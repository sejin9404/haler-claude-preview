'use client';

// 플랜페이지(/pass) — 새 구독 구성 페이지로 교체.
// 기존 Pass 디자인은 components/pass/PassDesktop·PassMobile 에 그대로 남아 있어 되돌리기 쉽다.
import React, { useState, useEffect } from 'react';
import SubscribeMobile from '@/components/subscribe/SubscribeMobile';
import SubscribeDesktop from '@/components/subscribe/SubscribeDesktop';

export default function PassPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (isMobile === null) return <div className="min-h-screen bg-[#F8FAFC]" />;

  return isMobile ? <SubscribeMobile /> : <SubscribeDesktop />;
}
