import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService.js';
import axiosInstance from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

/**
 * AuthProvider component wrapper.
 * Manages global user authentication state, token storage, silent refresh, and persistent logins.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and load user profile if session exists
  useEffect(() => {
    const loadSessionUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch current active profile
        const response = await axiosInstance.get('/auth/profile');
        setUser(response.data);
      } catch (err) {
        // Silent token rotation will happen automatically inside the Axios interceptor
        // If it completely fails, the auth:logout event listener below handles it.
        console.error('Failed to restore authentication session:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionUser();
  }, []);

  // Listen for force logouts emitted by Axios interceptor on token refresh failures
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, []);

  /**
   * Log in user credentials.
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiService.post('/auth/login', { email, password });
      const { user: userProfile, accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userProfile);
      
      toast.success(`Welcome back, ${userProfile.full_name}!`);
      return userProfile;
    } catch (error) {
      toast.error(error.message || 'Login failed.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new account.
   */
  const register = async (userData) => {
    try {
      const response = await apiService.post('/auth/register', userData);
      toast.success('Registration successful! Please check your email to verify your account.');
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      throw error;
    }
  };

  /**
   * Log out active session.
   */
  const logout = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    if (storedRefreshToken) {
      try {
        await apiService.post('/auth/logout', { refreshToken: storedRefreshToken });
      } catch (err) {
        // Fail silently during network failure
      }
    }
    toast.success('Successfully logged out.');
  };

  /**
   * Update active user profile.
   */
  const updateProfile = async (formData) => {
    try {
      const response = await axiosInstance.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUser = response.data;
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
      throw error;
    }
  };

  /**
   * Change current account password.
   */
  const changePassword = async (passwords) => {
    try {
      await apiService.post('/auth/change-password', passwords);
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to change password.');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom React Hook to consume the Auth Context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider wrapper.');
  }
  return context;
};

export default AuthContext;
