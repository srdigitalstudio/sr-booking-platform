"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  UserRound,
  UserCog,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AppointmentFormValues = {
  customer: string;
  service: string;
  staffId: string;
  date: string;
  time: string;
};

type AppointmentFormProps = {
  initialValues?: AppointmentFormValues;
  submitLabel?: string;
  onSubmit: (
    values: AppointmentFormValues
  ) => void | Promise<void>;
};

type Service = {
  id: string;
  name: string;
  duration: number;
  price: string | number | null;
  active: boolean;
};

type Staff = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
};

type FormErrors = Partial<
  Record<keyof AppointmentFormValues, string>
>;

const emptyForm: AppointmentFormValues = {
  customer: "",
  service: "",
  staffId: "",
  date: "",
  time: "",
};

async function getApiError(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
    };

    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export function AppointmentForm({
  initialValues,
  submitLabel = "Save Appointment",
  onSubmit,
}: AppointmentFormProps) {
  const [form, setForm] = useState<AppointmentFormValues>(
    initialValues ?? emptyForm
  );

  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] =
    useState(true);

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] =
    useState(true);

  const [serviceLoadError, setServiceLoadError] =
    useState("");

  const [staffLoadError, setStaffLoadError] =
    useState("");

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        setLoadingServices(true);
        setServiceLoadError("");

        const response = await fetch(
          "/api/services",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const message = await getApiError(
            response,
            "Failed to load services."
          );

          throw new Error(message);
        }

        const data =
          (await response.json()) as Service[];

        if (!cancelled) {
          setServices(
            data.filter(
              (service) => service.active
            )
          );
        }
      } catch (error) {
        console.error(
          "Failed to load services:",
          error
        );

        if (!cancelled) {
          setServiceLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load services."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingServices(false);
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

    async function loadStaff() {
      try {
        setLoadingStaff(true);
        setStaffLoadError("");

        const response = await fetch(
          "/api/staff",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const message = await getApiError(
            response,
            "Failed to load staff."
          );

          throw new Error(message);
        }

        const data =
          (await response.json()) as Staff[];

        if (!cancelled) {
          setStaff(
            data.filter(
              (member) => member.active
            )
          );
        }
      } catch (error) {
        console.error(
          "Failed to load staff:",
          error
        );

        if (!cancelled) {
          setStaffLoadError(
            error instanceof Error
              ? error.message
              : "Failed to load staff."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingStaff(false);
        }
      }
    }

    loadStaff();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField<
    K extends keyof AppointmentFormValues
  >(
    key: K,
    value: AppointmentFormValues[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    const customer = form.customer.trim();
    const service = form.service.trim();

    if (!customer) {
      nextErrors.customer =
        "Customer name is required.";
    } else if (customer.length < 2) {
      nextErrors.customer =
        "Customer name must contain at least 2 characters.";
    }

    if (!service) {
      nextErrors.service =
        "Please select a service.";
    }

    if (!form.date) {
      nextErrors.date =
        "Please select an appointment date.";
    }

    if (!form.time) {
      nextErrors.time =
        "Please select an appointment time.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        customer: form.customer.trim(),
        service: form.service.trim(),
        staffId: form.staffId,
        date: form.date,
        time: form.time,
      });

      if (!initialValues) {
        setForm(emptyForm);
        setErrors({});
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "h-11 rounded-xl border-border bg-background transition focus-visible:border-blue-500 focus-visible:ring-blue-500/20";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6"
    >
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-950 dark:bg-blue-950/30">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <CalendarDays
              className="h-4 w-4"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">
              Appointment details
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
              Enter the customer, service, staff,
              date and time for this appointment.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="appointment-customer"
          className="flex items-center gap-2"
        >
          <UserRound
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          Customer
        </Label>

        <Input
          id="appointment-customer"
          name="customer"
          autoComplete="name"
          placeholder="John Doe"
          value={form.customer}
          onChange={(event) =>
            updateField(
              "customer",
              event.target.value
            )
          }
          aria-invalid={Boolean(errors.customer)}
          aria-describedby={
            errors.customer
              ? "appointment-customer-error"
              : undefined
          }
          className={inputClass}
          disabled={submitting}
        />

        {errors.customer && (
          <p
            id="appointment-customer-error"
            className="text-xs font-medium text-red-600"
          >
            {errors.customer}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="appointment-service"
          className="flex items-center gap-2"
        >
          <Wrench
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          Service
        </Label>

        <select
          id="appointment-service"
          name="service"
          value={form.service}
          onChange={(event) =>
            updateField(
              "service",
              event.target.value
            )
          }
          disabled={
            submitting || loadingServices
          }
          aria-invalid={Boolean(errors.service)}
          aria-describedby={
            errors.service
              ? "appointment-service-error"
              : undefined
          }
          className={`${inputClass} w-full px-3 text-sm`}
        >
          <option value="">
            {loadingServices
              ? "Loading services..."
              : "Select a service"}
          </option>

          {services.map((service) => (
            <option
              key={service.id}
              value={service.name}
            >
              {service.name}
              {service.duration
                ? ` — ${service.duration} min`
                : ""}
            </option>
          ))}
        </select>

        {serviceLoadError && (
          <p className="text-xs font-medium text-red-600">
            {serviceLoadError}
          </p>
        )}

        {!loadingServices &&
          !serviceLoadError &&
          services.length === 0 && (
            <p className="text-xs font-medium text-amber-600">
              No active services are available.
              Please create or activate a service
              first.
            </p>
          )}

        {errors.service && (
          <p
            id="appointment-service-error"
            className="text-xs font-medium text-red-600"
          >
            {errors.service}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="appointment-staff"
          className="flex items-center gap-2"
        >
          <UserCog
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          Staff
        </Label>

        <select
          id="appointment-staff"
          name="staffId"
          value={form.staffId}
          onChange={(event) =>
            updateField(
              "staffId",
              event.target.value
            )
          }
          disabled={
            submitting || loadingStaff
          }
          className={`${inputClass} w-full px-3 text-sm`}
        >
          <option value="">
            {loadingStaff
              ? "Loading staff..."
              : "No staff assigned"}
          </option>

          {staff.map((member) => (
            <option
              key={member.id}
              value={member.id}
            >
              {member.name}
            </option>
          ))}
        </select>

        {staffLoadError && (
          <p className="text-xs font-medium text-red-600">
            {staffLoadError}
          </p>
        )}

        {!loadingStaff &&
          !staffLoadError &&
          staff.length === 0 && (
            <p className="text-xs font-medium text-muted-foreground">
              No active staff members are
              available. You can leave this
              appointment unassigned.
            </p>
          )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="appointment-date"
            className="flex items-center gap-2"
          >
            <CalendarDays
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            Date
          </Label>

          <Input
            id="appointment-date"
            name="date"
            type="date"
            value={form.date}
            onChange={(event) =>
              updateField(
                "date",
                event.target.value
              )
            }
            aria-invalid={Boolean(errors.date)}
            aria-describedby={
              errors.date
                ? "appointment-date-error"
                : undefined
            }
            className={inputClass}
            disabled={submitting}
          />

          {errors.date && (
            <p
              id="appointment-date-error"
              className="text-xs font-medium text-red-600"
            >
              {errors.date}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="appointment-time"
            className="flex items-center gap-2"
          >
            <Clock
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            Time
          </Label>

          <Input
            id="appointment-time"
            name="time"
            type="time"
            value={form.time}
            onChange={(event) =>
              updateField(
                "time",
                event.target.value
              )
            }
            aria-invalid={Boolean(errors.time)}
            aria-describedby={
              errors.time
                ? "appointment-time-error"
                : undefined
            }
            className={inputClass}
            disabled={submitting}
          />

          {errors.time && (
            <p
              id="appointment-time-error"
              className="text-xs font-medium text-red-600"
            >
              {errors.time}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <Button
          type="submit"
          disabled={
            submitting ||
            loadingServices ||
            services.length === 0
          }
          className="h-11 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : submitLabel}
        </Button>
      </div>
    </form>
  );
}