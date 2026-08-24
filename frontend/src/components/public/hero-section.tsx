import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicContainer } from "@/components/public/public-container";

interface HeroSectionProps {
  backgroundImage?: string | null;
  children?: React.ReactNode;
}

export function HeroSection({ backgroundImage, children }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      {backgroundImage ? (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            className="object-cover opacity-45"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-foreground to-foreground" />
      )}

      <PublicContainer className="relative flex flex-col items-center gap-10 py-24 text-center sm:py-32">
        <div className="flex max-w-3xl flex-col items-center gap-6">
          <h1 className="font-(family-name:--font-display) text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Encuentra el espacio que estás buscando
          </h1>
          <p className="max-w-xl text-lg text-background/80">
            Propiedades seleccionadas para comprar o arrendar, con acompañamiento de un equipo que conoce cada
            barrio.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/propiedades">Ver propiedades</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background">
              <Link href="/vender-mi-propiedad">Vender mi propiedad</Link>
            </Button>
          </div>
        </div>

        {children && <div className="w-full max-w-4xl">{children}</div>}
      </PublicContainer>
    </section>
  );
}
