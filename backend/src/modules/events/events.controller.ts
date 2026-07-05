import { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service';

export class EventsController {
  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await EventsService.getAllEvents();
      res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEventDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await EventsService.getEventById(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Event not found',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }
}
