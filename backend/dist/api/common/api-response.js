"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, data, statusCode = 200, message) {
        return res.status(statusCode).json({
            success: true,
            ...(message && { message }),
            data,
        });
    }
    static created(res, data, message) {
        return ApiResponse.success(res, data, 201, message);
    }
    static noContent(res, message) {
        return res.status(204).json({
            success: true,
            ...(message && { message }),
        });
    }
}
exports.ApiResponse = ApiResponse;
