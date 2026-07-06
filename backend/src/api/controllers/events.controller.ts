import { Request, Response, NextFunction } from 'express';
import { EventMode } from '@prisma/client';
import { mediator } from '../di-container';
import { SearchEventsQuery } from '../../application/use-cases/events/search-events';
import { GetEventDetailsQuery } from '../../application/use-cases/events/get-event-details';
import { CreateEventCommand } from '../../application/use-cases/events/create-event';
import { AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../common/api-response';

export class EventsController {
  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, mode, hostId, startTimeFrom } = req.query;
      const events = await mediator.send(new SearchEventsQuery({
        title: title as string,
        mode: mode as EventMode,
        hostId: hostId as string,
        startTimeFrom: startTimeFrom as string,
      }));
      return ApiResponse.success(res, events);
    } catch (error) {
      next(error);
    }
  }

  static async getEventDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await mediator.send(new GetEventDetailsQuery(id));
      return ApiResponse.success(res, event);
    } catch (error) {
      next(error);
    }
  }

  static async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, posterUrl, mode, venueDetails, startTime, totalSeats } = req.body;
      const event = await mediator.send(new CreateEventCommand(req.user!.id, {
        title,
        posterUrl,
        mode: mode as EventMode,
        venueDetails,
        startTime,
        totalSeats: Number(totalSeats),
      }));
      return ApiResponse.created(res, event);
    } catch (error) {
      next(error);
    }
  }
}
