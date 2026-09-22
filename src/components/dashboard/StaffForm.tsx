"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type StaffFormValues = {
  name: string;
  email: string;
  phone: string;
  active: boolean;
};

type StaffFormProps = {
  initialValues?: StaffFormValues;
  submitLabel?: string;
  onSubmit: (
    values: StaffFormValues
  ) => void | Promise<void>;
};

const emptyForm: StaffFormValues = {
  name: "",
  email: "",
  phone: "",
  active: true,
};

export function StaffForm({
  initialValues,
  submitLabel = "Save Staff",
  onSubmit,
}: StaffFormProps) {
  const [form, setForm] = useState<StaffFormValues>(
    initialValues ?? emptyForm
  );

  const [errors, setErrors] = useState<
    Partial<Record<keyof StaffFormValues, string>>
  >({});

  const [submitting, setSubmitting] =
    useState(false);

  function updateField<K extends keyof StaffFormValues>(
    key: K,
    value: StaffFormValues[K]
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
      Record<keyof StaffFormValues, string>
    > = {};

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name) {
      nextErrors.name = "Staff name is required.";
    } else if (name.length < 2) {
      nextErrors.name =
        "Staff name must be at least 2 characters.";
    } else if (name.length > 100) {
      nextErrors.name =
        "Staff name must be less than 100 characters.";
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
        active: form.active,
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
          htmlFor="staff-name"
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
            id="staff-name"
            placeholder="John Doe"
            value={form.name}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value
              )
            }
            disabled={submitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={
              errors.name
                ? "staff-name-error"
                : undefined
            }
            className="h-11 pl-10"
            autoComplete="name"
            required
          />
        </div>

        {errors.name && (
          <p
            id="staff-name-error"
            className="text-xs font-medium text-destructive"
          >
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="staff-email"
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
            id="staff-email"
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value
              )
            }
            disabled={submitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email
                ? "staff-email-error"
                : undefined
            }
            className="h-11 pl-10"
            autoComplete="email"
          />
        </div>

        {errors.email && (
          <p
            id="staff-email-error"
            className="text-xs font-medium text-destructive"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="staff-phone"
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
            id="staff-phone"
            type="tel"
            placeholder="+1 555 123 4567"
            value={form.phone}
            onChange={(event) =>
              updateField(
                "phone",
                event.target.value
              )
            }
            disabled={submitting}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone
                ? "staff-phone-error"
                : undefined
            }
            className="h-11 pl-10"
            autoComplete="tel"
          />
        </div>

        {errors.phone && (
          <p
            id="staff-phone-error"
            className="text-xs font-medium text-destructive"
          >
            {errors.phone}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
        <div>
          <Label
            htmlFor="staff-active"
            className="text-sm font-semibold"
          >
            Active
          </Label>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Active staff can be assigned to appointments.
          </p>
        </div>

        <Switch
          id="staff-active"
          checked={form.active}
          onCheckedChange={(checked) =>
            updateField("active", checked)
          }
          disabled={submitting}
        />
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          Staff information is used to organize your
          team and assign appointments to available staff
          members.
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