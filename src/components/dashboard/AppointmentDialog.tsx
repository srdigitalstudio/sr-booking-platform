"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  AppointmentForm,
  AppointmentFormValues,
} from "@/components/dashboard/AppointmentForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AppointmentDialogProps = {
  onSubmit?: (values: AppointmentFormValues) => void;
};

export function AppointmentDialog({
  onSubmit,
}: AppointmentDialogProps) {
  const [open, setOpen] = useState(false);

  function handleSubmit(values: AppointmentFormValues) {
    onSubmit?.(values);
    setOpen(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger
        render={<Button className="gap-2" />}
      >
        <Plus className="h-4 w-4" />
        New Appointment
      </SheetTrigger>

      <SheetContent className="p-8 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            New Appointment
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <AppointmentForm onSubmit={handleSubmit} />
        </div>
      </SheetContent>
    </Sheet>
  );
}