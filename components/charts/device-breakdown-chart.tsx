"use client";

import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface DeviceBreakdownChartProps {
  data: { type: string; count: number }[];
}

const COLORS = ["#A3E635", "#84CC16", "#65A30D", "#4D7C0F", "#3F6212"];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2 shadow-lg">
      <p className="font-mono text-[11px] text-zinc-400">{payload[0].name}</p>
      <p className="font-mono text-sm font-semibold text-lime-300">
        {payload[0].value} clicks
      </p>
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-3 pt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-mono text-[11px] text-zinc-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function DeviceBreakdownChart({ data }: DeviceBreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-zinc-500 sm:h-[280px]">
        No device data yet.
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="count"
            nameKey="type"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
