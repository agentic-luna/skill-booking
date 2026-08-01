import { IRequest, IRequestHandler } from '../../common/mediator';
import { prisma } from '../../../config/prisma';

export class TrackBoostClickCommand implements IRequest<any> {
  readonly __tag = 'TrackBoostClickCommand';
  constructor(public readonly eventId: string) {}
}

export class TrackBoostClickCommandHandler implements IRequestHandler<TrackBoostClickCommand, any> {
  async handle(command: TrackBoostClickCommand): Promise<any> {
    const { eventId } = command;
    if (!eventId) return { success: false };

    try {
      const boost = await prisma.boostedEvent.findFirst({
        where: { eventId, isActive: true, status: 'ACTIVE' },
      });

      if (boost) {
        await prisma.boostedEvent.update({
          where: { id: boost.id },
          data: { clicks: { increment: 1 } },
        });
        return { success: true, boostId: boost.id };
      }
    } catch (err) {
      console.error('[Telemetry] Failed to increment boost clicks:', err);
    }

    return { success: false };
  }
}
