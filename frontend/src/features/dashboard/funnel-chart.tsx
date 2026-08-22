interface FunnelChartProps {
  data: { stage: string; label: string; count: number }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => {
        const widthPercent = (item.count / max) * 100;

        return (
          <div key={item.stage} className="flex items-center gap-3">
            <span className="text-muted-foreground w-40 shrink-0 text-sm">{item.label}</span>
            <div className="flex-1">
              <div
                className="bg-primary h-6 rounded-r-[4px]"
                style={{ width: item.count > 0 ? `${widthPercent}%` : 0 }}
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
