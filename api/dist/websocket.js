"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWebSocket = initWebSocket;
exports.emitToOutlet = emitToOutlet;
exports.emitToKitchen = emitToKitchen;
exports.emitToBilling = emitToBilling;
exports.emitToStaff = emitToStaff;
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("./lib/redis");
const jwt_1 = require("./lib/jwt");
const logger_1 = require("./lib/logger");
let io;
async function initWebSocket(httpServer) {
    const subClient = redis_1.redis.duplicate();
    subClient.on('error', (err) => logger_1.logger.error('Redis Sub Error', err));
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(','),
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 20000,
        pingInterval: 25000,
    });
    io.adapter((0, redis_adapter_1.createAdapter)(redis_1.redis, subClient));
    // Auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error('Authentication required'));
        try {
            socket.data.user = (0, jwt_1.verifyAccessToken)(token);
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const { outlet_id, staff_id, role } = socket.data.user;
        logger_1.logger.info(`Staff connected: ${staff_id} to outlet: ${outlet_id}`);
        // All outlet staff join the outlet room
        socket.join(`outlet:${outlet_id}`);
        // Role-specific rooms for targeted events
        if (role === 'kitchen')
            socket.join(`outlet:${outlet_id}:kitchen`);
        if (role === 'cashier')
            socket.join(`outlet:${outlet_id}:billing`);
        // Individual staff room for personal notifications
        socket.join(`staff:${staff_id}`);
    });
    return io;
}
// Emit helpers
function emitToOutlet(outlet_id, event, data) {
    if (io)
        io.to(`outlet:${outlet_id}`).emit(event, data);
}
function emitToKitchen(outlet_id, event, data) {
    if (io)
        io.to(`outlet:${outlet_id}:kitchen`).emit(event, data);
}
function emitToBilling(outlet_id, event, data) {
    if (io)
        io.to(`outlet:${outlet_id}:billing`).emit(event, data);
}
function emitToStaff(staff_id, event, data) {
    if (io)
        io.to(`staff:${staff_id}`).emit(event, data);
}
