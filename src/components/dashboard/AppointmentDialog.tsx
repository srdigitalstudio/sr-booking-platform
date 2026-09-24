"use client";

import { useState } from "react";
import {
  CalendarPlus,
  Pencil,
  Plus,
} from "lucide-react";

import {
  AppointmentForm,
  AppointmentFormValues,
} from "@/components/dashboard/AppointmentForm";
import { Appointment } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AppointmentDialogProps = {
  onSubmit: (
    values: AppointmentFormValues
  ) => void | Promise<void>;
};

export function AppointmentDialog({
  onSubmit,
}: AppointmentDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(
    values: AppointmentFormValues
  ) {
    await onSubmit(values);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="h-11 gap-2 rounded-xl bg-blue-600 px-4 font-semibold text-white shadow-sm transition hover:bg-blue-700">
            <Plus
              className="h-4 w-4"
              aria-hidden="true"
            />
            <span>New Appointment</span>
          </Button>
        }
      />

      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg">
        <div className="border-b border-border bg-background px-6 py-6">
          <SheetHeader className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
              <CalendarPlus
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
            </div>

            <SheetTitle className="text-xl font-bold tracking-tight">
              New Appointment
            </SheetTitle>

            <SheetDescription className="text-sm leading-6">
              Create a new booking by entering the
              customer, service, date and time.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-6">
          <AppointmentForm
            submitLabel="Create Appointment"
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

type EditAppointmentDialogProps = {
  appointment: Appointment;
  onSubmit: (
    id: string,
    values: AppointmentFormValues
  ) => void | Promise<void>;
};

export function EditAppointmentDialog({
  appointment,
  onSubmit,
}: EditAppointmentDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(
    values: AppointmentFormValues
  ) {
    await onSubmit(appointment.id, values);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-muted-foreground transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
            aria-label={`Edit appointment for ${appointment.customer}`}
            title="Edit appointment"
          >
            <Pencil
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Button>
        }
      />

      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg">
        <div className="border-b border-border bg-background px-6 py-6">
          <SheetHeader className="text-left">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
              <Pencil
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
            </div>

            <SheetTitle className="text-xl font-bold tracking-tight">
              Edit Appointment
            </SheetTitle>

            <SheetDescription className="text-sm leading-6">
              Update the details for{" "}
              <span className="font-semibold text-foreground">
                {appointment.customer}
              </span>
              .
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-6">
          <AppointmentForm
            submitLabel="Update Appointment"
           initialValues={{
  customer: appointment.customer,
  service: appointment.service,
  date: appointment.date,
  time: appointment.time,
  staffId: appointment.staffId,
}}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}