export interface HostSmsOtpTemplateData {
  otp: string;
  expiresInMinutes?: number;
}

export function generateHostSmsOtpTemplate(data: HostSmsOtpTemplateData): string {
  const expiry = data.expiresInMinutes || 10;
  return `[BookMyTraining] Your Host registration OTP is ${data.otp}. Valid for ${expiry} minutes. Do not share code with anyone.`;
}
