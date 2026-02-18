import React, { createContext, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    loadUser,
    login,
    register,
    logout,
    refreshUser,
    sessionExpired,
    setSessionExpired
  } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (sessionExpired && isAuthenticated) {
      Alert.alert(
        'Session Expired',
        'Your security session has ended. To continue syncing your tasks, please sign in again.',
        [
          {
            text: 'Sign In',
            onPress: () => {
              setSessionExpired(false);
              logout();
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [sessionExpired, isAuthenticated, logout, setSessionExpired]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
