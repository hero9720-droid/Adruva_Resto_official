import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis } from './lib/redis';
import { verifyAccessToken } from './lib/jwt';
import { logger } from './lib/logger';

let io: Server;

export async function initWebSocket(httpServer: any) {
  const subClient = redis.duplicate();
  subClient.on('error', (err) => logger.error('Redis Sub Error', err));
  
  io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(','),
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  io.adapter(createAdapter(redis, subClient));

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.data.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { outlet_id, staff_id, role } = socket.data.user;
    logger.info(`Staff connected: ${staff_id} to outlet: ${outlet_id} (Role: ${role})`);
    
    // All outlet staff join the base outlet room
    socket.join(`outlet:${outlet_id}`);
    
    // Automatic joining based on role
    if (role === 'kitchen' || role === 'outlet_manager' || role === 'admin') {
      socket.join(`outlet:${outlet_id}:kitchen`);
    }
    if (role === 'cashier' || role === 'outlet_manager' || role === 'admin') {
      socket.join(`outlet:${outlet_id}:billing`);
    }
    
    // Support manual room joining from frontend (if needed for specific views)
    socket.on('join', (room) => {
      // Staff manual join
      if (['kitchen', 'billing', 'pos'].includes(room) && role !== 'guest') {
        const fullRoom = `outlet:${outlet_id}:${room === 'pos' ? 'billing' : room}`;
        socket.join(fullRoom);
        logger.info(`Staff ${staff_id} manually joined ${fullRoom}`);
      }
      
      // Guest manual join to specific order
      if (room.startsWith('order:')) {
        socket.join(room);
        logger.info(`Guest/Staff joined ${room}`);
      }
    });

    // Individual staff room for personal notifications
    socket.join(`staff:${staff_id}`);
  });

  return io;
}

// Emit helpers
export function emitToOutlet(outlet_id: string, event: string, data: object) {
  if (io) io.to(`outlet:${outlet_id}`).emit(event, data);
}

export function emitToKitchen(outlet_id: string, event: string, data: object) {
  if (io) io.to(`outlet:${outlet_id}:kitchen`).emit(event, data);
}

export function emitToBilling(outlet_id: string, event: string, data: object) {
  if (io) io.to(`outlet:${outlet_id}:billing`).emit(event, data);
}

export function emitToOrder(order_id: string, event: string, data: object) {
  if (io) io.to(`order:${order_id}`).emit(event, data);
}

export function emitToStaff(staff_id: string, event: string, data: object) {
  if (io) io.to(`staff:${staff_id}`).emit(event, data);
}
