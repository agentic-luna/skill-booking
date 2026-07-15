-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "category" TEXT DEFAULT 'technology',
ADD COLUMN     "duration" TEXT DEFAULT '2 hours',
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 500.0;

-- CreateTable
CREATE TABLE "refund_requests" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "reason" TEXT,
    "status" "RefundRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refund_requests_bookingId_key" ON "refund_requests"("bookingId");

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
