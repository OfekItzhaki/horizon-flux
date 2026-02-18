import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, LoginDto, apiClient } from '@tasks-management/frontend-services';
import { useAuthStore } from '../store/authStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isUploadingAvatar: boolean;
  setIsUploadingAvatar: (loading: boolean) => void;
  sessionExpired: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    loading,
    updateUser: setUser,
    login: storeLogin,
    logout: storeLogout,
    initialize,
    sessionExpired,
    setSessionExpired
  } = useAuthStore();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    apiClient.onUnauthorized = () => {
      setSessionExpired(true);
    };
    return () => {
      apiClient.onUnauthorized = undefined;
    };
  }, [setSessionExpired]);

  useEffect(() => {
    if (sessionExpired && user) {
      const wantToSignIn = window.confirm(
        'Session Expired: Your security session has ended. To continue syncing your tasks, please sign in again.'
      );
      if (wantToSignIn) {
        setSessionExpired(false);
        storeLogout();
      }
    }
  }, [sessionExpired, user, storeLogout, setSessionExpired]);

  const login = async (credentials: LoginDto) => {
    await storeLogin(credentials);
  };

  const logout = async () => {
    await storeLogout();
  };

  const refreshUser = async () => {
    await initialize();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
        refreshUser,
        isAuthenticated: !!user,
        isUploadingAvatar,
        setIsUploadingAvatar,
        sessionExpired,
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
