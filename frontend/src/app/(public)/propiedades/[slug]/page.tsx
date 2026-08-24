import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublicContainer } from "@/components/public/public-container";
import { PropertyGallery } from "@/features/public-properties/property-gallery";
import { PropertyFeatures } from "@/features/public-properties/property-features";
import { PropertyCTA } from "@/features/public-properties/property-cta";
import { currencyFormatter } from "@/features/public-properties/format";
import { fetchPublicPropertyBySlug } from "@/lib/api/public";
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/types/property";
import { SITE_CONFIG } from "@/constants/site";

export async function generateMetadata(props: PageProps<"/propiedades/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const property = await fetchPublicPropertyBySlug(slug);

  if (!property) {
    return { title: `Propiedad no encontrada | ${SITE_CONFIG.name}` };
  }

  const location = [property.zone, property.city].filter(Boolean).join(", ");
  const title = `${property.title} en ${LISTING_TYPE_LABELS[property.listing_type].toLowerCase()} en ${location} | ${SITE_CONFIG.name}`;
  const description = property.description?.slice(0, 160) ?? `${PROPERTY_TYPE_LABELS[property.property_type]} en ${location}.`;
  const image = property.images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PropertyDetailPage(props: PageProps<"/propiedades/[slug]">) {
  const { slug } = await props.params;
  const property = await fetchPublicPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const location = [property.zone, property.city].filter(Boolean).join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description: property.description ?? undefined,
    image: property.images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "COP",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <PublicContainer className="flex flex-col gap-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground">{LISTING_TYPE_LABELS[property.listing_type]}</Badge>
          <span className="text-xs text-muted-foreground">{property.code}</span>
        </div>
        <h1 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight sm:text-4xl">
          {property.title}
        </h1>
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          {location}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <PropertyGallery images={property.images} title={property.title} />

          <div className="flex flex-col gap-1">
            <p className="font-(family-name:--font-display) text-3xl font-semibold text-primary">
              {currencyFormatter.format(property.price)}
            </p>
            {property.admin_fee !== null && (
              <p className="text-sm text-muted-foreground">+ {currencyFormatter.format(property.admin_fee)} de administración</p>
            )}
          </div>

          <PropertyFeatures property={property} />

          {property.description && (
            <div className="flex flex-col gap-3">
              <h2 className="font-(family-name:--font-display) text-xl font-semibold">Descripción</h2>
              <p className="whitespace-pre-line text-muted-foreground">{property.description}</p>
            </div>
          )}

          {property.features.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="font-(family-name:--font-display) text-xl font-semibold">Características adicionales</h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {property.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <PropertyCTA propertyId={property.id} title={property.title} code={property.code} />
        </div>
      </div>
    </PublicContainer>
  );
}
