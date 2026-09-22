"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
} from "lucide-react";

import { Appointment } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AppointmentCalendarProps = {
  appointments: Appointment[];
};

type CalendarDay = {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
};

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const statusClasses: Record<
  Appointment["status"],
  string
> = {
  confirmed:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  cancelled:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  completed:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300",
};

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0"
  );

  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

function getCalendarDays(month: Date): CalendarDay[] {
  const firstDay = startOfMonth(month);
  const firstWeekday = firstDay.getDay();

  const gridStart = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    1 - firstWeekday
  );

  const today = new Date();
  const todayKey = formatDateKey(today);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index
    );

    return {
      date,
      dateKey: formatDateKey(date),
      isCurrentMonth:
        date.getMonth() === month.getMonth() &&
        date.getFullYear() === month.getFullYear(),
      isToday: formatDateKey(date) === todayKey,
    };
  });
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSelectedDate(dateKey: string) {
  const [year, month, day] =
    dateKey.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatStatus(
  status: Appointment["status"]
) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

export function AppointmentCalendar({
  appointments,
}: AppointmentCalendarProps) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] =
    useState(() => startOfMonth(today));

  const [selectedDate, setSelectedDate] =
    useState(() => formatDateKey(today));

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const appointmentsByDate = useMemo(() => {
    const map = new Map<
      string,
      Appointment[]
    >();

    for (const appointment of appointments) {
      const existing =
        map.get(appointment.date) ?? [];

      existing.push(appointment);
      map.set(appointment.date, existing);
    }

    for (const dayAppointments of map.values()) {
      dayAppointments.sort((a, b) =>
        a.time.localeCompare(b.time)
      );
    }

    return map;
  }, [appointments]);

  const selectedAppointments =
    appointmentsByDate.get(selectedDate) ?? [];

  function goToPreviousMonth() {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1
        )
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1
        )
    );
  }

  function goToToday() {
    const now = new Date();

    setCurrentMonth(startOfMonth(now));
    setSelectedDate(formatDateKey(now));
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-md">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-border px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-card-foreground">
                Calendar
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                View appointments by date.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-lg px-3"
                onClick={goToToday}
              >
                Today
              </Button>

              <div className="flex items-center rounded-lg border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={goToPreviousMonth}
                  aria-label="Previous month"
                  title="Previous month"
                >
                  <ChevronLeft
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>

                <div className="min-w-[150px] px-3 text-center text-sm font-semibold">
                  {formatMonthTitle(currentMonth)}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                  title="Next month"
                >
                  <ChevronRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="border-r border-border bg-muted/30 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const dayAppointments =
                appointmentsByDate.get(
                  day.dateKey
                ) ?? [];

              const isSelected =
                day.dateKey === selectedDate;

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  onClick={() =>
                    setSelectedDate(day.dateKey)
                  }
                  className={`min-h-[110px] border-b border-r border-border p-2 text-left align-top transition last:border-r-0 hover:bg-muted/40 ${
                    !day.isCurrentMonth
                      ? "bg-muted/10 text-muted-foreground"
                      : "bg-background"
                  } ${
                    isSelected
                      ? "bg-blue-50/70 ring-2 ring-inset ring-blue-500 dark:bg-blue-950/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        day.isToday
                          ? "bg-blue-600 text-white"
                          : day.isCurrentMonth
                            ? "text-card-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {day.date.getDate()}
                    </span>

                    {dayAppointments.length > 0 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1">
                    {dayAppointments
                      .slice(0, 3)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`truncate rounded-md border px-2 py-1 text-[11px] font-medium ${statusClasses[appointment.status]}`}
                        >
                          <span className="font-semibold">
                            {appointment.time}
                          </span>{" "}
                          {appointment.customer}
                        </div>
                      ))}

                    {dayAppointments.length > 3 && (
                      <div className="px-1 text-[10px] font-medium text-muted-foreground">
                        +
                        {dayAppointments.length - 3}{" "}
                        more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-card shadow-md">
        <CardContent className="p-0">
          <div className="border-b border-border px-4 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                <Clock3
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight text-card-foreground">
                  {formatSelectedDate(
                    selectedDate
                  )}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedAppointments.length}{" "}
                  {selectedAppointments.length === 1
                    ? "appointment"
                    : "appointments"}{" "}
                  scheduled
                </p>
              </div>
            </div>
          </div>

          {selectedAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Plus
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-3 text-sm font-medium text-card-foreground">
                No appointments for this day.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Select another date to view its
                appointments.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {selectedAppointments.map(
                (appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="shrink-0 text-sm font-semibold text-card-foreground">
                          {appointment.time}
                        </span>

                        <span className="truncate text-sm font-medium text-card-foreground">
                          {appointment.customer}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {appointment.service}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[appointment.status]}`}
                    >
                      {formatStatus(
                        appointment.status
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}