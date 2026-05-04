import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { LogIn, ArrowRight, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      if (message.toLowerCase().includes('verify')) {
        navigate('/verify', { state: { email } });
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <motion.div variants={itemVariants} className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
          Sign in to <br />
          <span className="text-primary italic">Campus Companion.</span>
        </h2>
        <p className="mt-4 text-slate-500 font-medium text-lg">
          Please enter your credentials below.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemVariants}>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <Input
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="pl-12 h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all bg-slate-50/50 hover:bg-white"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pl-12 h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all bg-slate-50/50 hover:bg-white"
            />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" weights="font-bold" className="text-sm font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest">
              Forgot password?
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button 
            type="submit" 
            className="h-16 w-full text-lg font-black shadow-2xl shadow-primary/30 rounded-2xl group transition-all" 
            loading={loading} 
            disabled={loading}
          >
            <span>Access Dashboard</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-slate-50 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">
          New student on the platform?{' '}
          <Link to="/register" className="ml-2 font-black text-primary hover:underline transition-all">
            Join the community
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
