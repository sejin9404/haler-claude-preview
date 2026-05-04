'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface VeilContextType {
  isVeilVisible: boolean;
  startTransition: (url: string, customDuration?: number) => void;
}

const VeilContext = createContext<VeilContextType | undefined>(undefined);

export function VeilProvider({ children }: { children: React.ReactNode }) {
  const [isVeilVisible, setIsVeilVisible] = useState(false);
  const [isBlurInFinished, setIsBlurInFinished] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Detect when the new page is actually "ready" (pathname changed)
  useEffect(() => {
    if (isVeilVisible) {
      setIsPageReady(true);
    }
  }, [pathname]);

  // Only close the veil when BOTH the minimum blur-in is done AND the page is ready
  useEffect(() => {
    if (isBlurInFinished && isPageReady) {
      const timer = setTimeout(() => {
        setIsVeilVisible(false);
        // Reset states for next transition
        setIsBlurInFinished(false);
        setIsPageReady(false);
      }, 100); // Tiny buffer
      return () => clearTimeout(timer);
    }
  }, [isBlurInFinished, isPageReady]);

  // Safety fallback: 10 seconds
  useEffect(() => {
    if (isVeilVisible) {
      const safetyTimer = setTimeout(() => {
        setIsVeilVisible(false);
        setIsBlurInFinished(false);
        setIsPageReady(false);
      }, 10000); 
      return () => clearTimeout(safetyTimer);
    }
  }, [isVeilVisible]);

  const startTransition = (url: string) => {
    if (url === pathname) {
      setIsVeilVisible(true);
      setTimeout(() => setIsVeilVisible(false), 1000);
      return;
    }

    setIsVeilVisible(true);
    setIsBlurInFinished(false);
    setIsPageReady(false);

    // 1. Guarantee minimum blur-in duration (0.5s)
    setTimeout(() => {
      setIsBlurInFinished(true);
    }, 500);

    // 2. Start navigation after a short delay
    setTimeout(() => {
      router.push(url);
    }, 200); 
  };

  return (
    <VeilContext.Provider value={{ isVeilVisible, startTransition }}>
      {children}
    </VeilContext.Provider>
  );
}

export const useVeil = () => {
  const context = useContext(VeilContext);
  if (!context) {
    throw new Error('useVeil must be used within a VeilProvider');
  }
  return context;
};
