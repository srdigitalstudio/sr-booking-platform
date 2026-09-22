"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import {
  StaffForm,
  StaffFormValues,
} from "@/components/dashboard/StaffForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type EditStaffDialogProps = {
  staff: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    active: boolean;
  };
  onSubmit: (
    id: string,
    values: StaffFormValues
  ) => void | Promise<void>;
};

export function EditStaffDialog({
  staff,
  onSubmit,
}: EditStaffDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(
    values: StaffFormValues
  ) {
    await onSubmit(staff.id, values);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
            aria-label={`Edit ${staff.name}`}
            title="Edit staff"
          >
            <Pencil
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Button>
        }
      />

      <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-lg sm:p-8">
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-xl font-bold">
            Edit Staff
          </SheetTitle>

          <SheetDescription>
            Update the staff member&apos;s contact
            information and status.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          <StaffForm
            submitLabel="Update Staff"
            initialValues={{
              name: staff.name,
              email: staff.email ?? "",
              phone: staff.phone ?? "",
              active: staff.active,
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}