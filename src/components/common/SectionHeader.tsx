type SectionHeaderProps = {
  badge?: string;
  title: string;
  description?: string;
};

export function SectionHeader({
  badge,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      {badge && (
        <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
          {badge}
        </span>
      )}

      <h2 className="mt-5 text-4xl font-bold tracking-tight">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}