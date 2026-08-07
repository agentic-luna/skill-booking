-- CreateTable
CREATE TABLE "event_ticket_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "booked_seats" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_ticket_types_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "event_ticket_types_booked_seats_check" CHECK (booked_seats <= total_seats AND price >= 0 AND total_seats > 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "event_ticket_types_event_id_name_key" ON "event_ticket_types"("event_id", "name");

-- AddForeignKey
ALTER TABLE "event_ticket_types" ADD CONSTRAINT "event_ticket_types_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "ticket_type_id" UUID;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "event_ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "booking_participants" ADD COLUMN "ticket_type_id" UUID;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "event_ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
