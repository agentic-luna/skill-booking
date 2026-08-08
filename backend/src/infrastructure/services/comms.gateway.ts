import { ICommunicationService } from '../../application/services/communication.service';
import { EmailCommunicationService } from './comms/email.communication';
import { SmsCommunicationService } from './comms/sms.communication';
import { WhatsAppCommunicationService } from './comms/whatsapp.communication';
import { IPaymentGatewayProvider } from './providers/payment-gateway.provider';

function getPlainTextMessage(body: string): string {
  try {
    if (body.trim().startsWith('{')) {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === 'object' && typeof parsed.text === 'string') {
        return parsed.text;
      }
    }
  } catch {}
  return body;
}

export class CommunicationGateway implements ICommunicationService {
  constructor(
    private emailService: EmailCommunicationService,
    private smsService: SmsCommunicationService,
    private whatsappService: WhatsAppCommunicationService,
    private paymentGateway: IPaymentGatewayProvider
  ) {}

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    const res = await this.emailService.sendEmail(to, subject, body);
    return res.success;
  }

  async sendSMS(to: string, body: string): Promise<boolean> {
    const plainText = getPlainTextMessage(body);
    const res = await this.smsService.sendSms(to, plainText);
    return res.success;
  }

  async sendWhatsApp(to: string, body: string): Promise<boolean> {
    const res = await this.whatsappService.sendWhatsAppMessage(to, body);
    return res.success;
  }

  async createRazorpayOrder(
    amount: number,
    currency: string,
    receipt: string
  ): Promise<{ id: string; amount: number; currency: string; receipt: string }> {
    return this.paymentGateway.createOrder(amount, currency, receipt);
  }

  async transferPayout(
    destinationBankDetail: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    },
    amount: number
  ): Promise<{ success: boolean; payoutId: string; error?: string }> {
    return this.paymentGateway.transferPayout(destinationBankDetail, amount);
  }
}
