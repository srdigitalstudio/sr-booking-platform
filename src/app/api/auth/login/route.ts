import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import {
  createSession,
  verifyPassword,
} from "@/lib/auth";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (!email || !password) {
      return Response.json(
        {
          error: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return Response.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    const passwordValid =
      await verifyPassword(
        password,
        user.passwordHash
      );

    if (!passwordValid) {
      return Response.json(
        {
          error: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    await createSession(user.id);

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(
      "Failed to login:",
      error
    );

    return Response.json(
      {
        error: "Failed to login",
      },
      {
        status: 500,
      }
    );
  }
}