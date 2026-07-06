import { Response, NextFunction } from 'express';
import { mediator, userRepo } from '../di-container';
import { SubmitKycCommand } from '../../application/use-cases/hosts/submit-kyc';
import { SubmitBankDetailsCommand } from '../../application/use-cases/hosts/submit-bank-details';
import { GetHostDashboardQuery } from '../../application/use-cases/hosts/get-dashboard';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';
import { BadRequestError } from '../common/errors';

export class UsersController {
  static async submitKyc(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { accountType, govIdUrl, gstNumber, bio } = req.body;
      const result = await mediator.send(new SubmitKycCommand(req.user!.id, {
        accountType,
        govIdUrl,
        gstNumber,
        bio,
      }));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async submitBankDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const hostProfile = await userRepo.findHostProfileByUserId(req.user!.id);
      if (!hostProfile) {
        throw new BadRequestError('Host Profile not found. Please complete KYC submission first.');
      }

      const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;
      const bankDetails = (await mediator.send(new SubmitBankDetailsCommand(
        hostProfile.id,
        { accountHolderName, accountNumber, ifscCode, bankName, upiId },
        false
      ))) as any;

      return ApiResponse.success(res, {
        id: bankDetails.id,
        hostProfileId: bankDetails.hostProfileId,
        bankName: bankDetails.bankName,
        updatedAt: bankDetails.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBankDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const hostProfile = await userRepo.findHostProfileByUserId(req.user!.id);
      if (!hostProfile) {
        throw new BadRequestError('Host Profile not found.');
      }

      const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;
      const bankDetails = (await mediator.send(new SubmitBankDetailsCommand(
        hostProfile.id,
        { accountHolderName, accountNumber, ifscCode, bankName, upiId },
        true
      ))) as any;

      return ApiResponse.success(res, {
        id: bankDetails.id,
        hostProfileId: bankDetails.hostProfileId,
        bankName: bankDetails.bankName,
        updatedAt: bankDetails.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const hostProfile = await userRepo.findHostProfileByUserId(req.user!.id);
      if (!hostProfile) {
        throw new BadRequestError('Host Profile not found. Please complete KYC submission first.');
      }

      const stats = await mediator.send(new GetHostDashboardQuery(hostProfile.id));
      return ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}
