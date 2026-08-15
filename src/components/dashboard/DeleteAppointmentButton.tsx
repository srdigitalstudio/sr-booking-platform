"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteAppointmentButtonProps = {
  appointmentId: string;
  onDelete: (id: string) => Promise<void>;
};

export function DeleteAppointmentButton({
  appointmentId,
  onDelete,
}: DeleteAppointmentButtonProps) {
  async function handleClick() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmed) {
      return;
    }

    await onDelete(appointmentId);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Delete appointment"
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}