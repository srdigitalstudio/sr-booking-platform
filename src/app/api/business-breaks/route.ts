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

function isValidDay(
  value: unknown
): value is DayOfWeek {
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

function normalizeLabel(value: unknown) {
  const label = String(value ?? "").trim();

  return label || null;
}

async function getBusinessHour(
  businessId: string,
  dayOfWeek: DayOfWeek
) {
  return prisma.businessHour.findUnique({
    where: {
      businessId_dayOfWeek: {
        businessId,
        dayOfWeek,
      },
    },
  });
}

async function validateBreakTime(
  businessId: string,
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string
) {
  const businessHour =
    await getBusinessHour(
      businessId,
      dayOfWeek
    );

  if (!businessHour) {
    return {
      valid: false,
      error:
        "Business hours for this day have not been configured",
    };
  }

  if (!businessHour.isOpen) {
    return {
      valid: false,
      error:
        "Cannot create a break on a closed day",
    };
  }

  const businessStart = timeToMinutes(
    businessHour.startTime
  );

  const businessEnd = timeToMinutes(
    businessHour.endTime
  );

  const breakStart = timeToMinutes(
    startTime
  );

  const breakEnd = timeToMinutes(endTime);

  if (
    breakStart < businessStart ||
    breakEnd > businessEnd
  ) {
    return {
      valid: false,
      error:
        "Break must be within business hours",
    };
  }

  return {
    valid: true,
  };
}

async function hasOverlappingBreak(
  businessId: string,
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string,
  excludeId?: string
) {
  const breaks =
    await prisma.businessBreak.findMany({
      where: {
        businessId,
        dayOfWeek,
        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },
    });

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  return breaks.some((businessBreak) => {
    const existingStart = timeToMinutes(
      businessBreak.startTime
    );

    const existingEnd = timeToMinutes(
      businessBreak.endTime
    );

    return (
      newStart < existingEnd &&
      newEnd > existingStart
    );
  });
}

// GET /api/business-breaks
export async function GET() {
  const context =
    await getCurrentBusinessContext();

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
    const businessBreaks =
      await prisma.businessBreak.findMany({
        where: {
          businessId,
        },
        orderBy: [
          {
            dayOfWeek: "asc",
          },
          {
            startTime: "asc",
          },
        ],
      });

    return Response.json(businessBreaks);
  } catch (error) {
    console.error(
      "Failed to load business breaks:",
      error
    );

    return Response.json(
      {
        error: "Failed to load business breaks",
      },
      {
        status: 500,
      }
    );
  }
}

// POST /api/business-breaks
export async function POST(
  request: Request
) {
  const context =
    await getCurrentBusinessContext();

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

    const startTime = normalizeTime(
      body.startTime
    );

    const endTime = normalizeTime(
      body.endTime
    );

    const label = normalizeLabel(
      body.label
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

    if (label && label.length > 100) {
      return Response.json(
        {
          error:
            "Break label must be 100 characters or less",
        },
        {
          status: 400,
        }
      );
    }

    const businessHourValidation =
      await validateBreakTime(
        businessId,
        dayOfWeek,
        startTime,
        endTime
      );

    if (!businessHourValidation.valid) {
      return Response.json(
        {
          error:
            businessHourValidation.error,
        },
        {
          status: 400,
        }
      );
    }

    const overlapping =
      await hasOverlappingBreak(
        businessId,
        dayOfWeek,
        startTime,
        endTime
      );

    if (overlapping) {
      return Response.json(
        {
          error:
            "This break overlaps with an existing break",
        },
        {
          status: 409,
        }
      );
    }

    const businessBreak =
      await prisma.businessBreak.create({
        data: {
          businessId,
          dayOfWeek,
          startTime,
          endTime,
          label,
        },
      });

    return Response.json(
      businessBreak,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create business break:",
      error
    );

    return Response.json(
      {
        error: "Failed to create business break",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT /api/business-breaks
export async function PUT(
  request: Request
) {
  const context =
    await getCurrentBusinessContext();

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

    const id = String(body.id ?? "").trim();

    const dayOfWeek = normalizeDay(
      body.dayOfWeek
    );

    const startTime = normalizeTime(
      body.startTime
    );

    const endTime = normalizeTime(
      body.endTime
    );

    const label = normalizeLabel(
      body.label
    );

    if (!id) {
      return Response.json(
        {
          error: "Break ID is required",
        },
        {
          status: 400,
        }
      );
    }

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

    if (label && label.length > 100) {
      return Response.json(
        {
          error:
            "Break label must be 100 characters or less",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.businessBreak.findFirst({
        where: {
          id,
          businessId,
        },
      });

    if (!existing) {
      return Response.json(
        {
          error:
            "Business break not found",
        },
        {
          status: 404,
        }
      );
    }

    const businessHourValidation =
      await validateBreakTime(
        businessId,
        dayOfWeek,
        startTime,
        endTime
      );

    if (!businessHourValidation.valid) {
      return Response.json(
        {
          error:
            businessHourValidation.error,
        },
        {
          status: 400,
        }
      );
    }

    const overlapping =
      await hasOverlappingBreak(
        businessId,
        dayOfWeek,
        startTime,
        endTime,
        id
      );

    if (overlapping) {
      return Response.json(
        {
          error:
            "This break overlaps with an existing break",
        },
        {
          status: 409,
        }
      );
    }

    const businessBreak =
      await prisma.businessBreak.update({
        where: {
          id,
        },
        data: {
          dayOfWeek,
          startTime,
          endTime,
          label,
        },
      });

    return Response.json(businessBreak);
  } catch (error) {
    console.error(
      "Failed to update business break:",
      error
    );

    return Response.json(
      {
        error: "Failed to update business break",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE /api/business-breaks
export async function DELETE(
  request: Request
) {
  const context =
    await getCurrentBusinessContext();

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

    const id = String(body.id ?? "").trim();

    if (!id) {
      return Response.json(
        {
          error: "Break ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.businessBreak.findFirst({
        where: {
          id,
          businessId,
        },
      });

    if (!existing) {
      return Response.json(
        {
          error:
            "Business break not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.businessBreak.delete({
      where: {
        id,
      },
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to delete business break:",
      error
    );

    return Response.json(
      {
        error: "Failed to delete business break",
      },
      {
        status: 500,
      }
    );
  }
}