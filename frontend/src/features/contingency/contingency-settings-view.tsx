"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CircleAlert, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { fetchEligibleModules } from "@/features/contingency/api";
import { useContingency } from "@/features/contingency/contingency-context";
import type { ContingencyModuleDefinition, ContingencyTransaction } from "@/types/contingency";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

const STATUS_CONFIG = {
  PENDING: { label: "Pendiente", tone: "warning" as const },
  SYNCED: { label: "Sincronizada", tone: "success" as const },
  CONFLICT: { label: "Conflicto", tone: "destructive" as const },
  FAILED: { label: "Fallida", tone: "destructive" as const },
  DISCARDED: { label: "Descartada", tone: "outline" as const },
};

export function ContingencySettingsView() {
  const { active, session, transactions, pendingCount, activate, deactivate, sync, discard } = useContingency();
  const [modules, setModules] = useState<ContingencyModuleDefinition[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<ContingencyTransaction | null>(null);
  const [discardReason, setDiscardReason] = useState("");

  useEffect(() => {
    fetchEligibleModules()
      .then(setModules)
      .catch(() => toast.error("No fue posible cargar los módulos elegibles"));
  }, []);

  function toggleModule(key: string) {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleActivate() {
    setBusy(true);
    try {
      await activate(selected);
      toast.success("Modo contingencia activado");
    } catch {
      toast.error("No fue posible activar el modo contingencia");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeactivate() {
    setBusy(true);
    try {
      await deactivate();
      toast.success("Modo contingencia desactivado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible desactivar el modo contingencia");
    } finally {
      setBusy(false);
    }
  }

  async function handleSync(uuid: string) {
    setBusy(true);
    try {
      await sync(uuid);
    } finally {
      setBusy(false);
    }
  }

  async function handleDiscard() {
    if (!discardTarget || !discardReason.trim()) return;
    setBusy(true);
    try {
      await discard(discardTarget.uuid, discardReason.trim());
      setDiscardTarget(null);
      setDiscardReason("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>
            Elige qué módulos podrán seguir operando si hay una caída de conexión. El resto del sistema queda en
            solo lectura mientras la contingencia esté activa.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {active && session ? (
            <>
              <Alert>
                <CircleAlert />
                <AlertTitle>Contingencia activa desde {dateFormatter.format(new Date(session.activated_at))}</AlertTitle>
                <AlertDescription>
                  Activada por {session.activated_by}. Módulos habilitados: {session.enabled_modules.join(", ")}.
                </AlertDescription>
              </Alert>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={busy} className="w-fit">
                    Desactivar modo contingencia
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {pendingCount > 0 ? "No se puede desactivar todavía" : "¿Desactivar el modo contingencia?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {pendingCount > 0
                        ? `Existen ${pendingCount} transacciones pendientes de gestión. Debes sincronizarlas o descartarlas antes de volver al modo normal.`
                        : "Todos los módulos volverán a su comportamiento normal y se actualizarán desde el servidor."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    {pendingCount === 0 && (
                      <AlertDialogAction onClick={handleDeactivate} disabled={busy}>
                        Desactivar contingencia
                      </AlertDialogAction>
                    )}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {modules === null && <Loader2 className="animate-spin" />}
                {modules?.map((module) => (
                  // Radix's Checkbox renders a <button>, not a native <input> —
                  // wrapping it in a plain <label> would not forward clicks the
                  // way it does for real form controls, so the whole row is
                  // the click target instead (found via the Playwright E2E test).
                  <div
                    key={module.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleModule(module.key)}
                    onKeyDown={(event) => event.key === "Enter" && toggleModule(module.key)}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <Checkbox checked={selected.includes(module.key)} className="mt-0.5" />
                    <div>
                      <p className="font-medium">{module.label}</p>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={selected.length === 0 || busy} className="w-fit">
                    Activar modo contingencia
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Está a punto de activar el modo contingencia</AlertDialogTitle>
                    <AlertDialogDescription>
                      Solo {selected.length === 1 ? "el módulo configurado podrá" : "los módulos configurados podrán"}{" "}
                      realizar operaciones ({modules?.filter((m) => selected.includes(m.key)).map((m) => m.label).join(", ")}
                      ). El resto del sistema quedará en modo solo lectura.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleActivate} disabled={busy}>
                      Activar contingencia
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de contingencia</CardTitle>
          <CardDescription>Transacciones registradas localmente en este dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay transacciones de contingencia en este dispositivo.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Resumen</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.uuid}>
                    <TableCell className="capitalize">{tx.module}</TableCell>
                    <TableCell className="max-w-xs truncate" title={tx.summary}>
                      {tx.summary}
                    </TableCell>
                    <TableCell>{dateFormatter.format(new Date(tx.createdAt))}</TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} config={STATUS_CONFIG} />
                      {tx.lastError && <p className="mt-1 text-xs text-destructive">{tx.lastError}</p>}
                      {tx.discardReason && <p className="mt-1 text-xs text-muted-foreground">Motivo: {tx.discardReason}</p>}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {(tx.status === "PENDING" || tx.status === "FAILED" || tx.status === "CONFLICT") && (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => handleSync(tx.uuid)}>
                          Sincronizar
                        </Button>
                      )}
                      {tx.status !== "SYNCED" && tx.status !== "DISCARDED" && (
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => setDiscardTarget(tx)}>
                          Descartar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={discardTarget !== null} onOpenChange={(open) => !open && setDiscardTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desea descartar esta transacción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción queda registrada y no elimina la evidencia — la transacción queda marcada como descartada,
              no se borra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <label htmlFor="discard-reason" className="text-sm font-medium">
              Motivo
            </label>
            <Textarea
              id="discard-reason"
              value={discardReason}
              onChange={(event) => setDiscardReason(event.target.value)}
              placeholder="Explica por qué se descarta esta transacción"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscard} disabled={!discardReason.trim() || busy}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
