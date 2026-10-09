'use client';

import { useEffect, useState } from 'react';
import SubscribeMobile from '@/components/subscribe/SubscribeMobile';
import SubscribeDesktop from '@/components/subscribe/SubscribeDesktop';

export default function SubscribePage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // 3분할 데스크탑 레이아웃은 와이드 화면(1440px+) 전용 — 1024~1380 구간에서 카드/탭이
    // 뭉개지는 것이 실측 확인돼(2026-07-27 리뷰), 그 아래는 단일 컬럼 레이아웃이 담당.
    const check = () => setIsMobile(window.innerWidth < 1440);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile === null) return null;
  return isMobile ? <SubscribeMobile /> : <SubscribeDesktop />;
}
