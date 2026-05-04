'use client';

import React, { useState, useEffect } from 'react';
import MobileNavbar from './MobileNavbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useBoardingPass } from '@/context/BoardingPassContext';
import { useUI } from '@/context/UIContext';
import { useVeil } from '@/context/VeilContext';

// Desktop Version (Extracted from previous Navbar logic)
function DesktopNavbar() {
  const { navHidden, setNavHidden, navAtTop, activeTheme } = useUI();
  const { openBoardingPass } = useBoardingPass();
  const { startTransition } = useVeil();

  const menuItems = [
    { name: 'Product', href: '/product' },
    { name: 'Flaverage', href: '#' },
    { name: 'Pass', href: '/pass' },
    { name: 'Embasship', href: '#' },
    { name: 'About', href: '#' },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === '#') return;
    e.preventDefault();
    setNavHidden(true);
    startTransition(href);
  };

  return (
    <nav className={`navbar hydrate-fade ${activeTheme === 'dark' ? 'theme-dark' : 'theme-light'} ${navAtTop ? 'nav-at-top' : ''} ${navHidden ? 'nav-hidden' : ''} visible hidden md:flex`}>
      <div className="nav-logo-container">
        <Link href="/" className="nav-logo" onClick={(e) => handleNavClick(e, '/')}>
          <img src="/white.svg" alt="Haler Logo" className="logo-white" />
          <img src="/black.svg" alt="Haler Logo" className="logo-black" />
          <img src="/images/halersymbol.png" alt="Haler Symbol" className="logo-symbol" />
        </Link>
      </div>

      <div className="nav-links">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href} onClick={(e) => handleNavClick(e, item.href)}>
            {item.name}
          </Link>
        ))}
      </div>

      <div className="nav-icons">
        <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
        <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <svg onClick={openBoardingPass} className="cursor-pointer" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      </div>
    </nav>
  );
}

export default function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
    </>
  );
}
