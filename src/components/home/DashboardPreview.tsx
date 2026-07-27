import { CalendarDays, CreditCard, Users } from "lucide-react";

import { Section } from "@/components/ui/section";

export function DashboardPreview() {
  return (
    <Section>
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b px-6 py-4">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />

            <div className="ml-6 text-sm font-medium text-muted-foreground">
              SR Booking Dashboard
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-6 bg-slate-50 p-8 md:grid-cols-3">
            <StatCard
              icon={<CalendarDays className="h-6 w-6" />}
              title="Appointments"
              value="128"
            />

            <StatCard
              icon={<Users className="h-6 w-6" />}
              title="Customers"
              value="2,430"
            />

            <StatCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Revenue"
              value="$12,480"
            />
          </div>

          <div className="p-8">
            <div className="rounded-2xl border bg-white p-6">
              <h3 className="mb-6 text-lg font-semibold">
                Today's Schedule
              </h3>

              <div className="space-y-4">
                {[
                  "09:00 - Haircut",
                  "10:30 - Consultation",
                  "12:00 - Dental Check",
                  "15:30 - Fitness Coaching",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <span>{item}</span>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function StatCard({
  icon,
  title,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        {icon}
      </div>

      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>
    </div>
  );
}