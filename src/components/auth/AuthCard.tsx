import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/common/FadeIn";

type AuthCardProps = {
  children: ReactNode;
};

export function AuthCard({
  children,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-6">
      <FadeIn>
        <Card className="w-full max-w-md rounded-3xl border-0 shadow-2xl">
          <CardContent className="p-10">
            {children}
          </CardContent>
        </Card>
      </FadeIn>
    </main>
  );
}