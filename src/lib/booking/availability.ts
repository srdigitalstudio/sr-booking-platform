import type {
  Prisma,
  PrismaClient,
} from "@/generated/prisma/client";

type PrismaDatabase =
  | PrismaClient
  | Prisma.TransactionClient;

type DayOfWeek =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

type AvailabilityResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      error: string;
    };

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

function getDayOfWeek(
  date: Date,
  timezone: string
): DayOfWeek {
  const weekday = new Intl.DateTimeFormat(
    "en-US",
    {
      weekday: "long",
      timeZone: timezone,
    }
  ).format(date);

  switch (weekday) {
    case "Sunday":
      return "SUNDAY";
    case "Monday":
      return "MONDAY";
    case "Tuesday":
      return "TUESDAY";
    case "Wednesday":
      return "WEDNESDAY";
    case "Thursday":
      return "THURSDAY";
    case "Friday":
      return "FRIDAY";
    case "Saturday":
      return "SATURDAY";
    default:
      return "SUNDAY";
  }
}

export async function validateAppointmentAvailability({
  prisma,
  businessId,
  date,
  time,
  duration,
  excludeAppointmentId,
}: {
  prisma: PrismaDatabase;
  businessId: string;
  date: Date;
  time: string;
  duration: number;
  excludeAppointmentId?: string;
}): Promise<AvailabilityResult> {
  const business =
    await prisma.business.findUnique({
      where: {
        id: businessId,
      },
      select: {
        timezone: true,
      },
    });

  if (!business) {
    return {
      valid: false,
      error: "Business not found.",
    };
  }

  let timezone = business.timezone;

  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
    }).format(date);
  } catch {
    timezone = "UTC";
  }

  const dayOfWeek =
    getDayOfWeek(
      date,
      timezone
    );

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
      error: blockedDate.reason
        ? `This date is blocked: ${blockedDate.reason}`
        : "This date is blocked for bookings.",
    };
  }

  const appointmentStart =
    timeToMinutes(time);

  const appointmentEnd =
    appointmentStart + duration;

  const businessStart =
    timeToMinutes(
      businessHour.startTime
    );

  const businessEnd =
    timeToMinutes(
      businessHour.endTime
    );

  if (appointmentStart < businessStart) {
    return {
      valid: false,
      error:
        `Appointment must start at or after ${businessHour.startTime}.`,
    };
  }

  if (appointmentEnd > businessEnd) {
    return {
      valid: false,
      error:
        `This appointment would end at ${minutesToTime(
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
        ...(excludeAppointmentId
          ? {
              id: {
                not: excludeAppointmentId,
              },
            }
          : {}),
      },
      include: {
        service: {
          select: {
            duration: true,
          },
        },
      },
    });

  const overlappingAppointment =
    existingAppointments.find(
      (existingAppointment) => {
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
      }
    );

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