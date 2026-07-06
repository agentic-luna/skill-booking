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
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await di_container_1.mediator.send(new login_1.LoginCommand(email, password));
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
