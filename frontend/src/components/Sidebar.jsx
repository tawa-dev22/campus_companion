import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Bell, 
  ShoppingBag, 
  Users, 
  LogOut, 
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { cn } from '../utils/cn';

const Sidebar = () => {
  const { user, isSystemAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Assignments', path: '/assignments', icon: BookOpen },
    { name: 'Events', path: '/events', icon: Bell },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag },
    { name: 'Study Groups', path: '/study-groups', icon: Users },
  ];

  const adminLinks = [
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Roles & Audit', path: '/admin/system', icon: ShieldCheck },
  ];

  return (
    <aside className="w-72 h-screen glass border-r border-slate-200 sticky top-0 flex flex-col z-[50]">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campus<span className="text-primary">Companion</span></h2>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Main Menu</p>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => cn(
              "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
              isActive 
                ? "bg-primary/10 text-primary font-bold shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <link.icon className={cn(
                "w-5 h-5 transition-transform duration-200", 
                "group-hover:scale-110"
              )} />
              <span className="text-[14px]">{link.name}</span>
            </div>
            {link.badge && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm animate-pulse">
                {link.badge}
              </span>
            )}
            <div className={cn(
               "absolute left-0 w-1.5 h-6 bg-primary rounded-r-full transition-all duration-300 opacity-0",
               "group-[.active]:opacity-100"
            )} />
          </NavLink>
        ))}

        {isSystemAdmin && (
          <>
            <p className="px-4 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">Administration</p>
            {adminLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-accent/10 text-accent font-bold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <link.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[14px]">{link.name}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-6 border-t border-slate-100 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl text-rose-600 hover:bg-rose-50 transition-all group font-semibold text-[14px]"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
