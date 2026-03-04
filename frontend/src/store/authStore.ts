import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_token', token);
      localStorage.setItem('nexus_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

/**
 * Inicializa o store a partir do localStorage (chamado no layout raiz).
 */
export function hydrateAuth() {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('nexus_token');
  const userRaw = localStorage.getItem('nexus_user');
  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw) as User;
      useAuthStore.getState().login(user, token);
    } catch {
      // localStorage corrompido — ignora
    }
  }
}
