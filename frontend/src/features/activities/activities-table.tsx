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
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { ExportButtons } from "@/components/shared/export-buttons";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionMenu, type ActionMenuItem } from "@/components/shared/action-menu";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { deleteActivity } from "@/features/activities/api";
import { ACTIVITY_TYPE_CONFIG } from "@/features/activities/type-config";
import { usePermissions } from "@/hooks/use-permissions";
import { useServerTable } from "@/hooks/use-server-table";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPES, type Activity } from "@/types/activity";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

function buildColumns(canWrite: boolean, canDelete: boolean): DataTableColumnDef<Activity>[] {
  return [
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ getValue }) => <StatusBadge status={getValue<Activity["type"]>()} config={ACTIVITY_TYPE_CONFIG} />,
    },
    {
      accessorKey: "notes",
      header: "Notas",
      cell: ({ getValue }) => <span className="line-clamp-1">{getValue<string>()}</span>,
    },
    {
      accessorKey: "occurred_at",
      header: "Fecha",
      enableSorting: true,
      cell: ({ getValue }) => dateFormatter.format(new Date(getValue<string>())),
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
                    (table.options.meta as { requestDelete: (row: Activity) => void }).requestDelete(row.original),
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

export function ActivitiesTable() {
  const router = useRouter();
  const { canWrite, canDelete } = usePermissions();
  const [type, setType] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Activity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => ({ type }), [type]);
  const columns = useMemo(() => buildColumns(canWrite, canDelete), [canWrite, canDelete]);
  const table = useServerTable<Activity>({ endpoint: "/activities", filters });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteActivity(pendingDelete.id);
      toast.success("Seguimiento eliminado correctamente");
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar el seguimiento");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar seguimientos..."
        filters={
          <FilterDropdown
            label="Tipo"
            value={type}
            onChange={setType}
            options={ACTIVITY_TYPES.map((value) => ({ value, label: ACTIVITY_TYPE_LABELS[value] }))}
          />
        }
        exportSlot={
          <ExportButtons
            endpoint="/activities/export"
            params={{ search: table.search || undefined, ...filters }}
            fileBaseName="seguimientos"
          />
        }
        actions={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href="/activities/new">
                <Plus />
                Nuevo seguimiento
              </Link>
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={table.items}
        isLoading={table.isLoading}
        error={table.error}
        onRetry={table.refetch}
        sorting={table.sorting}
        onSortingChange={table.setSorting}
        emptyTitle="No hay seguimientos"
        emptyDescription="Ajusta la búsqueda o los filtros, o registra un nuevo seguimiento."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/activities/${id}/edit`),
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
        onConfirm={handleDelete}
        isSubmitting={isDeleting}
      />
    </div>
  );
}
