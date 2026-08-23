"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronRight } from "lucide-react";
import { BOTTOM_LINKS, DASHBOARD_LINK, NAV_GROUPS } from "@/constants/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

function isPathActive(pathname: string, href: string): boolean {
  const [base] = href.split("?");
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin, canWrite } = usePermissions();
  const { isMobile, setOpenMobile } = useSidebar();
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
                  <span className="font-semibold">CRM Inmobiliaria</span>
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

            {visibleGroups.map((group) => {
              const groupActive = group.items.some((item) => isPathActive(pathname, item.href));

              return (
                <Collapsible key={group.title} defaultOpen={groupActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={groupActive}>
                        <group.icon />
                        <span>{group.title}</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item) => (
                          <SidebarMenuSubItem key={item.href}>
                            <SidebarMenuSubButton asChild isActive={isPathActive(pathname, item.href)}>
                              <Link href={item.href} onClick={closeOnMobile}>{item.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
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
