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
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error(
      "Failed to load public services:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load services",
      },
      {
        status: 500,
      }
    );
  }
}