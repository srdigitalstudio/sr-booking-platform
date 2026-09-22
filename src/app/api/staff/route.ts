import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { requireApiUser } from "@/lib/api-auth";
import { getCurrentBusinessContext } from "@/lib/auth";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function getBusinessId() {
  const context = await getCurrentBusinessContext();

  return context?.business.id ?? null;
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

    const businessId = await getBusinessId();

    if (!businessId) {
      return Response.json(
        { error: "Business context not found" },
        { status: 404 }
      );
    }

    const staff = await prisma.staff.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        appointments: {
          select: {
            id: true,
          },
        },
      },
    });

    return Response.json(staff);
  } catch (error) {
    console.error("Failed to load staff:", error);

    return Response.json(
      { error: "Failed to load staff" },
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

    const businessId = await getBusinessId();

    if (!businessId) {
      return Response.json(
        { error: "Business context not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const active = body.active !== false;

    if (!name) {
      return Response.json(
        { error: "Staff name is required" },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return Response.json(
        { error: "Staff name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (phone.length > 30) {
      return Response.json(
        { error: "Phone number must be 30 characters or less" },
        { status: 400 }
      );
    }

    if (email) {
      const existingStaff = await prisma.staff.findFirst({
        where: {
          businessId,
          email,
        },
        select: {
          id: true,
        },
      });

      if (existingStaff) {
        return Response.json(
          { error: "A staff member with this email already exists" },
          { status: 409 }
        );
      }
    }

    const staff = await prisma.staff.create({
      data: {
        businessId,
        name,
        email: email || null,
        phone: phone || null,
        active,
      },
      include: {
        appointments: {
          select: {
            id: true,
          },
        },
      },
    });

    return Response.json(staff, { status: 201 });
  } catch (error) {
    console.error("Failed to create staff:", error);

    return Response.json(
      { error: "Failed to create staff" },
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

    const businessId = await getBusinessId();

    if (!businessId) {
      return Response.json(
        { error: "Business context not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const id = String(body.id ?? "").trim();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const active = body.active !== false;

    if (!id) {
      return Response.json(
        { error: "Staff id is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return Response.json(
        { error: "Staff name is required" },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return Response.json(
        { error: "Staff name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (phone.length > 30) {
      return Response.json(
        { error: "Phone number must be 30 characters or less" },
        { status: 400 }
      );
    }

    const existingStaff = await prisma.staff.findFirst({
      where: {
        id,
        businessId,
      },
      select: {
        id: true,
      },
    });

    if (!existingStaff) {
      return Response.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    if (email) {
      const duplicateStaff = await prisma.staff.findFirst({
        where: {
          businessId,
          email,
          id: {
            not: id,
          },
        },
        select: {
          id: true,
        },
      });

      if (duplicateStaff) {
        return Response.json(
          { error: "A staff member with this email already exists" },
          { status: 409 }
        );
      }
    }

    const staff = await prisma.staff.update({
      where: {
        id,
      },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        active,
      },
      include: {
        appointments: {
          select: {
            id: true,
          },
        },
      },
    });

    return Response.json(staff);
  } catch (error) {
    console.error("Failed to update staff:", error);

    return Response.json(
      { error: "Failed to update staff" },
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

    const businessId = await getBusinessId();

    if (!businessId) {
      return Response.json(
        { error: "Business context not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const id = String(body.id ?? "").trim();

    if (!id) {
      return Response.json(
        { error: "Staff id is required" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findFirst({
      where: {
        id,
        businessId,
      },
      select: {
        id: true,
      },
    });

    if (!staff) {
      return Response.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    await prisma.staff.delete({
      where: {
        id,
      },
    });

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete staff:", error);

    return Response.json(
      { error: "Failed to delete staff" },
      { status: 500 }
    );
  }
}