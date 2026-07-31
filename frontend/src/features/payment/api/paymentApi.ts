import { API_BASE_URL } from "@/lib/config";

export async function getRazorpayPublicKey() {
  const response = await fetch(
    `${API_BASE_URL}/payments/razorpay/public-key`
  );

  if (!response.ok) {
    throw new Error("Failed to load Razorpay configuration");
  }

  const data = await response.json();

  return data.data.keyId;
}