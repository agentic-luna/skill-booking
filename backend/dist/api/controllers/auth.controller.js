"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const di_container_1 = require("../di-container");
const signup_1 = require("../../application/use-cases/auth/signup");
const login_1 = require("../../application/use-cases/auth/login");
const refresh_1 = require("../../application/use-cases/auth/refresh");
const logout_1 = require("../../application/use-cases/auth/logout");
const get_profile_1 = require("../../application/use-cases/auth/get-profile");
const send_otp_1 = require("../../application/use-cases/auth/send-otp");
const verify_otp_1 = require("../../application/use-cases/auth/verify-otp");
const send_forgot_password_otp_1 = require("../../application/use-cases/auth/send-forgot-password-otp");
const verify_forgot_password_otp_1 = require("../../application/use-cases/auth/verify-forgot-password-otp");
const reset_password_1 = require("../../application/use-cases/auth/reset-password");
const send_otp_2 = require("../../application/use-cases/auth/client/send-otp");
const verify_otp_2 = require("../../application/use-cases/auth/client/verify-otp");
const signup_2 = require("../../application/use-cases/auth/client/signup");
const send_email_verification_1 = require("../../application/use-cases/auth/client/send-email-verification");
const verify_email_magic_link_1 = require("../../application/use-cases/auth/client/verify-email-magic-link");
const api_response_1 = require("../common/api-response");
class AuthController {
    static async sendOtp(req, res, next) {
        try {
            const { target, type } = req.body;
            const result = await di_container_1.mediator.send(new send_otp_1.SendOtpCommand(target, type));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyOtp(req, res, next) {
        try {
            const { target, type, otp } = req.body;
            const result = await di_container_1.mediator.send(new verify_otp_1.VerifyOtpCommand(target, type, otp));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async signup(req, res, next) {
        try {
            const { firstName, lastName, email, phone, password, role, emailOtp, phoneOtp } = req.body;
            const result = await di_container_1.mediator.send(new signup_1.SignupCommand({
                firstName,
                lastName,
                email,
                phone,
                passwordText: password,
                role,
                emailOtp,
                phoneOtp,
            }));
            return api_response_1.ApiResponse.created(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async clientSendOtp(req, res, next) {
        try {
            const { phone, whatsappNumber } = req.body;
            const targetPhone = phone || whatsappNumber;
            const result = await di_container_1.mediator.send(new send_otp_2.ClientSendOtpCommand(targetPhone));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async clientVerifyOtp(req, res, next) {
        try {
            const { phone, whatsappNumber, otp } = req.body;
            const targetPhone = phone || whatsappNumber;
            const result = await di_container_1.mediator.send(new verify_otp_2.ClientVerifyOtpCommand(targetPhone, otp));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async clientSignup(req, res, next) {
        try {
            const { firstName, lastName, phone, whatsappNumber, password, otp } = req.body;
            const targetPhone = phone || whatsappNumber;
            const result = await di_container_1.mediator.send(new signup_2.ClientSignupCommand({
                firstName,
                lastName,
                phone: targetPhone,
                passwordText: password,
                otp,
            }));
            return api_response_1.ApiResponse.created(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async clientSendEmailVerification(req, res, next) {
        try {
            const userId = req.user?.id;
            const { email } = req.body;
            const result = await di_container_1.mediator.send(new send_email_verification_1.ClientSendEmailVerificationCommand(userId, email));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async clientVerifyEmailMagicLink(req, res, next) {
        try {
            const { token } = req.body;
            const result = await di_container_1.mediator.send(new verify_email_magic_link_1.ClientVerifyEmailMagicLinkCommand(token));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { identifier, email, phone, password } = req.body;
            const loginIdentifier = identifier || email || phone;
            const result = await di_container_1.mediator.send(new login_1.LoginCommand(loginIdentifier, password));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async forgotPasswordSendOtp(req, res, next) {
        try {
            const { identifier, email, phone } = req.body;
            const targetIdentifier = identifier || email || phone;
            const result = await di_container_1.mediator.send(new send_forgot_password_otp_1.SendForgotPasswordOtpCommand(targetIdentifier));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async forgotPasswordVerifyOtp(req, res, next) {
        try {
            const { identifier, email, phone, otp } = req.body;
            const targetIdentifier = identifier || email || phone;
            const result = await di_container_1.mediator.send(new verify_forgot_password_otp_1.VerifyForgotPasswordOtpCommand(targetIdentifier, otp));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { resetToken, newPassword, password } = req.body;
            const passwordToSet = newPassword || password;
            const result = await di_container_1.mediator.send(new reset_password_1.ResetPasswordCommand(resetToken, passwordToSet));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await di_container_1.mediator.send(new refresh_1.RefreshTokenCommand(refreshToken));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await di_container_1.mediator.send(new logout_1.LogoutCommand(refreshToken));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            const result = await di_container_1.mediator.send(new get_profile_1.GetProfileQuery(req.user.id));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
