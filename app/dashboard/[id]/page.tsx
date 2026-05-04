'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { db, Device } from '@/lib/db';
import { 
  Activity, 
  Battery, 
  Droplets, 
  Settings, 
  ShieldCheck, 
  MapPin, 
  RefreshCcw,
  Zap,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const params = useParams();
  const deviceId = params.id as string;
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    async function load() {
      const data = await db.getDevice(deviceId);
      setDevice(data);
    }
    load();
  }, [deviceId]);

  return (
    <main className="min-h-screen bg-[#F2F4F7] pb-32">
      <Navbar />
      
      <div className="pt-40 px-[5%] max-w-7xl mx-auto">
        {/* TOP PANEL */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-400 tracking-widest uppercase">Live Status</span>
            </div>
            <h1 className="text-6xl font-light tracking-tighter text-gray-900 leading-none">
              Control <span className="font-extralight text-blue-500">Center</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6 bg-white/50 backdrop-blur-xl p-2 rounded-full border border-white">
            <div className="px-6 py-3 bg-white rounded-full shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Device ID</p>
              <p className="font-semibold text-gray-800">{deviceId}</p>
            </div>
            <button className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-full hover:scale-110 transition-transform">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <GlassWidget 
                icon={<Droplets className="w-8 h-8 text-blue-500" />} 
                label="Hydration Formula" 
                value="92%" 
                sub="Fresh Mint XEM"
                progress={92}
                color="bg-blue-500"
            />
            <GlassWidget 
                icon={<Battery className="w-8 h-8 text-green-500" />} 
                label="Battery" 
                value="74%" 
                sub="Est. 4 days remain"
                progress={74}
                color="bg-green-500"
            />
            <GlassWidget 
                icon={<Activity className="w-8 h-8 text-purple-500" />} 
                label="Airway Status" 
                value="Optimal" 
                sub="Sync 12m ago"
                progress={100}
                color="bg-purple-500"
            />
        </div>

        {/* TWO-COLUMN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
            {/* Primary Action Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 liquid-glass p-12 rounded-[56px] border-white bg-white/40 shadow-2xl flex flex-col justify-between group"
            >
               <div>
                  <div className="flex justify-between items-start mb-12">
                    <h2 className="text-4xl font-light text-gray-800 tracking-tight">Recent Activity</h2>
                    <TrendingUp className="text-blue-500 w-8 h-8" />
                  </div>
                  
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between p-6 bg-white/30 rounded-3xl border border-white/50 hover:bg-white/60 transition-all cursor-pointer">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <Clock className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Airway Hydration Cycle</p>
                            <p className="text-xs text-gray-400">Today, 2:15 PM</p>
                          </div>
                        </div>
                        <span className="text-blue-500 font-medium">+12%</span>
                      </div>
                    ))}
                  </div>
               </div>
               
               <button className="mt-12 w-full py-6 rounded-3xl border-2 border-white bg-white/20 hover:bg-white transition-all text-gray-800 font-medium tracking-tight">
                  View Full Analytics History
               </button>
            </motion.div>

            {/* Side Refill Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black text-white p-12 rounded-[56px] flex flex-col items-center text-center justify-between shadow-[0_40px_100px_rgba(0,0,0,0.15)] relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] pointer-events-none" />
               <div className="z-10">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-10">
                    <Zap className="w-10 h-10 text-blue-400" />
                  </div>
                  <h2 className="text-4xl font-light mb-6 tracking-tighter">Refill <br/><span className="not-italic font-normal">Subscription</span></h2>
                  <p className="text-white/40 font-light leading-relaxed mb-12">Automated shipping active. <br/>Next kit arrives May 12.</p>
               </div>
               
               <button className="z-10 w-full bg-blue-500 text-white py-6 rounded-3xl text-xl font-medium hover:scale-105 transition-transform shadow-xl shadow-blue-500/20">
                  Manage Pass
               </button>
            </motion.div>
        </div>
      </div>
    </main>
  );
}

function GlassWidget({ icon, label, value, sub, progress, color }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="liquid-glass p-10 rounded-[48px] border-white/50 bg-white/30 flex flex-col items-start gap-8"
        >
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                {icon}
            </div>
            <div className="w-full">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-5xl font-light text-gray-900 mb-6 tracking-tighter">{value}</p>
                <div className="w-full h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${color}`} 
                    />
                </div>
                <p className="mt-4 text-xs font-light text-gray-400 tracking-wide">{sub}</p>
            </div>
        </motion.div>
    );
}
