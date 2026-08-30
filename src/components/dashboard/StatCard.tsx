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
    <Card
      className="
        group
        rounded-2xl
        border-border
        bg-card
        shadow-md
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-300
        hover:shadow-[0_15px_35px_rgba(37,99,235,0.18)]
      "
    >
      <CardContent className="flex items-center justify-between p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-2 truncate text-3xl font-bold tracking-tight">
            {value}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div
          className="
            ml-4
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-blue-100
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:bg-blue-600
            dark:bg-blue-950
            dark:group-hover:bg-blue-600
          "
        >
          <Icon
            className="
              h-7
              w-7
              text-blue-600
              transition-colors
              duration-300
              group-hover:text-white
              dark:text-blue-400
              dark:group-hover:text-white
            "
            aria-hidden="true"
          />
        </div>
      </CardContent>
    </Card>
  );
}