import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Car, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_PROPERTY_IMAGE } from "@/constants/images";
import { LISTING_TYPE_LABELS, PROPERTY_TYPE_LABELS } from "@/types/property";
import type { PublicPropertySummary } from "@/types/public";
import { currencyFormatter } from "@/features/public-properties/format";

export function PropertyCard({ property }: { property: PublicPropertySummary }) {
  const location = [property.zone, property.city].filter(Boolean).join(", ");

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <Image
          src={property.cover_image ?? SAMPLE_PROPERTY_IMAGE}
          alt={property.cover_image ? property.title : "Interior moderno de propiedad"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary text-primary-foreground">{LISTING_TYPE_LABELS[property.listing_type]}</Badge>
          {property.is_featured && <Badge variant="secondary">Destacada</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="font-(family-name:--font-display) text-xl font-semibold text-primary">
            {currencyFormatter.format(property.price)}
          </p>
          <h3 className="mt-1 line-clamp-1 text-base font-medium">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </p>
        </div>

        <div className="mt-auto flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground">
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" />
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1">
              <Bath className="size-4" />
              {property.bathrooms}
            </span>
          )}
          {property.parking_spots !== null && property.parking_spots > 0 && (
            <span className="flex items-center gap-1">
              <Car className="size-4" />
              {property.parking_spots}
            </span>
          )}
          {(property.built_area ?? property.private_area) !== null && (
            <span className="ml-auto flex items-center gap-1">
              <Ruler className="size-4" />
              {property.built_area ?? property.private_area} m²
            </span>
          )}
        </div>

        <span className="text-xs text-muted-foreground uppercase">{PROPERTY_TYPE_LABELS[property.property_type]}</span>
      </div>
    </Link>
  );
}
