import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PublicContainer } from "@/components/public/public-container";
import { SectionHeading } from "@/components/public/section-heading";
import { ContactForm } from "@/features/public-leads/contact-form";
import { SITE_CONFIG, buildWhatsAppUrl } from "@/constants/site";

export const metadata: Metadata = {
  title: `Contacto | ${SITE_CONFIG.name}`,
  description: "Escríbenos por WhatsApp, teléfono, correo o completa el formulario y te contactaremos pronto.",
};

const CONTACT_ITEMS = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: SITE_CONFIG.phone,
    href: buildWhatsAppUrl("Hola, quiero más información."),
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: SITE_CONFIG.phone,
    href: `tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`,
  },
  {
    icon: Mail,
    label: "Correo",
    value: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
  },
  {
    icon: MapPin,
    label: "Ubicación",
    value: SITE_CONFIG.address,
    href: undefined,
  },
];

export default function ContactoPage() {
  return (
    <PublicContainer className="flex flex-col gap-10 py-14">
      <div className="realty-animate-fade-up">
        <SectionHeading
          level={1}
          eyebrow="Contacto"
          title="Hablemos de tu próxima propiedad"
          description="Escríbenos y un asesor te responderá lo antes posible."
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {CONTACT_ITEMS.map((item, index) => {
            const content = (
              <div className={`realty-animate-fade-up realty-hover-lift flex items-start gap-3 rounded-xl border border-border bg-card p-4 ${index === 1 ? "realty-animate-delay-1" : index === 2 ? "realty-animate-delay-2" : index === 3 ? "realty-animate-delay-3" : ""}`}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            );

            return item.href ? (
              <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {content}
              </a>
            ) : (
              <div key={item.label}>{content}</div>
            );
          })}
        </div>

        <div className="realty-animate-scale-in realty-animate-delay-1 lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </PublicContainer>
  );
}
