"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { AppointmentFormValues } from "@/components/dashboard/AppointmentForm";
import { DeleteAppointmentButton } from "@/components/dashboard/DeleteAppointmentButton";
import { EditAppointmentDialog } from "@/components/dashboard/EditAppointmentDialog";
import { StatusFilter } from "@/components/dashboard/StatusFilter";
import { StatusSelect } from "@/components/dashboard/StatusSelect";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Appointment,
  AppointmentStatus,
} from "@/types/appointment";

type AppointmentTableProps = {
  appointments: Appointment[];

  onEdit: (
    id: string,
    values: AppointmentFormValues
  ) => Promise<void>;

  onDelete: (id: string) => Promise<void>;

  onStatusChange: (
    id: string,
    status: AppointmentStatus
  ) => Promise<void>;
};

export function AppointmentTable({
  appointments,
  onEdit,
  onDelete,
  onStatusChange,
}: AppointmentTableProps) {
  const [search, setSearch] = useState("");

  const [status, setStatus] =
    useState<AppointmentStatus | "all">("all");

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesSearch =
        !query ||
        appointment.customer
          .toLowerCase()
          .includes(query) ||
        appointment.service
          .toLowerCase()
          .includes(query) ||
        appointment.date
          .toLowerCase()
          .includes(query) ||
        appointment.time
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "all" ||
        appointment.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, status]);

  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-md">
      <CardContent className="p-0">
        <div className="border-b border-border px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                <ClipboardList
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
                  Appointments
                </h2>

                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Manage and track all customer bookings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
              <CalendarDays
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span>
                {filteredAppointments.length}{" "}
                {filteredAppointments.length === 1
                  ? "appointment"
                  : "appointments"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-border bg-muted/20 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customer, service, date..."
                aria-label="Search appointments"
                className="h-11 rounded-xl border-border bg-background pl-10 pr-4"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal
                className="hidden h-4 w-4 text-muted-foreground sm:block"
                aria-hidden="true"
              />

              <StatusFilter
                value={status}
                onChange={setStatus}
              />
            </div>
          </div>

          {(search || status !== "all") && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Showing {filteredAppointments.length} of{" "}
                {appointments.length} appointments
              </span>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Clear search
                </button>
              )}

              {status !== "all" && (
                <button
                  type="button"
                  onClick={() => setStatus("all")}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Clear status
                </button>
              )}
            </div>
          )}
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Search
                className="h-6 w-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-card-foreground">
              No appointments found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              {search || status !== "all"
                ? "Try changing your search or status filter."
                : "Create your first appointment to see it listed here."}
            </p>

            {(search || status !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
                className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-4 sm:px-6">
                    Customer
                  </th>

                  <th className="px-4 py-4 sm:px-6">
                    Service
                  </th>

                  <th className="px-4 py-4 sm:px-6">
                    Date & Time
                  </th>

                  <th className="px-4 py-4 sm:px-6">
                    Status
                  </th>

                  <th className="px-4 py-4 text-right sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map(
                  (appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {appointment.customer
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-card-foreground">
                              {appointment.customer}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Customer
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <p className="text-sm font-medium text-card-foreground">
                          {appointment.service}
                        </p>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-card-foreground">
                            {appointment.date}
                          </span>

                          <span className="mt-0.5 text-xs text-muted-foreground">
                            {appointment.time}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <StatusSelect
                          appointmentId={
                            appointment.id
                          }
                          status={appointment.status}
                          onStatusChange={
                            onStatusChange
                          }
                        />
                      </td>

                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex justify-end gap-1">
                          <EditAppointmentDialog
                            appointment={appointment}
                            onSubmit={onEdit}
                          />

                          <DeleteAppointmentButton
                            appointmentId={
                              appointment.id
                            }
                            onDelete={onDelete}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}