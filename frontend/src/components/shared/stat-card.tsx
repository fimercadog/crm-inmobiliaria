import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {Icon && (
          <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Icon className="size-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
