"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES, type ListingTypeValue } from "@/types/property";

const ANY_TYPE = "__any__";

export function PropertySearch() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingTypeValue>("venta");
  const [propertyType, setPropertyType] = useState<string>(ANY_TYPE);
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    const params = new URLSearchParams();
    params.set("listing_type", listingType);
    if (propertyType !== ANY_TYPE) params.set("property_type", propertyType);
    if (city) params.set("city", city);
    if (zone) params.set("zone", zone);
    if (priceMin) params.set("price_min", priceMin);
    if (priceMax) params.set("price_max", priceMax);

    router.push(`/propiedades?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-6"
    >
      <Tabs value={listingType} onValueChange={(value) => setListingType(value as ListingTypeValue)}>
        <TabsList>
          <TabsTrigger value="venta">Comprar</TabsTrigger>
          <TabsTrigger value="arriendo">Arrendar</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tipo de inmueble" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_TYPE}>Todos los tipos</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input placeholder="Ciudad" value={city} onChange={(event) => setCity(event.target.value)} />

        <Input placeholder="Barrio / zona" value={zone} onChange={(event) => setZone(event.target.value)} />

        <Input
          type="number"
          min={0}
          placeholder="Precio mínimo"
          value={priceMin}
          onChange={(event) => setPriceMin(event.target.value)}
        />

        <Input
          type="number"
          min={0}
          placeholder="Precio máximo"
          value={priceMax}
          onChange={(event) => setPriceMax(event.target.value)}
        />

        <Button type="submit" className="w-full">
          <Search />
          Buscar propiedades
        </Button>
      </div>
    </form>
  );
}
