import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getCurrentBusinessContext } from "@/lib/auth";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const allowedDays = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

type DayOfWeek = (typeof allowedDays)[number];

function isValidDay(value: unknown): value is DayOfWeek {
  return (
    typeof value === "string" &&
    allowedDays.includes(value as DayOfWeek)
  );
}

function isValidTime(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value
    .split(":")
    .map(Number);

  return (
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

function normalizeDay(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function normalizeTime(value: unknown) {
  return String(value ?? "").trim();
}

// GET /api/business-hours
export async function GET() {
  const context = await getCurrentBusinessContext();

  if (!context) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const businessId = context.business.id;

  try {
    const businessHours =
      await prisma.businessHour.findMany({
        where: {
          businessId,
        },
        orderBy: {
          dayOfWeek: "asc",
        },
      });

    return Response.json(businessHours);
  } catch (error) {
    console.error(
      "Failed to load business hours:",
      error
    );

    return Response.json(
      {
        error: "Failed to load business hours",
      },
      {
        status: 500,
      }
    );
  }
}

// POST /api/business-hours
export async function POST(request: Request) {
  const context = await getCurrentBusinessContext();

  if (!context) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const businessId = context.business.id;

  try {
    const body = await request.json();

    const dayOfWeek = normalizeDay(
      body.dayOfWeek
    );

    const isOpen = Boolean(body.isOpen);

    const startTime = normalizeTime(
      body.startTime
    );

    const endTime = normalizeTime(
      body.endTime
    );

    if (!isValidDay(dayOfWeek)) {
      return Response.json(
        {
          error: "Invalid day of week",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidTime(startTime)) {
      return Response.json(
        {
          error: "Invalid start time",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidTime(endTime)) {
      return Response.json(
        {
          error: "Invalid end time",
        },
        {
          status: 400,
        }
      );
    }

    if (
      isOpen &&
      timeToMinutes(startTime) >=
        timeToMinutes(endTime)
    ) {
      return Response.json(
        {
          error:
            "Start time must be earlier than end time",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.businessHour.findUnique({
        where: {
          businessId_dayOfWeek: {
            businessId,
            dayOfWeek,
          },
        },
      });

    if (existing) {
      return Response.json(
        {
          error:
            "Business hours for this day already exist",
        },
        {
          status: 409,
        }
      );
    }

    const businessHour =
      await prisma.businessHour.create({
        data: {
          businessId,
          dayOfWeek,
          isOpen,
          startTime,
          endTime,
        },
      });

    return Response.json(
      businessHour,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create business hours:",
      error
    );

    return Response.json(
      {
        error: "Failed to create business hours",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT /api/business-hours
export async function PUT(request: Request) {
  const context = await getCurrentBusinessContext();

  if (!context) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const businessId = context.business.id;

  try {
    const body = await request.json();

    const dayOfWeek = normalizeDay(
      body.dayOfWeek
    );

    const isOpen = Boolean(body.isOpen);

    const startTime = normalizeTime(
      body.startTime
    );

    const endTime = normalizeTime(
      body.endTime
    );

    if (!isValidDay(dayOfWeek)) {
      return Response.json(
        {
          error: "Invalid day of week",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidTime(startTime)) {
      return Response.json(
        {
          error: "Invalid start time",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidTime(endTime)) {
      return Response.json(
        {
          error: "Invalid end time",
        },
        {
          status: 400,
        }
      );
    }

    if (
      isOpen &&
      timeToMinutes(startTime) >=
        timeToMinutes(endTime)
    ) {
      return Response.json(
        {
          error:
            "Start time must be earlier than end time",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.businessHour.findUnique({
        where: {
          businessId_dayOfWeek: {
            businessId,
            dayOfWeek,
          },
        },
      });

    if (!existing) {
      return Response.json(
        {
          error:
            "Business hours for this day do not exist",
        },
        {
          status: 404,
        }
      );
    }

    const businessHour =
      await prisma.businessHour.update({
        where: {
          businessId_dayOfWeek: {
            businessId,
            dayOfWeek,
          },
        },
        data: {
          isOpen,
          startTime,
          endTime,
        },
      });

    return Response.json(businessHour);
  } catch (error) {
    console.error(
      "Failed to update business hours:",
      error
    );

    return Response.json(
      {
        error: "Failed to update business hours",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE /api/business-hours
export async function DELETE(
  request: Request
) {
  const context = await getCurrentBusinessContext();

  if (!context) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const businessId = context.business.id;

  try {
    const body = await request.json();

    const dayOfWeek = normalizeDay(
      body.dayOfWeek
    );

    if (!isValidDay(dayOfWeek)) {
      return Response.json(
        {
          error: "Invalid day of week",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.businessHour.findUnique({
        where: {
          businessId_dayOfWeek: {
            businessId,
            dayOfWeek,
          },
        },
      });

    if (!existing) {
      return Response.json(
        {
          error:
            "Business hours for this day do not exist",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.businessHour.delete({
      where: {
        businessId_dayOfWeek: {
          businessId,
          dayOfWeek,
        },
      },
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to delete business hours:",
      error
    );

    return Response.json(
      {
        error: "Failed to delete business hours",
      },
      {
        status: 500,
      }
    );
  }
}