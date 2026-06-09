import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import client, { getBackendUrl } from '../api/client';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const response = await client.get('/notifications');
        const list = response.data.notifications || [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Failed to fetch notifications');
      }
    };

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (user && !socket) {
      const socketUrl = getBackendUrl();
      const newSocket = io(socketUrl);
      
      newSocket.on('connect', () => {
        newSocket.emit('join', user._id);
        console.log('Socket connected and joined user room');
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show a nice toast alert
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-slate-100">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-bold text-primary hover:text-primary/70 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ));
      });

      setSocket(newSocket);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [user]);

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // API call would go here
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
    socketConnected: !!socket,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
