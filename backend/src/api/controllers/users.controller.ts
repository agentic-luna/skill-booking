import { Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import bcrypt from 'bcryptjs';
import { mediator, userRepo, cryptoService } from '../di-container';
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

      return ApiResponse.success(res, cryptoService.decryptBankDetail(bankDetails), 201);
    } catch (error) {
      next(error);
    }
  }

  static async getBankDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const hostProfile = await userRepo.findHostProfileByUserId(req.user!.id);
      if (!hostProfile) {
        throw new BadRequestError('Host Profile not found.');
      }

      const bankDetails = await userRepo.findHostBankDetail(hostProfile.id);
      if (!bankDetails) {
        return ApiResponse.success(res, null);
      }

      return ApiResponse.success(res, cryptoService.decryptBankDetail(bankDetails));
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

      return ApiResponse.success(res, cryptoService.decryptBankDetail(bankDetails));
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

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email } = req.body;
      if (!firstName || !email) {
        throw new BadRequestError('First name and email are required');
      }
      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: { firstName, lastName: lastName || '', email },
      });
      return ApiResponse.success(res, { user: updatedUser });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        throw new BadRequestError('Current password and new password are required');
      }
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) {
        throw new BadRequestError('User not found');
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestError('Incorrect current password');
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { passwordHash },
      });
      return ApiResponse.success(res, { message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async applyHost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { expertise, bio } = req.body;
      if (!bio) {
        throw new BadRequestError('Professional bio is required to apply');
      }
      const hostProfile = await prisma.hostProfile.upsert({
        where: { userId: req.user!.id },
        update: { bio },
        create: {
          userId: req.user!.id,
          bio,
          kycStatus: 'PENDING',
        },
      });
      return ApiResponse.success(res, hostProfile);
    } catch (error) {
      next(error);
    }
  }

  static async getMyEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const hostProfile = await prisma.hostProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!hostProfile) {
        return ApiResponse.success(res, []);
      }
      const events = await prisma.event.findMany({
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
          boostedEvent: true,
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
      return ApiResponse.success(res, serialized);
    } catch (error) {
      next(error);
    }
  }

  static async getHostParticipants(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const hostProfile = await prisma.hostProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!hostProfile) {
        return ApiResponse.success(res, []);
      }
      const bookings = await prisma.booking.findMany({
        where: {
          event: { hostId: hostProfile.id },
        },
        include: {
          event: true,
          client: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, bookings);
    } catch (error) {
      next(error);
    }
  }

  static async getEventBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const bookings = await prisma.booking.findMany({
        where: { eventId },
        include: {
          client: true,
          event: true,
          refundRequest: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return ApiResponse.success(res, bookings);
    } catch (error) {
      next(error);
    }
  }
}
