-- AlterTable
ALTER TABLE "boosted_events" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentCapturedAt" TIMESTAMP(3),
ADD COLUMN     "paymentGateway" TEXT DEFAULT 'RAZORPAY',
ADD COLUMN     "webhookProcessed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "boosted_events_razorpayOrderId_key" ON "boosted_events"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "boosted_events_razorpayPaymentId_key" ON "boosted_events"("razorpayPaymentId");
