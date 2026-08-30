import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

type LayoutProps = {
  children: ReactNode;
};

export default async function Layout({
  children,
}: LayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}