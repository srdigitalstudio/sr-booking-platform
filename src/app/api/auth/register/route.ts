import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import {
  createSession,
  hashPassword,
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

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");

    if (!name) {
      return Response.json(
        {
          error: "Name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {
      return Response.json(
        {
          error: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!email.includes("@")) {
      return Response.json(
        {
          error: "Please enter a valid email address",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return Response.json(
        {
          error:
            "Password must be at least 8 characters",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return Response.json(
        {
          error:
            "An account with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    const passwordHash =
      await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    await createSession(user.id);

    return Response.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Failed to register user:",
      error
    );

    return Response.json(
      {
        error: "Failed to create account",
      },
      {
        status: 500,
      }
    );
  }
}