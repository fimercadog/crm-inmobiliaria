"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Sparkles } from "lucide-react";
import { BOTTOM_LINKS, CONTINGENCY_LINK, DASHBOARD_LINK, NAV_GROUPS, REPORTS_LINK } from "@/constants/navigation";
import { useContingency } from "@/features/contingency/contingency-context";
import { usePermissions } from "@/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PremiumBadge } from "@/components/shared/premium-badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

function isPathActive(pathname: string, href: string): boolean {
  const [base] = href.split("?");
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin, canWrite: roleCanWrite } = usePermissions();
  const { active: contingencyActive, transactions } = useContingency();
  const hasContingencyIssues = transactions.some((tx) => tx.status === "CONFLICT" || tx.status === "FAILED");
  const { isMobile, setOpenMobile } = useSidebar();
  // writeOnly sidebar shortcuts don't carry a module key, so contingency
  // hides all of them while active rather than guessing which module each
  // belongs to — conservative, and correct today since the one enabled
  // module (Seguimientos) has no writeOnly shortcut of its own here.
  const canWrite = roleCanWrite && !contingencyActive;
  const visibleGroups = NAV_GROUPS.filter((group) => !group.adminOnly || isAdmin).map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.writeOnly || canWrite),
  }));

  function closeOnMobile() {
    if (isMobile) setOpenMobile(false);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" onClick={closeOnMobile}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="flex items-center gap-1.5 font-semibold">
                    CRM Inmobiliaria
                    <Badge className="bg-warning px-1.5 py-0 text-[10px] font-semibold text-warning-foreground">
                      Beta
                    </Badge>
                  </span>
                  <span className="text-xs text-muted-foreground">Gestión inmobiliaria</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isPathActive(pathname, DASHBOARD_LINK.href)}>
                <Link href={DASHBOARD_LINK.href} onClick={closeOnMobile}>
                  <DASHBOARD_LINK.icon />
                  <span>{DASHBOARD_LINK.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isPathActive(pathname, REPORTS_LINK.href)}>
                <Link href={REPORTS_LINK.href} onClick={closeOnMobile}>
                  <REPORTS_LINK.icon />
                  <span>{REPORTS_LINK.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuButton className="border border-primary/40 bg-primary/10 font-medium text-foreground hover:bg-primary/15">
                    <Sparkles className="text-primary" />
                    <span>IA</span>
                    <PremiumBadge className="ml-auto" />
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Inteligencia Artificial para tu Inmobiliaria</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Potenciá la gestión comercial de tu inmobiliaria con una herramienta de inteligencia
                      artificial diseñada para{" "}
                      <strong className="font-semibold text-foreground">
                        apoyar tus procesos, facilitar el análisis de información y ayudarte en la toma de
                        decisiones
                      </strong>
                      .
                    </p>
                    <p>
                      Podés utilizarla para analizar el desempeño de tu cartera de propiedades, identificar
                      tendencias de precios y demanda, resumir información de clientes y leads, redactar
                      descripciones y comunicados, consultar datos de propiedades y oportunidades, y obtener
                      apoyo para interpretar indicadores como tasa de conversión, tiempo promedio de cierre y
                      rotación de inventario.
                    </p>
                    <p>
                      La inteligencia artificial funciona como un{" "}
                      <strong className="font-semibold text-foreground">asistente para tu equipo comercial</strong>,
                      permitiendo trabajar de forma más ágil y obtener información útil a partir de los datos
                      disponibles en el sistema.
                    </p>
                    <p className="font-medium text-foreground">
                      Esta funcionalidad está disponible en el plan Premium. Para activarla o conocer las
                      opciones disponibles, comunicate con el administrador de tu sistema.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>

            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isPathActive(pathname, CONTINGENCY_LINK.href)}
                  className={
                    contingencyActive
                      ? "bg-destructive font-medium text-white hover:bg-destructive hover:text-white data-active:bg-destructive data-active:text-white"
                      : "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive data-active:bg-destructive/15 data-active:text-destructive"
                  }
                >
                  {/* Emergency control — reads as important even at rest (tinted
                   * row + destructive text), and turns into a solid red bar the
                   * moment it's actually active. */}
                  <Link href={CONTINGENCY_LINK.href} onClick={closeOnMobile}>
                    <CONTINGENCY_LINK.icon className={contingencyActive ? "text-white" : "text-destructive"} />
                    <span>{CONTINGENCY_LINK.title}</span>
                    {contingencyActive && (
                      <Badge
                        className={`ml-auto bg-white font-semibold text-destructive${
                          hasContingencyIssues ? " animate-pulse" : ""
                        }`}
                      >
                        Activa
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

          </SidebarMenu>
        </SidebarGroup>

        {visibleGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>
              <group.icon className="mr-1.5 size-3.5" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isPathActive(pathname, item.href)}>
                    <Link href={item.href} onClick={closeOnMobile}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {BOTTOM_LINKS.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton asChild isActive={isPathActive(pathname, link.href)}>
                <Link href={link.href} onClick={closeOnMobile}>
                  <link.icon />
                  <span>{link.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
