import Link from "next/link";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { PUBLIC_NAV_LINKS } from "@/constants/public-navigation";
import { SITE_CONFIG } from "@/constants/site";

const currentYear = new Date().getFullYear();

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Building2 className="size-4.5" />
              </span>
              <span className="font-(family-name:--font-display) text-lg font-semibold tracking-tight">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Encuentra el espacio que estás buscando. Compra, arrienda o vende con acompañamiento profesional en
              cada paso.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-(family-name:--font-display) text-sm font-semibold">Navegación</h3>
            <ul className="flex flex-col gap-2">
              {PUBLIC_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-(family-name:--font-display) text-sm font-semibold">Propiedades</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/comprar" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Comprar
                </Link>
              </li>
              <li>
                <Link href="/arrendar" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Arrendar
                </Link>
              </li>
              <li>
                <Link href="/vender-mi-propiedad" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Vender mi propiedad
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-(family-name:--font-display) text-sm font-semibold">Contacto</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{SITE_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <a href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`} className="transition-colors hover:text-primary">
                  {SITE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="transition-colors hover:text-primary">
                  {SITE_CONFIG.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {currentYear} {SITE_CONFIG.name}. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/contacto" className="transition-colors hover:text-primary">
              Términos
            </Link>
            <Link href="/contacto" className="transition-colors hover:text-primary">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
