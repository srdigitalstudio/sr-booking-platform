"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  Sparkles,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: string | number | null;
};

type BusinessDayOfWeek =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

type BusinessHour = {
  id: string;
  dayOfWeek: BusinessDayOfWeek;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

type BusinessBreak = {
  id: string;
  dayOfWeek: BusinessDayOfWeek;
  startTime: string;
  endTime: string;
  label: string | null;
};

type BlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

type Appointment = {
  id: string;
  date: string;
  time: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED";
  service: {
    duration: number;
  };
};

function formatPrice(price: Service["price"]) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

  const numericPrice =
    typeof price === "number" ? price : Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Price on request";
  }

  return `$${numericPrice.toFixed(2)}`;
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getDateKey(date: Date) {
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

function getDayOfWeek(
  dateString: string
): BusinessDayOfWeek {
  const date = new Date(`${dateString}T00:00:00`);

  const days: BusinessDayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  return days[date.getDay()];
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
}

function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number,
  breaks: BusinessBreak[],
  appointments: Appointment[]
) {
  const slots: string[] = [];

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    start >= end
  ) {
    return slots;
  }

  for (
    let current = start;
    current + duration <= end;
    current += 30
  ) {
    const slotEnd = current + duration;

    const overlapsBreak = breaks.some(
      (businessBreak) => {
        const breakStart = timeToMinutes(
          businessBreak.startTime
        );

        const breakEnd = timeToMinutes(
          businessBreak.endTime
        );

        return (
          current < breakEnd &&
          slotEnd > breakStart
        );
      }
    );

    if (overlapsBreak) {
      continue;
    }

    const overlapsAppointment =
      appointments.some((appointment) => {
        if (
          appointment.status === "CANCELLED"
        ) {
          return false;
        }

        const appointmentStart =
          timeToMinutes(
            appointment.time
          );

        const appointmentDuration =
          appointment.service?.duration ?? 0;

        const appointmentEnd =
          appointmentStart +
          appointmentDuration;

        return (
          current < appointmentEnd &&
          slotEnd > appointmentStart
        );
      });

    if (!overlapsAppointment) {
      slots.push(
        minutesToTime(current)
      );
    }
  }

  return slots;
}

export default function BookingPage() {
  const [services, setServices] = useState<
    Service[]
  >([]);

  const [businessHours, setBusinessHours] =
    useState<BusinessHour[]>([]);

  const [businessBreaks, setBusinessBreaks] =
    useState<BusinessBreak[]>([]);

  const [blockedDates, setBlockedDates] =
    useState<BlockedDate[]>([]);

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [scheduleLoading, setScheduleLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [scheduleError, setScheduleError] =
    useState("");

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedTime, setSelectedTime] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        setLoading(true);
        setError("");

        const [
          servicesResponse,
          hoursResponse,
          breaksResponse,
          blockedResponse,
        ] = await Promise.all([
          fetch("/api/public/services", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/business-hours", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/business-breaks", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/blocked-dates", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const servicesData =
          await servicesResponse.json();

        if (!servicesResponse.ok) {
          throw new Error(
            servicesData?.error ||
              "Failed to load services."
          );
        }

        if (!Array.isArray(servicesData)) {
          throw new Error(
            "Invalid services response."
          );
        }

        const hoursData =
          await hoursResponse.json();

        const breaksData =
          await breaksResponse.json();

        const blockedData =
          await blockedResponse.json();

        if (cancelled) {
          return;
        }

        setServices(servicesData);

        if (
          hoursResponse.ok &&
          Array.isArray(hoursData)
        ) {
          setBusinessHours(hoursData);
        } else {
          setBusinessHours([]);
        }

        if (
          breaksResponse.ok &&
          Array.isArray(breaksData)
        ) {
          setBusinessBreaks(breaksData);
        } else {
          setBusinessBreaks([]);
        }

        if (
          blockedResponse.ok &&
          Array.isArray(blockedData)
        ) {
          setBlockedDates(blockedData);
        } else {
          setBlockedDates([]);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load booking data:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load booking data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      if (!selectedDate) {
        setAppointments([]);
        setScheduleLoading(false);
        setScheduleError("");
        return;
      }

      try {
        setScheduleLoading(true);
        setScheduleError("");
        setSelectedTime("");

        const response = await fetch(
          `/api/public/appointments?date=${encodeURIComponent(
            selectedDate
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setAppointments([]);
            setScheduleError(
              "Unable to load available times."
            );
          }

          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setAppointments(
            Array.isArray(data) ? data : []
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load appointments:",
          error
        );

        setAppointments([]);
        setScheduleError(
          "Unable to load available times."
        );
      } finally {
        if (!cancelled) {
          setScheduleLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const today = useMemo(
    () => getDateKey(new Date()),
    []
  );

  const selectedDayOfWeek = selectedDate
    ? getDayOfWeek(selectedDate)
    : null;

  const selectedBusinessHour =
    selectedDayOfWeek
      ? businessHours.find(
          (businessHour) =>
            businessHour.dayOfWeek ===
            selectedDayOfWeek
        )
      : null;

  const selectedBreaks =
    selectedDayOfWeek
      ? businessBreaks.filter(
          (businessBreak) =>
            businessBreak.dayOfWeek ===
            selectedDayOfWeek
        )
      : [];

  const blockedDate =
    selectedDate
      ? blockedDates.find(
          (item) =>
            item.date.slice(0, 10) ===
            selectedDate
        )
      : undefined;

  const isBlockedDate =
    Boolean(blockedDate);

  const availableTimeSlots =
    selectedService &&
    selectedBusinessHour?.isOpen &&
    !isBlockedDate &&
    !scheduleLoading
      ? generateTimeSlots(
          selectedBusinessHour.startTime,
          selectedBusinessHour.endTime,
          selectedService.duration,
          selectedBreaks,
          appointments
        )
      : [];

  function selectService(service: Service) {
    setSelectedService(service);
    setSelectedDate("");
    setSelectedTime("");
    setAppointments([]);
    setScheduleError("");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-semibold"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              SR
            </span>

            <span className="hidden sm:inline">
              SR Booking
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-blue-50 via-background to-background dark:from-blue-950/30 dark:via-background dark:to-background">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-600/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-600 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              Simple & convenient booking
            </div>

            <h1 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Book your appointment
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Choose a service and select a
              convenient date and time.
            </p>
          </div>

          {/* Booking steps */}
          <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center">
            <div className="flex w-full items-center justify-center">
              <div
                className={[
                  "flex items-center gap-3",
                  selectedService
                    ? "text-blue-600 dark:text-blue-400"
                    : "",
                ].join(" ")}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
                  {selectedService ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "1"
                  )}
                </div>

                <span className="text-sm font-semibold">
                  Service
                </span>
              </div>

              <div className="mx-3 h-px w-12 bg-border sm:mx-5 sm:w-20" />

              <div
                className={[
                  "flex items-center gap-3",
                  selectedService
                    ? "text-foreground"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                    selectedService
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-border bg-muted/40",
                  ].join(" ")}
                >
                  2
                </div>

                <span className="hidden text-sm font-medium sm:inline">
                  Date & time
                </span>
              </div>

              <div className="mx-3 h-px w-12 bg-border sm:mx-5 sm:w-20" />

              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/40 text-sm font-semibold">
                  3
                </div>

                <span className="hidden text-sm font-medium sm:inline">
                  Details
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Step 1
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Select a service
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Choose the service you&apos;d like to
            book.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-card shadow-md">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              Loading available services...
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <CalendarDays className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Unable to load services
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          services.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <CalendarDays className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-lg font-semibold">
                No services available
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                There are currently no active
                services available for booking.
              </p>
            </div>
          )}

        {/* Service cards */}
        {!loading &&
          !error &&
          services.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const selected =
                  selectedService?.id === service.id;

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() =>
                      selectService(service)
                    }
                    className={[
                      "group relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-md",
                      "transition-all duration-300",
                      "hover:-translate-y-1 hover:shadow-xl",
                      selected
                        ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xl"
                        : "",
                    ].join(" ")}
                  >
                    {selected && (
                      <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                        <Check className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={[
                        "flex h-14 w-14 items-center justify-center rounded-2xl",
                        "bg-blue-100 text-blue-600",
                        "transition-all duration-300",
                        "group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white",
                        "dark:bg-blue-950 dark:text-blue-400",
                        "dark:group-hover:bg-blue-600 dark:group-hover:text-white",
                      ].join(" ")}
                    >
                      <CalendarDays className="h-7 w-7" />
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-tight">
                      {service.name}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {service.description ||
                        "Professional service with a convenient appointment experience."}
                    </p>

                    <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />

                        <span>
                          {service.duration} min
                        </span>
                      </div>

                      <span className="text-base font-bold">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
      </section>

      {/* Date & time */}
      {selectedService && (
        <section className="border-t border-border/60 bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Step 2
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Choose date & time
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Select a date and an available time
                for {selectedService.name}.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              {/* Date */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Select a date
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Pick your preferred day.
                    </p>
                  </div>
                </div>

                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(
                      event.target.value
                    );
                    setSelectedTime("");
                  }}
                  className="mt-6 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                {selectedDate && (
                  <div className="mt-5 rounded-xl bg-muted/50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Selected date
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatDate(selectedDate)}
                    </p>
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Available times
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Times are based on business
                      hours and existing bookings.
                    </p>
                  </div>
                </div>

                {!selectedDate && (
                  <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
                    <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />

                    <p className="mt-3 text-sm font-medium">
                      Select a date first
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Available appointment times
                      will appear here.
                    </p>
                  </div>
                )}

                {selectedDate &&
                  isBlockedDate && (
                    <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                      <p className="font-semibold">
                        This date is unavailable
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {blockedDate?.reason ||
                          "This date is blocked for bookings."}
                      </p>
                    </div>
                  )}

                {selectedDate &&
                  !isBlockedDate &&
                  selectedBusinessHour &&
                  !selectedBusinessHour.isOpen && (
                    <div className="mt-6 rounded-xl border border-border bg-muted/40 p-6 text-center">
                      <p className="font-semibold">
                        We are closed on this day
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Please choose another date.
                      </p>
                    </div>
                  )}

                {selectedDate &&
                  !isBlockedDate &&
                  !selectedBusinessHour && (
                    <div className="mt-6 rounded-xl border border-border bg-muted/40 p-6 text-center">
                      <p className="font-semibold">
                        Schedule unavailable
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Business hours have not been
                        configured for this day.
                      </p>
                    </div>
                  )}

                {selectedDate &&
                  !isBlockedDate &&
                  selectedBusinessHour?.isOpen &&
                  scheduleLoading && (
                    <div className="mt-6 flex min-h-[180px] items-center justify-center rounded-xl border border-border bg-muted/20">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                        Checking available times...
                      </div>
                    </div>
                  )}

                {selectedDate &&
                  !isBlockedDate &&
                  selectedBusinessHour?.isOpen &&
                  !scheduleLoading &&
                  scheduleError && (
                    <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                      <p className="font-semibold">
                        Unable to load times
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {scheduleError}
                      </p>
                    </div>
                  )}

                {selectedDate &&
                  !isBlockedDate &&
                  selectedBusinessHour?.isOpen &&
                  !scheduleLoading &&
                  !scheduleError &&
                  availableTimeSlots.length ===
                    0 && (
                    <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
                      <Clock3 className="mx-auto h-8 w-8 text-muted-foreground" />

                      <p className="mt-3 font-semibold">
                        No available times
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        There are no available
                        appointment times for this
                        date.
                      </p>
                    </div>
                  )}

                {selectedDate &&
                  !isBlockedDate &&
                  selectedBusinessHour?.isOpen &&
                  !scheduleLoading &&
                  !scheduleError &&
                  availableTimeSlots.length >
                    0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {availableTimeSlots.map(
                        (time) => {
                          const selected =
                            selectedTime === time;

                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() =>
                                setSelectedTime(
                                  time
                                )
                              }
                              className={[
                                "inline-flex h-12 items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-200",
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white shadow-md"
                                  : "border-border bg-background hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40",
                              ].join(" ")}
                            >
                              <Clock3 className="mr-2 h-4 w-4" />
                              {time}
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}

                {selectedDate &&
                  selectedBusinessHour?.isOpen &&
                  selectedBreaks.length > 0 && (
                    <p className="mt-5 text-xs text-muted-foreground">
                      Break times are automatically
                      excluded from available slots.
                    </p>
                  )}

                {selectedDate &&
                  selectedBusinessHour?.isOpen && (
                    <div className="mt-6 rounded-xl bg-muted/50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Business hours
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {
                          selectedBusinessHour.startTime
                        }{" "}
                        –{" "}
                        {
                          selectedBusinessHour.endTime
                        }
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Service duration:{" "}
                        {selectedService.duration}{" "}
                        minutes
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Selection footer */}
      {selectedService && (
        <div className="sticky bottom-0 z-40 border-t border-border/60 bg-background/90 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your selection
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-semibold">
                  {selectedService.name}
                </p>

                <span className="text-sm text-muted-foreground">
                  {selectedService.duration} min
                </span>

                {selectedDate && (
                  <span className="text-sm text-muted-foreground">
                    {formatDate(selectedDate)}
                  </span>
                )}

                {selectedTime && (
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {selectedTime}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedDate || !selectedTime}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}