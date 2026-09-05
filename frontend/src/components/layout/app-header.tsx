"use client";

import { useRouter } from "next/navigation";
import { LogOut, TriangleAlert, User } from "lucide-react";
import { toast } from "sonner";
import { logout as logoutRequest } from "@/features/auth/api";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { clearCredentials } from "@/store/slices/authSlice";

interface AppHeaderProps {
  onShowBetaNotice: () => void;
}

export function AppHeader({ onShowBetaNotice }: AppHeaderProps) {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutRequest();
    } catch {
      // best-effort: proceed with local logout even if the request fails
    } finally {
      dispatch(clearCredentials());
      toast.success("Sesión cerrada correctamente");
      router.push("/login");
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Ver aviso de versión Beta" onClick={onShowBetaNotice}>
          <TriangleAlert className="text-warning" />
        </Button>
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Cuenta">
              <User className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.name ?? "Mi cuenta"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut className="size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
