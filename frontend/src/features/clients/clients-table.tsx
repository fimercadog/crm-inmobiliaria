"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumnDef } from "@/components/tables/data-table";
import { DataTableToolbar } from "@/components/tables/data-table-toolbar";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { ExportButtons } from "@/components/shared/export-buttons";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionMenu, type ActionMenuItem } from "@/components/shared/action-menu";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { deleteClient } from "@/features/clients/api";
import { CLIENT_STATUS_CONFIG } from "@/features/clients/status-config";
import { useContingency } from "@/features/contingency/contingency-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useServerTable } from "@/hooks/use-server-table";
import type { Client } from "@/types/client";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function buildColumns(canWrite: boolean, canDelete: boolean): DataTableColumnDef<Client>[] {
  return [
    { accessorKey: "name", header: "Nombre", enableSorting: true },
    { accessorKey: "phone", header: "Teléfono", cell: ({ getValue }) => getValue<string | null>() ?? "—" },
    { accessorKey: "email", header: "Correo", cell: ({ getValue }) => getValue<string | null>() ?? "—" },
    {
      accessorKey: "budget_max",
      header: "Presupuesto máx.",
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue<number | null>();
        return value !== null ? currencyFormatter.format(value) : "—";
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue<Client["status"]>()} config={CLIENT_STATUS_CONFIG} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row, table }) => {
        const items: ActionMenuItem[] = [
          ...(canWrite
            ? [
                {
                  label: "Editar",
                  icon: Pencil,
                  onSelect: () =>
                    (table.options.meta as { navigateToEdit: (id: number) => void }).navigateToEdit(
                      row.original.id,
                    ),
                },
              ]
            : []),
          ...(canDelete
            ? [
                {
                  label: "Eliminar",
                  icon: Trash2,
                  variant: "destructive" as const,
                  separatorBefore: canWrite,
                  onSelect: () =>
                    (table.options.meta as { requestDelete: (row: Client) => void }).requestDelete(row.original),
                },
              ]
            : []),
        ];

        if (items.length === 0) return <div />;

        return (
          <div className="flex justify-end">
            <ActionMenu items={items} />
          </div>
        );
      },
    },
  ];
}

export function ClientsTable() {
  const router = useRouter();
  const { canWrite: roleCanWrite, canDelete: roleCanDelete } = usePermissions();
  const { isReadOnly } = useContingency();
  const contingencyBlocksWrites = isReadOnly("clients");
  const canWrite = roleCanWrite && !contingencyBlocksWrites;
  const canDelete = roleCanDelete && !contingencyBlocksWrites;
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = useMemo(() => buildColumns(canWrite, canDelete), [canWrite, canDelete]);
  const table = useServerTable<Client>({ endpoint: "/clients" });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteClient(pendingDelete.id);
      toast.success(`"${pendingDelete.name}" eliminado correctamente`);
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar el cliente");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar clientes..."
        exportSlot={<ExportButtons endpoint="/clients/export" params={{ search: table.search || undefined }} fileBaseName="clientes" />}
        actions={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href="/clients/new">
                <Plus />
                Nuevo cliente
              </Link>
            </Button>
          ) : undefined
        }
      />

      {contingencyBlocksWrites && roleCanWrite && (
        <p className="text-sm text-muted-foreground">Solo lectura durante modo contingencia.</p>
      )}

      <DataTable
        columns={columns}
        data={table.items}
        isLoading={table.isLoading}
        error={table.error}
        onRetry={table.refetch}
        sorting={table.sorting}
        onSortingChange={table.setSorting}
        emptyTitle="No hay clientes"
        emptyDescription="Ajusta la búsqueda, o crea un nuevo cliente."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/clients/${id}/edit`),
        }}
      />

      <DataTablePagination
        pageIndex={table.pageIndex}
        pageSize={table.pageSize}
        total={table.total}
        lastPage={table.lastPage}
        onPageIndexChange={table.setPageIndex}
        onPageSizeChange={table.setPageSize}
      />

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        resourceName={pendingDelete?.name}
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
