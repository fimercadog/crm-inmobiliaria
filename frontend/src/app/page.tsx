import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CRM Inmobiliaria</h1>
          <p className="text-muted-foreground text-sm">Design system en construcción — Fase 4</p>
        </div>
        <ModeToggle />
      </header>

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
    </main>
  );
}
