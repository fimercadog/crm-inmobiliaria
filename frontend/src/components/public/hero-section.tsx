import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicContainer } from "@/components/public/public-container";
import { SAMPLE_PROPERTY_IMAGE } from "@/constants/images";

interface HeroSectionProps {
  backgroundImage?: string | null;
  children?: React.ReactNode;
}

export function HeroSection({ backgroundImage, children }: HeroSectionProps) {
  const heroImage = backgroundImage ?? SAMPLE_PROPERTY_IMAGE;

  return (
    <section className="relative overflow-hidden bg-black text-white">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        className="object-cover grayscale"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/55" />

      <PublicContainer className="relative flex min-h-[620px] flex-col items-center justify-center gap-10 py-24 text-center sm:py-32">
        <div className="flex max-w-4xl flex-col items-center gap-6">
          <p className="text-[0.68rem] font-extrabold tracking-wide uppercase text-white/80">Grupo inmobiliario</p>
          <h1 className="font-sans text-5xl leading-[1.05] font-medium tracking-normal text-balance sm:text-6xl lg:text-7xl">
            Encuentra el espacio que estás buscando
          </h1>
          <p className="max-w-xl text-base leading-7 text-white/80">
            Propiedades seleccionadas para comprar o arrendar, con acompañamiento de un equipo que conoce cada
            barrio.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-[var(--realty-accent)] px-6 text-[0.68rem] font-extrabold uppercase text-white hover:bg-[var(--realty-accent)]/90">
              <Link href="/propiedades">Ver propiedades</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/60 bg-transparent px-6 text-[0.68rem] font-extrabold uppercase text-white hover:bg-white/10 hover:text-white">
              <Link href="/vender-mi-propiedad">Vender mi propiedad</Link>
            </Button>
          </div>
        </div>

        {children && <div className="w-full max-w-5xl">{children}</div>}
      </PublicContainer>
    </section>
  );
}
