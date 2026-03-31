import { create } from "zustand";

interface Theme {
  type: string;
  color: string;
}

const AvailableThemes: Theme[] = [{
  type: 'light',
  color: '#0f172a' // Slate-900 for abstract glass contrast
}, {
  type: 'dark',
  color: '#111'
}];

interface ThemeStore {
  themes: Theme[];
  theme: Theme;
  nextTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  (set, get) => ({
    themes: [...AvailableThemes],
    theme: AvailableThemes[1], // always start dark
    nextTheme: () => {
      const themes = get().themes;
      const activeThemeIndex = themes.findIndex(theme => theme.type === get().theme.type);
      const nextThemeIndex = (activeThemeIndex + 1) % themes.length;
      set(() => ({ theme: themes[nextThemeIndex] }));
    },
  })
);