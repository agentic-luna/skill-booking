import { IWhatsAppProvider } from '../providers/whatsapp.provider';

export class WhatsAppCommunicationService {
  constructor(private waProvider: IWhatsAppProvider) {}

  async sendWhatsAppMessage(to: string, message: string) {
    return this.waProvider.sendWhatsAppMessage(to, message);
  }
}
