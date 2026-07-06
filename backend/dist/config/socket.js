"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const di_container_1 = require("../api/di-container");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // Configure origin in production
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        di_container_1.logger.info(`[Socket] Client connected: ${socket.id}`);
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            di_container_1.logger.info(`[Socket] Client ${socket.id} joined room: ${roomId}`);
        });
        socket.on('disconnect', () => {
            di_container_1.logger.info(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized. Please call initSocket first.');
    }
    return io;
};
exports.getIO = getIO;
