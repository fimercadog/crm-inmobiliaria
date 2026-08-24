import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppUrl } from "@/constants/site";

export function FloatingWhatsApp() {
  const href = buildWhatsAppUrl("Hola, quiero más información sobre las propiedades.");

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="realty-whatsapp-float group fixed right-5 bottom-5 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-sm font-extrabold text-white shadow-2xl shadow-black/20 transition-transform hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-[#25D366]/30 focus-visible:outline-none sm:right-7 sm:bottom-7"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 motion-safe:animate-ping" aria-hidden="true" />
      <span className="relative flex size-11 items-center justify-center rounded-full bg-white/15">
        <MessageCircle className="size-5" />
      </span>
      <span className="relative hidden pr-1 uppercase tracking-wide sm:inline">WhatsApp</span>
    </Link>
  );
}
