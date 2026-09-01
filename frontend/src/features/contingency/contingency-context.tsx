"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { activateContingency, deactivateContingency, fetchContingencyStatus } from "@/features/contingency/api";
import { getModuleAdapter } from "@/features/contingency/module-registry";
import { getOfflineStorage } from "@/lib/offline/offline-storage";
import { ApiError } from "@/types/api";
import type { ContingencySessionInfo, ContingencyTransaction } from "@/types/contingency";

const UNRESOLVED_STATUSES = new Set(["PENDING", "CONFLICT", "FAILED"]);

interface ContingencyContextValue {
  active: boolean;
  session: ContingencySessionInfo | null;
  transactions: ContingencyTransaction[];
  pendingCount: number;
  isModuleEnabled: (moduleKey: string) => boolean;
  isReadOnly: (moduleKey: string) => boolean;
  activate: (enabledModules: string[]) => Promise<void>;
  deactivate: () => Promise<void>;
  queue: (moduleKey: string, action: string, payload: Record<string, unknown>) => Promise<void>;
  sync: (uuid: string) => Promise<void>;
  discard: (uuid: string, reason: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ContingencyContext = createContext<ContingencyContextValue | null>(null);

export function ContingencyProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ContingencySessionInfo | null>(null);
  const [transactions, setTransactions] = useState<ContingencyTransaction[]>([]);

  const refreshTransactions = useCallback(async () => {
    setTransactions(await getOfflineStorage().getAll());
  }, []);

  const refresh = useCallback(async () => {
    const status = await fetchContingencyStatus();
    setSession(status.session);
    await refreshTransactions();
  }, [refreshTransactions]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const active = session !== null;

  const isModuleEnabled = useCallback(
    (moduleKey: string) => active && (session?.enabled_modules.includes(moduleKey) ?? false),
    [active, session],
  );

  // Only meaningful while contingency is active — a module never becomes
  // read-only because of contingency when contingency itself is off.
  const isReadOnly = useCallback(
    (moduleKey: string) => active && !isModuleEnabled(moduleKey),
    [active, isModuleEnabled],
  );

  const pendingCount = useMemo(
    () => transactions.filter((tx) => UNRESOLVED_STATUSES.has(tx.status)).length,
    [transactions],
  );

  async function activate(enabledModules: string[]) {
    const info = await activateContingency(enabledModules);
    setSession(info);
  }

  async function deactivate() {
    if (pendingCount > 0) {
      throw new Error(
        `No se puede desactivar el modo contingencia. Existen ${pendingCount} transacciones pendientes de gestión.`,
      );
    }
    await deactivateContingency();
    setSession(null);
  }

  async function queue(moduleKey: string, action: string, payload: Record<string, unknown>) {
    const adapter = getModuleAdapter(moduleKey);
    const uuid = crypto.randomUUID();
    const transaction: ContingencyTransaction = {
      uuid,
      module: moduleKey,
      action,
      payload,
      summary: adapter?.summarize(payload) ?? action,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      syncedAt: null,
      attempts: 0,
      lastError: null,
      discardReason: null,
    };
    await getOfflineStorage().put(transaction);
    await refreshTransactions();
  }

  async function sync(uuid: string) {
    const transaction = transactions.find((tx) => tx.uuid === uuid);
    if (!transaction) return;

    const adapter = getModuleAdapter(transaction.module);
    if (!adapter) {
      await getOfflineStorage().put({ ...transaction, status: "FAILED", lastError: "Módulo sin adaptador de sincronización" });
      await refreshTransactions();
      return;
    }

    try {
      await adapter.sync(transaction.payload, transaction.uuid);
      await getOfflineStorage().put({
        ...transaction,
        status: "SYNCED",
        syncedAt: new Date().toISOString(),
        attempts: transaction.attempts + 1,
        lastError: null,
      });
    } catch (error) {
      const isConflict = error instanceof ApiError && (error.status === 409 || error.status === 422);
      await getOfflineStorage().put({
        ...transaction,
        status: isConflict ? "CONFLICT" : "FAILED",
        attempts: transaction.attempts + 1,
        lastError: error instanceof Error ? error.message : "Error desconocido al sincronizar",
      });
    }
    await refreshTransactions();
  }

  async function discard(uuid: string, reason: string) {
    const transaction = transactions.find((tx) => tx.uuid === uuid);
    if (!transaction) return;
    await getOfflineStorage().put({ ...transaction, status: "DISCARDED", discardReason: reason });
    await refreshTransactions();
  }

  const value: ContingencyContextValue = {
    active,
    session,
    transactions,
    pendingCount,
    isModuleEnabled,
    isReadOnly,
    activate,
    deactivate,
    queue,
    sync,
    discard,
    refresh,
  };

  return <ContingencyContext.Provider value={value}>{children}</ContingencyContext.Provider>;
}

export function useContingency(): ContingencyContextValue {
  const context = useContext(ContingencyContext);
  if (!context) throw new Error("useContingency must be used within a ContingencyProvider");
  return context;
}
