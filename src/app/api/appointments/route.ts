import { NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// GET
export async function GET() {
  try {
    const appointments =
      await prisma.appointment.findMany({
        include: {
          customer: true,
          service: true,
        },
        orderBy: {
          date: "desc",
        },
      });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error(
      "GET /api/appointments failed:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customer,
      service,
      date,
      time,
    } = body;

    if (
      !customer ||
      !service ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        {
          error:
            "All appointment fields are required",
        },
        { status: 400 }
      );
    }

    const customerEmail = `${customer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ".")}@local.customer`;

    const customerRecord =
      await prisma.customer.upsert({
        where: {
          email: customerEmail,
        },
        update: {
          name: customer.trim(),
        },
        create: {
          name: customer.trim(),
          email: customerEmail,
        },
      });

    let serviceRecord =
      await prisma.service.findFirst({
        where: {
          name: service.trim(),
        },
      });

    if (!serviceRecord) {
      serviceRecord =
        await prisma.service.create({
          data: {
            name: service.trim(),
            duration: 60,
          },
        });
    }

    const appointment =
      await prisma.appointment.create({
        data: {
          customerId: customerRecord.id,
          serviceId: serviceRecord.id,
          date: new Date(date),
          time,
          status: "PENDING",
        },
        include: {
          customer: true,
          service: true,
        },
      });

    return NextResponse.json(
      appointment,
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/appointments failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create appointment",
      },
      { status: 500 }
    );
  }
}

// PATCH
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const {
      id,
      customer,
      service,
      date,
      time,
    } = body;

    if (
      !id ||
      !customer ||
      !service ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        {
          error:
            "All appointment fields are required",
        },
        { status: 400 }
      );
    }

    const appointment =
      await prisma.appointment.findUnique({
        where: {
          id,
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          error: "Appointment not found",
        },
        { status: 404 }
      );
    }

    const customerEmail = `${customer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ".")}@local.customer`;

    const customerRecord =
      await prisma.customer.upsert({
        where: {
          email: customerEmail,
        },
        update: {
          name: customer.trim(),
        },
        create: {
          name: customer.trim(),
          email: customerEmail,
        },
      });

    let serviceRecord =
      await prisma.service.findFirst({
        where: {
          name: service.trim(),
        },
      });

    if (!serviceRecord) {
      serviceRecord =
        await prisma.service.create({
          data: {
            name: service.trim(),
            duration: 60,
          },
        });
    }

    const updatedAppointment =
      await prisma.appointment.update({
        where: {
          id,
        },
        data: {
          customerId: customerRecord.id,
          serviceId: serviceRecord.id,
          date: new Date(date),
          time,
        },
        include: {
          customer: true,
          service: true,
        },
      });

    return NextResponse.json(
      updatedAppointment
    );
  } catch (error) {
    console.error(
      "PATCH /api/appointments failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update appointment",
      },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Appointment ID is required",
        },
        { status: 400 }
      );
    }

    await prisma.appointment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/appointments failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete appointment",
      },
      { status: 500 }
    );
  }
}