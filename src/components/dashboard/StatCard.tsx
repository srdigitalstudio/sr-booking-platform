import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="group rounded-2xl border-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex min-h-[140px] items-center justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {value}
          </h3>

          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14">
          <Icon
            className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7"
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  );
}