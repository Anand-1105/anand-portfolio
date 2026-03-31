import { create } from 'zustand';

interface ScrollStore {
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  isAboutMeVisible: boolean;
  setAboutMeVisible: (visible: boolean) => void;
}

export const useScrollStore = create<ScrollStore>((set) => ({
  scrollProgress: 0,
  setScrollProgress: (progress) => set(() => ({ scrollProgress: progress })),
  isAboutMeVisible: false,
  setAboutMeVisible: (visible) => set(() => ({ isAboutMeVisible: visible })),
}));