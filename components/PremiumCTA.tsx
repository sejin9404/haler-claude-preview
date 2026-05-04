'use client';

/**
 * 🔐 GLOBAL PREMIUM CTA LOCKED
 * -------------------------------------------
 * This is a shared global component. 
 * DO NOT modify styles or structure for specific pages within this file.
 * Any request to update the CTA should be applied here to affect the entire site.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronUp, ScanFace, ArrowRight, Check, Gift } from 'lucide-react';
import { useBoardingPass } from "@/context/BoardingPassContext";
import { supabase } from '@/lib/supabase';

import { useUI } from "@/context/UIContext";

const PremiumCTA = () => {
  const { isLoggedIn, setIsLoggedIn, setStatus } = useBoardingPass();
  const { navHidden, bottomTheme } = useUI();
  const [isExpanded, setIsExpanded] = useState(false);
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const ctaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ctaRef.current && !ctaRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        // Reset auth step if user clicks out
        setAuthStep('email');
        setOtpValue('');
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  if (isLoggedIn) return null;

  const isDark = bottomTheme === 'dark';

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
    <div 
      data-bottom-theme={bottomTheme}
      data-is-dark={isDark}
      className={`fixed bottom-12 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none ${isDark ? 'theme-dark' : 'theme-light'}`}
    >
      <motion.div 
        ref={ctaRef}
        layout
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: navHidden && !isExpanded ? 150 : 0, 
          opacity: navHidden && !isExpanded ? 0 : 1,
          borderRadius: 40
        }}
        transition={{ 
          y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.4 },
          borderRadius: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
          layout: { 
            type: "tween", 
            duration: 0.5,
            ease: [0.32, 0.72, 0, 1]
          },
        }}
        className={`h-auto bg-[#1C88FF]/[0.08] backdrop-blur-[40px] saturate-[200%] contrast-[110%] overflow-hidden shadow-[0_40px_100px_rgba(28,136,255,0.2)] border border-white/40 pointer-events-auto transition-all duration-500 w-full md:w-[512px] max-w-[calc(100vw-48px)] md:max-w-none`}
      >
        <div className={`${isExpanded ? 'p-8' : 'px-8 py-3'} relative transition-all duration-500`}>
          <AnimatePresence mode="wait" initial={false}>
            {!isExpanded ? (
              <motion.div 
                key="collapsed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { duration: 0.3 } 
                }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="flex items-center justify-between min-h-[36px] cursor-pointer w-full gap-4"
                onClick={() => setIsExpanded(true)}
              >
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-[15px] md:text-xl font-bold theme-text tracking-tight whitespace-nowrap">Start now with free device</span>
                </div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className={`px-5 md:px-6 py-2.5 md:py-3 rounded-full font-bold text-[13px] md:text-sm flex items-center gap-3 transition-all duration-700 cursor-pointer group flex-shrink-0 whitespace-nowrap relative overflow-hidden backdrop-blur-md border
                    ${isDark 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'bg-black/80 text-white border-white/10 shadow-lg'}`}
                >
                   <div className="relative h-4 flex-1 flex items-center justify-center">
                     <motion.span 
                       initial={false}
                       animate={{ opacity: isDark ? 1 : 0 }}
                       className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                     >
                       Join Now
                     </motion.span>
                     <motion.span 
                       initial={false}
                       animate={{ opacity: isDark ? 0 : 1 }}
                       className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                     >
                       Join Now
                     </motion.span>
                     <span className="opacity-0">Join Now</span>
                   </div>
                   <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                key="expanded"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, transition: { duration: 0.4 } }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                   <div>
                      <h2 className="text-3xl font-bold theme-text mb-2">Ready to join?</h2>
                      <p className="theme-subtext text-sm font-medium">Secure your Haler Pass with Face ID or Email.</p>
                   </div>
                   <button 
                     onClick={() => { setIsExpanded(false); setAuthStep('email'); setOtpValue(''); }} 
                     className="theme-subtext hover:theme-text transition-colors p-2"
                   >
                      <ChevronUp className="rotate-180 w-8 h-8" />
                   </button>
                </div>

                {/* Biometrics */}
                <button 
                  onClick={handleBioLogin}
                  className="w-full py-6 bg-[#1C88FF]/85 backdrop-blur-md text-white rounded-[24px] font-bold text-xl flex items-center justify-center gap-3 hover:bg-[#1C88FF]/95 transition-all"
                >
                   {loading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white animate-spin rounded-full" /> : <ScanFace className="w-6 h-6" />}
                   Verify with Face ID
                </button>

                {/* Social Login Grid (Added for consistency) */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center justify-center gap-3 bg-black/60 py-5 rounded-[24px] hover:bg-black/70 transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="font-bold text-sm text-white/90">Google</span>
                  </button>
                  <button 
                    onClick={() => handleSocialLogin('apple')}
                    className="flex items-center justify-center gap-3 bg-black/60 py-5 rounded-[24px] hover:bg-black/70 transition-all active:scale-95"
                  >
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                    <span className="font-bold text-sm text-white/90">Apple</span>
                  </button>
                </div>

                {/* Separator */}
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 h-[1px] bg-current opacity-10" />
                  <span className="text-xs font-bold opacity-20 uppercase tracking-widest theme-text">OR</span>
                  <div className="flex-1 h-[1px] bg-current opacity-10" />
                </div>

                {/* Multi-step Auth Area */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    {authStep === 'email' ? (
                      <motion.div 
                        key="email-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center space-y-6"
                      >
                        <div className="relative group">
                          <input 
                            type="email" 
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleLoginSubmit();
                            }}
                            className={`w-full h-[72px] rounded-[24px] px-8 outline-none transition-all duration-700 text-lg font-medium placeholder:opacity-30 backdrop-blur-md border
                              ${isDark 
                                ? 'bg-white/45 text-white border-white/50 focus:bg-white/55 focus:border-white/70' 
                                : 'bg-black/5 text-black border-black/5 shadow-sm focus:bg-black/10'}`}
                            style={{ color: isDark ? 'white' : 'black' }}
                          />
                          <button 
                            onClick={handleLoginSubmit}
                            className="absolute right-3 top-3 bottom-3 aspect-square bg-pocari-blue text-white rounded-[18px] flex items-center justify-center hover:scale-105 transition-transform active:scale-95 shadow-lg"
                          >
                            <ArrowRight className="w-6 h-6" />
                          </button>
                        </div>
                        <button 
                          className="text-sm font-bold theme-subtext hover:theme-text transition-colors"
                        >
                          or use other login method
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="otp-view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          x: isError ? [0, -10, 10, -10, 10, 0] : 0
                        }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ 
                          x: isError ? { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.3 }
                        }}
                        className="text-center space-y-6"
                      >
                        <div className="flex justify-center gap-3">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div 
                              key={i}
                              className={`w-12 h-[72px] rounded-[16px] border-2 flex items-center justify-center text-2xl font-bold font-outfit transition-all duration-500 ${
                                isSuccess ? 'border-pocari-blue bg-white shadow-[0_0_30px_rgba(28,136,255,0.4)] text-pocari-blue' :
                                isError ? 'border-red-500 bg-red-50 text-red-500' :
                                otpValue[i] ? 'border-pocari-blue/40 bg-white/80 text-pocari-blue' : 
                                i === otpValue.length ? 'border-pocari-blue bg-white/45 shadow-[0_0_20px_rgba(28,136,255,0.2)]' : 'border-white/50 bg-white/45'
                              }`}
                            >
                              {isSuccess ? (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ 
                                    type: "spring", 
                                    stiffness: 300, 
                                    damping: 20,
                                    delay: i * 0.05 
                                  }}
                                >
                                  <Check className="w-8 h-8" strokeWidth={3} />
                                </motion.div>
                              ) : (
                                <span className={otpValue[i] ? 'theme-text' : 'opacity-20 theme-text'}>{otpValue[i] || '-'}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <input 
                          autoFocus
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={otpValue}
                          onChange={(e) => handleOtpChange(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-default"
                          disabled={isSuccess}
                        />
                        <button 
                          onClick={() => { if(!isSuccess) { setAuthStep('email'); setOtpValue(''); setIsError(false); } }}
                          className={`text-sm font-bold transition-all duration-300 ${
                            isSuccess ? 'text-pocari-blue opacity-100 scale-110' : 'theme-subtext hover:theme-text'
                          }`}
                        >
                          {isSuccess ? 'Verified Successfully' : 'Use another email'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumCTA;
