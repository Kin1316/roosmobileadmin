import {create} from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  toggle: () => set({theme: get().theme === 'light' ? 'dark' : 'light'}),
}));
