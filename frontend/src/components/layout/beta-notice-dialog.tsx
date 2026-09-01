"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Cleared on every fresh login (see login-form.tsx) so the auto-popup shows
 * once per session, not once forever — the header button (see app-header.tsx)
 * can always reopen it regardless of this flag. */
export const BETA_NOTICE_KEY = "crm_beta_notice_seen";

interface BetaNoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BetaNoticeDialog({ open, onOpenChange }: BetaNoticeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Estás en la versión Beta</DialogTitle>
            <Badge className="bg-warning font-semibold text-warning-foreground">Beta</Badge>
          </div>
          <DialogDescription>
            Antes de que sigas explorando, un par de cosas que vale la pena saber.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Este CRM ya pasó por pruebas de desarrollo — módulos, permisos por
          rol y flujos completos verificados uno por uno — y funciona con
          datos de demostración reales (propiedades, clientes, reportes).
          Sigue siendo una beta: es posible que encuentres algún detalle por
          pulir mientras seguimos afinando el producto. Si ves algo raro,
          cuéntanoslo.
        </p>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
