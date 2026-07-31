"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteServiceButtonProps = {
  serviceId: string;
};

export function DeleteServiceButton({
  serviceId,
}: DeleteServiceButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch("/api/services", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: serviceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete service");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);

      window.alert(
        "Failed to delete service. Please try again."
      );

      setDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={deleting}
      aria-label="Delete service"
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}