import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const defaultSettings = {
  businessName: "SR Booking",
  businessType: "Booking Platform",
  bookingEnabled: true,
  defaultAppointmentStatus: "PENDING" as const,
  bookingNotifications: true,
  customerNotifications: true,
  language: "English",
  currency: "USD",
};

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

const allowedLanguages = [
  "English",
  "Dari",
  "Pashto",
] as const;

const allowedCurrencies = [
  "USD",
  "EUR",
  "AFN",
] as const;

async function getSettings() {
  let settings = await prisma.settings.findFirst();

  if (!settings) {
    settings = await prisma.settings.create({
      data: defaultSettings,
    });
  }

  return settings;
}

// GET /api/settings
export async function GET() {
  try {
    const settings = await getSettings();

    return Response.json(settings);
  } catch (error) {
    console.error(
      "Failed to load settings:",
      error
    );

    return Response.json(
      {
        error: "Failed to load settings",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT /api/settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const businessName = String(
      body.businessName ?? ""
    ).trim();

    const businessType = String(
      body.businessType ?? ""
    ).trim();

    const language = String(
      body.language ?? ""
    ).trim();

    const currency = String(
      body.currency ?? ""
    ).trim();

    const defaultAppointmentStatus =
      String(
        body.defaultAppointmentStatus ?? ""
      ).toUpperCase();

    const bookingEnabled =
      Boolean(body.bookingEnabled);

    const bookingNotifications =
      Boolean(body.bookingNotifications);

    const customerNotifications =
      Boolean(body.customerNotifications);

    if (!businessName) {
      return Response.json(
        {
          error:
            "Business name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!businessType) {
      return Response.json(
        {
          error:
            "Business type is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !allowedStatuses.includes(
        defaultAppointmentStatus as
          (typeof allowedStatuses)[number]
      )
    ) {
      return Response.json(
        {
          error:
            "Invalid default appointment status",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !allowedLanguages.includes(
        language as
          (typeof allowedLanguages)[number]
      )
    ) {
      return Response.json(
        {
          error: "Invalid language",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !allowedCurrencies.includes(
        currency as
          (typeof allowedCurrencies)[number]
      )
    ) {
      return Response.json(
        {
          error: "Invalid currency",
        },
        {
          status: 400,
        }
      );
    }

    const existingSettings =
      await prisma.settings.findFirst();

    const settings =
      existingSettings
        ? await prisma.settings.update({
            where: {
              id: existingSettings.id,
            },
            data: {
              businessName,
              businessType,
              bookingEnabled,
              defaultAppointmentStatus:
                defaultAppointmentStatus as
                  | "PENDING"
                  | "CONFIRMED"
                  | "COMPLETED"
                  | "CANCELLED",
              bookingNotifications,
              customerNotifications,
              language,
              currency,
            },
          })
        : await prisma.settings.create({
            data: {
              businessName,
              businessType,
              bookingEnabled,
              defaultAppointmentStatus:
                defaultAppointmentStatus as
                  | "PENDING"
                  | "CONFIRMED"
                  | "COMPLETED"
                  | "CANCELLED",
              bookingNotifications,
              customerNotifications,
              language,
              currency,
            },
          });

    return Response.json(settings);
  } catch (error) {
    console.error(
      "Failed to update settings:",
      error
    );

    return Response.json(
      {
        error: "Failed to update settings",
      },
      {
        status: 500,
      }
    );
  }
}