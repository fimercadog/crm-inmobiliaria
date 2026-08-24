import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/features/public-leads/lead-form";
import { buildWhatsAppUrl } from "@/constants/site";

export function PropertyCTA({ propertyId, title, code }: { propertyId: number; title: string; code: string }) {
  const whatsappUrl = buildWhatsAppUrl(`Hola, estoy interesado en la propiedad ${code} - ${title}.`);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estoy interesado en esta propiedad</CardTitle>
        <CardDescription>Escríbenos por WhatsApp o déjanos tus datos y un asesor te contactará.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <Button asChild size="lg" className="w-full bg-[#25D366] text-white hover:bg-[#1ebe57]">
          <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle />
            Escribir por WhatsApp
          </Link>
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase">
          <span className="h-px flex-1 bg-border" />
          o completa el formulario
          <span className="h-px flex-1 bg-border" />
        </div>

        <LeadForm
          intent="compra_arriendo"
          propertyId={propertyId}
          messagePlaceholder="Cuéntanos qué te gustaría saber sobre esta propiedad"
          submitLabel="Solicitar información"
        />
      </CardContent>
    </Card>
  );
}
