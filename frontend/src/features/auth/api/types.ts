// ── All auth API response / request types ──────────────────────────────────

export type OtpType = "EMAIL" | "PHONE";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "CLIENT" | "HOST" | "SUPERADMIN";
  status: "ACTIVE" | "SUSPENDED";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface OtpSendResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
  /** Returned by backend only in development mode */
  devOtp?: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordSendResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
  devOtp?: string;
}

export interface ForgotPasswordVerifyResponse {
  data : {
    success: boolean;
    message: string;
    resetToken: string;
    expiresInSeconds: number;
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: "CLIENT" | "HOST";
  emailOtp?: string;
  phoneOtp?: string;
}
