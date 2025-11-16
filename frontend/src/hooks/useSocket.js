// src/hooks/useSocket.js
'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function useSocket(brandName) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      if (brandName) {
        socketInstance.emit('subscribe_brand', brandName);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && brandName) {
      socket.emit('subscribe_brand', brandName);
    }
  }, [socket, brandName]);

  return { socket, connected };
}