"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const prisma_1 = require("../../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const di_container_1 = require("../di-container");
const submit_kyc_1 = require("../../application/use-cases/hosts/submit-kyc");
const submit_bank_details_1 = require("../../application/use-cases/hosts/submit-bank-details");
const get_dashboard_1 = require("../../application/use-cases/hosts/get-dashboard");
const api_response_1 = require("../common/api-response");
const errors_1 = require("../common/errors");
class UsersController {
    static async submitKyc(req, res, next) {
        try {
            const { accountType, govIdUrl, gstNumber, bio } = req.body;
            const result = await di_container_1.mediator.send(new submit_kyc_1.SubmitKycCommand(req.user.id, {
                accountType,
                govIdUrl,
                gstNumber,
                bio,
            }));
            return api_response_1.ApiResponse.success(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async submitBankDetails(req, res, next) {
        try {
            const hostProfile = await di_container_1.userRepo.findHostProfileByUserId(req.user.id);
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found. Please complete KYC submission first.');
            }
            const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;
            const bankDetails = (await di_container_1.mediator.send(new submit_bank_details_1.SubmitBankDetailsCommand(hostProfile.id, { accountHolderName, accountNumber, ifscCode, bankName, upiId }, false)));
            return api_response_1.ApiResponse.success(res, di_container_1.cryptoService.decryptBankDetail(bankDetails), 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getBankDetails(req, res, next) {
        try {
            const hostProfile = await di_container_1.userRepo.findHostProfileByUserId(req.user.id);
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found.');
            }
            const bankDetails = await di_container_1.userRepo.findHostBankDetail(hostProfile.id);
            if (!bankDetails) {
                return api_response_1.ApiResponse.success(res, null);
            }
            return api_response_1.ApiResponse.success(res, di_container_1.cryptoService.decryptBankDetail(bankDetails));
        }
        catch (error) {
            next(error);
        }
    }
    static async updateBankDetails(req, res, next) {
        try {
            const hostProfile = await di_container_1.userRepo.findHostProfileByUserId(req.user.id);
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found.');
            }
            const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;
            const bankDetails = (await di_container_1.mediator.send(new submit_bank_details_1.SubmitBankDetailsCommand(hostProfile.id, { accountHolderName, accountNumber, ifscCode, bankName, upiId }, true)));
            return api_response_1.ApiResponse.success(res, di_container_1.cryptoService.decryptBankDetail(bankDetails));
        }
        catch (error) {
            next(error);
        }
    }
    static async getDashboard(req, res, next) {
        try {
            const hostProfile = await di_container_1.userRepo.findHostProfileByUserId(req.user.id);
            if (!hostProfile) {
                throw new errors_1.BadRequestError('Host Profile not found. Please complete KYC submission first.');
            }
            const stats = await di_container_1.mediator.send(new get_dashboard_1.GetHostDashboardQuery(hostProfile.id));
            return api_response_1.ApiResponse.success(res, stats);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const { firstName, lastName, email } = req.body;
            if (!firstName || !email) {
                throw new errors_1.BadRequestError('First name and email are required');
            }
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: req.user.id },
                data: { firstName, lastName: lastName || '', email },
            });
            return api_response_1.ApiResponse.success(res, { user: updatedUser });
        }
        catch (error) {
            next(error);
        }
    }
    static async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new errors_1.BadRequestError('Current password and new password are required');
            }
            const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
            if (!user) {
                throw new errors_1.BadRequestError('User not found');
            }
            const isMatch = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!isMatch) {
                throw new errors_1.BadRequestError('Incorrect current password');
            }
            const passwordHash = await bcryptjs_1.default.hash(newPassword, 10);
            await prisma_1.prisma.user.update({
                where: { id: req.user.id },
                data: { passwordHash },
            });
            return api_response_1.ApiResponse.success(res, { message: 'Password updated successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async applyHost(req, res, next) {
        try {
            const { expertise, bio } = req.body;
            if (!bio) {
                throw new errors_1.BadRequestError('Professional bio is required to apply');
            }
            const hostProfile = await prisma_1.prisma.hostProfile.upsert({
                where: { userId: req.user.id },
                update: { bio },
                create: {
                    userId: req.user.id,
                    bio,
                    kycStatus: 'PENDING',
                },
            });
            return api_response_1.ApiResponse.success(res, hostProfile);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyEvents(req, res, next) {
        try {
            const hostProfile = await prisma_1.prisma.hostProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!hostProfile) {
                return api_response_1.ApiResponse.success(res, []);
            }
            const events = await prisma_1.prisma.event.findMany({
                where: { hostId: hostProfile.id },
                select: {
                    id: true,
                    hostId: true,
                    title: true,
                    description: true,
                    posterUrl: true,
                    mode: true,
                    venueDetails: true,
                    startTime: true,
                    totalSeats: true,
                    availableSeats: true,
                    status: true,
                    version: true,
                    price: true,
                    duration: true,
                    category: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { startTime: 'desc' },
            });
            // Serialize Decimal/BigInt fields to plain JS numbers for JSON
            const serialized = events.map((e) => ({
                ...e,
                price: e.price ? Number(e.price) : null,
                totalSeats: Number(e.totalSeats),
                availableSeats: Number(e.availableSeats),
                version: Number(e.version),
            }));
            return api_response_1.ApiResponse.success(res, serialized);
        }
        catch (error) {
            next(error);
        }
    }
    static async getHostParticipants(req, res, next) {
        try {
            const hostProfile = await prisma_1.prisma.hostProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!hostProfile) {
                return api_response_1.ApiResponse.success(res, []);
            }
            const bookings = await prisma_1.prisma.booking.findMany({
                where: {
                    event: { hostId: hostProfile.id },
                },
                include: {
                    event: true,
                    client: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return api_response_1.ApiResponse.success(res, bookings);
        }
        catch (error) {
            next(error);
        }
    }
    static async getEventBookings(req, res, next) {
        try {
            const { eventId } = req.params;
            const bookings = await prisma_1.prisma.booking.findMany({
                where: { eventId },
                include: {
                    client: true,
                    event: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            return api_response_1.ApiResponse.success(res, bookings);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UsersController = UsersController;
