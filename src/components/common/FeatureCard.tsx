import { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group rounded-3xl border border-border/60 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:border-blue-300 hover:shadow-2xl">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-600">
        <Icon className="h-7 w-7 text-blue-600 transition-colors duration-500 group-hover:text-white" />
      </div>

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-muted-foreground">
        {description}
      </p>

      <button className="mt-8 font-semibold text-blue-600 transition-all duration-500 group-hover:translate-x-2">
        Learn More →
      </button>
    </div>
  );
}