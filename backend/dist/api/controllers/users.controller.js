"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
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
            return api_response_1.ApiResponse.success(res, {
                id: bankDetails.id,
                hostProfileId: bankDetails.hostProfileId,
                bankName: bankDetails.bankName,
                updatedAt: bankDetails.updatedAt,
            });
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
            return api_response_1.ApiResponse.success(res, {
                id: bankDetails.id,
                hostProfileId: bankDetails.hostProfileId,
                bankName: bankDetails.bankName,
                updatedAt: bankDetails.updatedAt,
            });
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
}
exports.UsersController = UsersController;
