"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: string | number | null;
};

type AvailabilityResponse = {
  available: boolean;
  reason?: string;
  slots: string[];
  businessHours?: {
    startTime: string;
    endTime: string;
  };
  breaks?: {
    id: string;
    startTime: string;
    endTime: string;
    label: string | null;
  }[];
};

type BookingResponse = {
  success: boolean;
  appointment: {
    id: string;
    date: string;
    time: string;
    status: string;
    customer: {
      name: string;
      email: string | null;
      phone: string | null;
    };
    service: {
      id: string;
      name: string;
      duration: number;
      price: string | null;
    };
  };
};

function formatPrice(price: Service["price"]) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

  const numeric =
    typeof price === "number" ? price : Number(price);

  if (!Number.isFinite(numeric)) {
    return "Price on request";
  }

  return `$${numeric.toFixed(2)}`;
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

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  const normalized = phone.replace(/[\s\-().+]/g, "");

  return /^\d{7,15}$/.test(normalized);
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedService, setSelectedService] =
    useState<Service | null>(null);

  const [selectedDate, setSelectedDate] = useState("");

  const [selectedTime, setSelectedTime] = useState("");

  const [availability, setAvailability] =
    useState<AvailabilityResponse | null>(null);

  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [availabilityError, setAvailabilityError] =
    useState("");

  const [customerName, setCustomerName] = useState("");

  const [customerEmail, setCustomerEmail] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");

  const [notes, setNotes] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingError, setBookingError] = useState("");

  const [bookingSuccess, setBookingSuccess] =
    useState<BookingResponse | null>(null);

  const today = useMemo(
    () => getDateKey(new Date()),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/public/services",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load services."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            "Invalid services response."
          );
        }

        if (!cancelled) {
          setServices(data);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load services:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load services."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      if (!selectedService || !selectedDate) {
        setAvailability(null);
        setSelectedTime("");
        return;
      }

      try {
        setAvailabilityLoading(true);
        setAvailabilityError("");
        setSelectedTime("");

        const response = await fetch(
          `/api/public/availability?date=${encodeURIComponent(
            selectedDate
          )}&serviceId=${encodeURIComponent(
            selectedService.id
          )}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load available times."
          );
        }

        if (!cancelled) {
          setAvailability(data);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load availability:",
          error
        );

        setAvailability(null);

        setAvailabilityError(
          error instanceof Error
            ? error.message
            : "Unable to load available times."
        );
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, selectedService]);

  function selectService(service: Service) {
    setSelectedService(service);
    setSelectedDate("");
    setSelectedTime("");
    setAvailability(null);
    setAvailabilityError("");
    setBookingError("");
    setBookingSuccess(null);
    setTermsAccepted(false);
  }

  function changeService() {
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setAvailability(null);
    setAvailabilityError("");
    setBookingError("");
    setTermsAccepted(false);

    window.scrollTo({
      top: 500,
      behavior: "smooth",
    });
  }

  function resetBooking() {
    setSelectedService(null);
    setSelectedDate("");
    setSelectedTime("");
    setAvailability(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setNotes("");
    setTermsAccepted(false);
    setBookingError("");
    setBookingSuccess(null);
  }

  async function submitBooking() {
    if (
      !selectedService ||
      !selectedDate ||
      !selectedTime
    ) {
      return;
    }

    const trimmedName = customerName.trim();
    const trimmedEmail = customerEmail.trim();
    const trimmedPhone = customerPhone.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedName) {
      setBookingError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setBookingError(
        "Please enter a valid full name."
      );
      return;
    }

    if (
      trimmedEmail &&
      !isValidEmail(trimmedEmail)
    ) {
      setBookingError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      trimmedPhone &&
      !isValidPhone(trimmedPhone)
    ) {
      setBookingError(
        "Please enter a valid phone number."
      );
      return;
    }

    if (!termsAccepted) {
      setBookingError(
        "Please accept the booking terms before continuing."
      );
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError("");

      const response = await fetch(
        "/api/public/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
         body: JSON.stringify({
  customerName: trimmedName,
  customerEmail: trimmedEmail,
  customerPhone: trimmedPhone,
  serviceId: selectedService.id,
  date: selectedDate,
  time: selectedTime,
  notes: trimmedNotes,
}),
        }
      );

      const data =
        (await response.json()) as
          | BookingResponse
          | {
              error?: string;
            };

      if (!response.ok) {
        throw new Error(
          "error" in data
            ? data.error ||
                "Unable to create booking."
            : "Unable to create booking."
        );
      }

      setBookingSuccess(
        data as BookingResponse
      );
    } catch (error) {
      console.error(
        "Booking failed:",
        error
      );

      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  const currentStep = bookingSuccess
    ? 4
    : selectedService &&
        selectedDate &&
        selectedTime
      ? 3
      : selectedService
        ? 2
        : 1;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-semibold"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm transition-transform group-hover:scale-105">
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

              <span className="hidden sm:inline">
                Back to home
              </span>
            </Link>
          </div>
        </div>
      </header>

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
              Choose a service, find a convenient
              time, and confirm your appointment
              in just a few steps.
            </p>
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl items-center justify-center">
            {[
              ["1", "Service"],
              ["2", "Date & time"],
              ["3", "Your details"],
              ["4", "Complete"],
            ].map(([number, label], index) => {
              const step = index + 1;

              const active =
                currentStep >= step;

              const complete =
                currentStep > step;

              return (
                <div
                  key={number}
                  className="flex items-center"
                >
                  <div
                    className={[
                      "flex items-center gap-2",
                      active
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                        active
                          ? "bg-blue-600 text-white"
                          : "border border-border bg-muted/40",
                      ].join(" ")}
                    >
                      {complete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        number
                      )}
                    </div>

                    <span className="hidden text-sm font-medium md:inline">
                      {label}
                    </span>
                  </div>

                  {index < 3 && (
                    <div className="mx-2 h-px w-5 bg-border sm:mx-4 sm:w-10 lg:w-16" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {bookingSuccess ? (
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-lg sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <p className="mt-6 text-sm font-semibold text-green-600 dark:text-green-400">
              Booking confirmed
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Your appointment is booked
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              Thank you,{" "}
              {bookingSuccess.appointment.customer.name}.
              Your appointment details are below.
            </p>

            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Service
                </p>

                <p className="mt-1 font-semibold">
                  {
                    bookingSuccess.appointment
                      .service.name
                  }
                </p>
              </div>

              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Date
                </p>

                <p className="mt-1 font-semibold">
                  {formatDate(
                    bookingSuccess.appointment.date
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Time
                </p>

                <p className="mt-1 font-semibold">
                  {
                    bookingSuccess.appointment
                      .time
                  }
                </p>
              </div>

              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {bookingSuccess.appointment.status.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Back to home
              </Link>

              <button
                type="button"
                onClick={resetBooking}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold transition hover:bg-muted"
              >
                Book another appointment
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Step 1
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Select a service
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Choose the service that best matches
                  what you need.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Secure booking
              </div>
            </div>

            {loading && (
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-card shadow-md">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  Loading available services...
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                <h2 className="text-lg font-semibold">
                  Unable to load services
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              services.length === 0 && (
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />

                  <h2 className="mt-4 text-lg font-semibold">
                    No services available
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    There are currently no active
                    services available for booking.
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              services.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => {
                    const selected =
                      selectedService?.id ===
                      service.id;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          selectService(service)
                        }
                        className={[
                          "group relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl border bg-card p-6 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                          selected
                            ? "border-blue-500 ring-2 ring-blue-500/20"
                            : "border-border",
                        ].join(" ")}
                      >
                        {selected && (
                          <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 transition group-hover:scale-110 dark:bg-blue-950 dark:text-blue-400">
                          <CalendarDays className="h-7 w-7" />
                        </div>

                        <h3 className="mt-5 text-xl font-semibold">
                          {service.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {service.description ||
                            "Professional service with a convenient appointment experience."}
                        </p>

                        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock3 className="h-4 w-4" />
                            {service.duration} min
                          </div>

                          <span className="font-bold">
                            {formatPrice(
                              service.price
                            )}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
          </section>

          {selectedService && (
            <>
              <section className="border-t border-border/60 bg-muted/20">
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        Step 2
                      </p>

                      <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        Choose date & time
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Select an available date and
                        appointment time.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={changeService}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Change service
                    </button>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
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
                          setAvailability(null);
                          setAvailabilityError("");
                        }}
                        className="mt-6 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />

                      {selectedDate && (
                        <div className="mt-5 rounded-xl bg-muted/50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Selected date
                          </p>

                          <p className="mt-1 font-semibold">
                            {formatDate(
                              selectedDate
                            )}
                          </p>
                        </div>
                      )}
                    </div>

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
                            Available times are
                            calculated from your
                            schedule.
                          </p>
                        </div>
                      </div>

                      {!selectedDate && (
                        <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
                          <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />

                          <p className="mt-3 font-medium">
                            Select a date first
                          </p>
                        </div>
                      )}

                      {selectedDate &&
                        availabilityLoading && (
                          <div className="mt-6 flex min-h-[180px] items-center justify-center rounded-xl border border-border">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                              Checking available times...
                            </div>
                          </div>
                        )}

                      {selectedDate &&
                        !availabilityLoading &&
                        availabilityError && (
                          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                            <p className="font-semibold">
                              Unable to load times
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                              {availabilityError}
                            </p>
                          </div>
                        )}

                      {selectedDate &&
                        !availabilityLoading &&
                        !availabilityError &&
                        availability &&
                        !availability.available && (
                          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-6 text-center">
                            <p className="font-semibold">
                              No booking available
                            </p>

                            <p className="mt-2 text-sm text-muted-foreground">
                              {availability.reason}
                            </p>
                          </div>
                        )}

                      {selectedDate &&
                        !availabilityLoading &&
                        !availabilityError &&
                        availability?.available &&
                        availability.slots.length ===
                          0 && (
                          <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
                            <Clock3 className="mx-auto h-8 w-8 text-muted-foreground" />

                            <p className="mt-3 font-semibold">
                              No available times
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              Please choose another
                              date.
                            </p>
                          </div>
                        )}

                      {selectedDate &&
                        !availabilityLoading &&
                        !availabilityError &&
                        availability?.available &&
                        availability.slots.length > 0 && (
                          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {availability.slots.map(
                              (time) => {
                                const selected =
                                  selectedTime ===
                                  time;

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
                                      "inline-flex h-12 items-center justify-center rounded-xl border text-sm font-semibold transition-all",
                                      selected
                                        ? "border-blue-600 bg-blue-600 text-white shadow-md"
                                        : "border-border bg-background hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40",
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

                      {availability?.businessHours && (
                        <div className="mt-6 rounded-xl bg-muted/50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Business hours
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {
                              availability
                                .businessHours
                                .startTime
                            }{" "}
                            –{" "}
                            {
                              availability
                                .businessHours
                                .endTime
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

              {selectedDate && selectedTime && (
                <section className="border-t border-border/60">
                  <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                    <div className="mb-8">
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        Step 3
                      </p>

                      <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        Your details
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Enter your contact information
                        to complete the booking.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="customer-name"
                            className="mb-2 block text-sm font-semibold"
                          >
                            Full name
                            <span className="ml-1 text-xs font-normal text-destructive">
                              required
                            </span>
                          </label>

                          <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                              id="customer-name"
                              value={customerName}
                              onChange={(event) => {
                                setCustomerName(
                                  event.target.value
                                );

                                if (bookingError) {
                                  setBookingError("");
                                }
                              }}
                              placeholder="Your full name"
                              autoComplete="name"
                              className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="customer-email"
                            className="mb-2 block text-sm font-semibold"
                          >
                            Email
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              optional
                            </span>
                          </label>

                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                              id="customer-email"
                              type="email"
                              value={customerEmail}
                              onChange={(event) => {
                                setCustomerEmail(
                                  event.target.value
                                );

                                if (bookingError) {
                                  setBookingError("");
                                }
                              }}
                              placeholder="you@example.com"
                              autoComplete="email"
                              className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="customer-phone"
                            className="mb-2 block text-sm font-semibold"
                          >
                            Phone
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              optional
                            </span>
                          </label>

                          <div className="relative">
                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                              id="customer-phone"
                              type="tel"
                              value={customerPhone}
                              onChange={(event) => {
                                setCustomerPhone(
                                  event.target.value
                                );

                                if (bookingError) {
                                  setBookingError("");
                                }
                              }}
                              placeholder="+1 555 123 4567"
                              autoComplete="tel"
                              className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label
                            htmlFor="booking-notes"
                            className="mb-2 block text-sm font-semibold"
                          >
                            Notes
                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                              optional
                            </span>
                          </label>

                          <textarea
                            id="booking-notes"
                            value={notes}
                            onChange={(event) =>
                              setNotes(
                                event.target.value
                              )
                            }
                            placeholder="Anything you would like us to know?"
                            rows={4}
                            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      </div>

                      {bookingError && (
                        <div
                          role="alert"
                          className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive"
                        >
                          {bookingError}
                        </div>
                      )}

                      <div className="mt-8 rounded-2xl border border-border bg-muted/50 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Booking summary
                          </p>

                          <button
                            type="button"
                            onClick={changeService}
                            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Change service
                          </button>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-muted-foreground">
                              Service
                            </span>

                            <span className="text-right font-semibold">
                              {selectedService.name}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <span className="text-muted-foreground">
                              Date
                            </span>

                            <span className="text-right font-semibold">
                              {formatDate(
                                selectedDate
                              )}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <span className="text-muted-foreground">
                              Time
                            </span>

                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {selectedTime}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <span className="text-muted-foreground">
                              Duration
                            </span>

                            <span className="font-semibold">
                              {selectedService.duration}{" "}
                              min
                            </span>
                          </div>

                          <div className="border-t border-border pt-3">
                            <div className="flex items-start justify-between gap-4">
                              <span className="font-medium">
                                Price
                              </span>

                              <span className="text-lg font-bold">
                                {formatPrice(
                                  selectedService.price
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 transition hover:bg-muted/40">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(event) => {
                            setTermsAccepted(
                              event.target.checked
                            );

                            if (
                              event.target.checked &&
                              bookingError
                            ) {
                              setBookingError("");
                            }
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500"
                        />

                        <span className="text-sm leading-6 text-muted-foreground">
                          I confirm that the booking
                          details are correct and I
                          agree to the applicable
                          booking terms and policies.
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={submitBooking}
                        disabled={
                          bookingLoading ||
                          !customerName.trim() ||
                          !termsAccepted
                        }
                        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {bookingLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Confirming booking...
                          </>
                        ) : (
                          <>
                            Confirm booking
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        Your booking details are handled
                        securely.
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}