'use client';

import { useState, useEffect } from 'react';
import HomeDesktop from '@/components/home/HomeDesktop';
import HomeMobile from '@/components/home/HomeMobile';

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show a loading or empty state during SSR/Initial mounting
  if (isMobile === null) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <>
      {isMobile ? <HomeMobile /> : <HomeDesktop />}
    </>
  );
}
