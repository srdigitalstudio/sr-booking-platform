import { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  compact?: boolean;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  compact = false,
}: StatCardProps) {
  return (
    <Card
      className={`
        group
        rounded-2xl
        border-border
        bg-card
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-300
        hover:shadow-[0_15px_35px_rgba(37,99,235,0.14)]
        dark:hover:border-blue-800
        dark:hover:shadow-[0_15px_35px_rgba(37,99,235,0.12)]
        ${compact ? "shadow-none" : ""}
      `}
    >
      <CardContent
        className={`flex items-center justify-between ${
          compact ? "gap-3 p-4 sm:p-5" : "gap-4 p-5 sm:p-6"
        }`}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h3
            className={`mt-2 truncate font-bold tracking-tight ${
              compact
                ? "text-2xl sm:text-3xl"
                : "text-2xl sm:text-3xl"
            }`}
          >
            {value}
          </h3>

          <p className="mt-1.5 truncate text-xs text-muted-foreground sm:text-sm">
            {description}
          </p>
        </div>

        <div
          className={`
            ml-2
            flex
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-blue-100
            text-blue-600
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:bg-blue-600
            group-hover:text-white
            dark:bg-blue-950
            dark:text-blue-400
            dark:group-hover:bg-blue-600
            dark:group-hover:text-white
            ${compact ? "h-11 w-11" : "h-12 w-12 sm:h-14 sm:w-14"}
          `}
        >
          <Icon
            className={
              compact
                ? "h-5 w-5"
                : "h-6 w-6 sm:h-7 sm:w-7"
            }
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  );
}