import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  username: string | null;
  _hydrated: boolean;
  login: (token: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      _hydrated: false,
      login: async (token: string, username?: string) => {
        set({token, username: username ?? null});
      },
      logout: async () => {
        set({token: null, username: null});
      },
      bootstrap: async () => {
        // mark as hydrated, persist will rehydrate token
        set({_hydrated: true});
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({token: state.token, username: state.username}),
      onRehydrateStorage: () => (state) => {
        // set hydrated when storage rehydration completes
        if (state) {
          state._hydrated = true;
        }
      },
    },
  ),
);
