"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Mail, 
  Truck, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useBoardingPass } from "@/context/BoardingPassContext";

export default function SuccessPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [arrivalDate, setArrivalDate] = useState("");
  const { setStatus, setIsLoggedIn } = useBoardingPass();

  useEffect(() => {
    setIsMounted(true);
    // Switch to logged in state and show boarding pass peek
    setIsLoggedIn(true);
    setStatus('peek');
    // Dynamic arrival date: Today + 7 days
    const date = new Date();
    date.setDate(date.getDate() + 7);
    setArrivalDate(date.toLocaleDateString("en-US", { 
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    }));
  }, []);

  const steps = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Check Inbox",
      desc: "A detailed receipt and onboarding guide have been sent."
    },
    {
      icon: <Truck className="w-5 h-5" />,
      title: "Track Box",
      desc: "You'll receive a tracking number as soon as your box ships."
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: "Get Support",
      desc: "Our specialists are here to help 24/7 with any questions."
    }
  ];

  if (!isMounted) return null;

  return (
    <main data-theme="light" className="min-h-screen bg-[#FDFDFD] px-6 flex flex-col items-center notch-safe-hero notch-safe-bottom">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1C88FF]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00D4FF]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* HERO HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 text-emerald-500 font-semibold text-sm mb-8 border border-emerald-100/50 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Reservation Confirmed
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-gray-900 mb-6 font-display">
            You&apos;ve Arrived.
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-lg mx-auto">
            Welcome to the future of cellular nutrition. Your journey to pure hydration starts now.
          </p>
        </motion.div>

        {/* MEMBERSHIP CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 40, rotateX: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ 
            duration: 1.2, 
            delay: 0.5, 
            type: "spring",
            damping: 20
          }}
          className="w-full max-w-[500px] mb-20 relative group"
        >
          {/* CARD GLOW */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#1C88FF] to-[#00D4FF] rounded-[40px] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-1000" />
          
          <div className="relative aspect-[1.6/1] w-full bg-[#0A0A0A] rounded-[38px] p-10 overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
            {/* CARD TEXTURE/OVERLAY */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(28,136,255,0.15)_0%,transparent_70%)]" />
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#1C88FF]/10 blur-[80px]" />
            
            <div className="relative flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/40">Haler Official Membership</span>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  ACTIVE MEMBER
                </div>
              </div>
              <ShieldCheck className="text-white/20 w-8 h-8" />
            </div>

            <div className="mt-8 relative">
              <h2 className="text-4xl font-bold text-white tracking-tight leading-none mb-2">New Member</h2>
              <p className="text-sm text-white/50 font-light flex items-center gap-2">
                Essential Subscription <span className="w-1 h-1 rounded-full bg-white/20" /> Monthly Arrival
              </p>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-white/30 block">First Arrival</span>
                <span className="text-white font-medium text-lg">{arrivalDate}</span>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-white/30 block">Member ID</span>
                <span className="text-white/70 font-mono text-sm tracking-tighter">HL-8829-01X</span>
              </div>
            </div>

            {/* LOGO WATERMARK */}
            <div className="absolute bottom-[-20px] right-[-20px] opacity-10 pointer-events-none rotate-12">
               <Star className="w-48 h-48 text-white fill-white" />
            </div>
          </div>
        </motion.div>

        {/* NEXT STEPS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.02)] transition-all hover:border-[#1C88FF]/30 group"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#1C88FF]/5 group-hover:text-[#1C88FF] transition-colors mb-6">
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* PORTAL BUTTON */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 }}
        >
          <Link href="/">
            <button className="h-16 px-12 bg-[#0A0A0A] hover:bg-black text-white rounded-full font-bold flex items-center gap-4 shadow-xl transition-all hover:translate-y-[-2px] hover:shadow-2xl">
              Go to Member Portal
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>

      </div>

      {/* AMBIENT PARTICLES (Optional Premium Polish) */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <AnimatePresence>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                x: Math.random() * 100 + "%", 
                y: "100%" 
              }}
              animate={{ 
                opacity: [0, 1, 0],
                y: "-10%",
                x: (Math.random() * 100) + (Math.random() * 10 - 5) + "%"
              }}
              transition={{ 
                duration: 5 + Math.random() * 5, 
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-1 h-1 bg-[#1C88FF]/20 rounded-full blur-[1px]"
            />
          ))}
        </AnimatePresence>
      </div>

    </main>
  );
}
