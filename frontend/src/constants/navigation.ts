import type { LucideIcon } from "lucide-react";
import { Building2, Handshake, LayoutDashboard, Settings, Target, Users, UsersRound } from "lucide-react";

export interface NavLink {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: { title: string; href: string; writeOnly?: boolean }[];
  adminOnly?: boolean;
}

export const DASHBOARD_LINK: NavLink = { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Propiedades",
    icon: Building2,
    items: [
      { title: "Todas", href: "/properties" },
      { title: "Disponibles", href: "/properties?status=disponible" },
      { title: "Reservadas", href: "/properties?status=reservado" },
      { title: "Vendidas", href: "/properties?status=vendido" },
      { title: "Arrendadas", href: "/properties?status=arrendado" },
      { title: "Nueva propiedad", href: "/properties/new", writeOnly: true },
    ],
  },
  {
    title: "Personas",
    icon: Users,
    items: [
      { title: "Propietarios", href: "/owners" },
      { title: "Clientes", href: "/clients" },
      { title: "Leads", href: "/leads" },
    ],
  },
  {
    title: "Comercial",
    icon: Handshake,
    items: [
      { title: "Oportunidades", href: "/opportunities" },
      { title: "Visitas", href: "/visits" },
      { title: "Seguimientos", href: "/activities" },
      { title: "Tareas", href: "/tasks" },
    ],
  },
  {
    title: "Equipo",
    icon: UsersRound,
    adminOnly: true,
    items: [{ title: "Usuarios", href: "/team/users" }],
  },
];

export const BOTTOM_LINKS: NavLink[] = [
  { title: "Reportes", href: "/reports", icon: Target },
  { title: "Configuración", href: "/settings", icon: Settings },
];
