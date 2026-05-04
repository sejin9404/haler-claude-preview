'use client';

import React, { useState, useEffect } from 'react';
import PassDesktop from '@/components/pass/PassDesktop';
import PassMobile from '@/components/pass/PassMobile';

export default function PassPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (isMobile === null) return <div className="min-h-screen bg-[#F8FAFC]" />;

  return isMobile ? <PassMobile /> : <PassDesktop />;
}
