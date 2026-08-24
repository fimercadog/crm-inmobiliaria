import { Bath, BedDouble, Building2, Calendar, Car, Layers, Ruler, Wallet } from "lucide-react";
import { PROPERTY_TYPE_LABELS } from "@/types/property";
import { currencyFormatter } from "@/features/public-properties/format";
import type { PublicPropertyDetail } from "@/types/public";

interface FeatureItem {
  icon: typeof BedDouble;
  label: string;
  value: string;
}

export function PropertyFeatures({ property }: { property: PublicPropertyDetail }) {
  const items: FeatureItem[] = [
    { icon: Building2, label: "Tipo", value: PROPERTY_TYPE_LABELS[property.property_type] },
    property.bedrooms !== null && { icon: BedDouble, label: "Habitaciones", value: String(property.bedrooms) },
    property.bathrooms !== null && { icon: Bath, label: "Baños", value: String(property.bathrooms) },
    property.parking_spots !== null && { icon: Car, label: "Parqueaderos", value: String(property.parking_spots) },
    property.built_area !== null && { icon: Ruler, label: "Área construida", value: `${property.built_area} m²` },
    property.private_area !== null && { icon: Ruler, label: "Área privada", value: `${property.private_area} m²` },
    property.stratum !== null && { icon: Layers, label: "Estrato", value: String(property.stratum) },
    property.admin_fee !== null && { icon: Wallet, label: "Administración", value: currencyFormatter.format(property.admin_fee) },
    property.year_built !== null && { icon: Calendar, label: "Año de construcción", value: String(property.year_built) },
  ].filter((item): item is FeatureItem => Boolean(item));

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <item.icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
