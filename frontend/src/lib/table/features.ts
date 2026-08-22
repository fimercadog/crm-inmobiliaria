import { rowSortingFeature, tableFeatures } from "@tanstack/react-table";

// Server-driven tables only need column sort *state* (manualSorting): no
// filtering/pagination/grouping row models are computed client-side.
export const dataTableFeatures = tableFeatures({ rowSortingFeature });
