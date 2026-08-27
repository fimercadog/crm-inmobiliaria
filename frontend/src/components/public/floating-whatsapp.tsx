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
      className="realty-whatsapp-float group fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/20 transition-transform hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-[#25D366]/30 focus-visible:outline-none sm:right-7 sm:bottom-7 sm:size-16"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-ping" aria-hidden="true" />
      <MessageCircle className="relative size-7 sm:size-8" />
    </Link>
  );
}
