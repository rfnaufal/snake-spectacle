import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import type { User, AuthCredentials } from '@/types/game';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await api.auth.getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setLoading(true);
    const result = await api.auth.login(credentials);
    setLoading(false);
    
    if (result.success && result.data) {
      setUser(result.data);
      toast.success(`Welcome back, ${result.data.username}!`);
      return true;
    }
    
    toast.error(result.error || 'Login failed');
    return false;
  }, []);

  const signup = useCallback(async (credentials: AuthCredentials) => {
    setLoading(true);
    const result = await api.auth.signup(credentials);
    setLoading(false);
    
    if (result.success && result.data) {
      setUser(result.data);
      toast.success(`Welcome, ${result.data.username}! Ready to play?`);
      return true;
    }
    
    toast.error(result.error || 'Signup failed');
    return false;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
};
