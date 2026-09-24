"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenueChartData = {
  date: string;
  revenue: number;
};

type RevenueChartProps = {
  data: RevenueChartData[];
  currency: string;
};

export function RevenueChart({
  data,
  currency,
}: RevenueChartProps) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              formatter.format(value)
            }
            width={70}
          />

          <Tooltip
            formatter={(value) =>
              formatter.format(Number(value))
            }
            labelFormatter={(label) =>
              `Date: ${label}`
            }
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="currentColor"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            className="text-blue-600 dark:text-blue-400"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}