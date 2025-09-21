import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        setToken(savedToken);
        try {
          const response = await userAPI.getProfile();
          const userData = response.data.data.user;
          setUser(userData);
          localStorage.setItem('userProfile', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          const savedUser = localStorage.getItem('userProfile');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('userProfile', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
