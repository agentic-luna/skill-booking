export interface ISmsProvider {
  sendSms(to: string, body: string): Promise<{ success: boolean; messageId?: string }>;
}
