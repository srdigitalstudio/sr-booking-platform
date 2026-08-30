-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT 'SR Booking',
    "businessType" TEXT NOT NULL DEFAULT 'Booking Platform',
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultAppointmentStatus" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "bookingNotifications" BOOLEAN NOT NULL DEFAULT true,
    "customerNotifications" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'English',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
