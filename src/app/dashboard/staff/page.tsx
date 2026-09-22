import {
  CalendarCheck,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import { revalidatePath } from "next/cache";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { AddStaffDialog } from "@/components/dashboard/AddStaffDialog";
import { StaffTable } from "@/components/dashboard/StaffTable";
import { StaffFormValues } from "@/components/dashboard/StaffForm";
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

export default async function StaffPage() {
  const context = await getCurrentBusinessContext();

  if (!context) {
    throw new Error(
      "You must be signed in to access staff."
    );
  }

  const businessId = context.business.id;

  const staff = await prisma.staff.findMany({
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

  async function createStaff(
    values: StaffFormValues
  ) {
    "use server";

    const currentContext =
      await getCurrentBusinessContext();

    if (!currentContext) {
      throw new Error(
        "You must be signed in to create a staff member."
      );
    }

    const currentBusinessId =
      currentContext.business.id;

    const name = values.name.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const active = values.active;

    if (!name) {
      throw new Error(
        "Staff name is required."
      );
    }

    if (name.length < 2) {
      throw new Error(
        "Staff name must be at least 2 characters."
      );
    }

    if (name.length > 100) {
      throw new Error(
        "Staff name must be less than 100 characters."
      );
    }

    if (email) {
      const existingStaff =
        await prisma.staff.findFirst({
          where: {
            businessId: currentBusinessId,
            email,
          },
          select: {
            id: true,
          },
        });

      if (existingStaff) {
        throw new Error(
          "A staff member with this email already exists."
        );
      }
    }

    if (phone.length > 30) {
      throw new Error(
        "Phone number must be 30 characters or less."
      );
    }

    try {
      await prisma.staff.create({
        data: {
          businessId: currentBusinessId,
          name,
          email: email || null,
          phone: phone || null,
          active,
        },
      });

      revalidatePath("/dashboard/staff");
    } catch (error) {
      console.error(
        "Failed to create staff:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "A staff member with this email already exists."
      ) {
        throw error;
      }

      throw new Error(
        "Failed to create staff member. Please try again."
      );
    }
  }

  async function updateStaff(
    id: string,
    values: StaffFormValues
  ) {
    "use server";

    const currentContext =
      await getCurrentBusinessContext();

    if (!currentContext) {
      throw new Error(
        "You must be signed in to update a staff member."
      );
    }

    const currentBusinessId =
      currentContext.business.id;

    const name = values.name.trim();
    const email = values.email.trim();
    const phone = values.phone.trim();
    const active = values.active;

    if (!id) {
      throw new Error(
        "Staff id is required."
      );
    }

    const existingStaff =
      await prisma.staff.findFirst({
        where: {
          id,
          businessId: currentBusinessId,
        },
        select: {
          id: true,
        },
      });

    if (!existingStaff) {
      throw new Error(
        "Staff member not found."
      );
    }

    if (!name) {
      throw new Error(
        "Staff name is required."
      );
    }

    if (name.length < 2) {
      throw new Error(
        "Staff name must be at least 2 characters."
      );
    }

    if (name.length > 100) {
      throw new Error(
        "Staff name must be less than 100 characters."
      );
    }

    if (email) {
      const duplicateStaff =
        await prisma.staff.findFirst({
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

      if (duplicateStaff) {
        throw new Error(
          "A staff member with this email already exists."
        );
      }
    }

    if (phone.length > 30) {
      throw new Error(
        "Phone number must be 30 characters or less."
      );
    }

    try {
      await prisma.staff.update({
        where: {
          id,
        },
        data: {
          name,
          email: email || null,
          phone: phone || null,
          active,
        },
      });

      revalidatePath("/dashboard/staff");
    } catch (error) {
      console.error(
        "Failed to update staff:",
        error
      );

      throw new Error(
        "Failed to update staff member. Please try again."
      );
    }
  }

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (member) => member.active
  ).length;

  const totalAppointments = staff.reduce(
    (total, member) =>
      total + member.appointments.length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            <UserRound
              className="h-4 w-4"
              aria-hidden="true"
            />

            Staff Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Staff
          </h1>

          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Manage your team members and their appointment assignments.
          </p>
        </div>

        <AddStaffDialog
          onSubmit={createStaff}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card shadow-md">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Staff
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {totalStaff}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                All team members
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <UserRound
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
                Active Staff
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {activeStaff}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Currently active team members
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
                Total Appointments
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight">
                {totalAppointments}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Assigned to staff
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <CalendarCheck
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <StaffTable
        staff={staff}
        onUpdate={updateStaff}
      />
    </div>
  );
}