import { useEffect, useRef, useState } from 'react';
const socketIOClient = require('socket.io-client');

type AnySocket = any;

export function useSocket(outletId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<AnySocket>(null);

  useEffect(() => {
    if (!outletId) return;

    const connectFn = socketIOClient.io ?? socketIOClient.connect ?? socketIOClient.default ?? socketIOClient;
    const socket: AnySocket = connectFn(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
      {
        transports: ['websocket'],
      }
    );

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join room for this specific outlet
      socket.emit('join', outletId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [outletId]);

  return {
    socket: socketRef.current as AnySocket,
    isConnected,
  };
}
