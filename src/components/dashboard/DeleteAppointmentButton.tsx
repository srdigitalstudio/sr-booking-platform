"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteAppointmentButtonProps = {
  appointmentId: string;
  onDelete: (id: string) => void;
};

export function DeleteAppointmentButton({
  appointmentId,
  onDelete,
}: DeleteAppointmentButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/appointments",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: appointmentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete appointment"
        );
      }

      onDelete(appointmentId);
    } catch (error) {
      console.error(error);

      window.alert(
        "Unable to delete appointment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}