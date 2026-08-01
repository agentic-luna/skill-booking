-- AlterEnum
ALTER TYPE "LedgerTxnType" ADD VALUE IF NOT EXISTS 'SETTLEMENT';
ALTER TYPE "LedgerTxnType" ADD VALUE IF NOT EXISTS 'REFUND_ADJUSTMENT';
ALTER TYPE "LedgerTxnType" ADD VALUE IF NOT EXISTS 'MANUAL_ADJUSTMENT';

-- AlterEnum
ALTER TYPE "BoostStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentCapturedAt" TIMESTAMP(3),
ADD COLUMN     "paymentGateway" TEXT DEFAULT 'RAZORPAY',
ADD COLUMN     "webhookProcessed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "boosted_events" ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "conversions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "impressions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "refund_requests" ADD COLUMN     "refundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "refundPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_razorpayOrderId_key" ON "bookings"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_razorpayPaymentId_key" ON "bookings"("razorpayPaymentId");
