"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type DeleteStaffButtonProps = {
  staffId: string;
};

export function DeleteStaffButton({
  staffId,
}: DeleteStaffButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    if (deleting) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this staff member?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        "/api/staff",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: staffId,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Failed to delete staff member.";

        try {
          const data = (await response.json()) as {
            error?: string;
          };

          if (data.error) {
            message = data.error;
          }
        } catch {
          // Use fallback message.
        }

        throw new Error(message);
      }

      window.location.reload();
    } catch (error) {
      console.error(
        "Failed to delete staff:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete staff member. Please try again."
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
      className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
      aria-label="Delete staff"
      title="Delete staff"
    >
      <Trash2
        className={`h-4 w-4 ${
          deleting ? "animate-pulse" : ""
        }`}
        aria-hidden="true"
      />
    </Button>
  );
}