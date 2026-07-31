"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteCustomerButtonProps = {
  customerId: string;
};

export function DeleteCustomerButton({
  customerId,
}: DeleteCustomerButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch("/api/customers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: customerId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);

      window.alert(
        "Failed to delete customer. Please try again."
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
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}