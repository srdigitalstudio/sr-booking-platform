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
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const settings = await prisma.settings.findMany({
    select: {
      id: true,
      businessName: true,
      businessType: true,
      currency: true,
      language: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const customers = await prisma.customer.count();
  const services = await prisma.service.count();
  const appointments = await prisma.appointment.count();
  const businessHours = await prisma.businessHour.count();
  const businessBreaks = await prisma.businessBreak.count();
  const blockedDates = await prisma.blockedDate.count();
  const businesses = await prisma.business.count();
  const memberships = await prisma.businessMembership.count();

  console.log("");
  console.log("========== MULTI-TENANT DATA INSPECTION ==========");
  console.log("");

  console.log("Users:");
  console.table(users);

  console.log("");
  console.log("Settings:");
  console.table(settings);

  console.log("");
  console.log("Record counts:");
  console.table({
    customers,
    services,
    appointments,
    businessHours,
    businessBreaks,
    blockedDates,
    businesses,
    memberships,
  });

  console.log("");
  console.log("===================================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Inspection failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });