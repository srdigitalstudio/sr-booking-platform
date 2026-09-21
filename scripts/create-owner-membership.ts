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

const OWNER_EMAIL = "srdigitalstudio002@gmail.com";
const BUSINESS_SLUG = "sr-booking";

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      email: OWNER_EMAIL,
    },
  });

  if (!user) {
    throw new Error(
      `User with email "${OWNER_EMAIL}" was not found. Register the account first.`,
    );
  }

  const business = await prisma.business.findUnique({
    where: {
      slug: BUSINESS_SLUG,
    },
  });

  if (!business) {
    throw new Error(
      `Business with slug "${BUSINESS_SLUG}" was not found.`,
    );
  }

  const membership = await prisma.businessMembership.upsert({
    where: {
      userId_businessId: {
        userId: user.id,
        businessId: business.id,
      },
    },
    update: {
      role: "OWNER",
    },
    create: {
      userId: user.id,
      businessId: business.id,
      role: "OWNER",
    },
  });

  console.log("");
  console.log("========== OWNER MEMBERSHIP CREATED ==========");
  console.log("");

  console.table({
    userId: user.id,
    name: user.name,
    email: user.email,
    businessId: business.id,
    businessName: business.name,
    role: membership.role,
  });

  console.log("");
  console.log("==============================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Owner membership creation failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });