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
    let amount = 500;
    
    if (pricingConfig && pricingConfig.value && Array.isArray(pricingConfig.value)) {
      const plan = pricingConfig.value.find((p: any) => p.tier === command.tier && p.days === command.durationDays);
      if (plan && plan.price) {
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
