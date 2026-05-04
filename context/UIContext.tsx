"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from 'next/navigation';

interface UIContextType {
  navHidden: boolean;
  navAtTop: boolean;
  activeTheme: 'dark' | 'light';
  bottomTheme: 'dark' | 'light';
  navLocked: boolean;
  setNavHidden: (hidden: boolean) => void;
  setNavLocked: (locked: boolean) => void;
  setNavAtTop: (atTop: boolean) => void;
  setActiveTheme: (theme: 'dark' | 'light') => void;
  setBottomTheme: (theme: 'dark' | 'light') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [navHidden, setNavHidden] = useState(true);
  const [navAtTop, setNavAtTop] = useState(true);
  const [activeTheme, setActiveTheme] = useState<'dark' | 'light'>('dark');
  const [bottomTheme, setBottomTheme] = useState<'dark' | 'light'>('dark');
  const [navLocked, setNavLocked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const isMainPage = pathname === '/';
    const isProductPage = pathname?.startsWith('/product');

    const startHideTimer = () => {
      if (isProductPage) return;
      if (isMainPage && window.scrollY < 50) return;
      if (navLocked) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        setNavHidden(true);
      }, 3000);
    };

    const handleScroll = () => {
      if (navLocked) return;
      const currentScroll = window.scrollY;
      setNavAtTop(currentScroll < 20);
      setNavHidden(false);
      startHideTimer();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (navLocked) return;
      if (e.clientY < 100) {
        setNavHidden(false);
        startHideTimer();
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    const updateThemes = () => {
      const elements = document.querySelectorAll('[data-theme], [data-nav-visible]');
      const viewportHeight = window.innerHeight;
      
      let topThemeFound: 'dark' | 'light' = 'dark';
      let bottomThemeFound: 'dark' | 'light' = 'dark';
      let navForceVisible = isProductPage;
      let navShouldLock = false;

      const topZone = { start: 0, end: 100 };
      const bottomZone = { start: viewportHeight - 150, end: viewportHeight };

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const theme = el.getAttribute('data-theme') as 'dark' | 'light';
        const navVisibleAttr = el.getAttribute('data-nav-visible');
        
        if (!theme && !navVisibleAttr) return;

        const overlapsTop = Math.max(0, Math.min(rect.bottom, topZone.end) - Math.max(rect.top, topZone.start));
        if (overlapsTop > 0) {
          if (theme) topThemeFound = theme;
          if (navVisibleAttr === 'false') navShouldLock = true;
          else if (navVisibleAttr === 'true') navForceVisible = true;
        }

        const overlapsBottom = Math.max(0, Math.min(rect.bottom, bottomZone.end) - Math.max(rect.top, bottomZone.start));
        if (overlapsBottom > 0) {
          if (theme) bottomThemeFound = theme;
        }
      });

      setActiveTheme(topThemeFound);
      setBottomTheme(bottomThemeFound);
      
      if (navShouldLock) {
        setNavLocked(true);
        setNavHidden(true);
      } else if (navForceVisible) {
        setNavLocked(false);
        setNavHidden(false);
      } else {
        setNavLocked(false);
      }
    };

    const observer = new IntersectionObserver(() => {
      updateThemes();
    }, { threshold: [0, 0.5, 1] });

    const initObservers = () => {
      const elements = document.querySelectorAll('[data-theme], [data-nav-visible]');
      elements.forEach(el => observer.observe(el));
      updateThemes();
    };

    const initTimer = setTimeout(initObservers, 100);
    window.addEventListener('scroll', updateThemes);
    window.addEventListener('resize', updateThemes);

    const handleRouteChange = () => {
      setTimeout(() => {
        updateThemes();
        setNavAtTop(window.scrollY < 20);
        if (isProductPage || isMainPage) {
          setNavHidden(false);
        } else {
          setNavHidden(true);
        }
      }, 100);
    };

    handleRouteChange();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', updateThemes);
      window.removeEventListener('resize', updateThemes);
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(initTimer);
    };
  }, [pathname, navLocked]);

  return (
    <UIContext.Provider value={{ 
      navHidden, 
      navAtTop, 
      activeTheme, 
      bottomTheme,
      navLocked,
      setNavHidden, 
      setNavLocked,
      setNavAtTop,
      setActiveTheme,
      setBottomTheme
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
