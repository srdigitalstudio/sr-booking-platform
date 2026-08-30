import {
  CheckCircle2,
  Clock3,
  Scissors,
  XCircle,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { AddServiceDialog } from "@/components/dashboard/AddServiceDialog";
import { ServiceFormValues } from "@/components/dashboard/ServiceForm";
import { ServiceTable } from "@/components/dashboard/ServiceTable";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      appointments: true,
    },
  });

  async function createService(
    values: ServiceFormValues
  ) {
    "use server";

    const name = values.name.trim();
    const description = values.description.trim();

    if (!name) {
      throw new Error(
        "Service name is required."
      );
    }

    if (
      !Number.isFinite(values.duration) ||
      values.duration <= 0
    ) {
      throw new Error(
        "Duration must be greater than 0."
      );
    }

    const price =
      values.price.trim() === ""
        ? null
        : Number(values.price);

    if (
      price !== null &&
      (!Number.isFinite(price) || price < 0)
    ) {
      throw new Error(
        "Price must be a valid positive number."
      );
    }

    try {
      await prisma.service.create({
        data: {
          name,
          description: description || null,
          duration: values.duration,
          price,
          active: values.active,
        },
      });

      revalidatePath("/dashboard/services");
      revalidatePath("/dashboard/appointments");
    } catch (error) {
      console.error(
        "Failed to create service:",
        error
      );

      throw new Error(
        "Failed to create service."
      );
    }
  }

  async function updateService(
    id: string,
    values: ServiceFormValues
  ) {
    "use server";

    const serviceId = id.trim();
    const name = values.name.trim();
    const description = values.description.trim();

    if (!serviceId) {
      throw new Error(
        "Service ID is required."
      );
    }

    if (!name) {
      throw new Error(
        "Service name is required."
      );
    }

    if (
      !Number.isFinite(values.duration) ||
      values.duration <= 0
    ) {
      throw new Error(
        "Duration must be greater than 0."
      );
    }

    const price =
      values.price.trim() === ""
        ? null
        : Number(values.price);

    if (
      price !== null &&
      (!Number.isFinite(price) || price < 0)
    ) {
      throw new Error(
        "Price must be a valid positive number."
      );
    }

    try {
      await prisma.service.update({
        where: {
          id: serviceId,
        },
        data: {
          name,
          description: description || null,
          duration: values.duration,
          price,
          active: values.active,
        },
      });

      revalidatePath("/dashboard/services");
      revalidatePath("/dashboard/appointments");
    } catch (error) {
      console.error(
        "Failed to update service:",
        error
      );

      throw new Error(
        "Failed to update service."
      );
    }
  }

  const activeServices = services.filter(
    (service) => service.active
  );

  const inactiveServices = services.filter(
    (service) => !service.active
  );

  const totalBookings = services.reduce(
    (total, service) =>
      total + service.appointments.length,
    0
  );

  const tableServices = services.map(
    (service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price:
        service.price === null
          ? null
          : service.price.toString(),
      active: service.active,
      appointments: service.appointments,
    })
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <Scissors
              className="h-4 w-4"
              aria-hidden="true"
            />

            <span>Service Management</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Scissors
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Services
              </h1>

              <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                Manage the services customers can
                book.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-xl border border-border bg-card px-4 py-2.5 text-sm sm:block">
            <span className="font-semibold">
              {services.length}
            </span>{" "}
            <span className="text-muted-foreground">
              {services.length === 1
                ? "service"
                : "services"}
            </span>
          </div>

          <AddServiceDialog
            onSubmit={createService}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Services */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Services
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {services.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                All configured services
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Scissors
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Active Services */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {activeServices.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Available for booking
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
              <CheckCircle2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Inactive Services */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Inactive
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {inactiveServices.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Hidden from booking
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <XCircle
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {totalBookings}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Across all services
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
              <Clock3
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Service List */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Scissors
                className="h-4 w-4"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Service List
              </h2>

              <p className="mt-0.5 text-sm text-muted-foreground">
                View and manage all your booking
                services.
              </p>
            </div>
          </div>
        </div>

        <ServiceTable
          services={tableServices}
          onUpdate={updateService}
        />
      </div>
    </div>
  );
}