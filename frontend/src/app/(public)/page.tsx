import type { Metadata } from "next";
import Link from "next/link";
import { Award, Handshake, ShieldCheck } from "lucide-react";
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

const VALUE_PROPS = [
  {
    icon: ShieldCheck,
    title: "Acompañamiento confiable",
    description: "Te guiamos en cada paso del proceso, desde la primera visita hasta la firma final.",
  },
  {
    icon: Handshake,
    title: "Negociación a tu favor",
    description: "Conocemos el mercado local y trabajamos para conseguir las mejores condiciones.",
  },
  {
    icon: Award,
    title: "Propiedades verificadas",
    description: "Cada inmueble publicado pasa por un proceso de validación antes de salir al mercado.",
  },
];

export default async function HomePage() {
  const featured = await fetchFeaturedProperties();

  return (
    <>
      <HeroSection backgroundImage={featured[0]?.cover_image}>
        <PropertySearch />
      </HeroSection>

      <section className="py-20">
        <PublicContainer className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Selección del equipo"
            title="Propiedades destacadas"
            description="Una muestra de los inmuebles más solicitados esta semana."
          />
          <PropertyGrid properties={featured} />
          <div className="flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/propiedades">Ver todas las propiedades</Link>
            </Button>
          </div>
        </PublicContainer>
      </section>

      <section className="bg-secondary/40 py-20">
        <PublicContainer className="flex flex-col gap-12">
          <SectionHeading
            eyebrow="Por qué elegirnos"
            title="Una experiencia inmobiliaria sin fricciones"
            align="center"
          />
          <div className="grid gap-8 sm:grid-cols-3">
            {VALUE_PROPS.map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-6" />
                </span>
                <h3 className="font-(family-name:--font-display) text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </PublicContainer>
      </section>

      <section className="py-20">
        <PublicContainer>
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-16">
            <h2 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              ¿Quieres vender o arrendar tu propiedad?
            </h2>
            <p className="max-w-xl text-primary-foreground/85">
              Cuéntanos sobre tu inmueble y un asesor se pondrá en contacto contigo para coordinar la publicación.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/vender-mi-propiedad">Publica tu propiedad</Link>
            </Button>
          </div>
        </PublicContainer>
      </section>
    </>
  );
}
