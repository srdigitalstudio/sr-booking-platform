"use client";

import { useEffect, useState } from "react";

import {
  AppointmentFormValues,
} from "@/components/dashboard/AppointmentForm";
import { AppointmentDialog } from "@/components/dashboard/AppointmentDialog";
import { AppointmentTable } from "@/components/dashboard/AppointmentTable";
import { Appointment } from "@/types/appointment";
import { AppointmentStatus } from "@/types/appointment";

type ApiAppointment = {
  id: string;
  date: string;
  time: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED";
  customer: {
    name: string;
  };
  service: {
    name: string;
  };
};

function mapAppointment(
  appointment: ApiAppointment
): Appointment {
  return {
    id: appointment.id,
    customer: appointment.customer.name,
    service: appointment.service.name,
    date: appointment.date.slice(0, 10),
    time: appointment.time,
    status:
      appointment.status.toLowerCase() as Appointment["status"],
  };
}

export function AppointmentsManager() {
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/appointments"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load appointments"
          );
        }

        const data =
          (await response.json()) as ApiAppointment[];

        setAppointments(data.map(mapAppointment));
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load appointments."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  async function handleCreateAppointment(
    values: AppointmentFormValues
  ) {
    try {
      setError("");

      const response = await fetch(
        "/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to create appointment"
        );
      }

      const data =
        (await response.json()) as ApiAppointment;

      setAppointments((previous) => [
        mapAppointment(data),
        ...previous,
      ]);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to create appointment."
      );
    }
  }

  async function handleEditAppointment(
    id: string,
    values: AppointmentFormValues
  ) {
    try {
      setError("");

      const response = await fetch(
        "/api/appointments",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            ...values,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update appointment"
        );
      }

      const data =
        (await response.json()) as ApiAppointment;

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === id
            ? mapAppointment(data)
            : appointment
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to update appointment."
      );
    }
  }

  async function handleDeleteAppointment(
    id: string
  ) {
    try {
      setError("");

      const response = await fetch(
        "/api/appointments",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete appointment"
        );
      }

      setAppointments((previous) =>
        previous.filter(
          (appointment) =>
            appointment.id !== id
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to delete appointment."
      );
    }
  }

  async function handleStatusChange(
    id: string,
    status: AppointmentStatus
  ) {
    try {
      setError("");

      const response = await fetch(
        "/api/appointments",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update appointment status"
        );
      }

      const data =
        (await response.json()) as ApiAppointment;

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === id
            ? mapAppointment(data)
            : appointment
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to update appointment status."
      );
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <AppointmentDialog
          onSubmit={handleCreateAppointment}
        />
      </div>

      {loading ? (
        <div className="py-10 text-center text-muted-foreground">
          Loading appointments...
        </div>
      ) : (
        <AppointmentTable
          appointments={appointments}
          onEdit={handleEditAppointment}
          onDelete={handleDeleteAppointment}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}