import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Button from '../components/ui/Button';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VerifyPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
    setOtp(newOtp);

    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await client.post('/auth/verify', { email, otp: otpString });
      toast.success('Account verified successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await client.post('/auth/forgot-password', { email });
      toast.success('Verification code resent to your email');
    } catch (error) {
      toast.error('Failed to resend code');
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
      <motion.div variants={itemVariants} className="mb-10 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/5">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
          Secure your <br />
          <span className="text-primary italic">Identity.</span>
        </h2>
        <p className="mt-4 text-slate-500 font-medium text-lg">
          We sent a 6-digit code to <br />
          <span className="text-slate-900 font-black">{email}</span>
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div variants={itemVariants} className="flex justify-between gap-3">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              className="w-full aspect-square text-center text-3xl font-black bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all outline-none group-focus-within:border-primary"
            />
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button 
            type="submit" 
            className="h-16 w-full text-lg font-black shadow-2xl shadow-primary/30 rounded-2xl group transition-all" 
            loading={loading} 
            disabled={loading}
          >
            <span>Verify & Connect</span>
          </Button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-slate-50 text-center space-y-4">
        <div className="flex flex-col gap-1 items-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Didn't receive code?</p>
          <button onClick={resendOTP} className="flex items-center gap-2 font-black text-primary hover:text-primary/80 transition-all text-sm group">
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Resend Verification Code
          </button>
        </div>
        
        <button 
          onClick={() => navigate('/register')}
          className="flex items-center justify-center gap-2 w-full text-slate-400 hover:text-slate-900 transition-colors font-black text-[11px] uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-4 h-4" /> Start Over
        </button>
      </motion.div>
    </motion.div>
  );
};

export default VerifyPage;
