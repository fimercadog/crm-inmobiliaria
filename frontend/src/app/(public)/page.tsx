import type { Metadata } from "next";
import Link from "next/link";
import { Home, KeyRound, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicContainer } from "@/components/public/public-container";
import { SectionHeading } from "@/components/public/section-heading";
import { HeroSection } from "@/components/public/hero-section";
import { PropertySearch } from "@/features/public-properties/property-search";
import { PropertyGrid } from "@/features/public-properties/property-grid";
import { fetchFeaturedProperties } from "@/lib/api/public";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — Encuentra el espacio que estás buscando`,
  description: "Compra, arrienda o vende tu propiedad con el acompañamiento de un equipo inmobiliario profesional.",
};

const ACTIONS = [
  {
    icon: Home,
    title: "Comprar",
    href: "/comprar",
  },
  {
    icon: KeyRound,
    title: "Arrendar",
    href: "/arrendar",
  },
  {
    icon: Search,
    title: "Vender",
    href: "/vender-mi-propiedad",
  },
  {
    icon: Star,
    title: "Nuevas",
    href: "/propiedades",
  },
];

export default async function HomePage() {
  const featured = await fetchFeaturedProperties();

  return (
    <>
      <HeroSection backgroundImage={featured[0]?.cover_image}>
        <PropertySearch />
      </HeroSection>

      <PublicContainer className="-mt-18 relative z-10">
        <div className="grid bg-black text-white sm:grid-cols-4">
          {ACTIONS.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-36 flex-col items-center justify-center gap-4 text-center text-[0.68rem] font-extrabold uppercase tracking-wide transition-colors hover:bg-[var(--realty-accent)] ${index === 3 ? "bg-[var(--realty-accent)]" : ""}`}
            >
              <item.icon className="size-7" />
              {item.title}
            </Link>
          ))}
        </div>
      </PublicContainer>

      <section className="py-24">
        <PublicContainer className="flex flex-col gap-12">
          <SectionHeading
            eyebrow="Listings"
            title="Propiedades destacadas"
            description="Una muestra de los inmuebles más solicitados esta semana."
          />
          <PropertyGrid properties={featured} />
          <div className="flex justify-center">
            <Button asChild variant="outline" size="lg" className="rounded-full border-2 border-[var(--realty-accent)] px-6 text-[0.68rem] font-extrabold uppercase text-[var(--realty-accent)] hover:bg-[var(--realty-accent)] hover:text-white">
              <Link href="/propiedades">Ver todas las propiedades</Link>
            </Button>
          </div>
        </PublicContainer>
      </section>

      <section className="bg-[var(--realty-surface)] py-24">
        <PublicContainer className="grid gap-12 lg:grid-cols-2">
          <SectionHeading eyebrow="Por qué elegirnos" title="Expertos en los que puedes confiar" />
          <div className="grid gap-8">
            <div>
              <h3 className="text-xl font-semibold">Explora propiedades con acompañamiento real</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Te guiamos en cada paso del proceso, desde la primera visita hasta la firma final.
              </p>
              <Link href="/propiedades" className="realty-button mt-5">Ver propiedades</Link>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Publica tu inmueble con mayor claridad</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Conocemos el mercado local y trabajamos para conseguir las mejores condiciones.
              </p>
              <Link href="/vender-mi-propiedad" className="realty-button mt-5">Empezar</Link>
            </div>
          </div>
        </PublicContainer>
      </section>

      <section className="py-24 text-center">
        <p className="realty-eyebrow">Looking for agent?</p>
        <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-medium text-balance sm:text-5xl lg:text-6xl">
          Deja los detalles en nuestras manos y vive mejor tu próximo paso.
        </h2>
        <Link href="/contacto" className="mt-10 inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--realty-accent)] px-7 text-[0.68rem] font-extrabold uppercase text-white transition-colors hover:bg-[var(--realty-accent)]/90">
          Contactar asesor
        </Link>
      </section>
    </>
  );
}
