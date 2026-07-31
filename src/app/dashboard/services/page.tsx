import { Scissors } from "lucide-react";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { AddServiceDialog } from "@/components/dashboard/AddServiceDialog";
import { EditServiceDialog } from "@/components/dashboard/EditServiceDialog";
import { DeleteServiceButton } from "@/components/dashboard/DeleteServiceButton";
import { ServiceFormValues } from "@/components/dashboard/ServiceForm";

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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/services`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create service");
    }
  }

  async function updateService(
    id: string,
    values: ServiceFormValues
  ) {
    "use server";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/services`,
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
      throw new Error("Failed to update service");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Services
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage your booking services.
          </p>
        </div>

        <AddServiceDialog
          onSubmit={createService}
        />
      </div>

      <Card className="rounded-2xl border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Service List
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b text-left text-sm text-muted-foreground">
                <tr>
                  <th className="pb-4">Name</th>
                  <th className="pb-4">
                    Description
                  </th>
                  <th className="pb-4">Duration</th>
                  <th className="pb-4">Price</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">
                    Appointments
                  </th>
                  <th className="pb-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b last:border-0"
                  >
                    <td className="py-4 font-medium">
                      {service.name}
                    </td>

                    <td>
                      {service.description ?? "—"}
                    </td>

                    <td>
                      {service.duration} min
                    </td>

                    <td>
                      {service.price
                        ? `$${service.price.toString()}`
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          service.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {service.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {service.appointments.length}
                    </td>

                    <td>
                      <div className="flex justify-end gap-1">
                        <EditServiceDialog
                          service={{
                            id: service.id,
                            name: service.name,
                            description:
                              service.description,
                            duration:
                              service.duration,
                            price:
                              service.price?.toString() ??
                              null,
                            active: service.active,
                          }}
                          onSubmit={updateService}
                        />

                        <DeleteServiceButton
                          serviceId={service.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {services.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No services yet.
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