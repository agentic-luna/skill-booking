-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERADMIN', 'HOST', 'CLIENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "IntegrationService" AS ENUM ('RAZORPAY', 'TWILIO', 'SENDGRID', 'META_WA');

-- CreateEnum
CREATE TYPE "IntegrationEnvironment" AS ENUM ('TEST', 'LIVE');

-- CreateEnum
CREATE TYPE "DeliveryChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'IN_APP');

-- CreateEnum
CREATE TYPE "TriggerEvent" AS ENUM ('BOOKING_CONFIRMED', 'EVENT_APPROVED', 'KYC_REJECTED', 'EMAIL_OTP', 'SMS_OTP', 'WHATSAPP_OTP', 'PASSWORD_RESET', 'BOOKING_REMINDER', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'REFUND_SUCCESS', 'TICKET_DELIVERY', 'STAFF_INVITATION', 'EMAIL_VERIFICATION');

-- CreateEnum
CREATE TYPE "EventMode" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELED', 'EDIT_MODE');

-- CreateEnum
CREATE TYPE "EditRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BoostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BoostTier" AS ENUM ('BASIC', 'STANDARD', 'PRO');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('FIXED', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('INITIATED', 'CONFIRMED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LedgerTxnType" AS ENUM ('PAYMENT_CAPTURE', 'ESCROW_RELEASE', 'REFUND', 'SETTLEMENT', 'REFUND_ADJUSTMENT', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LedgerStatus" AS ENUM ('HELD', 'RELEASED_TO_HOST', 'REFUNDED_TO_CLIENT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "RefundRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
    "govIdUrl" TEXT,
    "gstNumber" TEXT,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "bio" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "city" TEXT,
    "country" TEXT,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "department" TEXT DEFAULT 'Platform Management',
    "adminLevel" INTEGER NOT NULL DEFAULT 1,
    "lastLoginIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_bank_details" (
    "id" UUID NOT NULL,
    "hostProfileId" UUID NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "upiId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "host_bank_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_configs" (
    "id" UUID NOT NULL,
    "serviceName" "IntegrationService" NOT NULL,
    "environment" "IntegrationEnvironment" NOT NULL DEFAULT 'TEST',
    "credentials" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" UUID NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "hostId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trainerName" TEXT,
    "trainerInfo" TEXT,
    "trainerBio" TEXT,
    "posterUrl" TEXT NOT NULL,
    "mode" "EventMode" NOT NULL DEFAULT 'ONLINE',
    "venueDetails" JSONB,
    "startTime" TIMESTAMP(3) NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 500.0,
    "duration" TEXT DEFAULT '2 hours',
    "durationHours" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "category" TEXT DEFAULT 'life-coaching',
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instructorId" UUID,
    "venueId" UUID,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_ticket_types" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "booked_seats" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_ticket_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_commissions" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "commissionType" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "platformValue" DECIMAL(10,2) NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boosted_events" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "tier" "BoostTier" NOT NULL DEFAULT 'BASIC',
    "price" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "BoostStatus" NOT NULL DEFAULT 'PENDING',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "paymentMethod" TEXT,
    "paymentCapturedAt" TIMESTAMP(3),
    "paymentGateway" TEXT DEFAULT 'RAZORPAY',
    "webhookProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boosted_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "bookingId" UUID,
    "clientId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "bookingRef" TEXT NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "paymentMethod" TEXT,
    "paymentCapturedAt" TIMESTAMP(3),
    "paymentGateway" TEXT DEFAULT 'RAZORPAY',
    "webhookProcessed" BOOLEAN NOT NULL DEFAULT false,
    "clientId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "ticket_type_id" UUID,
    "seatCount" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'INITIATED',
    "commissionType" "CommissionType",
    "platformValue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_participants" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "ticket_type_id" UUID,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "dob" TEXT,
    "gender" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_ledgers" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "gatewayTxnId" TEXT NOT NULL,
    "type" "LedgerTxnType" NOT NULL,
    "amountCaptured" DECIMAL(10,2) NOT NULL,
    "platformRevenue" DECIMAL(10,2) NOT NULL,
    "hostLiability" DECIMAL(10,2) NOT NULL,
    "status" "LedgerStatus" NOT NULL DEFAULT 'HELD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "channel" "DeliveryChannel" NOT NULL,
    "triggerEvent" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "clientProfileId" UUID,
    "eventId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_likes" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_requests" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "reason" TEXT,
    "refundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refundPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "RefundRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "instructors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "facebook" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "meetingLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "host_profiles_userId_key" ON "host_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "client_profiles_userId_key" ON "client_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_userId_key" ON "admin_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "host_bank_details_hostProfileId_key" ON "host_bank_details"("hostProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "integration_configs_serviceName_key" ON "integration_configs"("serviceName");

-- CreateIndex
CREATE UNIQUE INDEX "event_ticket_types_event_id_name_key" ON "event_ticket_types"("event_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "event_commissions_eventId_key" ON "event_commissions"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "boosted_events_eventId_key" ON "boosted_events"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "boosted_events_razorpayOrderId_key" ON "boosted_events"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "boosted_events_razorpayPaymentId_key" ON "boosted_events"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_clientId_eventId_key" ON "reviews"("clientId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingRef_key" ON "bookings"("bookingRef");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_razorpayOrderId_key" ON "bookings"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_razorpayPaymentId_key" ON "bookings"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_ledgers_gatewayTxnId_key" ON "transaction_ledgers"("gatewayTxnId");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_clientId_eventId_key" ON "wishlists"("clientId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "event_likes_clientId_eventId_key" ON "event_likes"("clientId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_requests_bookingId_key" ON "refund_requests"("bookingId");

-- AddForeignKey
ALTER TABLE "host_profiles" ADD CONSTRAINT "host_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profiles" ADD CONSTRAINT "client_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "host_bank_details" ADD CONSTRAINT "host_bank_details_hostProfileId_fkey" FOREIGN KEY ("hostProfileId") REFERENCES "host_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_ticket_types" ADD CONSTRAINT "event_ticket_types_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_commissions" ADD CONSTRAINT "event_commissions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boosted_events" ADD CONSTRAINT "boosted_events_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "event_ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "event_ticket_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_ledgers" ADD CONSTRAINT "transaction_ledgers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "client_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_likes" ADD CONSTRAINT "event_likes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_likes" ADD CONSTRAINT "event_likes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_requests" ADD CONSTRAINT "edit_requests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edit_requests" ADD CONSTRAINT "edit_requests_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "host_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
