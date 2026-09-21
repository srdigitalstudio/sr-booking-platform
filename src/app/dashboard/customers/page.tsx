import {
  Users,
  UserRoundCheck,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { AddCustomerDialog } from "@/components/dashboard/AddCustomerDialog";
import { CustomersTable } from "@/components/dashboard/CustomersTable";
import { CustomerFormValues } from "@/components/dashboard/CustomerForm";
import { getCurrentBusinessContext } from "@/lib/auth";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default async function CustomersPage() {
  const context = await getCurrentBusinessContext();

  if (!context) {
    throw new Error(
      "You must be signed in to access customers."
    );
  }

  const businessId = context.business.id;

  const customers = await prisma.customer.findMany({
    where: {
      businessId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      appointments: {
        select: {
          id: true,
        },
      },
    },
  });

  async function createCustomer(
    values: CustomerFormValues
  ) {
    "use server";

    const currentContext =
      await getCurrentBusinessContext();

    if (!currentContext) {
      throw new Error(
        "You must be signed in to create a customer."
      );
    }

    const currentBusinessId =
      currentContext.business.id;

    const name = values.name.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();

    if (!name) {
      throw new Error(
        "Customer name is required."
      );
    }

    if (name.length < 2) {
      throw new Error(
        "Customer name must be at least 2 characters."
      );
    }

    if (name.length > 100) {
      throw new Error(
        "Customer name must be less than 100 characters."
      );
    }

    if (email) {
      const existingCustomer =
        await prisma.customer.findFirst({
          where: {
            businessId: currentBusinessId,
            email,
          },
          select: {
            id: true,
          },
        });

      if (existingCustomer) {
        throw new Error(
          "A customer with this email already exists."
        );
      }
    }

    try {
      await prisma.customer.create({
        data: {
          businessId: currentBusinessId,
          name,
          email: email || null,
          phone: phone || null,
        },
      });

      revalidatePath("/dashboard/customers");
    } catch (error) {
      console.error(
        "Failed to create customer:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "A customer with this email already exists."
      ) {
        throw error;
      }

      throw new Error(
        "Failed to create customer. Please try again."
      );
    }
  }

  async function updateCustomer(
    id: string,
    values: CustomerFormValues
  ) {
    "use server";

    const currentContext =
      await getCurrentBusinessContext();

    if (!currentContext) {
      throw new Error(
        "You must be signed in to update a customer."
      );
    }

    const currentBusinessId =
      currentContext.business.id;

    const name = values.name.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();

    if (!id) {
      throw new Error(
        "Customer id is required."
      );
    }

    const existingCustomer =
      await prisma.customer.findFirst({
        where: {
          id,
          businessId: currentBusinessId,
        },
        select: {
          id: true,
        },
      });

    if (!existingCustomer) {
      throw new Error(
        "Customer not found."
      );
    }

    if (!name) {
      throw new Error(
        "Customer name is required."
      );
    }

    if (name.length < 2) {
      throw new Error(
        "Customer name must be at least 2 characters."
      );
    }

    if (name.length > 100) {
      throw new Error(
        "Customer name must be less than 100 characters."
      );
    }

    if (email) {
      const duplicateCustomer =
        await prisma.customer.findFirst({
          where: {
            businessId: currentBusinessId,
            email,
            NOT: {
              id,
            },
          },
          select: {
            id: true,
          },
        });

      if (duplicateCustomer) {
        throw new Error(
          "A customer with this email already exists."
        );
      }
    }

    try {
      await prisma.customer.update({
        where: {
          id,
        },
        data: {
          name,
          email: email || null,
          phone: phone || null,
        },
      });

      revalidatePath("/dashboard/customers");
    } catch (error) {
      console.error(
        "Failed to update customer:",
        error
      );

      throw new Error(
        "Failed to update customer. Please try again."
      );
    }
  }

  const totalCustomers = customers.length;

  const customersWithAppointments =
    customers.filter(
      (customer) =>
        customer.appointments.length > 0
    ).length;

  const totalAppointments = customers.reduce(
    (total, customer) =>
      total + customer.appointments.length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <Users
              className="h-4 w-4"
              aria-hidden="true"
            />

            Customer Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Customers
          </h1>

          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Manage your customers and their booking history.
          </p>
        </div>

        <AddCustomerDialog
          onSubmit={createCustomer}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Customers
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {totalCustomers}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                All registered customers
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Users
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Customers
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {customersWithAppointments}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Customers with bookings
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
              <UserRoundCheck
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-md sm:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {totalAppointments}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Across all customers
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Users
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <CustomersTable
        customers={customers}
        onUpdate={updateCustomer}
      />
    </div>
  );
}