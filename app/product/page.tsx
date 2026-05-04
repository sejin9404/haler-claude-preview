'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Shield, Cpu, Zap, Droplets, Wind, Sparkles, Box, Info } from 'lucide-react';
import { MEDIA_ASSETS } from '@/lib/mediaConfig';
import Navbar from '@/components/Navbar';

export default function ProductPage() {
  const [activeTab, setActiveTab] = useState<'bliz' | 'xem'>('bliz');
  const [isScrolled, setIsScrolled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Reset scroll state when switching tabs
  useEffect(() => {
    setIsScrolled(false);
  }, [activeTab]);

  // Typing animation components with Blur-in effect
  const TypingText = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
    const words = text.split(" ");
    return (
      <div className={className}>
        {words.map((word, i) => {
          // Check for the specific phrases to highlight
          const cleanWord = word.replace(/[.,]/g, "").toLowerCase();
          const highlightWords = ["breathing", "formula", "daily", "respiratory", "wellness"];
          const isHighlighted = highlightWords.includes(cleanWord);
          
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: "blur(10px)", y: 5 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.8,
                delay: delay + i * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              className={`inline-block mr-2 ${isHighlighted ? 'font-normal text-gray-900' : 'font-extralight text-gray-400'}`}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    );
  };

  return (
    <main data-theme={activeTab === 'bliz' ? 'dark' : 'light'} className="h-screen w-screen bg-[#F8FAFC] overflow-hidden relative selection:bg-pocari-blue selection:text-white">
      {/* 🎬 Background Dynamic Asset */}
      <div className="fixed inset-0 z-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {activeTab === 'bliz' ? (
            <motion.div
              key="video-bliz"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                scale: 1.1,
                filter: isScrolled ? "blur(0px)" : "blur(5px)"
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover opacity-100"
              >
                <source src={MEDIA_ASSETS.WATERBALL_VIDEO} type="video/mp4" />
              </video>
            </motion.div>
          ) : (
            <motion.div
              key="gif-xem"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                scale: isScrolled ? 0.25 : 1.1,
                filter: isScrolled ? "blur(0px)" : "blur(5px)"
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img 
                src={MEDIA_ASSETS.WATERBALL_GIF} 
                alt="Waterball Background" 
                className="w-full h-full object-cover opacity-100"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Subtle overlay for depth - fades out on scroll */}
        <motion.div 
          animate={{ opacity: isScrolled ? 0 : 1 }}
          className="absolute inset-0 backdrop-blur-[2px] bg-white/5 pointer-events-none" 
        />
      </div>

      <Navbar />

      <div className="relative z-10 px-12 max-w-7xl mx-auto flex flex-col w-full notch-safe-hero notch-safe-bottom">
        
        {/* 🧭 Header Navigation: Toggle (Left) & Start Now (Right) */}
        <div className="flex justify-between items-center w-full mb-16">
          {/* 🎚️ Premium Black Glass Style Toggle Switch - Left */}
          <div className="p-1 bg-black/[0.03] backdrop-blur-[40px] saturate-[200%] contrast-[110%] rounded-full border border-white/40 shadow-sm flex items-center relative h-10 w-[180px] overflow-hidden">
            <motion.div
              layoutId="toggle-bg"
              className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-black/80 backdrop-blur-md rounded-full shadow-md border-t border-white/10"
              animate={{ x: activeTab === 'bliz' ? 0 : '100%' }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab('bliz')}
              className={`flex-1 relative z-10 h-full flex items-center justify-center font-normal text-[11px] tracking-tight transition-all duration-300 ${activeTab === 'bliz' ? 'text-white' : 'text-black'}`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              bliz
            </button>
            <button
              onClick={() => setActiveTab('xem')}
              className={`flex-1 relative z-10 h-full flex items-center justify-center font-normal text-[11px] tracking-tight transition-all duration-300 ${activeTab === 'xem' ? 'text-white' : 'text-black'}`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              xem
            </button>
          </div>

          {/* 🚀 'start now' Button - Right (Symmetrical) */}
          <motion.a
            href="/pass"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-1 bg-black/[0.03] backdrop-blur-[40px] saturate-[200%] contrast-[110%] rounded-full border border-white/40 shadow-sm flex items-center justify-center relative h-10 w-[180px] overflow-hidden cursor-pointer group"
          >
            <div className="absolute inset-1 bg-black/80 backdrop-blur-md rounded-full shadow-md border-t border-white/10 transition-colors group-hover:bg-black/90" />
            <span 
              className="relative z-10 text-white font-normal text-[11px] tracking-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              start now
            </span>
          </motion.a>
        </div>

        {/* 📦 Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'bliz' ? (
            <motion.section
              key="bliz"
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ 
                opacity: 0, 
                filter: "blur(20px)",
                transition: { duration: 0.4, delay: 0, ease: "easeOut" } 
              }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-[70vh] flex flex-col items-center justify-center text-center relative"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <motion.div 
                animate={{ 
                  y: isScrolled ? -150 : 60,
                  scale: isScrolled ? 0.65 : 1
                }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center z-20"
              >
                <div className="inline-flex flex-col items-stretch">
                  <h1 className="text-8xl md:text-[12rem] font-normal tracking-tighter text-gray-900 leading-none text-center">
                    bliz
                  </h1>
                  <div className="flex justify-between w-full mt-[-5px] px-1">
                    {"the daily nebulizer".split("").map((char, index) => (
                      <span 
                        key={index} 
                        className="text-[10px] md:text-[16px] font-normal text-gray-400 uppercase"
                        style={{ display: char === " " ? "inline" : "inline-block", minWidth: char === " " ? "0.4em" : "auto" }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* BLIZ Story Content (Empty for now or add similar typing effect if needed) */}
              <div className="max-w-4xl mt-60 text-center">
                <AnimatePresence>
                  {isScrolled && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <TypingText 
                        className="text-2xl md:text-4xl text-gray-700 font-light leading-snug tracking-tight"
                        text="bliz is the next generation device for"
                        delay={0.5}
                      />
                      <TypingText 
                        className="text-2xl md:text-4xl text-gray-700 font-light leading-snug tracking-tight"
                        text="seamless daily respiratory care."
                        delay={1.2}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="xem"
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ 
                opacity: 0, 
                filter: "blur(20px)",
                transition: { duration: 0.4, delay: 0, ease: "easeOut" } 
              }}
              transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-[70vh] flex flex-col items-center justify-center text-center relative"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <motion.div 
                animate={{ 
                  y: isScrolled ? -150 : 60,
                  scale: isScrolled ? 0.65 : 1
                }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex flex-col items-stretch z-20"
              >
                <h1 className="text-8xl md:text-[12rem] font-normal tracking-tighter text-gray-900 leading-none">
                  xem.
                </h1>
                <div className="flex justify-between w-full mt-[-5px] px-1">
                  {"the hydration formula".split("").map((char, index) => (
                    <span 
                      key={index} 
                      className="text-[10px] md:text-[16px] font-normal text-gray-400 uppercase"
                      style={{ display: char === " " ? "inline" : "inline-block", minWidth: char === " " ? "0.4em" : "auto" }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Story Content with Typing Effect - Simplified to one paragraph and lowered */}
              <div className="max-w-4xl mt-60 text-center">
                <AnimatePresence>
                  {isScrolled && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <TypingText 
                        className="text-2xl md:text-4xl text-gray-700 font-light leading-snug tracking-tight"
                        text="xem is breathing formula that encapsulated"
                        delay={0.5}
                      />
                      <TypingText 
                        className="text-2xl md:text-4xl text-gray-700 font-light leading-snug tracking-tight"
                        text="our essence of daily respiratory wellness."
                        delay={1.2}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
