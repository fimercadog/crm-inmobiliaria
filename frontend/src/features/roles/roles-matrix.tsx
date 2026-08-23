import { Check, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface PermissionRow {
  action: string;
  admin: boolean;
  agente: boolean;
  asistente: boolean;
}

const CRM_PERMISSIONS: PermissionRow[] = [
  { action: "Ver propiedades, personas, comercial", admin: true, agente: true, asistente: true },
  { action: "Crear y editar registros", admin: true, agente: true, asistente: false },
  { action: "Eliminar registros", admin: true, agente: false, asistente: false },
  { action: "Convertir leads a clientes", admin: true, agente: true, asistente: false },
];

const TEAM_PERMISSIONS: PermissionRow[] = [
  { action: "Ver el módulo Equipo (Usuarios, Agentes, Roles)", admin: true, agente: false, asistente: false },
  { action: "Crear, editar y eliminar usuarios", admin: true, agente: false, asistente: false },
  { action: "Asignar roles a otros usuarios", admin: true, agente: false, asistente: false },
];

function PermissionIcon({ granted }: { granted: boolean }) {
  return granted ? (
    <Check className="size-4 text-success" />
  ) : (
    <X className={cn("size-4 text-muted-foreground")} />
  );
}

function PermissionTable({ rows }: { rows: PermissionRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Acción</TableHead>
          <TableHead className="text-center">Administrador</TableHead>
          <TableHead className="text-center">Agente</TableHead>
          <TableHead className="text-center">Asistente</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.action}>
            <TableCell>{row.action}</TableCell>
            <TableCell className="text-center">
              <PermissionIcon granted={row.admin} />
            </TableCell>
            <TableCell className="text-center">
              <PermissionIcon granted={row.agente} />
            </TableCell>
            <TableCell className="text-center">
              <PermissionIcon granted={row.asistente} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function RolesMatrix() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Módulos inmobiliarios</CardTitle>
          <CardDescription>
            Propiedades, Propietarios, Clientes, Leads, Oportunidades, Visitas, Seguimientos y Tareas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionTable rows={CRM_PERMISSIONS} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipo</CardTitle>
          <CardDescription>Gestión de cuentas y asignación de roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionTable rows={TEAM_PERMISSIONS} />
        </CardContent>
      </Card>
    </div>
  );
}
