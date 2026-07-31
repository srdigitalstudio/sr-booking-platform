import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        appointments: true,
      },
    });

    return Response.json(services);
  } catch (error) {
    console.error("Failed to load services:", error);

    return Response.json(
      { error: "Failed to load services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const description = String(
      body.description ?? ""
    ).trim();

    const duration = Number(body.duration ?? 0);
    const priceValue = String(
      body.price ?? ""
    ).trim();

    const active =
      body.active === undefined
        ? true
        : Boolean(body.active);

    if (!name) {
      return Response.json(
        { error: "Service name is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return Response.json(
        { error: "Duration must be greater than 0" },
        { status: 400 }
      );
    }

    const price =
      priceValue === ""
        ? null
        : Number(priceValue);

    if (
      price !== null &&
      (!Number.isFinite(price) || price < 0)
    ) {
      return Response.json(
        { error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        duration,
        price,
        active,
      },
      include: {
        appointments: true,
      },
    });

    return Response.json(service, {
      status: 201,
    });
  } catch (error) {
    console.error("Failed to create service:", error);

    return Response.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id = String(body.id ?? "").trim();
    const name = String(body.name ?? "").trim();
    const description = String(
      body.description ?? ""
    ).trim();

    const duration = Number(body.duration ?? 0);
    const priceValue = String(
      body.price ?? ""
    ).trim();

    const active =
      body.active === undefined
        ? true
        : Boolean(body.active);

    if (!id) {
      return Response.json(
        { error: "Service id is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return Response.json(
        { error: "Service name is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      return Response.json(
        { error: "Duration must be greater than 0" },
        { status: 400 }
      );
    }

    const price =
      priceValue === ""
        ? null
        : Number(priceValue);

    if (
      price !== null &&
      (!Number.isFinite(price) || price < 0)
    ) {
      return Response.json(
        { error: "Price must be a valid positive number" },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({
      where: {
        id,
      },
      data: {
        name,
        description: description || null,
        duration,
        price,
        active,
      },
      include: {
        appointments: true,
      },
    });

    return Response.json(service);
  } catch (error) {
    console.error("Failed to update service:", error);

    return Response.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const id = String(body.id ?? "").trim();

    if (!id) {
      return Response.json(
        { error: "Service id is required" },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: {
        id,
      },
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete service:", error);

    return Response.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}