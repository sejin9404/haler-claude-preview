'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { db, Device, User } from '@/lib/db';
import { Loader2, CheckCircle2, AlertCircle, Smartphone, ArrowRight, ShieldCheck, Cpu, X, Mail, Check } from 'lucide-react';
import { MEDIA_ASSETS } from '@/lib/mediaConfig';

// --- STYLED COMPONENTS ---

const LiquidBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden isolate bg-[#F8FAFC]">
    <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(28,136,255,0.22)_0%,transparent_60%)] animate-liquid-flow blur-[60px] will-change-transform transform-gpu" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(0,212,255,0.15)_0%,transparent_60%)] animate-liquid-flow-delayed blur-[50px] will-change-transform transform-gpu" />
  </div>
);

const chewyTransition = {
  duration: 0.6,
  ease: [0.32, 0.72, 0, 1]
};

function TapHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'analyzing' | 'new_intro' | 'unauthorized' | 'ready' | 'error'>('loading');
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const deviceId = searchParams.get('d');

  useEffect(() => {
    if (authStep === 'otp') {
      // Small timeout to ensure transition started and input is ready
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 50);
    }
  }, [authStep]);

  useEffect(() => {
    setStatus('analyzing');
    
    // For now, treat all entries as a new device onboarding experience
    const timer = setTimeout(() => {
      setStatus('new_intro');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoginSubmit = () => {
    if (!email) return;
    setAuthStep('otp');
    // We attempt to focus but it might need the DOM element to be present.
    // By removing mode="wait", the OTP element mounts immediately.
  };

  const handleOtpChange = (val: string) => {
    const numericVal = val.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpValue(numericVal);
    if (numericVal.length === 6) {
      if (numericVal === '000000') {
        setIsSuccess(true);
        setTimeout(() => router.push('/pass'), 1500);
      } else {
        setIsError(true);
        setTimeout(() => { setOtpValue(''); setIsError(false); }, 600);
      }
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center bg-[#F8FAFC] overflow-hidden">
      <LiquidBackground />
      
      {/* 1. ANALYZING / SYMBOL STAGE */}
      <AnimatePresence>
        {status === 'analyzing' && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
            className="flex flex-col items-center justify-center min-h-screen z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20"
            >
              <img src={MEDIA_ASSETS.HALER_SYMBOL} alt="Haler Symbol" className="w-full h-full object-contain" />
            </motion.div>
          </motion.div>
        )}

        {/* 2. NEW DEVICE / APP-LIKE ONBOARDING STAGE */}
        {status === 'new_intro' && (
          <motion.div 
            key="new_intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-screen h-[100dvh] w-full max-w-md mx-auto flex flex-col items-center justify-start pb-8 px-6 bg-[#F8FAFC] overflow-hidden notch-safe-hero"
          >
            {/* Top: Welcome Header (Slightly lowered from top) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center z-20 shrink-0"
            >
              <h1 className="text-[2.5rem] md:text-5xl font-bold tracking-tighter text-gray-900 mb-1">Welcome!</h1>
              <p className="text-sm md:text-base text-gray-400 font-medium tracking-tight">Seem like you are first!</p>
            </motion.div>

            {/* Middle: Device Image (Perfectly centered in remaining space) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex-1 w-full flex items-center justify-center z-10"
            >
              <div className="w-full max-w-[210px] md:max-w-[240px] aspect-square flex items-center justify-center">
                <img 
                  src={MEDIA_ASSETS.BLIZ_DEVICE} 
                  alt="BLIZ Device" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as any).src = "https://cdn-icons-png.flaticon.com/512/3663/3663953.png";
                  }}
                />
              </div>
            </motion.div>

            {/* Bottom: Expanding Glass Registration (Anchored at bottom) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, ...chewyTransition }}
              className="w-full bg-white/60 backdrop-blur-[40px] border border-white/60 rounded-[40px] px-6 pt-6 pb-4 shadow-[0_30px_80px_rgba(0,0,0,0.06)] z-20 shrink-0 mb-2"
            >
              <div className="space-y-4 md:space-y-6 text-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2 leading-tight">Register device once!</h2>
                  <p className="text-sm md:text-base font-normal text-gray-500 leading-snug max-w-[320px] mx-auto">
                    Next time you can manage your plans<br className="hidden md:block" /> by just tagging your phone on bliz!
                  </p>
                </div>

                <AnimatePresence>
                  {authStep === 'email' ? (
                    <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative group max-w-md mx-auto">
                      <input 
                        autoFocus
                        type="email" 
                        inputMode="email"
                        autoComplete="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLoginSubmit()}
                        className="w-full h-16 md:h-20 bg-white border-2 border-blue-50/50 rounded-[22px] md:rounded-[28px] pl-6 md:pl-10 pr-16 md:pr-20 outline-none focus:border-pocari-blue/50 focus:shadow-[0_0_20px_rgba(28,136,255,0.15)] transition-all text-lg md:text-xl font-medium text-left caret-transparent shadow-[0_0_15px_rgba(28,136,255,0.1)]"
                      />
                      <button 
                        onClick={handleLoginSubmit}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-pocari-blue text-white rounded-[16px] md:rounded-[20px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                      >
                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="otp" 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: isError ? [0, -10, 10, -10, 10, 0] : 0 }} 
                      exit={{ opacity: 0, x: -20 }}
                      className="relative max-w-md mx-auto"
                    >
                      <div className="flex justify-between gap-2 md:gap-3 pointer-events-none">
                        {[0,1,2,3,4,5].map(i => (
                          <div 
                            key={i} 
                            className={`flex-1 h-12 md:h-16 rounded-[14px] md:rounded-[18px] border flex items-center justify-center text-xl md:text-2xl font-bold transition-all duration-300 ${
                              isSuccess ? 'border-pocari-blue bg-white text-pocari-blue' :
                              isError ? 'border-red-500 bg-red-50 text-red-500' :
                              otpValue[i] ? 'border-pocari-blue bg-white shadow-sm' : 'border-blue-200 bg-white text-gray-400'
                            }`}
                          >
                            {isSuccess ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : otpValue[i] || ''}
                          </div>
                        ))}
                      </div>
                      <input 
                        ref={otpInputRef}
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]*"
                        value={otpValue}
                        onChange={(e) => handleOtpChange(e.target.value)}
                        className="absolute inset-x-0 top-0 h-full opacity-0 caret-transparent cursor-pointer z-10"
                        disabled={isSuccess}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 max-w-md mx-auto pt-0">
                   <button className="flex-1 h-14 md:h-16 bg-white border border-gray-100 rounded-[16px] md:rounded-[20px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm outline-none">
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4 md:w-5 md:h-5" alt="Google" />
                      <span className="text-xs md:text-sm font-bold text-gray-700">Google</span>
                   </button>
                   <button className="flex-1 h-14 md:h-16 bg-black text-white rounded-[16px] md:rounded-[20px] flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-sm outline-none">
                      <svg className="w-4 h-4 md:w-5 md:h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                      <span className="text-xs md:text-sm font-bold">Apple</span>
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. READY / REDIRECT STAGE */}
        {status === 'ready' && (
          <motion.div key="ready" className="flex flex-col items-center z-10">
            <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-400 font-medium">Resuming your airway journey...</p>
          </motion.div>
        )}

        {/* 4. ERROR STAGE */}
        {status === 'error' && (
          <motion.div key="error" className="flex flex-col items-center z-10 px-6">
            <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-8 text-center leading-relaxed">We couldn't recognize this device.<br/>Please try tagging again.</p>
            <button onClick={() => router.push('/')} className="px-10 py-4 bg-black text-white rounded-full font-bold">Home</button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function TapHub() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <TapHubContent />
    </Suspense>
  );
}
