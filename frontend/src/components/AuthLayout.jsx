import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user && user.isVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex bg-slate-50 font-inter overflow-hidden">
      {/* Visual Side (Hidden on mobile) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden group"
      >
        <img 
          src="/auth-bg.png" 
          alt="Campus Background" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-linear group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/40 to-transparent"></div>
        
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Campus<span className="opacity-60">Companion</span>
            </h1>
          </motion.div>

          <div className="max-w-xl">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-6xl font-black text-white leading-[1.05] tracking-tighter mb-6"
            >
              The digital core of your <span className="text-primary italic">academic soul.</span>
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-xl text-slate-300 font-medium leading-relaxed"
            >
              Manage assignments, discover events, and connect with your campus community through a premium, unified experience.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.2 }}
            className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]"
          >
            Est. 2026 • Production Grade
          </motion.div>
        </div>
      </motion.div>

      {/* Form Content Side */}
      <div className="flex-1 flex flex-col relative bg-white lg:rounded-l-[40px] shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-20">
        <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* mobile / footer branding */}
        <div className="p-8 lg:px-20 border-t border-slate-50 flex items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
           <span>Campus Companion v1.0</span>
           <span>&copy; 2026 ALL RIGHTS RESERVED</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
