'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useBoardingPass } from '@/context/BoardingPassContext';
import { useUI } from '@/context/UIContext';
import { useVeil } from '@/context/VeilContext';
import { Star, ChevronUp, ScanFace, ArrowRight, Check, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MobileNavbar() {
  const pathname = usePathname();
  const { navHidden, setNavHidden, activeTheme: globalTheme } = useUI();
  
  // Force light theme on specific light-background pages
  const isLightPage = pathname === '/pass' || pathname === '/success' || pathname === '/login';
  const activeTheme = isLightPage ? 'light' : globalTheme;
  const { openBoardingPass, isLoggedIn, setIsLoggedIn, setStatus } = useBoardingPass();
  const { startTransition } = useVeil();

  // Unified Panel State
  const [activePanel, setActivePanel] = useState<'menu' | 'auth' | null>(null);

  // Auth States (Moved from PremiumCTA)
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { name: 'Product', href: '/product' },
    { name: 'Pass', href: '/pass' },
    { name: 'About', href: '#' },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === '#') return;
    e.preventDefault();
    setActivePanel(null);
    setNavHidden(true);
    startTransition(href);
  };

  const handleLoginSubmit = () => {
    if (!email) return;
    setAuthStep('otp');
  };

  const handleOtpChange = (val: string) => {
    if (isError || isSuccess) return;
    const numericVal = val.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpValue(numericVal);

    if (numericVal.length === 6) {
      if (numericVal === '000000') {
        setIsSuccess(true);
        setTimeout(() => {
          setIsLoggedIn(true);
          setStatus('peek');
          setActivePanel(null);
        }, 1500);
      } else {
        setIsError(true);
        setTimeout(() => {
          setOtpValue('');
          setIsError(false);
        }, 600);
      }
    }
  };

  const handleBioLogin = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setIsLoggedIn(true);
    setStatus('peek');
    setStatus('peek');
    setActivePanel(null);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      alert(error.message);
    }
  };

  return (
    <>
      {/* Backdrop for clicking outside to close */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePanel(null)}
            className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[9999]"
          />
        )}
      </AnimatePresence>

      <div 
        className={`fixed left-1/2 -translate-x-1/2 w-[calc(100%-48px)] z-[10000] ${(navHidden && !activePanel) ? 'pointer-events-none' : 'pointer-events-auto'}`}
        style={{ top: 'calc(env(safe-area-inset-top, 16px) + 8px)' }}
      >
        {/* Main Navbar Pill */}
        <motion.nav
          initial={false}
          animate={{
            y: (navHidden && !activePanel) ? -130 : 0,
            opacity: 1
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full h-14 flex items-center justify-between px-6 rounded-full relative z-[101] pointer-events-auto
            ${activeTheme === 'dark' ? 'bg-white/10 text-white' : 'bg-white/40 text-black'} 
            backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden`}
        >
          {/* Logo with Cross-fade */}
          <Link 
            href="/" 
            onClick={(e) => handleNavClick(e, '/')}
            className="relative h-6 w-20 flex items-center"
          >
            <div className="relative w-full h-full flex items-center">
              <motion.img 
                src="/white.svg" 
                alt="Haler" 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-auto"
                initial={false}
                animate={{ opacity: activeTheme === 'dark' ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              />
              <motion.img 
                src="/black.svg" 
                alt="Haler" 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-auto"
                initial={false}
                animate={{ opacity: activeTheme === 'dark' ? 0 : 1 }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            {!isLoggedIn && (
              <button
                onClick={() => setActivePanel(activePanel === 'auth' ? null : 'auth')}
                className={`px-4 py-2 rounded-full font-bold text-[12px] transition-all duration-700 active:scale-95 whitespace-nowrap backdrop-blur-md border
                  ${activeTheme === 'dark' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-black/80 text-white border-white/10 shadow-lg'}`}
              >
                Get Started
              </button>
            )}
            
            <button 
              onClick={() => setActivePanel(activePanel ? null : 'menu')}
              className="relative w-6 h-6 flex flex-col items-center justify-center gap-[5px]"
            >
              <motion.div 
                animate={{ 
                  ...(activePanel ? { rotate: 45, y: 6.5, width: '22px' } : { rotate: 0, y: 0, width: '20px' }),
                  backgroundColor: activeTheme === 'dark' ? '#ffffff' : '#000000'
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-[1.5px] rounded-full" 
              />
              <motion.div 
                animate={{ 
                  ...(activePanel ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }),
                  backgroundColor: activeTheme === 'dark' ? '#ffffff' : '#000000'
                }}
                transition={{ duration: 0.5 }}
                className="w-5 h-[1.5px] rounded-full" 
              />
              <motion.div 
                animate={{ 
                  ...(activePanel ? { rotate: -45, y: -6.5, width: '22px' } : { rotate: 0, y: 0, width: '20px' }),
                  backgroundColor: activeTheme === 'dark' ? '#ffffff' : '#000000'
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-[1.5px] rounded-full" 
              />
            </button>
          </div>
        </motion.nav>

        {/* Seed.com Style Expanding Universal Panel */}
        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div
              key={activePanel}
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ 
                height: 'auto', 
                opacity: 1, 
                marginTop: 8,
                backgroundColor: activeTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)',
                color: activeTheme === 'dark' ? '#ffffff' : '#000000'
              }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="w-full overflow-hidden rounded-[32px] backdrop-blur-2xl border border-white/20 shadow-2xl"
            >
              {activePanel === 'menu' ? (
                /* MENU CONTENT */
                <div className="p-8 pt-6 space-y-6">
                  {menuItems.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 + 0.2 }}
                    >
                      <Link 
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className="text-4xl font-light block tracking-tighter hover:opacity-60 transition-opacity"
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  <div className="pt-8 border-t border-white/10 flex gap-6 text-sm font-medium opacity-60">
                    <span>Instagram</span>
                    <span>Support</span>
                    <span>Legal</span>
                  </div>
                </div>
              ) : (
                /* AUTH CONTENT (PREMIUM CTA) */
                <div className="p-8 pt-6 space-y-8">
                  <div className="space-y-1 text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Ready to join?</h2>
                    <p className="opacity-60 text-sm font-normal italic">Start your daily breath care today</p>
                  </div>

                  {/* 1. GET FREE TRIAL KIT (NEW) */}
                  <button 
                    onClick={() => {
                      setActivePanel(null);
                      startTransition('/product');
                    }}
                    className={`w-full py-5 rounded-[24px] font-bold text-lg flex items-center justify-center transition-all duration-700 active:scale-95 whitespace-nowrap backdrop-blur-md border relative overflow-hidden
                      ${activeTheme === 'dark' 
                        ? 'bg-white/20 text-white border-white/30' 
                        : 'bg-black/80 text-white border-white/10 shadow-lg'}`}
                  >
                    <div className="relative h-6 flex-1 flex items-center justify-center">
                      <motion.span 
                        initial={false}
                        animate={{ opacity: activeTheme === 'dark' ? 1 : 0 }}
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                      >
                        Get free trial kit
                      </motion.span>
                      <motion.span 
                        initial={false}
                        animate={{ opacity: activeTheme === 'dark' ? 0 : 1 }}
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                      >
                        Get free trial kit
                      </motion.span>
                      {/* Hidden spacer to maintain width */}
                      <span className="opacity-0">Get free trial kit</span>
                    </div>
                  </button>

                  <div className="relative flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-current opacity-10" />
                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">sign in</span>
                    <div className="flex-1 h-[1px] bg-current opacity-10" />
                  </div>

                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {authStep === 'email' ? (
                        <motion.div 
                          key="email"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          <div className="relative">
                            <input 
                              type="email" 
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={`w-full h-16 rounded-[24px] px-6 outline-none transition-all duration-700 placeholder:text-black/30 backdrop-blur-md border
                                ${activeTheme === 'dark' 
                                  ? 'bg-white/45 text-white border-white/50 focus:bg-white/55 focus:border-white/70' 
                                  : 'bg-black/5 text-black border-black/5 shadow-sm focus:bg-black/10'}`}
                            style={{ color: activeTheme === 'dark' ? 'white' : 'black' }}
                            />
                            <button 
                              onClick={handleLoginSubmit}
                              className="absolute right-2 top-2 bottom-2 aspect-square bg-[#1C88FF] text-white rounded-[18px] flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* 2. SOCIAL & FACE ID LOGIN (REORDERED & SPACED) */}
                          <div className="flex flex-col gap-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => handleSocialLogin('google')}
                                className="h-16 bg-black/60 rounded-[20px] flex items-center justify-center gap-3 hover:bg-black/70 transition-all active:scale-95"
                              >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="text-sm font-bold text-white/90">Google</span>
                              </button>
                              <button 
                                onClick={() => handleSocialLogin('apple')}
                                className="h-16 bg-black/60 rounded-[20px] flex items-center justify-center gap-3 hover:bg-black/70 transition-all active:scale-95"
                              >
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                                <span className="text-sm font-bold text-white/90">Apple</span>
                              </button>
                            </div>

                            <button 
                              onClick={handleBioLogin}
                              className="w-full py-5 bg-[#1C88FF]/85 backdrop-blur-md text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#1C88FF]/95 transition-all"
                            >
                              {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full" /> : <ScanFace className="w-6 h-6" />}
                              Verify with Face ID
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="otp"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, x: isError ? [0, -10, 10, -10, 10, 0] : 0 }}
                          className="space-y-6"
                        >
                          <div className="flex justify-center gap-2">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <div 
                                key={i}
                                className={`w-10 h-14 rounded-[12px] border flex items-center justify-center text-xl font-bold transition-all
                                  ${isSuccess ? 'border-[#1C88FF] bg-white text-[#1C88FF]' :
                                    isError ? 'border-red-500 bg-red-50 text-red-500' :
                                    otpValue[i] ? 'border-[#1C88FF]/40 bg-white/10' : 'border-white/20 bg-white/5'}`}
                              >
                                {isSuccess ? <Check className="w-6 h-6" /> : otpValue[i] || '-'}
                              </div>
                            ))}
                          </div>
                          <input 
                            autoFocus
                            type="text"
                            maxLength={6}
                            value={otpValue}
                            onChange={(e) => handleOtpChange(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-default"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
