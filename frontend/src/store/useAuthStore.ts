import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define exactly what a "User" looks like
interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string; // Optional if you add profile pics later
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null });
        // No need to manually remove from localStorage; 
        // persist() handles clearing state upon logout.
      },
    }),
    { 
      name: 'auth-storage' 
    }
  )
);