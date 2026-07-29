import {
  CalendarDays,
  CreditCard,
  Scissors,
  Users,
} from "lucide-react";

import { RecentAppointments } from "@/components/dashboard/RecentAppointments";
import { StatCard } from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Welcome to SR Booking Platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Appointments"
          value="128"
          description="12 bookings today"
          icon={CalendarDays}
        />

        <StatCard
          title="Customers"
          value="42"
          description="5 new this week"
          icon={Users}
        />

        <StatCard
          title="Revenue"
          value="$4,250"
          description="+18% this month"
          icon={CreditCard}
        />

        <StatCard
          title="Services"
          value="8"
          description="Currently active"
          icon={Scissors}
        />
      </div>

      <RecentAppointments />
    </div>
  );
}