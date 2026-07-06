export interface IWhatsAppProvider {
  sendWhatsAppMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string }>;
}
