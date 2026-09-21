import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    const businessCount = await tx.business.count();
    const settingsCount = await tx.settings.count();

    if (businessCount > 0) {
      throw new Error(
        `Business records already exist (${businessCount}). Backfill stopped for safety.`,
      );
    }

    if (settingsCount !== 1) {
      throw new Error(
        `Expected exactly 1 Settings record, but found ${settingsCount}. Backfill stopped for safety.`,
      );
    }

    const settings = await tx.settings.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!settings) {
      throw new Error("Settings record was not found.");
    }

    const business = await tx.business.create({
      data: {
        name: settings.businessName || "SR Booking",
        slug: "sr-booking",
        description: settings.businessType || null,
        currency: settings.currency || "USD",
        active: true,
      },
    });

    const customerResult = await tx.customer.updateMany({
      where: {
        businessId: null,
      },
      data: {
        businessId: business.id,
      },
    });

    const serviceResult = await tx.service.updateMany({
      where: {
        businessId: null,
      },
      data: {
        businessId: business.id,
      },
    });

    const appointmentResult = await tx.appointment.updateMany({
      where: {
        businessId: null,
      },
      data: {
        businessId: business.id,
      },
    });

    const businessHourResult = await tx.businessHour.updateMany({
      where: {
        businessId: null,
      },
      data: {
        businessId: business.id,
      },
    });

    const businessBreakResult = await tx.businessBreak.updateMany({
      where: {
        businessId: null,
      },
      data: {
        businessId: business.id,
      },
    });

    const blockedDateResult = await tx.blockedDate.updateMany({
      where: {
        businessId: null,
      },
      data: {
        businessId: business.id,
      },
    });

    await tx.settings.update({
      where: {
        id: settings.id,
      },
      data: {
        businessId: business.id,
      },
    });

    return {
      business,
      counts: {
        customers: customerResult.count,
        services: serviceResult.count,
        appointments: appointmentResult.count,
        businessHours: businessHourResult.count,
        businessBreaks: businessBreakResult.count,
        blockedDates: blockedDateResult.count,
      },
    };
  });

  console.log("");
  console.log("========== BUSINESS BACKFILL COMPLETE ==========");
  console.log("");

  console.log("Business:");
  console.table({
    id: result.business.id,
    name: result.business.name,
    slug: result.business.slug,
  });

  console.log("");
  console.log("Migrated records:");
  console.table(result.counts);

  console.log("");
  console.log("No existing users were modified.");
  console.log("=================================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Business backfill failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });