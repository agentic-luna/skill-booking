-- CreateEnum
CREATE TYPE "EditRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "durationHours" DOUBLE PRECISION NOT NULL DEFAULT 2.0;

-- CreateTable
CREATE TABLE "edit_requests" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "hostId" UUID NOT NULL,
    "status" "EditRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edit_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "edit_requests" ADD CONSTRAINT "edit_requests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_requests" ADD CONSTRAINT "edit_requests_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
