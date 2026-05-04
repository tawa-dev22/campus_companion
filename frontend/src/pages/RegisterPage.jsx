import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserPlus, ArrowRight, Mail, Lock, User as UserIcon, Shield, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Registration successful! Please verify your identity.');
      navigate('/verify', { state: { email: formData.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
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
        delayChildren: 0.2
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
      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
          Start your <span className="text-primary italic">Journey.</span>
        </h2>
        <p className="mt-4 text-slate-500 font-medium text-lg">
          Join thousands of students on Campus Companion.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div variants={itemVariants}>
          <div className="relative group">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <Input
              label=""
              name="fullName"
              placeholder="Your Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="pl-12 h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all bg-slate-50/50 hover:bg-white"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <Input
              label=""
              name="email"
              type="email"
              placeholder="name@university.edu"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="pl-12 h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all bg-slate-50/50 hover:bg-white"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <Input
              label=""
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="pl-12 pr-12 h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all bg-slate-50/50 hover:bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors z-10"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative group">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <Input
              label=""
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="pl-12 pr-12 h-14 rounded-2xl border-2 border-slate-100 focus:border-primary transition-all bg-slate-50/50 hover:bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors z-10"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4">
          <Button 
            type="submit" 
            className="h-16 w-full text-lg font-black shadow-2xl shadow-primary/30 rounded-2xl group transition-all" 
            loading={loading} 
            disabled={loading}
          >
            <span>Create Profile</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="mt-10 pt-8 border-t border-slate-50 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">
          Already have an account?{' '}
          <Link to="/login" className="ml-2 font-black text-primary hover:underline transition-all">
            Sign In Instead
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;
