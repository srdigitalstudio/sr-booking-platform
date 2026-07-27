import { cn } from "@/lib/utils";

type SectionProps = React.HTMLAttributes<HTMLElement>;

export function Section({
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("py-24", className)}
      {...props}
    >
      <div className="mx-auto max-w-7xl px-6">
        {children}
      </div>
    </section>
  );
}

type SectionHeaderProps = {
  badge?: string;
  title: string;
  subtitle?: string;
};

export function SectionHeader({
  badge,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-16 max-w-3xl text-center">
      {badge && (
        <span className="mb-4 inline-flex rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-600">
          {badge}
        </span>
      )}

      <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-6 text-lg text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}