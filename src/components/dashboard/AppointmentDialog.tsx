"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AppointmentForm } from "@/components/dashboard/AppointmentForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppointmentDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger
  render={
    <Button className="gap-2" />
  }
>
  <Plus className="h-4 w-4" />
  New Appointment
</SheetTrigger>

      <SheetContent className="p-8 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            New Appointment
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <AppointmentForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}