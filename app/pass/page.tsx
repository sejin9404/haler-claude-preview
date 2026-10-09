'use client';

// 플랜페이지(/pass) — 새 구독 구성 페이지로 교체.
// 기존 Pass 디자인은 components/pass/PassDesktop·PassMobile 에 그대로 남아 있어 되돌리기 쉽다.
import React, { useState, useEffect } from 'react';
import SubscribeMobile from '@/components/subscribe/SubscribeMobile';
import SubscribeDesktop from '@/components/subscribe/SubscribeDesktop';

export default function PassPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // 3분할 데스크탑 레이아웃은 와이드 화면(1440px+) 전용 — 1024~1380 구간에서 카드/탭이
    // 뭉개지는 것이 실측 확인돼(2026-07-27 리뷰), 그 아래는 단일 컬럼 레이아웃이 담당.
    const check = () => setIsMobile(window.innerWidth < 1440);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Prevent hydration mismatch by not rendering anything until mounted
  if (isMobile === null) return <div className="min-h-screen bg-[#F8FAFC]" />;

  return isMobile ? <SubscribeMobile /> : <SubscribeDesktop />;
}
