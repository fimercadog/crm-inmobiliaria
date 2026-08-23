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
import { deleteBlogPost } from "@/features/blog/api";
import { BLOG_POST_STATUS_CONFIG } from "@/features/blog/status-config";
import { usePermissions } from "@/hooks/use-permissions";
import { useServerTable } from "@/hooks/use-server-table";
import { BLOG_POST_STATUS_LABELS, BLOG_POST_STATUSES, type BlogPost } from "@/types/blog";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

function buildColumns(canWrite: boolean, canDelete: boolean): DataTableColumnDef<BlogPost>[] {
  return [
    { accessorKey: "title", header: "Título", enableSorting: true },
    { id: "author", header: "Autor", cell: ({ row }) => row.original.author?.name ?? "—" },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue<BlogPost["status"]>()} config={BLOG_POST_STATUS_CONFIG} />,
    },
    {
      accessorKey: "published_at",
      header: "Publicado",
      cell: ({ getValue }) => {
        const value = getValue<string | null>();
        return value ? dateFormatter.format(new Date(value)) : "—";
      },
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
                    (table.options.meta as { navigateToEdit: (id: number) => void }).navigateToEdit(row.original.id),
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
                    (table.options.meta as { requestDelete: (row: BlogPost) => void }).requestDelete(row.original),
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

export function BlogTable() {
  const router = useRouter();
  const { canWrite, canDelete } = usePermissions();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filters = useMemo(() => ({ status }), [status]);
  const columns = useMemo(() => buildColumns(canWrite, canDelete), [canWrite, canDelete]);
  const table = useServerTable<BlogPost>({ endpoint: "/blog-posts", filters });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteBlogPost(pendingDelete.id);
      toast.success(`"${pendingDelete.title}" eliminado correctamente`);
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar el artículo");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar artículos..."
        filters={
          <FilterDropdown
            label="Estado"
            value={status}
            onChange={setStatus}
            options={BLOG_POST_STATUSES.map((value) => ({ value, label: BLOG_POST_STATUS_LABELS[value] }))}
          />
        }
        exportSlot={
          <ExportButtons endpoint="/blog-posts/export" params={{ search: table.search || undefined, ...filters }} fileBaseName="blog" />
        }
        actions={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href="/blog/new">
                <Plus />
                Nuevo artículo
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
        emptyTitle="No hay artículos"
        emptyDescription="Ajusta la búsqueda o los filtros, o crea un nuevo artículo."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          navigateToEdit: (id: number) => router.push(`/blog/${id}/edit`),
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
