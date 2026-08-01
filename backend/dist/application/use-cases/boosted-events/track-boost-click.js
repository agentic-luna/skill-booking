"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackBoostClickCommandHandler = exports.TrackBoostClickCommand = void 0;
const prisma_1 = require("../../../config/prisma");
class TrackBoostClickCommand {
    eventId;
    __tag = 'TrackBoostClickCommand';
    constructor(eventId) {
        this.eventId = eventId;
    }
}
exports.TrackBoostClickCommand = TrackBoostClickCommand;
class TrackBoostClickCommandHandler {
    async handle(command) {
        const { eventId } = command;
        if (!eventId)
            return { success: false };
        try {
            const boost = await prisma_1.prisma.boostedEvent.findFirst({
                where: { eventId, isActive: true, status: 'ACTIVE' },
            });
            if (boost) {
                await prisma_1.prisma.boostedEvent.update({
                    where: { id: boost.id },
                    data: { clicks: { increment: 1 } },
                });
                return { success: true, boostId: boost.id };
            }
        }
        catch (err) {
            console.error('[Telemetry] Failed to increment boost clicks:', err);
        }
        return { success: false };
    }
}
exports.TrackBoostClickCommandHandler = TrackBoostClickCommandHandler;
