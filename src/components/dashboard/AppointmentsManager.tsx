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

type ToastType = "success" | "error";

type Toast = {
  type: ToastType;
  message: string;
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

async function getApiError(
  response: Response,
  fallback: string
) {
  try {
    const data = (await response.json()) as {
      error?: string;
    };

    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export function AppointmentsManager() {
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [toast, setToast] =
    useState<Toast | null>(null);

  function showToast(
    type: ToastType,
    message: string
  ) {
    setToast({
      type,
      message,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }

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
            await getApiError(
              response,
              "Failed to load appointments."
            )
          );
        }

        const data =
          (await response.json()) as ApiAppointment[];

        setAppointments(data.map(mapAppointment));
      } catch (err) {
        console.error(err);

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load appointments.";

        setError(message);
        showToast("error", message);
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  async function handleCreateAppointment(
    values: AppointmentFormValues
  ) {
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
      const message = await getApiError(
        response,
        "Unable to create appointment."
      );

      setError(message);
      showToast("error", message);

      throw new Error(message);
    }

    const data =
      (await response.json()) as ApiAppointment;

    setAppointments((previous) => [
      mapAppointment(data),
      ...previous,
    ]);

    showToast(
      "success",
      "Appointment created successfully."
    );
  }

  async function handleEditAppointment(
    id: string,
    values: AppointmentFormValues
  ) {
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
      const message = await getApiError(
        response,
        "Unable to update appointment."
      );

      setError(message);
      showToast("error", message);

      throw new Error(message);
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

    showToast(
      "success",
      "Appointment updated successfully."
    );
  }

  async function handleDeleteAppointment(
    id: string
  ) {
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
      const message = await getApiError(
        response,
        "Unable to delete appointment."
      );

      setError(message);
      showToast("error", message);

      throw new Error(message);
    }

    setAppointments((previous) =>
      previous.filter(
        (appointment) =>
          appointment.id !== id
      )
    );

    showToast(
      "success",
      "Appointment deleted successfully."
    );
  }

  async function handleStatusChange(
    id: string,
    status: AppointmentStatus
  ) {
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
      const message = await getApiError(
        response,
        "Unable to update appointment status."
      );

      setError(message);
      showToast("error", message);

      throw new Error(message);
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

    showToast(
      "success",
      "Appointment status updated."
    );
  }

  return (
    <>
      {toast && (
        <div
          className={`fixed right-6 top-6 z-[100] max-w-sm rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {toast.type === "success"
                  ? "Success"
                  : "Error"}
              </p>

              <p className="mt-1 text-sm">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-current opacity-60 transition hover:opacity-100"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <AppointmentDialog
          onSubmit={handleCreateAppointment}
        />
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white py-12 text-center text-muted-foreground shadow-sm">
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