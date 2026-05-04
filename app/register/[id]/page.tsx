'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { db, Device } from '@/lib/db';
import { Smartphone, ShieldCheck, Zap, ArrowRight, Loader2, Cpu, Globe, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function RegisterDevice() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;
  
  const [device, setDevice] = useState<Device | null>(null);
  const [phase, setPhase] = useState<'scanning' | 'ready' | 'success'>('scanning');

  useEffect(() => {
    // 2초 정도 '기기 스캐닝' 감성을 보여준 후 실제 정보 표시
    const timer = setTimeout(() => {
      async function load() {
        const data = await db.getDevice(deviceId);
        setDevice(data);
        setPhase('ready');
      }
      load();
    }, 2500);
    return () => clearTimeout(timer);
  }, [deviceId]);

  const handleRegister = async () => {
    setPhase('success');
    const user = await db.getCurrentUser();
    await db.registerDevice(deviceId, user.id);
    
    // 성공 메시지 노출 후 대시보드 이동
    setTimeout(() => router.push(`/dashboard/${deviceId}`), 3000);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden relative">
      <Navbar />
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full" />
      
      <div className="relative z-10 px-6 flex flex-col items-center justify-center min-h-screen notch-safe-hero notch-safe-bottom">
        <AnimatePresence mode="wait">
          {phase === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-48 h-48 mb-12">
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ping" />
                <div className="absolute inset-4 border-2 border-blue-400/50 rounded-full animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-16 h-16 text-blue-400" />
                </div>
              </div>
              <h2 className="text-3xl font-light tracking-widest uppercase mb-4">Identifying Device</h2>
              <p className="text-white/40 font-light tracking-wide uppercase text-sm">Searching for Haler BLIZ signature...</p>
            </motion.div>
          )}

          {phase === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-xl w-full"
            >
              <div className="liquid-glass p-12 rounded-[60px] border-white/10 bg-white/5 backdrop-blur-3xl text-center">
                <div className="inline-block px-4 py-2 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                  NEW DEVICE DETECTED
                </div>
                
                <h1 className="text-5xl font-light tracking-tighter mb-6 leading-tight">
                  Welcome to the <br/><span className="text-blue-500">Haler Ecosystem</span>
                </h1>
                
                <div className="flex flex-col gap-4 mb-12">
                  <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl text-left border border-white/5">
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="font-medium">Device Secure</p>
                      <p className="text-white/40 text-sm">Genuine BLIZ Unit (ID: {deviceId})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl text-left border border-white/5">
                    <Zap className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="font-medium">Instant Integration</p>
                      <p className="text-white/40 text-sm">Unlock cloud refills & health analytics.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleRegister}
                  className="w-full bg-white text-black py-6 rounded-full text-xl font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-3 overflow-hidden group relative"
                >
                  <span className="relative z-10">Connect & Activate</span>
                  <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out opacity-20" />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
                className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_80px_rgba(59,130,246,0.5)]"
              >
                <Check className="w-16 h-16 text-white stroke-[3px]" />
              </motion.div>
              <h1 className="text-6xl font-light tracking-tighter mb-4">Device Activated</h1>
              <p className="text-white/40 text-xl font-light tracking-wide">Syncing with your profile. Please hold...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
