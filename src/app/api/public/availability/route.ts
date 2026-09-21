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

function isValidDateFormat(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function parseDate(value: string): Date | null {
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

function timeToMinutes(time: string): number {
  if (!isValidTime(time)) {
    return -1;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const normalizedMinutes = Math.max(
    0,
    Math.min(totalMinutes, 23 * 60 + 59)
  );

  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

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

function getDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

function generateSlots({
  startTime,
  endTime,
  duration,
  breaks,
  appointments,
}: {
  startTime: string;
  endTime: string;
  duration: number;
  breaks: Array<{
    startTime: string;
    endTime: string;
  }>;
  appointments: Array<{
    time: string;
    service: {
      duration: number;
    };
  }>;
}): string[] {
  const businessStart = timeToMinutes(startTime);
  const businessEnd = timeToMinutes(endTime);

  if (
    businessStart < 0 ||
    businessEnd < 0 ||
    businessEnd <= businessStart ||
    duration <= 0
  ) {
    return [];
  }

  const slots: string[] = [];

  for (
    let current = businessStart;
    current + duration <= businessEnd;
    current += 30
  ) {
    const slotEnd = current + duration;

    const overlapsBreak = breaks.some((item) => {
      const breakStart = timeToMinutes(item.startTime);
      const breakEnd = timeToMinutes(item.endTime);

      if (
        breakStart < 0 ||
        breakEnd < 0 ||
        breakEnd <= breakStart
      ) {
        return false;
      }

      return (
        current < breakEnd &&
        slotEnd > breakStart
      );
    });

    if (overlapsBreak) {
      continue;
    }

    const overlapsAppointment = appointments.some(
      (appointment) => {
        const appointmentStart = timeToMinutes(
          appointment.time
        );

        const appointmentDuration =
          appointment.service.duration;

        if (
          appointmentStart < 0 ||
          !Number.isInteger(appointmentDuration) ||
          appointmentDuration <= 0
        ) {
          return false;
        }

        const appointmentEnd =
          appointmentStart + appointmentDuration;

        return (
          current < appointmentEnd &&
          slotEnd > appointmentStart
        );
      }
    );

    if (!overlapsAppointment) {
      slots.push(minutesToTime(current));
    }
  }

  return slots;
}

async function getPublicBusiness(
  businessSlug: string
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const dateValue =
      url.searchParams.get("date")?.trim() ?? "";

    const serviceId =
      url.searchParams.get("serviceId")?.trim() ?? "";

    const businessSlug =
      url.searchParams.get("businessSlug")?.trim() ?? "";

    if (!dateValue) {
      return jsonError("Date is required.", 400);
    }

    if (!serviceId) {
      return jsonError(
        "Service ID is required.",
        400
      );
    }

    const date = parseDate(dateValue);

    if (!date) {
      return jsonError("Invalid date.", 400);
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
      await prisma.settings.findUnique({
        where: {
          businessId,
        },
      });

    if (settings && !settings.bookingEnabled) {
      return NextResponse.json({
        date: dateValue,
        serviceId,
        available: false,
        slots: [],
        reason: "Booking is currently disabled.",
      });
    }

    const service =
      await prisma.service.findFirst({
        where: {
          id: serviceId,
          businessId,
          active: true,
        },
        select: {
          id: true,
          name: true,
          duration: true,
        },
      });

    if (!service) {
      return jsonError(
        "Service not found or inactive.",
        404
      );
    }

    if (
      !Number.isInteger(service.duration) ||
      service.duration <= 0
    ) {
      return jsonError(
        "The selected service has an invalid duration.",
        400
      );
    }

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
      return NextResponse.json({
        date: dateValue,
        serviceId,
        available: false,
        slots: [],
        reason:
          "Business hours are not configured for this day.",
      });
    }

    if (
      !isValidTime(businessHour.startTime) ||
      !isValidTime(businessHour.endTime)
    ) {
      console.error(
        "Invalid business hour configuration:",
        {
          businessId,
          dayOfWeek,
          startTime: businessHour.startTime,
          endTime: businessHour.endTime,
        }
      );

      return jsonError(
        "Business hours contain an invalid time configuration.",
        500
      );
    }

    if (!businessHour.isOpen) {
      return NextResponse.json({
        date: dateValue,
        serviceId,
        available: false,
        slots: [],
        reason:
          "The business is closed on this day.",
      });
    }

    const businessStart = timeToMinutes(
      businessHour.startTime
    );

    const businessEnd = timeToMinutes(
      businessHour.endTime
    );

    if (businessEnd <= businessStart) {
      return jsonError(
        "Business hours contain an invalid time range.",
        500
      );
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
      return NextResponse.json({
        date: dateValue,
        serviceId,
        available: false,
        slots: [],
        reason:
          blockedDate.reason ??
          "This date is blocked for bookings.",
      });
    }

    const breaks =
      await prisma.businessBreak.findMany({
        where: {
          businessId,
          dayOfWeek,
        },
        select: {
          startTime: true,
          endTime: true,
        },
        orderBy: {
          startTime: "asc",
        },
      });

    const validBreaks = breaks.filter((item) => {
      if (
        !isValidTime(item.startTime) ||
        !isValidTime(item.endTime)
      ) {
        return false;
      }

      const breakStart = timeToMinutes(
        item.startTime
      );

      const breakEnd = timeToMinutes(
        item.endTime
      );

      return (
        breakEnd > breakStart &&
        breakStart < businessEnd &&
        breakEnd > businessStart
      );
    });

    const appointments =
      await prisma.appointment.findMany({
        where: {
          businessId,
          date,
          status: {
            not: "CANCELLED",
          },
        },
        select: {
          time: true,
          service: {
            select: {
              duration: true,
            },
          },
        },
      });

    const validAppointments = appointments.filter(
      (appointment) => {
        return (
          isValidTime(appointment.time) &&
          Number.isInteger(
            appointment.service.duration
          ) &&
          appointment.service.duration > 0
        );
      }
    );

    const slots = generateSlots({
      startTime: businessHour.startTime,
      endTime: businessHour.endTime,
      duration: service.duration,
      breaks: validBreaks,
      appointments: validAppointments,
    });

    return NextResponse.json({
      date: dateValue,
      serviceId,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
      },
      businessHours: {
        startTime: businessHour.startTime,
        endTime: businessHour.endTime,
      },
      available: slots.length > 0,
      slots,
      meta: {
        dayOfWeek,
        dateKey: getDateKey(date),
        breakCount: validBreaks.length,
        appointmentCount:
          validAppointments.length,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/public/availability failed:",
      error
    );

    return jsonError(
      "Unable to calculate appointment availability.",
      500
    );
  }
}