"use client";

import { useMemo, useState } from "react";

import { SearchBar } from "@/components/dashboard/SearchBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { StatusFilter } from "@/components/dashboard/StatusFilter";
import { Card, CardContent } from "@/components/ui/card";
import { Appointment, AppointmentStatus } from "@/types/appointment";

type AppointmentTableProps = {
  appointments: Appointment[];
};

export function AppointmentTable({
  appointments,
}: AppointmentTableProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const query = search.toLowerCase();

      const matchesSearch =
        appointment.customer.toLowerCase().includes(query) ||
        appointment.service.toLowerCase().includes(query);

      const matchesStatus =
        status === "all" || appointment.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, status]);

  return (
    <Card className="rounded-2xl border-0 shadow-md">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchBar
            placeholder="Search appointments..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <StatusFilter
            value={status}
            onChange={setStatus}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-slate-50 text-left text-sm font-medium text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b transition hover:bg-slate-50 last:border-0"
                >
                  <td className="px-6 py-4 font-medium">
                    {appointment.customer}
                  </td>

                  <td className="px-6 py-4">
                    {appointment.service}
                  </td>

                  <td className="px-6 py-4">
                    {appointment.date} • {appointment.time}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={appointment.status} />
                  </td>
                </tr>
              ))}

              {filteredAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}