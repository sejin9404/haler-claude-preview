'use client';

import { useEffect, useState } from 'react';
import SubscribeMobile from '@/components/subscribe/SubscribeMobile';
import SubscribeDesktop from '@/components/subscribe/SubscribeDesktop';

export default function SubscribePage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile === null) return null;
  return isMobile ? <SubscribeMobile /> : <SubscribeDesktop />;
}
