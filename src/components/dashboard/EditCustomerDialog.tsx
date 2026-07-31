"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

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

type EditCustomerDialogProps = {
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  onSubmit: (
    id: string,
    values: CustomerFormValues
  ) => void;
};

export function EditCustomerDialog({
  customer,
  onSubmit,
}: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false);

  function handleSubmit(values: CustomerFormValues) {
    onSubmit(customer.id, values);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
          />
        }
      >
        <Pencil className="h-4 w-4" />
      </SheetTrigger>

      <SheetContent className="p-8 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Customer</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <CustomerForm
            submitLabel="Update Customer"
            initialValues={{
              name: customer.name,
              email: customer.email ?? "",
              phone: customer.phone ?? "",
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}