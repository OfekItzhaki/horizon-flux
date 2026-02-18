import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { User, LoginDto } from '@tasks-management/frontend-services';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  lastEmail: string;

  // Actions
  initialize: () => Promise<void>;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User | null) => void;
  setSessionExpired: (expired: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  isAuthenticated: authService.isAuthenticated(),
  sessionExpired: false,
  lastEmail: localStorage.getItem('last_email') || '',

  initialize: async () => {
    const hasToken = authService.isAuthenticated();
    if (!hasToken) {
      set({ loading: false, user: null, isAuthenticated: false });
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      set({
        user: currentUser,
        isAuthenticated: true,
        loading: false,
        lastEmail: currentUser.email
      });
      localStorage.setItem('last_email', currentUser.email);
    } catch {
      authService.logout();
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (credentials: LoginDto) => {
    const response = await authService.login(credentials);
    set({
      user: response.user,
      isAuthenticated: true,
      lastEmail: response.user.email,
      sessionExpired: false
    });
    localStorage.setItem('last_email', response.user.email);
  },

  logout: async () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, loading: false, sessionExpired: false });
  },

  updateUser: (user: User | null) => {
    if (user) {
      set({ user, lastEmail: user.email });
      localStorage.setItem('last_email', user.email);
    } else {
      set({ user: null });
    }
  },

  setSessionExpired: (expired: boolean) => set({ sessionExpired: expired }),
}));
