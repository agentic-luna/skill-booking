import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200, message?: string) {
    return res.status(statusCode).json({
      success: true,
      ...(message && { message }),
      data,
    });
  }

  static created<T>(res: Response, data: T, message?: string) {
    return ApiResponse.success(res, data, 201, message);
  }

  static noContent(res: Response, message?: string) {
    return res.status(204).json({
      success: true,
      ...(message && { message }),
    });
  }
}
