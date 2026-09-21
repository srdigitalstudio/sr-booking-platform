import { NextResponse } from "next/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
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
  try {
    const settings =
      await prisma.settings.findFirst();

    if (
      settings &&
      !settings.bookingEnabled
    ) {
      return NextResponse.json([]);
    }

    const services =
      await prisma.service.findMany({
        where: {
          active: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          duration: true,
          price: true,
        },
        orderBy: [
          {
            name: "asc",
          },
        ],
      });

    return NextResponse.json(services);
  } catch (error) {
    console.error(
      "GET /api/public/services failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load available services.",
      },
      {
        status: 500,
      }
    );
  }
}