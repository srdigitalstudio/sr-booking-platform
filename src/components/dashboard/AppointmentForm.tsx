"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AppointmentFormValues = {
  customer: string;
  service: string;
  date: string;
  time: string;
};

type AppointmentFormProps = {
  initialValues?: AppointmentFormValues;
  submitLabel?: string;
  onSubmit: (values: AppointmentFormValues) => void;
};

export function AppointmentForm({
  initialValues,
  submitLabel = "Save Appointment",
  onSubmit,
}: AppointmentFormProps) {
  const [form, setForm] = useState<AppointmentFormValues>(
    initialValues ?? {
      customer: "",
      service: "",
      date: "",
      time: "",
    }
  );

  function updateField<K extends keyof AppointmentFormValues>(
    key: K,
    value: AppointmentFormValues[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit(form);

    if (!initialValues) {
      setForm({
        customer: "",
        service: "",
        date: "",
        time: "",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <Label htmlFor="customer">
          Customer
        </Label>

        <Input
          id="customer"
          placeholder="John Doe"
          value={form.customer}
          onChange={(event) =>
            updateField("customer", event.target.value)
          }
        />
      </div>

      <div>
        <Label htmlFor="service">
          Service
        </Label>

        <Input
          id="service"
          placeholder="Haircut"
          value={form.service}
          onChange={(event) =>
            updateField("service", event.target.value)
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="date">
            Date
          </Label>

          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(event) =>
              updateField("date", event.target.value)
            }
          />
        </div>

        <div>
          <Label htmlFor="time">
            Time
          </Label>

          <Input
            id="time"
            type="time"
            value={form.time}
            onChange={(event) =>
              updateField("time", event.target.value)
            }
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
      >
        {submitLabel}
      </Button>
    </form>
  );
}