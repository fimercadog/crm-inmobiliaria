import type { LucideIcon } from "lucide-react";
import { Building2, Globe, Handshake, LayoutDashboard, Settings, Target, Users, UsersRound, WifiOff } from "lucide-react";

export interface NavLink {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: { title: string; href: string; writeOnly?: boolean }[];
  adminOnly?: boolean;
}

export const DASHBOARD_LINK: NavLink = { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard };

// Promoted out of BOTTOM_LINKS: reports are a destination people visit
// often, not a utility like Settings — burying it at the very bottom of the
// sidebar next to Configuración made it hard to find.
export const REPORTS_LINK: NavLink = { title: "Reportes", href: "/reports", icon: Target };

// Emergency-equipment placement, not filed inside a submenu: an admin should
// see this — and its live status — without opening anything first.
export const CONTINGENCY_LINK: NavLink = {
  title: "Modo contingencia",
  href: "/settings/contingency",
  // WifiOff over a generic shield icon — contingency mode IS "working
  // without a connection," so the icon should say that directly.
  icon: WifiOff,
  adminOnly: true,
};

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
      { title: "Cierres", href: "/closings" },
    ],
  },
  {
    title: "Sitio web",
    icon: Globe,
    items: [
      { title: "Blog", href: "/blog-posts" },
      { title: "Nuevo artículo", href: "/blog-posts/new", writeOnly: true },
    ],
  },
  {
    title: "Equipo",
    icon: UsersRound,
    adminOnly: true,
    items: [
      { title: "Agentes", href: "/team/agents" },
      { title: "Usuarios", href: "/team/users" },
      { title: "Roles", href: "/team/roles" },
    ],
  },
];

export const BOTTOM_LINKS: NavLink[] = [{ title: "Configuración", href: "/settings", icon: Settings }];
