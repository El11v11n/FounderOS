"use client";

import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Point = { week: string; net: number };

function SparkTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded border border-border-strong bg-surface-raised px-2 py-1 font-mono text-[11px] tracking-wider text-foreground shadow-lg">
      {point.week} · {point.net >= 0 ? "+" : "−"}€{Math.abs(point.net)}
    </div>
  );
}

/**
 * 12-point trend sparkline for stat cards: 2px accent line, faint gradient
 * fill, zero baseline, hover tooltip. No axes by design — the tile's value
 * and delta carry the numbers.
 */
export function Sparkline({ data }: { data: Point[] }) {
  return (
    <div className="h-16 w-full" aria-hidden={false}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ReferenceLine y={0} stroke="var(--border-strong)" strokeWidth={1} />
          <Tooltip
            content={<SparkTooltip />}
            cursor={{ stroke: "var(--faint)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="net"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#spark-fill)"
            dot={false}
            activeDot={{
              r: 3,
              fill: "var(--accent-strong)",
              stroke: "var(--surface)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
