"use client";

import { useState } from "react";

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
  onSubmit: (values: CustomerFormValues) => void;
};

export function CustomerForm({
  initialValues,
  submitLabel = "Save Customer",
  onSubmit,
}: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormValues>(
    initialValues ?? {
      name: "",
      email: "",
      phone: "",
    }
  );

  function updateField<K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    onSubmit(form);

    if (!initialValues) {
      setForm({
        name: "",
        email: "",
        phone: "",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="customer-name">
          Name
        </Label>

        <Input
          id="customer-name"
          placeholder="John Doe"
          value={form.name}
          onChange={(event) =>
            updateField("name", event.target.value)
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="customer-email">
          Email
        </Label>

        <Input
          id="customer-email"
          type="email"
          placeholder="john@example.com"
          value={form.email}
          onChange={(event) =>
            updateField("email", event.target.value)
          }
        />
      </div>

      <div>
        <Label htmlFor="customer-phone">
          Phone
        </Label>

        <Input
          id="customer-phone"
          type="tel"
          placeholder="+1 555 123 4567"
          value={form.phone}
          onChange={(event) =>
            updateField("phone", event.target.value)
          }
        />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}