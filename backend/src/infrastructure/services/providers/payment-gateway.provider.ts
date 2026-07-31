export interface IPaymentGatewayProvider {
  createOrder(
    amount: number,
    currency: string,
    receipt: string
  ): Promise<{ id: string; amount: number; currency: string; receipt: string }>;

  /**
   * Verify a Razorpay webhook signature.
   * Input: HMAC-SHA256 over the raw request body string.
   */
  verifyWebhookSignature(payload: string | object, signature: string, secret?: string): Promise<boolean>;

  /**
   * Verify a Razorpay client-side payment signature.
   * Input: HMAC-SHA256 over "{orderId}|{paymentId}".
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): Promise<boolean>;

  initiateRefund(
    paymentId: string,
    amount: number,
    notes?: any
  ): Promise<{ success: boolean; refundId: string; amount: number }>;

  transferPayout(
    destinationBankDetail: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    },
    amount: number
  ): Promise<{ success: boolean; payoutId: string; error?: string }>;
}
