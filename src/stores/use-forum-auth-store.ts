import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IAuthUser } from '@/api/auth/types';

interface ForumAuthState {
  token: string | null;
  user: IAuthUser | null;
  hasHydrated: boolean;
  setAuth: (token: string, user: IAuthUser) => void;
  setUser: (user: IAuthUser) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  clearAuth: () => void;
}

export const useForumAuthStore = create<ForumAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'forum-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
