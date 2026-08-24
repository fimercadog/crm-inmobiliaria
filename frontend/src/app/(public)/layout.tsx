import { Fraunces } from "next/font/google";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { FloatingWhatsApp } from "@/components/public/floating-whatsapp";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`public-theme ${fraunces.variable} flex min-h-svh flex-col bg-background text-foreground`}>
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <FloatingWhatsApp />
    </div>
  );
}
