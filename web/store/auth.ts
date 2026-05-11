import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  color: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('draftly_token');
    const userStr = localStorage.getItem('draftly_user');
    let user: User | null = null;
    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch {
      user = null;
    }
    set({ token, user, hydrated: true });
  },

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('draftly_token', token);
      localStorage.setItem('draftly_user', JSON.stringify(user));
    }
    set({ user, token });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('draftly_token');
      localStorage.removeItem('draftly_user');
    }
    set({ user: null, token: null });
  },
}));
