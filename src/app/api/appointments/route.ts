import { NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { getCurrentBusinessContext } from "@/lib/auth";

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

type DayOfWeek =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

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
 * new Date("YYYY-MM-DD") ambiguity across environments.
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

function timeToMinutes(time: string): number {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
}

function getDayOfWeek(
  date: Date
): DayOfWeek {
  const day = date.getUTCDay();

  switch (day) {
    case 0:
      return "SUNDAY";
    case 1:
      return "MONDAY";
    case 2:
      return "TUESDAY";
    case 3:
      return "WEDNESDAY";
    case 4:
      return "THURSDAY";
    case 5:
      return "FRIDAY";
    case 6:
      return "SATURDAY";
    default:
      return "SUNDAY";
  }
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

async function getSettings(
  businessId: string
) {
  const existingSettings =
    await prisma.settings.findUnique({
      where: {
        businessId,
      },
    });

  if (existingSettings) {
    return existingSettings;
  }

  return prisma.settings.create({
    data: {
      ...DEFAULT_SETTINGS,
      businessId,
    },
  });
}

async function findOrCreateCustomer(
  businessId: string,
  customerName: string
) {
  const email =
    createCustomerEmail(customerName);

  return prisma.customer.upsert({
    where: {
      businessId_email: {
        businessId,
        email,
      },
    },
    update: {
      name: customerName,
    },
    create: {
      businessId,
      name: customerName,
      email,
    },
  });
}

async function findService(
  businessId: string,
  serviceName: string
) {
  return prisma.service.findFirst({
    where: {
      businessId,
      name: {
        equals: serviceName,
        mode: "insensitive",
      },
      active: true,
    },
  });
}

async function getBusinessContext() {
  return getCurrentBusinessContext();
}

/**
 * Validates the appointment against:
 * - blocked dates
 * - configured business hours
 * - business opening/closing time
 * - business breaks
 * - the service duration
 * - other active appointments
 */
async function validateAppointmentAvailability({
  businessId,
  date,
  time,
  duration,
  excludeAppointmentId,
}: {
  businessId: string;
  date: Date;
  time: string;
  duration: number;
  excludeAppointmentId?: string;
}) {
  const dayOfWeek = getDayOfWeek(date);

  const businessHour =
    await prisma.businessHour.findUnique({
      where: {
        businessId_dayOfWeek: {
          businessId,
          dayOfWeek,
        },
      },
    });

  if (!businessHour) {
    return {
      valid: false,
      error:
        "Business hours for this day have not been configured.",
    };
  }

  if (!businessHour.isOpen) {
    return {
      valid: false,
      error:
        "The business is closed on this day.",
    };
  }

  const blockedDate =
    await prisma.blockedDate.findUnique({
      where: {
        businessId_date: {
          businessId,
          date,
        },
      },
    });

  if (blockedDate) {
    return {
      valid: false,
      error:
        blockedDate.reason
          ? `This date is blocked: ${blockedDate.reason}`
          : "This date is blocked for bookings.",
    };
  }

  const startMinutes =
    timeToMinutes(time);

  const endMinutes =
    startMinutes + duration;

  const businessStart =
    timeToMinutes(
      businessHour.startTime
    );

  const businessEnd =
    timeToMinutes(
      businessHour.endTime
    );

  if (startMinutes < businessStart) {
    return {
      valid: false,
      error:
        `Appointment must start at or after ${businessHour.startTime}.`,
    };
  }

  if (endMinutes > businessEnd) {
    return {
      valid: false,
      error:
        `This appointment would end at ${minutesToTime(
          endMinutes
        )}, outside business hours ending at ${businessHour.endTime}.`,
    };
  }

  const businessBreaks =
    await prisma.businessBreak.findMany({
      where: {
        businessId,
        dayOfWeek,
      },
    });

  const appointmentStart = startMinutes;
  const appointmentEnd = endMinutes;

  const overlappingBreak =
    businessBreaks.find((businessBreak) => {
      const breakStart =
        timeToMinutes(
          businessBreak.startTime
        );

      const breakEnd =
        timeToMinutes(
          businessBreak.endTime
        );

      return (
        appointmentStart < breakEnd &&
        appointmentEnd > breakStart
      );
    });

  if (overlappingBreak) {
    return {
      valid: false,
      error:
        overlappingBreak.label
          ? `This appointment overlaps with the break "${overlappingBreak.label}".`
          : "This appointment overlaps with a business break.",
    };
  }

  const appointments =
    await prisma.appointment.findMany({
      where: {
        businessId,
        date,
        status: {
          not: "CANCELLED",
        },
        ...(excludeAppointmentId
          ? {
              id: {
                not: excludeAppointmentId,
              },
            }
          : {}),
      },
      include: {
        service: true,
      },
    });

  const overlappingAppointment =
    appointments.find((existingAppointment) => {
      const existingStart =
        timeToMinutes(
          existingAppointment.time
        );

      const existingEnd =
        existingStart +
        existingAppointment.service.duration;

      return (
        appointmentStart < existingEnd &&
        appointmentEnd > existingStart
      );
    });

  if (overlappingAppointment) {
    return {
      valid: false,
      error:
        `This time overlaps with an existing appointment at ${overlappingAppointment.time}.`,
    };
  }

  return {
    valid: true,
  };
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
    const context =
      await getBusinessContext();

    if (!context) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    const appointments =
      await prisma.appointment.findMany({
        where: {
          businessId:
            context.business.id,
        },
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
    const context =
      await getBusinessContext();

    if (!context) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    const businessId =
      context.business.id;

    let body: Record<
      string,
      unknown
    >;

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

    const customer =
      normalizeText(body.customer);

    const service =
      normalizeText(body.service);

    const date =
      normalizeText(body.date);

    const time =
      normalizeText(body.time);

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

    const settings =
      await getSettings(businessId);

    if (!settings.bookingEnabled) {
      return jsonError(
        "Booking is currently disabled.",
        403
      );
    }

    const serviceRecord =
      await findService(
        businessId,
        service
      );

    if (!serviceRecord) {
      return jsonError(
        "Service not found or inactive.",
        404
      );
    }

    if (
      !Number.isInteger(
        serviceRecord.duration
      ) ||
      serviceRecord.duration <= 0
    ) {
      return jsonError(
        "The selected service has an invalid duration.",
        400
      );
    }

    const availability =
      await validateAppointmentAvailability({
        businessId,
        date: appointmentDate,
        time,
        duration:
          serviceRecord.duration,
      });

    if (!availability.valid) {
      return jsonError(
        availability.error ??
          "This appointment time is not available.",
        409
      );
    }

    const customerRecord =
      await findOrCreateCustomer(
        businessId,
        customer
      );

    const appointment =
      await prisma.appointment.create({
        data: {
          businessId,
          customerId:
            customerRecord.id,
          serviceId:
            serviceRecord.id,
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
    const context =
      await getBusinessContext();

    if (!context) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    const businessId =
      context.business.id;

    let body: Record<
      string,
      unknown
    >;

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

    const id =
      normalizeText(body.id);

    if (!id) {
      return jsonError(
        "Appointment ID is required.",
        400
      );
    }

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          businessId,
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
            status:
              normalizedStatus,
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

    const customer =
      normalizeText(body.customer);

    const service =
      normalizeText(body.service);

    const date =
      normalizeText(body.date);

    const time =
      normalizeText(body.time);

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
      await findService(
        businessId,
        service
      );

    if (!serviceRecord) {
      return jsonError(
        "Service not found or inactive.",
        404
      );
    }

    if (
      !Number.isInteger(
        serviceRecord.duration
      ) ||
      serviceRecord.duration <= 0
    ) {
      return jsonError(
        "The selected service has an invalid duration.",
        400
      );
    }

    const availability =
      await validateAppointmentAvailability({
        businessId,
        date: appointmentDate,
        time,
        duration:
          serviceRecord.duration,
        excludeAppointmentId:
          id,
      });

    if (!availability.valid) {
      return jsonError(
        availability.error ??
          "This appointment time is not available.",
        409
      );
    }

    const customerRecord =
      await findOrCreateCustomer(
        businessId,
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
    const context =
      await getBusinessContext();

    if (!context) {
      return jsonError(
        "Unauthorized",
        401
      );
    }

    const businessId =
      context.business.id;

    let body: Record<
      string,
      unknown
    >;

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

    const id =
      normalizeText(body.id);

    if (!id) {
      return jsonError(
        "Appointment ID is required.",
        400
      );
    }

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          businessId,
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