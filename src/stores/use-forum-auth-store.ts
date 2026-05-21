import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IAuthUser } from '@/api/auth/types';

interface ForumAuthState {
  token: string | null;
  user: IAuthUser | null;
  setAuth: (token: string, user: IAuthUser) => void;
  setUser: (user: IAuthUser) => void;
  clearAuth: () => void;
}

export const useForumAuthStore = create<ForumAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'forum-auth',
    }
  )
);
