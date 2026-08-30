"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import {
  CustomerForm,
  CustomerFormValues,
} from "@/components/dashboard/CustomerForm";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
  ) => void | Promise<void>;
};

export function EditCustomerDialog({
  customer,
  onSubmit,
}: EditCustomerDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(
    values: CustomerFormValues
  ) {
    await onSubmit(customer.id, values);
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
            aria-label={`Edit ${customer.name}`}
            title="Edit customer"
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
            Edit Customer
          </SheetTitle>

          <SheetDescription>
            Update the customer&apos;s contact information.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8">
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