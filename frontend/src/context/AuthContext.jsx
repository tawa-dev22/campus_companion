import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await client.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login: async (payload) => {
      const response = await client.post('/auth/login', payload);
      const { token, data } = response;
      localStorage.setItem('token', token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.fullName}!`);
    },
    register: async (payload) => {
      const response = await client.post('/auth/register', payload);
      // For OTP-based registration, the backend might not return a token yet
      if (response.token) {
        const { token, data } = response;
        localStorage.setItem('token', token);
        setUser(data.user);
        toast.success('Account created successfully!');
      } else {
        // If no token, it's likely waiting for verification
        return response;
      }
    },
    logout: () => {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out successfully');
    },
    isAdmin: user?.role?.name === 'Admin' || user?.role?.name === 'System Administrator',
    isSystemAdmin: user?.role?.name === 'System Administrator',
    isStudent: user?.role?.name === 'Student',
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new AuthError('useAuth must be used within an AuthProvider');
  }
  return context;
}

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}
