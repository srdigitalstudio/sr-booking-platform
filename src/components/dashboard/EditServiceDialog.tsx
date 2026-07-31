"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  ServiceForm,
  ServiceFormValues,
} from "@/components/dashboard/ServiceForm";

type EditServiceDialogProps = {
  service: {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: string | number | null;
    active: boolean;
  };

  onSubmit: (
    id: string,
    values: ServiceFormValues
  ) => void;
};

export function EditServiceDialog({
  service,
  onSubmit,
}: EditServiceDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(
    values: ServiceFormValues
  ) {
    await onSubmit(service.id, values);
    setOpen(false);
  }

  const initialValues: ServiceFormValues = {
    name: service.name,
    description: service.description ?? "",
    duration: service.duration,
    price:
      service.price === null
        ? ""
        : service.price.toString(),
    active: service.active,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
        aria-label={`Edit ${service.name}`}
      >
        <Pencil className="h-4 w-4" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit Service
          </DialogTitle>
        </DialogHeader>

        <ServiceForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}