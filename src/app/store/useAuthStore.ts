// src/store/useAuthStore.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  user: { id: string; email: string; name: string | null } | null;
  isHydrated: boolean; // <-- NEW: Flag to track rehydration
  setAuth: (data: { token: string; user: { id: string; email: string; name: string | null } }) => void;
  logout: () => void;
  setHydrated: () => void; // <-- NEW: Setter for the flag
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false, // <-- NEW: Initial state is false
      setAuth: (data) => set({ token: data.token, user: data.user }),
      logout: () => set({ token: null, user: null, isHydrated: true }), // Also set hydrated on logout
      setHydrated: () => set({ isHydrated: true }), // <-- NEW: The setter logic
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // --- NEW: This function runs once rehydration is complete ---
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);