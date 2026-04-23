import { useEffect, useRef, useState } from 'react';

// socket.io-client v4 bundles its own types but @types/socket.io-client v1 (legacy)
// is also installed and conflicts. We bypass by using the default import.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const socketIOClient = require('socket.io-client');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySocket = any;

export function useSocket(room: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<AnySocket>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('rms_access_token')
      : undefined;

    const connectFn = socketIOClient.io ?? socketIOClient.connect ?? socketIOClient.default ?? socketIOClient;
    const newSocket: AnySocket = connectFn(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000',
      {
        withCredentials: true,
        transports: ['websocket'],
        auth: token ? { token } : undefined,
      }
    );

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join', room);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [room]);

  return {
    socket,
    isConnected,
  };
}
