export interface ForgotPasswordSmsTemplateData {
  userName?: string;
  otp: string;
  expiresInMinutes?: number;
}

export function generateForgotPasswordSmsTemplate(data: ForgotPasswordSmsTemplateData): string {
  const expiry = data.expiresInMinutes || 10;
  return `[BookMyTraining] Hello${data.userName ? ` ${data.userName}` : ''}, your password reset OTP code is ${data.otp}. Valid for ${expiry} minutes.`;
}
