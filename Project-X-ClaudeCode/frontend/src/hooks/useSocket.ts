import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export function useSocket(): Socket {
  const socketRef = useRef<Socket>(connectSocket());

  useEffect(() => {
    return () => { disconnectSocket(); };
  }, []);

  return socketRef.current;
}
