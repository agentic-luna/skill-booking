import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IConfigRepository } from '../../../domain/repositories/config.repository';
import { ICommunicationService } from '../../services/communication.service';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class RequestBoostCommand implements IRequest<any> {
  readonly __tag = 'RequestBoostCommand';
  constructor(
    public readonly eventId: string,
    public readonly durationDays: number
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

    const boostRequest = await this.boostedRepo.upsert(command.eventId, {
      priority: 1,
      startDate,
      endDate,
      isActive: false, // Wait for payment verification
    } as any);
    
    // Fetch dynamic pricing
    let pricing: Record<string, number> = {
      "7": 500,
      "15": 900,
      "30": 1500
    };
    
    const pricingConfig = await this.configRepo.findPlatformSetting('BOOST_PRICING');
    if (pricingConfig && pricingConfig.value) {
      pricing = pricingConfig.value as Record<string, number>;
    }
    
    const amount = pricing[command.durationDays.toString()] || 500;
    
    // Create Razorpay Order
    const razorpayOrder = await this.commsService.createRazorpayOrder(amount, 'INR', boostRequest.id);
    
    return { boostRequest, razorpayOrder };
  }
}
