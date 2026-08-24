import { Suspense } from "react";
import type { Metadata } from "next";
import { PublicContainer } from "@/components/public/public-container";
import { SectionHeading } from "@/components/public/section-heading";
import { Pagination } from "@/components/public/pagination";
import { PropertyFilters } from "@/features/public-properties/property-filters";
import { PropertyGrid } from "@/features/public-properties/property-grid";
import { fetchPublicProperties } from "@/lib/api/public";
import { SITE_CONFIG } from "@/constants/site";
import type { PublicPropertyFilters } from "@/types/public";

export const metadata: Metadata = {
  title: `Propiedades | ${SITE_CONFIG.name}`,
  description: "Explora el catálogo completo de propiedades disponibles para comprar o arrendar.",
};

export default async function PropertiesPage(props: PageProps<"/propiedades">) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page ?? 1) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;

  const filters: PublicPropertyFilters = {
    listing_type: typeof searchParams.listing_type === "string" ? searchParams.listing_type : undefined,
    property_type: typeof searchParams.property_type === "string" ? searchParams.property_type : undefined,
    city: typeof searchParams.city === "string" ? searchParams.city : undefined,
    zone: typeof searchParams.zone === "string" ? searchParams.zone : undefined,
    bedrooms: typeof searchParams.bedrooms === "string" ? searchParams.bedrooms : undefined,
    bathrooms: typeof searchParams.bathrooms === "string" ? searchParams.bathrooms : undefined,
    price_min: typeof searchParams.price_min === "string" ? searchParams.price_min : undefined,
    price_max: typeof searchParams.price_max === "string" ? searchParams.price_max : undefined,
  };

  const { items, meta } = await fetchPublicProperties(page, filters, search);

  return (
    <PublicContainer className="flex flex-col gap-8 py-14">
      <SectionHeading title="Propiedades" description="Explora nuestro catálogo completo y filtra por lo que estás buscando." />

      <Suspense>
        <PropertyFilters />
      </Suspense>

      <p className="text-sm text-muted-foreground">{meta.total} propiedades encontradas</p>

      <PropertyGrid properties={items} />

      <Suspense>
        <Pagination currentPage={meta.current_page} lastPage={meta.last_page} basePath="/propiedades" />
      </Suspense>
    </PublicContainer>
  );
}
