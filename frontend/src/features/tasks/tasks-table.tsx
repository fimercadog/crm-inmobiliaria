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
import { ActionMenu } from "@/components/shared/action-menu";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { deleteTask } from "@/features/tasks/api";
import { TASK_STATUS_CONFIG } from "@/features/tasks/status-config";
import { useServerTable } from "@/hooks/use-server-table";
import { parseDateOnly } from "@/lib/date";
import { TASK_STATUS_LABELS, TASK_STATUSES, type Task } from "@/types/task";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

const columns: DataTableColumnDef<Task>[] = [
  { accessorKey: "title", header: "Título", enableSorting: true },
  {
    accessorKey: "due_date",
    header: "Fecha límite",
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return value ? dateFormatter.format(parseDateOnly(value)) : "—";
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => <StatusBadge status={getValue<Task["status"]>()} config={TASK_STATUS_CONFIG} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <div className="flex justify-end">
        <ActionMenu
          items={[
            {
              label: "Editar",
              icon: Pencil,
              onSelect: () =>
                (table.options.meta as { navigateToEdit: (id: number) => void }).navigateToEdit(row.original.id),
            },
            {
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              separatorBefore: true,
              onSelect: () =>
                (table.options.meta as { requestDelete: (row: Task) => void }).requestDelete(row.original),
            },
          ]}
        />
      </div>
    ),
  },
];

export function TasksTable() {
  const router = useRouter();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => ({ status }), [status]);
  const table = useServerTable<Task>({ endpoint: "/tasks", filters });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(pendingDelete.id);
      toast.success(`"${pendingDelete.title}" eliminada correctamente`);
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar la tarea");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar tareas..."
        filters={
          <FilterDropdown
            label="Estado"
            value={status}
            onChange={setStatus}
            options={TASK_STATUSES.map((value) => ({ value, label: TASK_STATUS_LABELS[value] }))}
          />
        }
        exportSlot={
          <ExportButtons endpoint="/tasks/export" params={{ search: table.search || undefined, ...filters }} fileBaseName="tareas" />
        }
        actions={
          <Button size="sm" asChild>
            <Link href="/tasks/new">
              <Plus />
              Nueva tarea
            </Link>
          </Button>
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
        emptyTitle="No hay tareas"
        emptyDescription="Ajusta la búsqueda o los filtros, o crea una nueva tarea."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/tasks/${id}/edit`),
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
        resourceName={pendingDelete?.title}
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
