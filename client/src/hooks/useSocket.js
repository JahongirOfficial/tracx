import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../stores/authStore';
import useFlightStore from '../stores/flightStore';

let socketInstance = null;

const useSocket = () => {
  const { token, role, user } = useAuthStore();
  const { refreshCurrentFlight } = useFlightStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!token || initialized.current) return;
    initialized.current = true;

    socketInstance = io('/', {
      auth: { token },
      transports: ['websocket'],
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      if (role === 'driver' && user?.id) {
        socketInstance.emit('join-driver', { driverId: user.id });
      } else if (role === 'business' && user?.id) {
        socketInstance.emit('join-business', { businessmanId: user.id });
      }
    });

    socketInstance.on('flight-updated', () => {
      refreshCurrentFlight();
    });

    socketInstance.on('expense-added', () => {
      refreshCurrentFlight();
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
      initialized.current = false;
    };
  }, [token]);

  return socketInstance;
};

export const getSocket = () => socketInstance;

export default useSocket;
