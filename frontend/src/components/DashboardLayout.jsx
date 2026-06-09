import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { User, Bell, Search, Settings } from 'lucide-react';
import { cn } from '../utils/cn';
import { getBackendUrl } from '../api/client';

const DashboardLayout = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 glass sticky top-0 z-[40] px-8 flex items-center justify-between border-b border-slate-200">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search academic resources, events, or marketplace..." 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all group">
                <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              </button>
            </div>
            
            <Link to="/profile" className="flex items-center gap-3 pl-6 border-l border-slate-200 group cursor-pointer hover:opacity-80 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1 group-hover:text-primary transition-colors">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{user?.role?.name}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 transform group-hover:scale-105 transition-transform">
                {user?.profilePicture ? (
                  <img 
                    src={`${getBackendUrl()}${user.profilePicture}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : user?.fullName?.charAt(0)}
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto animate-fade-in scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
