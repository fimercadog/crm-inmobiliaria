"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumnDef } from "@/components/tables/data-table";
import { DataTableToolbar } from "@/components/tables/data-table-toolbar";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { ExportButtons } from "@/components/shared/export-buttons";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActionMenu, type ActionMenuItem } from "@/components/shared/action-menu";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { convertLead, deleteLead } from "@/features/leads/api";
import { LEAD_STATUS_CONFIG } from "@/features/leads/status-config";
import { usePermissions } from "@/hooks/use-permissions";
import { useServerTable } from "@/hooks/use-server-table";
import { LEAD_SOURCE_LABELS, LEAD_SOURCES, type Lead } from "@/types/lead";

function buildColumns(canWrite: boolean, canDelete: boolean): DataTableColumnDef<Lead>[] {
  return [
    { accessorKey: "name", header: "Nombre", enableSorting: true },
    { accessorKey: "phone", header: "Teléfono", cell: ({ getValue }) => getValue<string | null>() ?? "—" },
    {
      accessorKey: "source",
      header: "Origen",
      cell: ({ getValue }) => LEAD_SOURCE_LABELS[getValue<Lead["source"]>()],
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ getValue }) => <StatusBadge status={getValue<Lead["status"]>()} config={LEAD_STATUS_CONFIG} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row, table }) => {
        const meta = table.options.meta as {
          navigateToEdit: (id: number) => void;
          requestDelete: (row: Lead) => void;
          requestConvert: (row: Lead) => void;
        };
        const isConverted = row.original.status === "convertido";

        const items: ActionMenuItem[] = [
          ...(canWrite && !isConverted
            ? [{ label: "Convertir a cliente", icon: UserCheck, onSelect: () => meta.requestConvert(row.original) }]
            : []),
          ...(canWrite
            ? [{ label: "Editar", icon: Pencil, onSelect: () => meta.navigateToEdit(row.original.id) }]
            : []),
          ...(canDelete
            ? [
                {
                  label: "Eliminar",
                  icon: Trash2,
                  variant: "destructive" as const,
                  separatorBefore: canWrite,
                  onSelect: () => meta.requestDelete(row.original),
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

export function LeadsTable() {
  const router = useRouter();
  const { canWrite, canDelete } = usePermissions();
  const [source, setSource] = useState<string | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [pendingConvert, setPendingConvert] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const filters = useMemo(() => ({ source }), [source]);
  const columns = useMemo(() => buildColumns(canWrite, canDelete), [canWrite, canDelete]);
  const table = useServerTable<Lead>({ endpoint: "/leads", filters });

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteLead(pendingDelete.id);
      toast.success(`"${pendingDelete.name}" eliminado correctamente`);
      setPendingDelete(null);
      table.refetch();
    } catch {
      toast.error("No fue posible eliminar el lead");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleConvert() {
    if (!pendingConvert) return;

    setIsConverting(true);
    try {
      await convertLead(pendingConvert.id);
      toast.success(`"${pendingConvert.name}" convertido a cliente`);
      setPendingConvert(null);
      table.refetch();
    } catch {
      toast.error("No fue posible convertir el lead");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Buscar leads..."
        filters={
          <FilterDropdown
            label="Origen"
            value={source}
            onChange={setSource}
            options={LEAD_SOURCES.map((value) => ({ value, label: LEAD_SOURCE_LABELS[value] }))}
          />
        }
        exportSlot={
          <ExportButtons endpoint="/leads/export" params={{ search: table.search || undefined, ...filters }} fileBaseName="leads" />
        }
        actions={
          canWrite ? (
            <Button size="sm" asChild>
              <Link href="/leads/new">
                <Plus />
                Nuevo lead
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
        emptyTitle="No hay leads"
        emptyDescription="Ajusta la búsqueda o los filtros, o crea un nuevo lead."
        getRowId={(row) => String(row.id)}
        meta={{
          requestDelete: setPendingDelete,
          requestConvert: setPendingConvert,
          navigateToEdit: (id: number) => router.push(`/leads/${id}/edit`),
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

      <ConfirmDialog
        open={pendingConvert !== null}
        onOpenChange={(open) => !open && setPendingConvert(null)}
        title="¿Convertir este lead a cliente?"
        description={
          pendingConvert
            ? `Se creará un cliente a partir de "${pendingConvert.name}" y el lead quedará marcado como convertido.`
            : undefined
        }
        confirmLabel="Convertir"
        isSubmitting={isConverting}
        onConfirm={handleConvert}
      />
    </div>
  );
}
