export interface IEmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string }>;
}
