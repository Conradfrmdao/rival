import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  phone: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (userData: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,

      // Actions
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      setToken: (token) => {
        set({ token });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);