import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { cn } from '../utils/cn';
import client from '../api/client';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      await client.patch(`/notifications/${notification._id}/read`);
      if (notification.link) {
        navigate(notification.link);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all group"
      >
        <Bell className={cn("w-5 h-5 transition-transform group-hover:scale-110", isOpen && "text-primary")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Notifications</h3>
            <div className="flex gap-2">
              <button 
                onClick={markAllAsRead}
                className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={clearNotifications}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-400">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div 
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "p-4 hover:bg-slate-50 cursor-pointer transition-colors group",
                      !n.isRead && "bg-primary/5 border-l-4 border-primary"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-black text-slate-900 leading-tight pr-4">{n.title}</p>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                    {n.link && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
             <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
               View All Activity
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
