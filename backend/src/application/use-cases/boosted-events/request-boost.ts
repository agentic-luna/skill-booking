import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICommunicationService } from '../../services/communication.service';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class RequestBoostCommand implements IRequest<any> {
  readonly __tag = 'RequestBoostCommand';
  constructor(
    public readonly eventId: string,
    public readonly durationDays: number,
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
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + command.durationDays);

    // Fetch dynamic pricing
    const pricingConfig = await this.configRepo.findPlatformSetting('BOOST_PRICING');
    let amount = 500; // default fallback

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
        if (plan && plan.price !== undefined) {
          amount = Number(plan.price);
        }
      }
    } else {
      // Hardcoded fallback matching default array from GetBoostPricingQueryHandler
      const fallbacks = [
        { tier: "BASIC", days: 7, price: 400 },
        { tier: "BASIC", days: 15, price: 800 },
        { tier: "BASIC", days: 30, price: 2000 },
        { tier: "STANDARD", days: 7, price: 600 },
        { tier: "STANDARD", days: 15, price: 1200 },
        { tier: "STANDARD", days: 30, price: 3000 },
        { tier: "PRO", days: 7, price: 1000 },
        { tier: "PRO", days: 15, price: 2000 },
        { tier: "PRO", days: 30, price: 5000 },
      ];
      const plan = fallbacks.find(
        (p: any) =>
          p.tier.toUpperCase() === command.tier.toUpperCase() &&
          Number(p.days) === Number(command.durationDays)
      );
      if (plan) {
        amount = plan.price;
      }
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
    
    return { boostRequest, razorpayOrder };
  }
}
