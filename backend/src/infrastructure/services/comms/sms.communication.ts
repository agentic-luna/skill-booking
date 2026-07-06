import { ISmsProvider } from '../providers/sms.provider';

export class SmsCommunicationService {
  constructor(private smsProvider: ISmsProvider) {}

  async sendSms(to: string, body: string) {
    return this.smsProvider.sendSms(to, body);
  }
}
