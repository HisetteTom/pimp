import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Lazily initializes and returns the Socket.io client instance.
 * Ensures the connection is setup only in browser environments.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    if (typeof window === 'undefined') {
      throw new Error('Socket client can only be initialized in the browser');
    }

    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : window.location.origin;

    socket = io(url, {
      autoConnect: false,
      withCredentials: true,
    });
  }
  return socket;
};
