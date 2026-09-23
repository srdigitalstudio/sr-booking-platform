import { NextResponse } from "next/server";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import {
  getCurrentBusinessContext,
} from "@/lib/auth";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not configured."
  );
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

export async function GET() {
  const context =
    await getCurrentBusinessContext();

  if (!context) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const services =
      await prisma.service.findMany({
        where: {
          businessId:
            context.business.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          appointments: true,
        },
      });

    return NextResponse.json(services);
  } catch (error) {
    console.error(
      "Failed to load services:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load services",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  const context =
    await getCurrentBusinessContext();

  if (!context) {
    return NextResponse.json(
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

    const name = String(
      body.name ?? ""
    ).trim();

    const description = String(
      body.description ?? ""
    ).trim();

    const duration = Number(
      body.duration ?? 0
    );

    const priceValue = String(
      body.price ?? ""
    ).trim();

    const active =
      body.active === undefined
        ? true
        : Boolean(body.active);

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Service name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Duration must be greater than 0",
        },
        {
          status: 400,
        }
      );
    }

    const price =
      priceValue === ""
        ? null
        : Number(priceValue);

    if (
      price !== null &&
      (!Number.isFinite(price) ||
        price < 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Price must be a valid positive number",
        },
        {
          status: 400,
        }
      );
    }

    const service =
      await prisma.service.create({
        data: {
          businessId:
            context.business.id,
          name,
          description:
            description || null,
          duration,
          price,
          active,
        },
        include: {
          appointments: true,
        },
      });

    return NextResponse.json(
      service,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to create service:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create service",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: Request
) {
  const context =
    await getCurrentBusinessContext();

  if (!context) {
    return NextResponse.json(
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

    const id = String(
      body.id ?? ""
    ).trim();

    const name = String(
      body.name ?? ""
    ).trim();

    const description = String(
      body.description ?? ""
    ).trim();

    const duration = Number(
      body.duration ?? 0
    );

    const priceValue = String(
      body.price ?? ""
    ).trim();

    const active =
      body.active === undefined
        ? true
        : Boolean(body.active);

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Service id is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Service name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Duration must be greater than 0",
        },
        {
          status: 400,
        }
      );
    }

    const price =
      priceValue === ""
        ? null
        : Number(priceValue);

    if (
      price !== null &&
      (!Number.isFinite(price) ||
        price < 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Price must be a valid positive number",
        },
        {
          status: 400,
        }
      );
    }

    const service =
      await prisma.service.updateMany({
        where: {
          id,
          businessId:
            context.business.id,
        },
        data: {
          name,
          description:
            description || null,
          duration,
          price,
          active,
        },
      });

    if (service.count === 0) {
      return NextResponse.json(
        {
          error:
            "Service not found",
        },
        {
          status: 404,
        }
      );
    }

    const updatedService =
      await prisma.service.findFirst({
        where: {
          id,
          businessId:
            context.business.id,
        },
        include: {
          appointments: true,
        },
      });

    return NextResponse.json(
      updatedService
    );
  } catch (error) {
    console.error(
      "Failed to update service:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update service",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request
) {
  const context =
    await getCurrentBusinessContext();

  if (!context) {
    return NextResponse.json(
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

    const id = String(
      body.id ?? ""
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Service id is required",
        },
        {
          status: 400,
        }
      );
    }

    const service =
      await prisma.service.deleteMany({
        where: {
          id,
          businessId:
            context.business.id,
        },
      });

    if (service.count === 0) {
      return NextResponse.json(
        {
          error:
            "Service not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Failed to delete service:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete service",
      },
      {
        status: 500,
      }
    );
  }
}