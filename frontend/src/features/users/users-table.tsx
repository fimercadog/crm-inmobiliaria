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
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionMenu } from "@/components/shared/action-menu";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { deleteUser } from "@/features/users/api";
import { USER_ROLE_CONFIG } from "@/features/users/status-config";
import { useServerTable } from "@/hooks/use-server-table";
import { useAppSelector } from "@/hooks/redux";
import { USER_ROLE_LABELS, USER_ROLES, type CrmUser } from "@/types/user";

function buildColumns(currentUserId: number | undefined): DataTableColumnDef<CrmUser>[] {
  return [
    { accessorKey: "name", header: "Nombre", enableSorting: true },
    { accessorKey: "email", header: "Correo", enableSorting: true },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ getValue }) => <StatusBadge status={getValue<CrmUser["role"]>()} config={USER_ROLE_CONFIG} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row, table }) => {
        const meta = table.options.meta as {
          navigateToEdit: (id: number) => void;
          requestDelete: (row: CrmUser) => void;
        };
        const isSelf = row.original.id === currentUserId;

        return (
          <div className="flex justify-end">
            <ActionMenu
              items={[
                { label: "Editar", icon: Pencil, onSelect: () => meta.navigateToEdit(row.original.id) },
                ...(isSelf
                  ? []
                  : [
                      {
                        label: "Eliminar",
                        icon: Trash2,
                        variant: "destructive" as const,
                        separatorBefore: true,
                        onSelect: () => meta.requestDelete(row.original),
                      },
                    ]),
              ]}
            />
          </div>
        );
      },
    },
  ];
}

export function UsersTable() {
  const router = useRouter();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<CrmUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => ({ role }), [role]);
  const table = useServerTable<CrmUser>({ endpoint: "/users", filters });
  const columns = useMemo(() => buildColumns(currentUserId), [currentUserId]);

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(pendingDelete.id);
      toast.success(`"${pendingDelete.name}" eliminado correctamente`);
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar el usuario");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar usuarios..."
        filters={
          <FilterDropdown
            label="Rol"
            value={role}
            onChange={setRole}
            options={USER_ROLES.map((value) => ({ value, label: USER_ROLE_LABELS[value] }))}
          />
        }
        actions={
          <Button size="sm" asChild>
            <Link href="/team/users/new">
              <Plus />
              Nuevo usuario
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
        emptyTitle="No hay usuarios"
        emptyDescription="Ajusta la búsqueda o los filtros, o crea un nuevo usuario."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/team/users/${id}/edit`),
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
