import { NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { getCurrentBusinessContext } from "@/lib/auth";
import { validateAppointmentAvailability } from "@/lib/booking/availability";

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

class BookingUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingUnavailableError";
  }
}

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

async function findStaff(
  businessId: string,
  staffId: string
) {
  return prisma.staff.findFirst({
    where: {
      id: staffId,
      businessId,
      active: true,
    },
  });
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

export async function GET() {
  try {
    const context =
      await getCurrentBusinessContext();

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
          staff: true,
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

export async function POST(
  request: Request
) {
  try {
    const context =
      await getCurrentBusinessContext();

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

    const staffId =
      normalizeText(body.staffId);

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

    let staffRecord = null;

    if (staffId) {
      staffRecord =
        await findStaff(
          businessId,
          staffId
        );

      if (!staffRecord) {
        return jsonError(
          "Staff member not found or inactive.",
          404
        );
      }
    }

    const appointment =
      await prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`
            SELECT pg_advisory_xact_lock(
              hashtext(
                ${businessId} || ':' || ${date}
              )
            )
          `;

          const availability =
            await validateAppointmentAvailability({
              prisma:
                tx as unknown as PrismaClient,
              businessId,
              date: appointmentDate,
              time,
              duration:
                serviceRecord.duration,
            });

          if (!availability.valid) {
            throw new BookingUnavailableError(
              availability.error
            );
          }

          const customerRecord =
            await tx.customer.upsert({
              where: {
                businessId_email: {
                  businessId,
                  email:
                    createCustomerEmail(
                      customer
                    ),
                },
              },
              update: {
                name: customer,
              },
              create: {
                businessId,
                name: customer,
                email:
                  createCustomerEmail(
                    customer
                  ),
              },
            });

          return tx.appointment.create({
            data: {
              businessId,
              customerId:
                customerRecord.id,
              serviceId:
                serviceRecord.id,
              staffId:
                staffRecord?.id ?? null,
              date: appointmentDate,
              time,
              status:
                settings.defaultAppointmentStatus,
            },
            include: {
              customer: true,
              service: true,
              staff: true,
            },
          });
        }
      );

    return NextResponse.json(
      appointment,
      {
        status: 201,
      }
    );
  } catch (error) {
    if (
      error instanceof
      BookingUnavailableError
    ) {
      return jsonError(
        error.message,
        409
      );
    }

    return handleUnexpectedError(
      "POST /api/appointments",
      error
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const context =
      await getCurrentBusinessContext();

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
            staff: true,
          },
        });

      return NextResponse.json(
        updatedAppointment
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

    const staffId =
      normalizeText(body.staffId);

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

    let staffRecord = null;

    if (staffId) {
      staffRecord =
        await findStaff(
          businessId,
          staffId
        );

      if (!staffRecord) {
        return jsonError(
          "Staff member not found or inactive.",
          404
        );
      }
    }

    const appointmentUpdate =
      await prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`
            SELECT pg_advisory_xact_lock(
              hashtext(
                ${businessId} || ':' || ${date}
              )
            )
          `;

          const availability =
            await validateAppointmentAvailability({
              prisma:
                tx as unknown as PrismaClient,
              businessId,
              date: appointmentDate,
              time,
              duration:
                serviceRecord.duration,
              excludeAppointmentId:
                id,
            });

          if (!availability.valid) {
            throw new BookingUnavailableError(
              availability.error
            );
          }

          const customerRecord =
            await tx.customer.upsert({
              where: {
                businessId_email: {
                  businessId,
                  email:
                    createCustomerEmail(
                      customer
                    ),
                },
              },
              update: {
                name: customer,
              },
              create: {
                businessId,
                name: customer,
                email:
                  createCustomerEmail(
                    customer
                  ),
              },
            });

          return tx.appointment.update({
            where: {
              id,
            },
            data: {
              customerId:
                customerRecord.id,
              serviceId:
                serviceRecord.id,
              staffId:
                staffRecord?.id ?? null,
              date: appointmentDate,
              time,
            },
            include: {
              customer: true,
              service: true,
              staff: true,
            },
          });
        }
      );

    return NextResponse.json(
      appointmentUpdate
    );
  } catch (error) {
    if (
      error instanceof
      BookingUnavailableError
    ) {
      return jsonError(
        error.message,
        409
      );
    }

    return handleUnexpectedError(
      "PATCH /api/appointments",
      error
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const context =
      await getCurrentBusinessContext();

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