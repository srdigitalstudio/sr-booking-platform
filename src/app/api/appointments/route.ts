import { NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { requireApiUser } from "@/lib/api-auth";

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

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

const DEFAULT_SETTINGS = {
  businessName: "SR Booking",
  businessType: "Booking Platform",
  bookingEnabled: true,
  defaultAppointmentStatus: "PENDING" as const,
  bookingNotifications: true,
  customerNotifications: true,
  language: "English",
  currency: "USD",
};

function jsonError(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    }
  );
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function isValidStatus(
  value: string
): value is AllowedStatus {
  return allowedStatuses.includes(
    value as AllowedStatus
  );
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidDateFormat(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Store appointment dates consistently at UTC midnight.
 *
 * The UI sends YYYY-MM-DD, so we intentionally avoid
 * `new Date("YYYY-MM-DD")` ambiguity across environments.
 */
function parseAppointmentDate(
  value: string
): Date | null {
  if (!isValidDateFormat(value)) {
    return null;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function createCustomerEmail(
  customerName: string
): string {
  const normalizedName = customerName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "");

  const safeName =
    normalizedName || "customer";

  return `${safeName}@local.customer`;
}

async function getSettings() {
  const existingSettings =
    await prisma.settings.findFirst();

  if (existingSettings) {
    return existingSettings;
  }

  return prisma.settings.create({
    data: DEFAULT_SETTINGS,
  });
}

async function findOrCreateCustomer(
  customerName: string
) {
  const email = createCustomerEmail(customerName);

  return prisma.customer.upsert({
    where: {
      email,
    },
    update: {
      name: customerName,
    },
    create: {
      name: customerName,
      email,
    },
  });
}

async function findService(
  serviceName: string
) {
  return prisma.service.findFirst({
    where: {
      name: {
        equals: serviceName,
        mode: "insensitive",
      },
      active: true,
    },
  });
}

async function getAuthenticatedUser() {
  const user = await requireApiUser();

  if (!user) {
    return null;
  }

  return user;
}

function handleUnexpectedError(
  operation: string,
  error: unknown
) {
  console.error(
    `${operation} failed:`,
    error
  );

  return jsonError(
    "Something went wrong. Please try again.",
    500
  );
}

/* -------------------------------------------------------------------------- */
/* GET                                                                        */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    const appointments =
      await prisma.appointment.findMany({
        include: {
          customer: true,
          service: true,
        },
        orderBy: [
          {
            date: "desc",
          },
          {
            time: "desc",
          },
        ],
      });

    return NextResponse.json(
      appointments
    );
  } catch (error) {
    return handleUnexpectedError(
      "GET /api/appointments",
      error
    );
  }
}

/* -------------------------------------------------------------------------- */
/* POST                                                                       */
/* -------------------------------------------------------------------------- */

export async function POST(
  request: Request
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    let body: Record<string, unknown>;

    try {
      body =
        (await request.json()) as Record<
          string,
          unknown
        >;
    } catch {
      return jsonError(
        "Invalid request body.",
        400
      );
    }

    const customer = normalizeText(
      body.customer
    );

    const service = normalizeText(
      body.service
    );

    const date = normalizeText(
      body.date
    );

    const time = normalizeText(
      body.time
    );

    if (
      !customer ||
      !service ||
      !date ||
      !time
    ) {
      return jsonError(
        "Customer, service, date and time are required.",
        400
      );
    }

    if (customer.length > 120) {
      return jsonError(
        "Customer name is too long.",
        400
      );
    }

    if (service.length > 120) {
      return jsonError(
        "Service name is too long.",
        400
      );
    }

    const appointmentDate =
      parseAppointmentDate(date);

    if (!appointmentDate) {
      return jsonError(
        "Invalid appointment date.",
        400
      );
    }

    if (!isValidTime(time)) {
      return jsonError(
        "Invalid appointment time. Use HH:MM format.",
        400
      );
    }

    const settings = await getSettings();

    if (!settings.bookingEnabled) {
      return jsonError(
        "Booking is currently disabled.",
        403
      );
    }

    const serviceRecord =
      await findService(service);

    if (!serviceRecord) {
      return jsonError(
        "Service not found or inactive.",
        404
      );
    }

    const existingAppointment =
      await prisma.appointment.findFirst({
        where: {
          serviceId: serviceRecord.id,
          date: appointmentDate,
          time,
          status: {
            not: "CANCELLED",
          },
        },
      });

    if (existingAppointment) {
      return jsonError(
        "This time slot is already booked for this service.",
        409
      );
    }

    const customerRecord =
      await findOrCreateCustomer(
        customer
      );

    const appointment =
      await prisma.appointment.create({
        data: {
          customerId: customerRecord.id,
          serviceId: serviceRecord.id,
          date: appointmentDate,
          time,
          status:
            settings.defaultAppointmentStatus,
        },
        include: {
          customer: true,
          service: true,
        },
      });

    return NextResponse.json(
      appointment,
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleUnexpectedError(
      "POST /api/appointments",
      error
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PATCH                                                                      */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  request: Request
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    let body: Record<string, unknown>;

    try {
      body =
        (await request.json()) as Record<
          string,
          unknown
        >;
    } catch {
      return jsonError(
        "Invalid request body.",
        400
      );
    }

    const id = normalizeText(body.id);

    if (!id) {
      return jsonError(
        "Appointment ID is required.",
        400
      );
    }

    const appointment =
      await prisma.appointment.findUnique({
        where: {
          id,
        },
      });

    if (!appointment) {
      return jsonError(
        "Appointment not found.",
        404
      );
    }

    /* --------------------------- Status update --------------------------- */

    if (body.status !== undefined) {
      const normalizedStatus =
        normalizeText(
          body.status
        ).toUpperCase();

      if (
        !isValidStatus(
          normalizedStatus
        )
      ) {
        return jsonError(
          "Invalid appointment status.",
          400
        );
      }

      const updatedAppointment =
        await prisma.appointment.update({
          where: {
            id,
          },
          data: {
            status: normalizedStatus,
          },
          include: {
            customer: true,
            service: true,
          },
        });

      return NextResponse.json(
        updatedAppointment
      );
    }

    /* -------------------------- Full update ----------------------------- */

    const customer = normalizeText(
      body.customer
    );

    const service = normalizeText(
      body.service
    );

    const date = normalizeText(
      body.date
    );

    const time = normalizeText(
      body.time
    );

    if (
      !customer ||
      !service ||
      !date ||
      !time
    ) {
      return jsonError(
        "Customer, service, date and time are required.",
        400
      );
    }

    if (customer.length > 120) {
      return jsonError(
        "Customer name is too long.",
        400
      );
    }

    if (service.length > 120) {
      return jsonError(
        "Service name is too long.",
        400
      );
    }

    const appointmentDate =
      parseAppointmentDate(date);

    if (!appointmentDate) {
      return jsonError(
        "Invalid appointment date.",
        400
      );
    }

    if (!isValidTime(time)) {
      return jsonError(
        "Invalid appointment time. Use HH:MM format.",
        400
      );
    }

    const serviceRecord =
      await findService(service);

    if (!serviceRecord) {
      return jsonError(
        "Service not found or inactive.",
        404
      );
    }

    const conflictingAppointment =
      await prisma.appointment.findFirst({
        where: {
          id: {
            not: id,
          },
          serviceId: serviceRecord.id,
          date: appointmentDate,
          time,
          status: {
            not: "CANCELLED",
          },
        },
      });

    if (conflictingAppointment) {
      return jsonError(
        "This time slot is already booked for this service.",
        409
      );
    }

    const customerRecord =
      await findOrCreateCustomer(
        customer
      );

    const updatedAppointment =
      await prisma.appointment.update({
        where: {
          id,
        },
        data: {
          customerId:
            customerRecord.id,
          serviceId:
            serviceRecord.id,
          date: appointmentDate,
          time,
        },
        include: {
          customer: true,
          service: true,
        },
      });

    return NextResponse.json(
      updatedAppointment
    );
  } catch (error) {
    return handleUnexpectedError(
      "PATCH /api/appointments",
      error
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE                                                                     */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  request: Request
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    let body: Record<string, unknown>;

    try {
      body =
        (await request.json()) as Record<
          string,
          unknown
        >;
    } catch {
      return jsonError(
        "Invalid request body.",
        400
      );
    }

    const id = normalizeText(body.id);

    if (!id) {
      return jsonError(
        "Appointment ID is required.",
        400
      );
    }

    const appointment =
      await prisma.appointment.findUnique({
        where: {
          id,
        },
      });

    if (!appointment) {
      return jsonError(
        "Appointment not found.",
        404
      );
    }

    await prisma.appointment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return handleUnexpectedError(
      "DELETE /api/appointments",
      error
    );
  }
}