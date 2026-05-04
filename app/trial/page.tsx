'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Package, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Poppins, Syne } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });
const syne = Syne({ subsets: ['latin'], weight: ['600', '700', '800'] });

export default function TrialKitPage() {
  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-black ${poppins.className} overflow-x-hidden`}>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center backdrop-blur-md bg-white/70 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${syne.className}`}>HALER</span>
        </Link>
        <Link href="/pass" className="text-sm font-bold text-slate-500 hover:text-black transition-colors">
          Plans
        </Link>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[12px] font-bold tracking-widest uppercase mb-4 shadow-sm">Exclusive Offer</span>
          <h1 className={`text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight ${syne.className} leading-[1.1]`}>
            Claim Your <br />
            <span className="text-blue-600">Free Trial Kit</span>
          </h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-md mx-auto">
            Experience the difference of personalized airway care. Start your journey with our curated trial essentials.
          </p>
        </motion.div>

        {/* PRODUCT VISUAL CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[40px] p-8 mb-12 shadow-[0_20px_80px_-20px_rgba(0,128,255,0.15)] relative overflow-hidden group border border-slate-50"
        >
          <div className="relative z-10">
            <div className="flex justify-center mb-10">
              <div className="relative">
                <motion.div 
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-48 h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl flex items-center justify-center p-8"
                >
                  <Package size={80} className="text-white opacity-90" />
                </motion.div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Status</span>
                  <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs uppercase">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Available
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap size={20} className="text-blue-500" />
                What's inside your kit
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "Personalized Bliz Pack", desc: "10 initial servings tailored to your profile", icon: "✨" },
                  { title: "Usage Guide", desc: "Step-by-step instructions for maximum effect", icon: "📖" },
                  { title: "Health Tracker", desc: "QR code to track your weekly progress", icon: "📱" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-[15px]">{item.title}</h4>
                      <p className="text-slate-500 text-[13px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* DECORATIVE ELEMENTS */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px] pointer-events-none" />
        </motion.div>

        {/* ORDER FORM SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black text-white rounded-[40px] p-10 shadow-2xl shadow-blue-900/20"
        >
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="text-blue-400" size={24} />
            <h3 className="text-xl font-bold tracking-tight">Shipping Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input type="text" placeholder="John" className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input type="text" placeholder="Doe" className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Shipping Address</label>
              <input type="text" placeholder="123 Airway Lane, Breath City" className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500 transition-colors" />
            </div>

            <button className="w-full mt-6 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all active:scale-[0.98] shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 group">
              Ship My Kit For Free
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center text-slate-500 text-[11px] mt-6 font-medium">
              By claiming, you agree to our Terms of Service. Shipping is 100% covered.
            </p>
          </div>
        </motion.div>
        
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-black transition-colors font-bold text-sm">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
