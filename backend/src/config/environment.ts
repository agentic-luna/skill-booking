import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ?? "",
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN ?? process.env.META_WA_VERIFY_TOKEN ?? "bookmyskill_wa_verify_token_2026",
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN ?? process.env.META_WA_ACCESS_TOKEN ?? "",
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID ?? process.env.META_WA_PHONE_NUMBER_ID ?? "",
  WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? process.env.META_WA_BUSINESS_ACCOUNT_ID ?? "",
};

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}