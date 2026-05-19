import { create } from "zustand";

type Theme = "light";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeStore>(() => ({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  hydrate: () => {},
}));
