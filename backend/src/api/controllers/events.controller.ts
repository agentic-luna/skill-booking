import { Request, Response, NextFunction } from 'express';
import { EventMode } from '@prisma/client';
import { mediator } from '../di-container';
import { prisma } from '../../config/prisma';
import { BadRequestError } from '../common/errors';
import { SearchEventsQuery } from '../../application/use-cases/events/search-events';
import { GetEventDetailsQuery } from '../../application/use-cases/events/get-event-details';
import { CreateEventCommand } from '../../application/use-cases/events/create-event';
import { ToggleEventLikeCommand, GetUserLikedEventsQuery } from '../../application/use-cases/likes/manage-event-likes';
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
      const { title, posterUrl, mode, venueDetails, startTime, totalSeats, price, duration, description } = req.body;
      const event = await mediator.send(new CreateEventCommand(req.user!.id, {
        title,
        posterUrl,
        mode: mode as EventMode,
        venueDetails,
        startTime,
        totalSeats: Number(totalSeats),
        price: price !== undefined ? Number(price) : undefined,
        duration: duration !== undefined ? String(duration) : undefined,
        description: description !== undefined ? String(description) : undefined,
      }));
      return ApiResponse.created(res, event);
    } catch (error) {
      next(error);
    }
  }

  static async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, posterUrl, mode, venueDetails, startTime, totalSeats, price, duration, description } = req.body;

      // 1. Fetch host profile first to verify ownership
      const hostProfile = await prisma.hostProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!hostProfile) {
        throw new BadRequestError('Host Profile not found.');
      }

      // 2. Fetch the event
      const event = await prisma.event.findUnique({
        where: { id },
      });
      if (!event) {
        return res.status(404).json({
          success: false,
          error: { message: 'Event not found.' },
        });
      }

      // 3. Verify ownership
      if (event.hostId !== hostProfile.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied. You do not own this event.' },
        });
      }

      // 4. Verify status is PENDING (edit is only allowed before approval)
      if (event.status !== 'PENDING') {
        throw new BadRequestError('Cannot edit this event as it has already been approved or processed.');
      }

      // 5. Update event
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          title: title !== undefined ? title : event.title,
          posterUrl: posterUrl !== undefined ? posterUrl : event.posterUrl,
          mode: mode !== undefined ? (mode as EventMode) : event.mode,
          venueDetails: venueDetails !== undefined ? venueDetails : (event.venueDetails as any),
          startTime: startTime !== undefined ? new Date(startTime) : event.startTime,
          totalSeats: totalSeats !== undefined ? Number(totalSeats) : event.totalSeats,
          availableSeats: totalSeats !== undefined ? Number(totalSeats) : event.availableSeats,
          price: price !== undefined ? Number(price) : event.price,
          duration: duration !== undefined ? String(duration) : event.duration,
          description: description !== undefined ? String(description) : event.description,
        },
      });

      return ApiResponse.success(res, updatedEvent);
    } catch (error) {
      next(error);
    }
  }

  static async deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // 1. Fetch host profile
      const hostProfile = await prisma.hostProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (!hostProfile) {
        throw new BadRequestError('Host Profile not found.');
      }

      // 2. Fetch the event
      const event = await prisma.event.findUnique({
        where: { id },
      });
      if (!event) {
        return res.status(404).json({
          success: false,
          error: { message: 'Event not found.' },
        });
      }

      // 3. Verify ownership
      if (event.hostId !== hostProfile.id) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied. You do not own this event.' },
        });
      }

      // 4. Verify status is PENDING
      if (event.status !== 'PENDING') {
        throw new BadRequestError('Cannot delete this event as it has already been approved or processed.');
      }

      // 5. Delete event
      await prisma.event.delete({
        where: { id },
      });

      return ApiResponse.success(res, { message: 'Event deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async toggleLike(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await mediator.send(new ToggleEventLikeCommand(req.user!.id, id));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getLikedEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await mediator.send(new GetUserLikedEventsQuery(req.user!.id));
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}
