"use client";

import { useState } from "react";

import {
  AppointmentFormValues,
} from "@/components/dashboard/AppointmentForm";
import { AppointmentDialog } from "@/components/dashboard/AppointmentDialog";
import { AppointmentTable } from "@/components/dashboard/AppointmentTable";
import { mockAppointments } from "@/lib/mockAppointments";
import { Appointment } from "@/types/appointment";

export function AppointmentsManager() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);

  function handleCreateAppointment(
    values: AppointmentFormValues
  ) {
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      customer: values.customer,
      service: values.service,
      date: values.date,
      time: values.time,
      status: "pending",
    };

    setAppointments((previous) => [
      newAppointment,
      ...previous,
    ]);
  }

  return (
    <>
      <div className="flex justify-end">
        <AppointmentDialog
          onSubmit={handleCreateAppointment}
        />
      </div>

      <AppointmentTable
        appointments={appointments}
      />
    </>
  );
}