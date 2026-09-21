/*
  Warnings:

  - A unique constraint covering the columns `[businessId,date]` on the table `BlockedDate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId,dayOfWeek]` on the table `BusinessHour` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId,email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BusinessRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF');

-- DropIndex
DROP INDEX "BlockedDate_date_key";

-- DropIndex
DROP INDEX "BusinessHour_dayOfWeek_key";

-- DropIndex
DROP INDEX "Customer_email_key";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "businessId" TEXT,
ADD COLUMN     "staffId" TEXT;

-- AlterTable
ALTER TABLE "BlockedDate" ADD COLUMN     "businessId" TEXT;

-- AlterTable
ALTER TABLE "BusinessBreak" ADD COLUMN     "businessId" TEXT;

-- AlterTable
ALTER TABLE "BusinessHour" ADD COLUMN     "businessId" TEXT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "businessId" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "businessId" TEXT;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "businessId" TEXT;

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "role" "BusinessRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "Business_name_idx" ON "Business"("name");

-- CreateIndex
CREATE INDEX "Business_active_idx" ON "Business"("active");

-- CreateIndex
CREATE INDEX "BusinessMembership_userId_idx" ON "BusinessMembership"("userId");

-- CreateIndex
CREATE INDEX "BusinessMembership_businessId_idx" ON "BusinessMembership"("businessId");

-- CreateIndex
CREATE INDEX "BusinessMembership_businessId_role_idx" ON "BusinessMembership"("businessId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMembership_userId_businessId_key" ON "BusinessMembership"("userId", "businessId");

-- CreateIndex
CREATE INDEX "Staff_businessId_idx" ON "Staff"("businessId");

-- CreateIndex
CREATE INDEX "Staff_name_idx" ON "Staff"("name");

-- CreateIndex
CREATE INDEX "Staff_active_idx" ON "Staff"("active");

-- CreateIndex
CREATE INDEX "Staff_businessId_active_idx" ON "Staff"("businessId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_businessId_email_key" ON "Staff"("businessId", "email");

-- CreateIndex
CREATE INDEX "Appointment_businessId_idx" ON "Appointment"("businessId");

-- CreateIndex
CREATE INDEX "Appointment_staffId_idx" ON "Appointment"("staffId");

-- CreateIndex
CREATE INDEX "Appointment_businessId_date_idx" ON "Appointment"("businessId", "date");

-- CreateIndex
CREATE INDEX "Appointment_businessId_status_idx" ON "Appointment"("businessId", "status");

-- CreateIndex
CREATE INDEX "Appointment_businessId_date_time_idx" ON "Appointment"("businessId", "date", "time");

-- CreateIndex
CREATE INDEX "BlockedDate_businessId_idx" ON "BlockedDate"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_businessId_date_key" ON "BlockedDate"("businessId", "date");

-- CreateIndex
CREATE INDEX "BusinessBreak_businessId_idx" ON "BusinessBreak"("businessId");

-- CreateIndex
CREATE INDEX "BusinessBreak_businessId_dayOfWeek_idx" ON "BusinessBreak"("businessId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "BusinessHour_businessId_idx" ON "BusinessHour"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHour_businessId_dayOfWeek_key" ON "BusinessHour"("businessId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Customer_businessId_idx" ON "Customer"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_businessId_email_key" ON "Customer"("businessId", "email");

-- CreateIndex
CREATE INDEX "Service_businessId_idx" ON "Service"("businessId");

-- CreateIndex
CREATE INDEX "Service_businessId_active_idx" ON "Service"("businessId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_businessId_key" ON "Settings"("businessId");

-- AddForeignKey
ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessHour" ADD CONSTRAINT "BusinessHour_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessBreak" ADD CONSTRAINT "BusinessBreak_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
