import { IEmailProvider } from '../providers/email.provider';

export class EmailCommunicationService {
  constructor(private emailProvider: IEmailProvider) {}

  async sendEmail(to: string, subject: string, body: string) {
    return this.emailProvider.sendEmail(to, subject, body);
  }
}
