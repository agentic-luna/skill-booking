import { IBoostedEventRepository } from '../../../domain/repositories/boosted-event.repository';
import { IRequest, IRequestHandler } from '../../common/mediator';

export class UpdateBoostStatusCommand implements IRequest<any> {
  readonly __tag = 'UpdateBoostStatusCommand';
  constructor(
    public readonly id: string,
    public readonly status: 'APPROVED' | 'REJECTED'
  ) {}
}

export class UpdateBoostStatusCommandHandler implements IRequestHandler<UpdateBoostStatusCommand, any> {
  constructor(private boostedRepo: IBoostedEventRepository) {}

  async handle(command: UpdateBoostStatusCommand): Promise<any> {
    const isActive = command.status === 'APPROVED';
    return this.boostedRepo.update(command.id, {
      status: command.status,
      isActive
    } as any);
  }
}
