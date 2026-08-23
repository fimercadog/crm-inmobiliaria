"use client";

import { DataTable, type DataTableColumnDef } from "@/components/tables/data-table";
import { DataTableToolbar } from "@/components/tables/data-table-toolbar";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { USER_ROLE_CONFIG } from "@/features/users/status-config";
import { useServerTable } from "@/hooks/use-server-table";
import type { Agent } from "@/types/agent";

const columns: DataTableColumnDef<Agent>[] = [
  { accessorKey: "name", header: "Nombre", enableSorting: true },
  { accessorKey: "email", header: "Correo", enableSorting: true },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ getValue }) => <StatusBadge status={getValue<Agent["role"]>()} config={USER_ROLE_CONFIG} />,
  },
  { accessorKey: "properties_count", header: "Propiedades" },
  { accessorKey: "open_opportunities_count", header: "Oportunidades abiertas" },
  { accessorKey: "pending_tasks_count", header: "Tareas pendientes" },
];

export function AgentsTable() {
  const table = useServerTable<Agent>({ endpoint: "/agents" });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar search={table.search} onSearchChange={table.setSearch} searchPlaceholder="Buscar agentes..." />

      <DataTable
        columns={columns}
        data={table.items}
        isLoading={table.isLoading}
        error={table.error}
        onRetry={table.refetch}
        sorting={table.sorting}
        onSortingChange={table.setSorting}
        emptyTitle="No hay agentes"
        emptyDescription="Los agentes se crean desde la sección Usuarios."
        getRowId={(row) => String(row.id)}
      />

      <DataTablePagination
        pageIndex={table.pageIndex}
        pageSize={table.pageSize}
        total={table.total}
        lastPage={table.lastPage}
        onPageIndexChange={table.setPageIndex}
        onPageSizeChange={table.setPageSize}
      />
    </div>
  );
}
