import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Vista general del negocio inmobiliario — en construcción (Fase 14)"
      />

      <Card>
        <CardHeader>
          <CardTitle>Botones</CardTitle>
          <CardDescription>Variantes y tamaños del sistema de botones</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estados</CardTitle>
          <CardDescription>Badges de estado para propiedades, oportunidades y visitas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge className="bg-success text-success-foreground">Disponible</Badge>
          <Badge className="bg-warning text-warning-foreground">Reservado</Badge>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
