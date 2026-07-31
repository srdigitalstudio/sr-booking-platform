"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import {
  CustomerForm,
  CustomerFormValues,
} from "@/components/dashboard/CustomerForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AddCustomerDialogProps = {
  onSubmit: (values: CustomerFormValues) => void;
};

export function AddCustomerDialog({
  onSubmit,
}: AddCustomerDialogProps) {
  const [open, setOpen] = useState(false);

  function handleSubmit(values: CustomerFormValues) {
    onSubmit(values);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <SheetContent className="p-8 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            Add Customer
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <CustomerForm
            submitLabel="Create Customer"
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}