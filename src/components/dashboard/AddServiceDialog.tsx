"use client";

import { useState } from "react";

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

type AddServiceDialogProps = {
  onSubmit: (values: ServiceFormValues) => void;
};

export function AddServiceDialog({
  onSubmit,
}: AddServiceDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(
    values: ServiceFormValues
  ) {
    await onSubmit(values);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        Add Service
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Add New Service
          </DialogTitle>
        </DialogHeader>

        <ServiceForm
          onSubmit={handleSubmit}
          submitLabel="Add Service"
        />
      </DialogContent>
    </Dialog>
  );
}