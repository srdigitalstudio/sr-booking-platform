import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("py-20 lg:py-28", className)}>
      <Container>{children}</Container>
    </section>
  );
}