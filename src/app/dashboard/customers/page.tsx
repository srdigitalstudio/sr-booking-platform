import { Users } from "lucide-react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { AddCustomerDialog } from "@/components/dashboard/AddCustomerDialog";
import { EditCustomerDialog } from "@/components/dashboard/EditCustomerDialog";
import { DeleteCustomerButton } from "@/components/dashboard/DeleteCustomerButton";
import { CustomerFormValues } from "@/components/dashboard/CustomerForm";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      appointments: true,
    },
  });

  async function createCustomer(
    values: CustomerFormValues
  ) {
    "use server";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/customers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create customer");
    }
  }

  async function updateCustomer(
    id: string,
    values: CustomerFormValues
  ) {
    "use server";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/customers`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...values,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update customer");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Customers
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your customers.
          </p>
        </div>

        <AddCustomerDialog
          onSubmit={createCustomer}
        />
      </div>

      <Card className="rounded-2xl border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b text-left text-sm text-muted-foreground">
                <tr>
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Phone</th>
                  <th className="pb-4">
                    Appointments
                  </th>
                  <th className="pb-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-4 font-medium">
                      {customer.name}
                    </td>

                    <td>
                      {customer.email ?? "—"}
                    </td>

                    <td>
                      {customer.phone ?? "—"}
                    </td>

                    <td>
                      {customer.appointments.length}
                    </td>

                    <td>
                      <div className="flex justify-end gap-1">
                        <EditCustomerDialog
                          customer={{
                            id: customer.id,
                            name: customer.name,
                            email: customer.email,
                            phone: customer.phone,
                          }}
                          onSubmit={updateCustomer}
                        />

                        <DeleteCustomerButton
                          customerId={customer.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {customers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No customers yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}