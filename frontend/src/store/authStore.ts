import { create } from 'zustand';
import type { User } from '../types';
import authService from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),

  login: (user, token, refreshToken) => {
    authService.storeAuthData(token, refreshToken, user);
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  initializeAuth: () => {
    const storedUser = authService.getStoredUser();
    const isAuthenticated = authService.isAuthenticated();
    
    set({
      user: storedUser,
      isAuthenticated,
      isLoading: false,
    });
  },
}));


