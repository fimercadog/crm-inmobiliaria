import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Handshake, MapPinned, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicContainer } from "@/components/public/public-container";
import { SectionHeading } from "@/components/public/section-heading";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: `Nosotros | ${SITE_CONFIG.name}`,
  description: "Conoce cómo trabajamos y qué puedes esperar al comprar, arrendar o vender tu propiedad con nosotros.",
};

const VALUES = [
  {
    title: "Cercanía",
    description: "Escuchamos lo que buscas antes de mostrarte propiedades, para no hacerte perder el tiempo.",
  },
  {
    title: "Transparencia",
    description: "Información clara sobre precios, condiciones y estado real de cada inmueble.",
  },
  {
    title: "Acompañamiento",
    description: "Te guiamos desde la primera visita hasta la firma, resolviendo dudas en cada etapa.",
  },
];

const PROCESS = [
  {
    icon: Search,
    title: "Buscas",
    description: "Filtra por ciudad, zona, presupuesto y tipo de inmueble hasta encontrar lo que necesitas.",
  },
  {
    icon: MapPinned,
    title: "Visitas",
    description: "Coordinamos la visita contigo, en persona o por videollamada según lo prefieras.",
  },
  {
    icon: CalendarCheck,
    title: "Cierras",
    description: "Te acompañamos en la negociación y la documentación hasta formalizar el negocio.",
  },
];

export default function NosotrosPage() {
  return (
    <PublicContainer className="flex flex-col gap-16 py-14">
      <SectionHeading
        eyebrow="Nosotros"
        title="Encontramos el lugar que tú imaginas"
        description="Somos un equipo inmobiliario enfocado en simplificar la compra, el arriendo y la venta de propiedades, con un proceso claro de principio a fin."
      />

      <div className="grid gap-10 sm:grid-cols-3">
        {VALUES.map((value) => (
          <div key={value.title} className="flex flex-col gap-2 border-t border-border pt-4">
            <h3 className="font-(family-name:--font-display) text-lg font-semibold">{value.title}</h3>
            <p className="text-sm text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-secondary/40 p-8 sm:p-12">
        <SectionHeading eyebrow="Cómo trabajamos" title="Un proceso simple, en tres pasos" align="center" />
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {PROCESS.map((step) => (
            <div key={step.title} className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="size-6" />
              </span>
              <h3 className="font-(family-name:--font-display) text-lg font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-(family-name:--font-display) text-2xl font-semibold tracking-tight sm:text-3xl">
          ¿Listo para dar el siguiente paso?
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/propiedades">Ver propiedades</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contacto">
              <Handshake />
              Hablar con un asesor
            </Link>
          </Button>
        </div>
      </div>
    </PublicContainer>
  );
}
