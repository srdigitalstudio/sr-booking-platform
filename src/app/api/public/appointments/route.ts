import { NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

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

function jsonError(message: string, status: number) {
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

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isValidDateFormat(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseAppointmentDate(value: string): Date | null {
  if (!isValidDateFormat(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

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

function formatDateKey(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
}

function getDayOfWeek(date: Date): DayOfWeek {
  switch (date.getUTCDay()) {
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
  customerName: string,
  customerEmail?: string
): string {
  const providedEmail = normalizeText(customerEmail);

  if (providedEmail) {
    return providedEmail.toLowerCase();
  }

  const normalizedName = customerName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "");

  const safeName = normalizedName || "customer";

  return `${safeName}@local.customer`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function getPublicBusiness(
  businessSlug?: string
) {
  if (businessSlug) {
    return prisma.business.findFirst({
      where: {
        slug: businessSlug,
        active: true,
      },
    });
  }

  return prisma.business.findFirst({
    where: {
      active: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

async function getSettings(businessId: string) {
  const settings = await prisma.settings.findUnique({
    where: {
      businessId,
    },
  });

  if (settings) {
    return settings;
  }

  return prisma.settings.create({
    data: {
      ...DEFAULT_SETTINGS,
      businessId,
    },
  });
}

async function findOrCreateCustomer({
  businessId,
  name,
  email,
  phone,
}: {
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
}) {
  const customerEmail = createCustomerEmail(
    name,
    email
  );

  const existingCustomer =
    await prisma.customer.findUnique({
      where: {
        businessId_email: {
          businessId,
          email: customerEmail,
        },
      },
    });

  if (existingCustomer) {
    return prisma.customer.update({
      where: {
        id: existingCustomer.id,
      },
      data: {
        name,
        ...(phone
          ? {
              phone,
            }
          : {}),
      },
    });
  }

  return prisma.customer.create({
    data: {
      businessId,
      name,
      email: customerEmail,
      ...(phone
        ? {
            phone,
          }
        : {}),
    },
  });
}

async function findActiveService(
  businessId: string,
  serviceId: string
) {
  return prisma.service.findFirst({
    where: {
      id: serviceId,
      businessId,
      active: true,
    },
  });
}

async function validateAppointmentAvailability({
  businessId,
  date,
  time,
  duration,
}: {
  businessId: string;
  date: Date;
  time: string;
  duration: number;
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
      error: "The business is closed on this day.",
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
      error: blockedDate.reason
        ? `This date is blocked: ${blockedDate.reason}`
        : "This date is blocked for bookings.",
    };
  }

  const appointmentStart = timeToMinutes(time);
  const appointmentEnd =
    appointmentStart + duration;

  const businessStart = timeToMinutes(
    businessHour.startTime
  );

  const businessEnd = timeToMinutes(
    businessHour.endTime
  );

  if (appointmentStart < businessStart) {
    return {
      valid: false,
      error: `Appointment must start at or after ${businessHour.startTime}.`,
    };
  }

  if (appointmentEnd > businessEnd) {
    return {
      valid: false,
      error: `This appointment would end at ${minutesToTime(
        appointmentEnd
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

  const overlappingBreak =
    businessBreaks.find((businessBreak) => {
      const breakStart = timeToMinutes(
        businessBreak.startTime
      );

      const breakEnd = timeToMinutes(
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
      error: overlappingBreak.label
        ? `This appointment overlaps with the break "${overlappingBreak.label}".`
        : "This appointment overlaps with a business break.",
    };
  }

  const existingAppointments =
    await prisma.appointment.findMany({
      where: {
        businessId,
        date,
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        service: true,
      },
    });

  const overlappingAppointment =
    existingAppointments.find(
      (existingAppointment) => {
        const existingStart = timeToMinutes(
          existingAppointment.time
        );

        const existingEnd =
          existingStart +
          existingAppointment.service.duration;

        return (
          appointmentStart < existingEnd &&
          appointmentEnd > existingStart
        );
      }
    );

  if (overlappingAppointment) {
    return {
      valid: false,
      error: `This time overlaps with an existing appointment at ${overlappingAppointment.time}.`,
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
  console.error(`${operation} failed:`, error);

  return jsonError(
    "Something went wrong. Please try again.",
    500
  );
}

/* -------------------------------------------------------------------------- */
/* POST                        */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;

    try {
      body = (await request.json()) as Record<
        string,
        unknown
      >;
    } catch {
      return jsonError(
        "Invalid request body.",
        400
      );
    }

    const businessSlug = normalizeText(
      body.businessSlug
    );

    const customerName = normalizeText(
      body.customerName ?? body.customer
    );

    const customerEmail = normalizeText(
      body.customerEmail ?? body.email
    );

    const customerPhone = normalizeText(
      body.customerPhone ?? body.phone
    );

    const serviceId = normalizeText(
      body.serviceId
    );

    const serviceName = normalizeText(
      body.service
    );

    const date = normalizeText(body.date);

    const time = normalizeText(body.time);

    const notes = normalizeText(body.notes);

    if (!customerName) {
      return jsonError(
        "Customer name is required.",
        400
      );
    }

    if (customerName.length > 120) {
      return jsonError(
        "Customer name is too long.",
        400
      );
    }

    if (
      customerEmail &&
      (customerEmail.length > 160 ||
        !isValidEmail(customerEmail))
    ) {
      return jsonError(
        "Please provide a valid email address.",
        400
      );
    }

    if (customerPhone.length > 40) {
      return jsonError(
        "Phone number is too long.",
        400
      );
    }

    if (notes.length > 1000) {
      return jsonError(
        "Notes are too long.",
        400
      );
    }

    if (!date || !time) {
      return jsonError(
        "Date and time are required.",
        400
      );
    }

    if (!serviceId && !serviceName) {
      return jsonError(
        "Service is required.",
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

    const today = new Date();

    const todayKey = formatDateKey(today);

    if (date < todayKey) {
      return jsonError(
        "Appointments cannot be booked in the past.",
        400
      );
    }

    const business =
      await getPublicBusiness(businessSlug);

    if (!business) {
      return jsonError(
        "Business not found.",
        404
      );
    }

    const businessId = business.id;

    const settings =
      await getSettings(businessId);

    if (!settings.bookingEnabled) {
      return jsonError(
        "Booking is currently disabled.",
        403
      );
    }

    let serviceRecord;

    if (serviceId) {
      serviceRecord =
        await findActiveService(
          businessId,
          serviceId
        );
    } else {
      serviceRecord =
        await prisma.service.findFirst({
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
        duration: serviceRecord.duration,
      });

    if (!availability.valid) {
      return jsonError(
        availability.error ??
          "This appointment time is not available.",
        409
      );
    }

    const customer =
      await findOrCreateCustomer({
        businessId,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      });

    const appointment =
      await prisma.appointment.create({
        data: {
          businessId,
          customerId: customer.id,
          serviceId: serviceRecord.id,
          date: appointmentDate,
          time,
          status:
            settings.defaultAppointmentStatus,
          ...(notes
            ? {
                notes,
              }
            : {}),
        },
        include: {
          customer: true,
          service: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        appointment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleUnexpectedError(
      "POST /api/public/appointments",
      error
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GET                        */
/* -------------------------------------------------------------------------- */

export async function GET(
  request: Request
) {
  try {
    const url = new URL(request.url);

    const businessSlug = normalizeText(
      url.searchParams.get("businessSlug")
    );

    const date = normalizeText(
      url.searchParams.get("date")
    );

    if (!date) {
      return jsonError(
        "Date is required.",
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

    const business =
      await getPublicBusiness(businessSlug);

    if (!business) {
      return jsonError(
        "Business not found.",
        404
      );
    }

    const appointments =
      await prisma.appointment.findMany({
        where: {
          businessId: business.id,
          date: appointmentDate,
          status: {
            not: "CANCELLED",
          },
        },
        select: {
          id: true,
          date: true,
          time: true,
          status: true,
          service: {
            select: {
              duration: true,
            },
          },
        },
        orderBy: {
          time: "asc",
        },
      });

    return NextResponse.json(
      appointments
    );
  } catch (error) {
    return handleUnexpectedError(
      "GET /api/public/appointments",
      error
    );
  }
}