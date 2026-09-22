"use client";

import { UserPlus } from "lucide-react";
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

type AddStaffDialogProps = {
  onSubmit: (
    values: StaffFormValues
  ) => void | Promise<void>;
};

export function AddStaffDialog({
  onSubmit,
}: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(
    values: StaffFormValues
  ) {
    await onSubmit(values);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="h-11 gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md">
            <UserPlus
              className="h-4 w-4"
              aria-hidden="true"
            />
            Add Staff
          </Button>
        }
      />

      <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-lg sm:p-8">
        <SheetHeader className="space-y-2">
          <SheetTitle className="text-xl font-bold">
            Add Staff
          </SheetTitle>

          <SheetDescription>
            Create a new staff profile for your booking
            system.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
          <StaffForm
            submitLabel="Create Staff"
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}