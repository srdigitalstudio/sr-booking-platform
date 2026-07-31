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
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        appointments: true,
      },
    });

    return Response.json(customers);
  } catch (error) {
    console.error("Failed to load customers:", error);

    return Response.json(
      { error: "Failed to load customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!name) {
      return Response.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
      include: {
        appointments: true,
      },
    });

    return Response.json(customer, { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);

    return Response.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const id = String(body.id ?? "").trim();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!id) {
      return Response.json(
        { error: "Customer id is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return Response.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
      include: {
        appointments: true,
      },
    });

    return Response.json(customer);
  } catch (error) {
    console.error("Failed to update customer:", error);

    return Response.json(
      { error: "Failed to update customer" },
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
        { error: "Customer id is required" },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: {
        id,
      },
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete customer:", error);

    return Response.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}