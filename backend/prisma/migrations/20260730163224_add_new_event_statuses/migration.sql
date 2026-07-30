-- CreateEnum
CREATE TYPE "BoostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "BoostTier" AS ENUM ('BASIC', 'STANDARD', 'PRO');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventStatus" ADD VALUE 'REJECTED';
ALTER TYPE "EventStatus" ADD VALUE 'COMPLETED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TriggerEvent" ADD VALUE 'EMAIL_OTP';
ALTER TYPE "TriggerEvent" ADD VALUE 'SMS_OTP';
ALTER TYPE "TriggerEvent" ADD VALUE 'WHATSAPP_OTP';
ALTER TYPE "TriggerEvent" ADD VALUE 'PASSWORD_RESET';
ALTER TYPE "TriggerEvent" ADD VALUE 'BOOKING_REMINDER';
ALTER TYPE "TriggerEvent" ADD VALUE 'BOOKING_CANCELLED';
ALTER TYPE "TriggerEvent" ADD VALUE 'PAYMENT_SUCCESS';
ALTER TYPE "TriggerEvent" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "TriggerEvent" ADD VALUE 'REFUND_SUCCESS';
ALTER TYPE "TriggerEvent" ADD VALUE 'TICKET_DELIVERY';
ALTER TYPE "TriggerEvent" ADD VALUE 'STAFF_INVITATION';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "commissionType" "CommissionType",
ADD COLUMN     "platformValue" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "boosted_events" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "BoostStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tier" "BoostTier" NOT NULL DEFAULT 'BASIC';

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL,
    "clientId" UUID,
    "hostId" UUID,
    "bookingId" UUID,
    "hostName" TEXT,
    "category" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
