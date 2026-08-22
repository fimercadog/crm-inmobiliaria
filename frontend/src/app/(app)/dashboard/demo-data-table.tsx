"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { SortingState } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumnDef } from "@/components/tables/data-table";
import { DataTableToolbar } from "@/components/tables/data-table-toolbar";
import { DataTablePagination } from "@/components/tables/data-table-pagination";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { StatusBadge, type StatusConfig } from "@/components/shared/status-badge";
import { ActionMenu } from "@/components/shared/action-menu";
import { DeleteDialog } from "@/components/dialogs/delete-dialog";

interface DemoProperty {
  id: string;
  title: string;
  city: string;
  price: number;
  status: "disponible" | "reservado" | "vendido" | "arrendado";
}

const STATUS_CONFIG: Record<DemoProperty["status"], StatusConfig> = {
  disponible: { label: "Disponible", tone: "success" },
  reservado: { label: "Reservado", tone: "warning" },
  vendido: { label: "Vendido", tone: "secondary" },
  arrendado: { label: "Arrendado", tone: "outline" },
};

const CITIES = ["Bogotá", "Medellín", "Cali", "Barranquilla"];
const STATUSES: DemoProperty["status"][] = ["disponible", "reservado", "vendido", "arrendado"];

function generateFakeProperties(count: number): DemoProperty[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    title: `Apartamento ${index + 1} — Piso ${((index * 3) % 12) + 1}`,
    city: CITIES[index % CITIES.length],
    price: 180_000_000 + index * 8_350_000,
    status: STATUSES[index % STATUSES.length],
  }));
}

const ALL_PROPERTIES = generateFakeProperties(47);

const currencyFormatter = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const columns: DataTableColumnDef<DemoProperty>[] = [
  { accessorKey: "title", header: "Propiedad", enableSorting: true },
  { accessorKey: "city", header: "Ciudad", enableSorting: true },
  {
    accessorKey: "price",
    header: "Precio",
    enableSorting: true,
    cell: ({ getValue }) => currencyFormatter.format(getValue<number>()),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => <StatusBadge status={getValue<DemoProperty["status"]>()} config={STATUS_CONFIG} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <div className="flex justify-end">
        <ActionMenu
          items={[
            { label: "Editar", icon: Pencil, onSelect: () => toast.info(`Editar "${row.original.title}"`) },
            {
              label: "Eliminar",
              icon: Trash2,
              variant: "destructive",
              separatorBefore: true,
              onSelect: () => (table.options.meta as { requestDelete: (row: DemoProperty) => void }).requestDelete(row.original),
            },
          ]}
        />
      </div>
    ),
  },
];

export function DemoDataTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pendingDelete, setPendingDelete] = useState<DemoProperty | null>(null);

  const filtered = useMemo(() => {
    let rows = ALL_PROPERTIES;

    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter((row) => row.title.toLowerCase().includes(term) || row.city.toLowerCase().includes(term));
    }

    if (status) {
      rows = rows.filter((row) => row.status === status);
    }

    const sort = sorting[0];
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const key = sort.id as keyof DemoProperty;
        const result = a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0;
        return sort.desc ? -result : result;
      });
    }

    return rows;
  }, [search, status, sorting]);

  const total = filtered.length;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = filtered.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPageIndex(0);
        }}
        searchPlaceholder="Buscar propiedades..."
        filters={
          <FilterDropdown
            label="Estado"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPageIndex(0);
            }}
            options={STATUSES.map((value) => ({ value, label: STATUS_CONFIG[value].label }))}
          />
        }
        actions={
          <Button size="sm">
            <Plus />
            Nueva propiedad
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={pageRows}
        sorting={sorting}
        onSortingChange={setSorting}
        emptyTitle="No hay propiedades"
        emptyDescription="Ajusta la búsqueda o los filtros para ver resultados."
        getRowId={(row) => row.id}
        meta={{ requestDelete: setPendingDelete }}
      />

      <DataTablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        total={total}
        lastPage={lastPage}
        onPageIndexChange={setPageIndex}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
      />

      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        resourceName={pendingDelete?.title}
        onConfirm={() => {
          toast.success(`"${pendingDelete?.title}" eliminado (demo)`);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
