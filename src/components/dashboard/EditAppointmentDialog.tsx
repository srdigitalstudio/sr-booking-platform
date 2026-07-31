"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import {
  AppointmentForm,
  AppointmentFormValues,
} from "@/components/dashboard/AppointmentForm";
import { Appointment } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type EditAppointmentDialogProps = {
  appointment: Appointment;
  onSubmit: (
    id: string,
    values: AppointmentFormValues
  ) => void;
};

export function EditAppointmentDialog({
  appointment,
  onSubmit,
}: EditAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    values: AppointmentFormValues
  ) {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/appointments",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: appointment.id,
            ...values,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update appointment"
        );
      }

      onSubmit(appointment.id, values);
      setOpen(false);
    } catch (error) {
      console.error(error);

      window.alert(
        "Unable to update appointment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
          />
        }
      >
        <Pencil className="h-4 w-4" />
      </SheetTrigger>

      <SheetContent className="p-8 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            Edit Appointment
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <AppointmentForm
            submitLabel={
              loading
                ? "Updating..."
                : "Update Appointment"
            }
            initialValues={{
              customer: appointment.customer,
              service: appointment.service,
              date: appointment.date,
              time: appointment.time,
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}