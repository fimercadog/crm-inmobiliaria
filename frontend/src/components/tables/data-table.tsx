"use client";

import { flexRender, useTable, type ColumnDef, type RowData, type SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { dataTableFeatures } from "@/lib/table/features";
import { cn } from "@/lib/utils";

export type DataTableColumnDef<TData extends RowData> = ColumnDef<typeof dataTableFeatures, TData>;

interface DataTableProps<T extends RowData> {
  columns: DataTableColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  getRowId?: (row: T) => string;
  meta?: Record<string, unknown>;
}

export function DataTable<T extends RowData>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = "Sin resultados",
  emptyDescription = "No se encontraron registros con los criterios actuales.",
  sorting,
  onSortingChange,
  getRowId,
  meta,
}: DataTableProps<T>) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    state: sorting ? { sorting } : undefined,
    onSortingChange: onSortingChange
      ? (updater) => {
          const next = typeof updater === "function" ? updater(sorting ?? []) : updater;
          onSortingChange(next);
        }
      : undefined,
    manualSorting: true,
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    meta,
  });

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (isLoading && data.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="flex items-center gap-1 select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" && <ArrowUp className="size-3.5" />}
                          {sorted === "desc" && <ArrowDown className="size-3.5" />}
                          {!sorted && <ArrowUpDown className="size-3.5 opacity-40" />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={cn(isLoading && "opacity-50")}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
