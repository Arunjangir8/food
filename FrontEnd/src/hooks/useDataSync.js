import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { localStorageUtils } from '../utils/localStorage.js';

export const useDataSync = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load data from API and sync with localStorage when user logs in
      localStorageUtils.loadFromAPI().catch(error => {
        console.warn('Failed to sync data on login:', error);
      });
    }
  }, [isAuthenticated, user]);

  return null;
};