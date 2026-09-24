import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { requireApiUser } from "@/lib/api-auth";
import { getCurrentBusinessContext } from "@/lib/auth";

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

export async function GET() {
  try {
    const user = await requireApiUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const context = await getCurrentBusinessContext();

    if (!context) {
      return Response.json(
        { error: "Business context not found" },
        { status: 403 }
      );
    }

    const businessId = context.business.id;

    const customers = await prisma.customer.findMany({
      where: {
        businessId,
      },
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
    const user = await requireApiUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const context = await getCurrentBusinessContext();

    if (!context) {
      return Response.json(
        { error: "Business context not found" },
        { status: 403 }
      );
    }

    const businessId = context.business.id;

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
        businessId,
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
    const user = await requireApiUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const context = await getCurrentBusinessContext();

    if (!context) {
      return Response.json(
        { error: "Business context not found" },
        { status: 403 }
      );
    }

    const businessId = context.business.id;

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

    const existingCustomer =
      await prisma.customer.findFirst({
        where: {
          id,
          businessId,
        },
        select: {
          id: true,
        },
      });

    if (!existingCustomer) {
      return Response.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const duplicateCustomer =
      email
        ? await prisma.customer.findFirst({
            where: {
              businessId,
              email,
              NOT: {
                id,
              },
            },
            select: {
              id: true,
            },
          })
        : null;

    if (duplicateCustomer) {
      return Response.json(
        {
          error:
            "A customer with this email already exists",
        },
        { status: 409 }
      );
    }

    const result =
      await prisma.customer.updateMany({
        where: {
          id,
          businessId,
        },
        data: {
          name,
          email: email || null,
          phone: phone || null,
        },
      });

    if (result.count !== 1) {
      return Response.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const customer =
      await prisma.customer.findFirst({
        where: {
          id,
          businessId,
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
    const user = await requireApiUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const context = await getCurrentBusinessContext();

    if (!context) {
      return Response.json(
        { error: "Business context not found" },
        { status: 403 }
      );
    }

    const businessId = context.business.id;

    const body = await request.json();

    const id = String(body.id ?? "").trim();

    if (!id) {
      return Response.json(
        { error: "Customer id is required" },
        { status: 400 }
      );
    }

    const result =
      await prisma.customer.deleteMany({
        where: {
          id,
          businessId,
        },
      });

    if (result.count !== 1) {
      return Response.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

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