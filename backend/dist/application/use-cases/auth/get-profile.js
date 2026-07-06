"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileQueryHandler = exports.GetProfileQuery = void 0;
const errors_1 = require("../../common/errors");
class GetProfileQuery {
    userId;
    __tag = 'GetProfileQuery';
    constructor(userId) {
        this.userId = userId;
    }
}
exports.GetProfileQuery = GetProfileQuery;
class GetProfileQueryHandler {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async handle(query) {
        const { userId } = query;
        const userProfile = await this.userRepo.findProfile(userId);
        if (!userProfile) {
            throw new errors_1.NotFoundError('User profile not found');
        }
        return userProfile;
    }
}
exports.GetProfileQueryHandler = GetProfileQueryHandler;
