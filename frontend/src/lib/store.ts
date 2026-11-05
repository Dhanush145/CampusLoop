import { create } from 'zustand';
import { User, Product } from './types';
import api from './api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  wishlistIds: number[];
  unreadCount: number;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;
  toggleWishlistId: (id: number) => void;
  setWishlistIds: (ids: number[]) => void;
  fetchProfile: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  wishlistIds: [],
  unreadCount: 0,

  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      if (user) localStorage.setItem('user_data', JSON.stringify(user));
      else {
        localStorage.removeItem('user_data');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    set({
      user,
      token: token || null,
      isAuthenticated: !!user,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        api.post('/auth/logout/', { refresh }).catch(() => {});
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
    set({ user: null, token: null, isAuthenticated: false, wishlistIds: [], unreadCount: 0 });
  },

  toggleWishlistId: (id: number) => {
    const ids = get().wishlistIds;
    if (ids.includes(id)) {
      set({ wishlistIds: ids.filter((item) => item !== id) });
    } else {
      set({ wishlistIds: [...ids, id] });
    }
  },

  setWishlistIds: (ids: number[]) => set({ wishlistIds: ids }),

  fetchProfile: async () => {
    try {
      const res = await api.get('/auth/profile/');
      set({ user: res.data, isAuthenticated: true });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(res.data));
      }
    } catch {
      // not authenticated
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread_count/');
      set({ unreadCount: res.data.unread_count });
    } catch {
      // ignore
    }
  },
}));

