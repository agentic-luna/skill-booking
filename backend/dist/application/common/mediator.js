"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mediator = void 0;
class Mediator {
    handlers = new Map();
    register(requestTag, handler) {
        this.handlers.set(requestTag, handler);
    }
    async send(request) {
        const handler = this.handlers.get(request.__tag);
        if (!handler) {
            throw new Error(`No request handler registered for request type: ${request.__tag}`);
        }
        return handler.handle(request);
    }
}
exports.Mediator = Mediator;
