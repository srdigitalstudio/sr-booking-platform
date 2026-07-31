"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export type ServiceFormValues = {
  name: string;
  description: string;
  duration: number;
  price: string;
  active: boolean;
};

type ServiceFormProps = {
  initialValues?: ServiceFormValues;
  submitLabel?: string;
  onSubmit: (values: ServiceFormValues) => void;
};

export function ServiceForm({
  initialValues,
  submitLabel = "Save Service",
  onSubmit,
}: ServiceFormProps) {
  const [form, setForm] = useState<ServiceFormValues>(
    initialValues ?? {
      name: "",
      description: "",
      duration: 30,
      price: "",
      active: true,
    }
  );

  function updateField<K extends keyof ServiceFormValues>(
    key: K,
    value: ServiceFormValues[K]
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
        description: "",
        duration: 30,
        price: "",
        active: true,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="service-name">
          Service Name
        </Label>

        <Input
          id="service-name"
          placeholder="Haircut"
          value={form.name}
          onChange={(event) =>
            updateField("name", event.target.value)
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="service-description">
          Description
        </Label>

        <Textarea
          id="service-description"
          placeholder="Describe the service..."
          value={form.description}
          onChange={(event) =>
            updateField(
              "description",
              event.target.value
            )
          }
        />
      </div>

      <div>
        <Label htmlFor="service-duration">
          Duration (minutes)
        </Label>

        <Input
          id="service-duration"
          type="number"
          min="1"
          value={form.duration}
          onChange={(event) =>
            updateField(
              "duration",
              Number(event.target.value)
            )
          }
          required
        />
      </div>

      <div>
        <Label htmlFor="service-price">
          Price
        </Label>

        <Input
          id="service-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="25.00"
          value={form.price}
          onChange={(event) =>
            updateField("price", event.target.value)
          }
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="service-active">
            Active
          </Label>

          <p className="text-sm text-muted-foreground">
            Allow customers to book this service.
          </p>
        </div>

        <Switch
          id="service-active"
          checked={form.active}
          onCheckedChange={(checked) =>
            updateField("active", checked)
          }
        />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}