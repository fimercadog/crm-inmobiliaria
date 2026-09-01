"use client";

import { usePowerBiPalette } from "@/lib/chart-palette";

interface FunnelChartProps {
  data: { stage: string; label: string; count: number }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const palette = usePowerBiPalette();
  const max = Math.max(1, ...data.map((item) => item.count));
  // One flat accent color for every bar (matches the flat/minimal reference
  // look) — it still rotates each page load since palette[0] comes from the
  // shuffled palette, so "colors change on reload" still holds.
  const color = palette[0];

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => {
        const widthPercent = (item.count / max) * 100;

        return (
          <div key={item.stage} className="flex items-center gap-3">
            <span className="text-muted-foreground w-40 shrink-0 text-sm">{item.label}</span>
            <div className="flex-1 rounded-full bg-muted">
              <div
                className="h-6 rounded-full transition-[width]"
                style={{ width: item.count > 0 ? `${widthPercent}%` : 0, backgroundColor: color }}
                title={`${item.label}: ${item.count}`}
              />
            </div>
            <span className="text-foreground w-8 shrink-0 text-right text-sm font-medium tabular-nums">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
