export interface ICommunicationService {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
  sendSMS(to: string, body: string): Promise<boolean>;
  sendWhatsApp(to: string, body: string): Promise<boolean>;
  createRazorpayOrder(
    amount: number,
    currency: string,
    receipt: string
  ): Promise<{ id: string; amount: number; currency: string; receipt: string }>;
  transferPayout(
    hostBankDetails: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    },
    amount: number
  ): Promise<{ success: boolean; payoutId: string }>;
}
