// import "react-crud-icons/dist/react-crud-icons.css";

import { useGSAP } from "@gsap/react";
import { usePortalStore, useThemeStore } from "@stores";
import gsap from "gsap";
import Image from 'next/image';
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

import { Moon, Sun } from 'lucide-react';

const ThemeSwitcher = () => {
  const themeSwitcherRef = useRef<HTMLDivElement>(null);
  const { nextTheme, theme } = useThemeStore();
  const isActive = usePortalStore((state) => state.activePortalId);
  const [positionClass, setPositionClass] = useState<string>('');
  const toggleTheme = () => nextTheme();

  useGSAP(() => {
    gsap.to(themeSwitcherRef.current, {
      opacity: isActive ? 0 : 1,
      duration: 1,
      delay: isActive ? 0 : 1,
    });
  }, [isActive]);

  useEffect(() => {
    setPositionClass(isMobile ? 'top-2 right-2' : 'top-6 right-6');
  }, [isMobile]);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.color);
    }
  }, [theme.color]);

  return (
    <div className={`fixed ${positionClass}`} ref={themeSwitcherRef} style={{ opacity: 0, zIndex: 2 }}>
      <div className="flex items-center justify-center gap-2">
        <a className="hover:cursor-pointer text-white opacity-80 hover:opacity-100 transition-opacity" onClick={toggleTheme}>
          {theme.type === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
        </a>
      </div>
    </div>
  );
};

export default ThemeSwitcher;