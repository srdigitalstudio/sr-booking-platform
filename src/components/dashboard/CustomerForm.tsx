"use client";

import { useState } from "react";
import { Mail, Phone, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CustomerFormValues = {
  name: string;
  email: string;
  phone: string;
};

type CustomerFormProps = {
  initialValues?: CustomerFormValues;
  submitLabel?: string;
  onSubmit: (values: CustomerFormValues) => void | Promise<void>;
};

const emptyForm: CustomerFormValues = {
  name: "",
  email: "",
  phone: "",
};

export function CustomerForm({
  initialValues,
  submitLabel = "Save Customer",
  onSubmit,
}: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormValues>(
    initialValues ?? emptyForm
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof CustomerFormValues, string>>
  >({});

  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K]
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

  function validate() {
    const nextErrors: Partial<
      Record<keyof CustomerFormValues, string>
    > = {};

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name) {
      nextErrors.name = "Customer name is required.";
    } else if (name.length < 2) {
      nextErrors.name =
        "Customer name must be at least 2 characters.";
    } else if (name.length > 100) {
      nextErrors.name =
        "Customer name must be less than 100 characters.";
    }

    if (email) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        nextErrors.email =
          "Please enter a valid email address.";
      }
    }

    if (phone && phone.length > 30) {
      nextErrors.phone =
        "Phone number must be less than 30 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validate() || submitting) {
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });

      if (!initialValues) {
        setForm(emptyForm);
        setErrors({});
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <div className="space-y-2">
        <Label
          htmlFor="customer-name"
          className="text-sm font-semibold"
        >
          Full name
        </Label>

        <div className="relative">
          <User
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            id="customer-name"
            placeholder="John Doe"
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
            disabled={submitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name
                ? "customer-name-error"
                : undefined
            }
            className="h-11 pl-10"
            autoComplete="name"
            required
          />
        </div>

        {errors.name && (
          <p
            id="customer-name-error"
            className="text-xs font-medium text-destructive"
          >
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="customer-email"
          className="text-sm font-semibold"
        >
          Email address
          <span className="ml-1 font-normal text-muted-foreground">
            (optional)
          </span>
        </Label>

        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            id="customer-email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
            disabled={submitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email
                ? "customer-email-error"
                : undefined
            }
            className="h-11 pl-10"
            autoComplete="email"
          />
        </div>

        {errors.email && (
          <p
            id="customer-email-error"
            className="text-xs font-medium text-destructive"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="customer-phone"
          className="text-sm font-semibold"
        >
          Phone number
          <span className="ml-1 font-normal text-muted-foreground">
            (optional)
          </span>
        </Label>

        <div className="relative">
          <Phone
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <Input
            id="customer-phone"
            type="tel"
            placeholder="+1 555 123 4567"
            value={form.phone}
            onChange={(event) =>
              updateField("phone", event.target.value)
            }
            disabled={submitting}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone
                ? "customer-phone-error"
                : undefined
            }
            className="h-11 pl-10"
            autoComplete="tel"
          />
        </div>

        {errors.phone && (
          <p
            id="customer-phone-error"
            className="text-xs font-medium text-destructive"
          >
            {errors.phone}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          Customer information is used to keep appointments
          organized and make future bookings faster.
        </p>
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-blue-600 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
        disabled={submitting}
      >
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}