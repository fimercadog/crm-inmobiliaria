interface FunnelChartProps {
  data: { stage: string; label: string; count: number }[];
}

// One color per stage instead of a single flat bar color — a funnel where
// every stage looks the same doesn't read as a funnel at a glance.
const STAGE_COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-5)", "var(--chart-2)", "var(--chart-4)", "var(--destructive)"];

export function FunnelChart({ data }: FunnelChartProps) {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div className="flex flex-col gap-3">
      {data.map((item, index) => {
        const widthPercent = (item.count / max) * 100;
        const color = STAGE_COLORS[index % STAGE_COLORS.length];

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
