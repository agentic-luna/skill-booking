import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICommunicationService } from '../../services/communication.service';
import { IRequest, IRequestHandler } from '../../common/mediator';

import { ConflictError, NotFoundError, BadRequestError } from '../../common/errors';
import { prisma } from '../../../config/prisma';

export class RequestBoostCommand implements IRequest<any> {
  readonly __tag = 'RequestBoostCommand';
  constructor(
    public readonly eventId: string,
    public readonly durationDays?: number,
    public readonly tier: 'BASIC' | 'STANDARD' | 'PRO' = 'BASIC'
  ) {}
}

export class RequestBoostCommandHandler implements IRequestHandler<RequestBoostCommand, any> {
  constructor(
    private boostedRepo: IBoostedEventRepository,
    private commsService: ICommunicationService,
    private configRepo: IConfigRepository
  ) {}

  async handle(command: RequestBoostCommand): Promise<any> {
    const { eventId, tier } = command;

    const now = new Date();

    // Check if target event exists and meets boosting requirements
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    if (event.status !== 'APPROVED') {
      throw new BadRequestError('Only approved events can be boosted.');
    }

    if (event.startTime < now) {
      throw new BadRequestError('Past events cannot be boosted. Only upcoming events can be boosted.');
    }

    // Check for existing active non-expired boost campaign
    const existingActiveBoost = await prisma.boostedEvent.findFirst({
      where: {
        eventId,
        isActive: true,
        status: { in: ['ACTIVE', 'APPROVED'] },
        endDate: { gte: now },
      },
    });

    if (existingActiveBoost) {
      throw new ConflictError(
        `This event already has an active ${existingActiveBoost.tier} promotion campaign running until ${new Date(
          existingActiveBoost.endDate
        ).toLocaleDateString()}.`
      );
    }

    // Default duration days per plan tier if not explicitly specified
    let durationDays = command.durationDays;
    if (!durationDays || durationDays <= 0) {
      if (tier === 'PRO') durationDays = 30;
      else if (tier === 'STANDARD') durationDays = 15;
      else durationDays = 7;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    // Fetch dynamic pricing
    const pricingConfig = await this.configRepo.findPlatformSetting('BOOST_PRICING');
    let amount: number | null = null;

    if (pricingConfig && pricingConfig.value) {
      let parsed = pricingConfig.value;
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = null;
        }
      }
      if (Array.isArray(parsed) && parsed.length > 0) {
        const plan = parsed.find(
          (p: any) =>
            p.tier.toUpperCase() === command.tier.toUpperCase() &&
            Number(p.days) === Number(command.durationDays)
        );
        if (plan && plan.price !== undefined && plan.price !== null) {
          amount = Number(plan.price);
        }
      }
    }

    if (amount === null || isNaN(amount)) {
      throw new BadRequestError('Boost pricing is not configured. Admin has to configure boost pricing.');
    }

    const boostRequest = await this.boostedRepo.upsert(command.eventId, {
      priority: command.tier === 'PRO' ? 3 : command.tier === 'STANDARD' ? 2 : 1,
      tier: command.tier,
      price: amount,
      startDate,
      endDate,
      isActive: false, // Wait for payment verification
    } as any);
    
    // Create Razorpay Order
    const razorpayOrder = await this.commsService.createRazorpayOrder(amount, 'INR', boostRequest.id);
    
    // Save razorpayOrderId into boost request
    let updatedBoost = boostRequest;
    if (razorpayOrder && razorpayOrder.id) {
      updatedBoost = await this.boostedRepo.updatePaymentDetails(boostRequest.id, {
        razorpayOrderId: razorpayOrder.id,
        paymentGateway: 'RAZORPAY',
      });
    }

    return { boostRequest: updatedBoost, razorpayOrder };
  }
}
