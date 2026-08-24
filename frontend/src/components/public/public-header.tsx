"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PUBLIC_NAV_LINKS } from "@/constants/public-navigation";
import { SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Building2 className="size-4.5" />
          </span>
          <span className="font-(family-name:--font-display) text-lg font-semibold tracking-tight">
            {SITE_CONFIG.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive(pathname, link.href) ? "text-primary" : "text-foreground/80",
              )}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 lg:block">
          <Button asChild size="sm">
            <Link href="/vender-mi-propiedad">Vende tu propiedad</Link>
          </Button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="public-theme flex w-full flex-col gap-0 sm:max-w-xs">
            <SheetHeader>
              <SheetTitle className="font-(family-name:--font-display)">{SITE_CONFIG.name}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {PUBLIC_NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive(pathname, link.href) ? "bg-accent text-primary" : "text-foreground",
                    )}
                  >
                    {link.title}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/vender-mi-propiedad">Vende tu propiedad</Link>
                </Button>
              </SheetClose>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Acceso agentes</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
