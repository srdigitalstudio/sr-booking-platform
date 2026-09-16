import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { requireApiUser } from "@/lib/api-auth";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseDate(value: string) {
  const [year, month, day] = value
    .split("-")
    .map(Number);

  return new Date(
    Date.UTC(year, month - 1, day)
  );
}

function normalizeDate(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeReason(value: unknown) {
  const reason = String(value ?? "").trim();

  return reason || null;
}

// GET /api/blocked-dates
export async function GET() {
  const user = await requireApiUser();

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const blockedDates =
      await prisma.blockedDate.findMany({
        orderBy: {
          date: "asc",
        },
      });

    return Response.json(blockedDates);
  } catch (error) {
    console.error(
      "Failed to load blocked dates:",
      error
    );

    return Response.json(
      {
        error: "Failed to load blocked dates",
      },
      {
        status: 500,
      }
    );
  }
}

// POST /api/blocked-dates
export async function POST(
  request: Request
) {
  const user = await requireApiUser();

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const dateValue = normalizeDate(
      body.date
    );

    const reason = normalizeReason(
      body.reason
    );

    if (!isValidDate(dateValue)) {
      return Response.json(
        {
          error:
            "Invalid date. Expected YYYY-MM-DD",
        },
        {
          status: 400,
        }
      );
    }

    if (reason && reason.length > 200) {
      return Response.json(
        {
          error:
            "Reason must be 200 characters or less",
        },
        {
          status: 400,
        }
      );
    }

    const date = parseDate(dateValue);

    const existing =
      await prisma.blockedDate.findUnique({
        where: {
          date,
        },
      });

    if (existing) {
      return Response.json(
        {
          error:
            "This date is already blocked",
        },
        {
          status: 409,
        }
      );
    }

    const blockedDate =
      await prisma.blockedDate.create({
        data: {
          date,
          reason,
        },
      });

    return Response.json(
      blockedDate,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create blocked date:",
      error
    );

    return Response.json(
      {
        error: "Failed to create blocked date",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT /api/blocked-dates
export async function PUT(
  request: Request
) {
  const user = await requireApiUser();

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const id = String(body.id ?? "").trim();

    const dateValue = normalizeDate(
      body.date
    );

    const reason = normalizeReason(
      body.reason
    );

    if (!id) {
      return Response.json(
        {
          error:
            "Blocked date ID is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidDate(dateValue)) {
      return Response.json(
        {
          error:
            "Invalid date. Expected YYYY-MM-DD",
        },
        {
          status: 400,
        }
      );
    }

    if (reason && reason.length > 200) {
      return Response.json(
        {
          error:
            "Reason must be 200 characters or less",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.blockedDate.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return Response.json(
        {
          error: "Blocked date not found",
        },
        {
          status: 404,
        }
      );
    }

    const date = parseDate(dateValue);

    const duplicate =
      await prisma.blockedDate.findFirst({
        where: {
          date,
          id: {
            not: id,
          },
        },
      });

    if (duplicate) {
      return Response.json(
        {
          error:
            "This date is already blocked",
        },
        {
          status: 409,
        }
      );
    }

    const blockedDate =
      await prisma.blockedDate.update({
        where: {
          id,
        },
        data: {
          date,
          reason,
        },
      });

    return Response.json(blockedDate);
  } catch (error) {
    console.error(
      "Failed to update blocked date:",
      error
    );

    return Response.json(
      {
        error: "Failed to update blocked date",
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE /api/blocked-dates
export async function DELETE(
  request: Request
) {
  const user = await requireApiUser();

  if (!user) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const id = String(body.id ?? "").trim();

    if (!id) {
      return Response.json(
        {
          error:
            "Blocked date ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.blockedDate.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return Response.json(
        {
          error: "Blocked date not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.blockedDate.delete({
      where: {
        id,
      },
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to delete blocked date:",
      error
    );

    return Response.json(
      {
        error: "Failed to delete blocked date",
      },
      {
        status: 500,
      }
    );
  }
}