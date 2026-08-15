"use client";

import { useState } from "react";

import { AppointmentStatus } from "@/types/appointment";

type StatusSelectProps = {
  appointmentId: string;
  status: AppointmentStatus;
  onStatusChange: (
    id: string,
    status: AppointmentStatus
  ) => Promise<void>;
};

const labels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusSelect({
  appointmentId,
  status,
  onStatusChange,
}: StatusSelectProps) {
  const [loading, setLoading] = useState(false);

  async function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const nextStatus =
      event.target.value as AppointmentStatus;

    if (nextStatus === status) {
      return;
    }

    try {
      setLoading(true);

      await onStatusChange(
        appointmentId,
        nextStatus
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="rounded-full border bg-background px-3 py-1.5 text-xs font-semibold outline-none transition focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`Change appointment status to ${labels[status]}`}
    >
      {(
        Object.entries(labels) as [
          AppointmentStatus,
          string
        ][]
      ).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}