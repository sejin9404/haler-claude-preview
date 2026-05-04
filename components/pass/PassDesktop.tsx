'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { themes, benefitPills, plans, getPlanLimit } from '@/app/pass/passData';

// 🌊 Liquid Background Components
const LiquidBackground = ({ isVisible }: { isVisible: boolean }) => (
  <div 
    className="fixed inset-0 pointer-events-none z-0 overflow-hidden isolate bg-[#F8FAFC]"
    style={{ display: isVisible ? 'block' : 'none' }}
  >
    <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(28,136,255,0.22)_0%,transparent_60%)] animate-liquid-flow blur-[60px] will-change-transform transform-gpu" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(0,212,255,0.15)_0%,transparent_60%)] animate-liquid-flow-delayed blur-[50px] will-change-transform transform-gpu" />
  </div>
);

export default function PassDesktop() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>('essential');
  const [isStep2Open, setIsStep2Open] = useState(false);
  const [hoveredPill, setHoveredPill] = useState<number | null>(null);
  const [activeTheme, setActiveTheme] = useState(0);
  const [prevTheme, setPrevTheme] = useState(0);
  const [activeFlavorId, setActiveFlavorId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState<string | null>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set default flavor when theme changes
  React.useEffect(() => {
    setPrevTheme(activeTheme);
    if (activeTheme === 5) {
      setActiveFlavorId(null);
      return;
    }
    const currentFlavors = themes[activeTheme]?.flavors;
    if (currentFlavors && currentFlavors.length > 0) {
      setActiveFlavorId(currentFlavors[0].id);
    } else {
      setActiveFlavorId(null);
    }
  }, [activeTheme]);

  const handleAddToCart = (flavorId: string) => {
    const total = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const limit = getPlanLimit(selectedPlan);
    if (total >= limit) return;
    setCart(prev => ({ ...prev, [flavorId]: (prev[flavorId] || 0) + 1 }));
  };

  const handleRemoveFromCart = (flavorId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[flavorId] > 1) newCart[flavorId]--;
      else delete newCart[flavorId];
      return newCart;
    });
  };

  return (
    <div className="hidden md:block">
      <LiquidBackground isVisible={!isStep2Open} />
      <div className="relative z-10 w-full">
        {/* HERO SECTION */}
        <section data-theme="light" className="relative pt-52 pb-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center w-full"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 mb-6 leading-[0.9]">
              Make your routine
            </h1>
            <motion.p 
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-8"
            >
              Choose your plan depending on your lifestyle.
            </motion.p>

            <div className="flex flex-col items-center mb-10">
              <div className="inline-flex flex-col items-stretch">
                {/* Pills Row */}
                <div className="flex flex-wrap justify-center gap-2.5 items-center py-2">
                  {benefitPills.map((pill, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ 
                        duration: 0.5,
                        delay: 0.4 + (i * 0.05),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      onHoverStart={() => setHoveredPill(i)}
                      onHoverEnd={() => setHoveredPill(null)}
                      className={`flex items-center gap-2.5 px-5 h-[46px] bg-white border rounded-full cursor-pointer transition-all duration-300 ${
                        hoveredPill === i 
                        ? "border-pocari-blue/40 shadow-[0_12px_24px_rgba(28,136,255,0.12)] -translate-y-0.5" 
                        : "border-gray-100/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                      }`}
                    >
                      <span className="text-pocari-blue flex-shrink-0">{pill.icon}</span>
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{pill.title}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Description Bar Row */}
                <div className="h-[46px] mt-6 flex justify-center items-center w-full">
                  <AnimatePresence mode="wait">
                    {hoveredPill !== null ? (
                      <motion.div
                        key={hoveredPill}
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        className="w-full h-full bg-gradient-to-r from-[#1C88FF]/90 to-[#00D4FF]/80 backdrop-blur-xl ring-1 ring-white/30 bg-clip-padding rounded-full shadow-[0_15px_45px_rgba(28,136,255,0.2)] flex items-center justify-center px-10 text-center"
                      >
                        <p className="text-[14px] md:text-base text-white font-bold leading-none tracking-wide whitespace-nowrap">
                          {benefitPills[hoveredPill].description}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] text-gray-300 tracking-[0.3em] font-light uppercase text-center"
                      >
                        Hover each pill to explore details
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mt-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
                animate={{ 
                  opacity: 1, 
                  y: selectedPlan === plan.id ? -10 : 0,
                  scale: selectedPlan === plan.id ? 1.05 : 1,
                  filter: "blur(0px)",
                  borderColor: selectedPlan === plan.id ? 'rgba(28, 136, 255, 0.5)' : 'rgba(243, 244, 246, 0.3)',
                  backgroundColor: selectedPlan === plan.id ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.4)'
                }}
                whileHover={{ 
                  scale: selectedPlan === plan.id ? 1.05 : 1.02,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  opacity: { duration: 0.6, delay: 0.7 },
                  y: { duration: 0.4, delay: isMounted ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] },
                  filter: { duration: 0.6, delay: 0.7 },
                  scale: { duration: 0.4 },
                  borderColor: { duration: 0.4 },
                  backgroundColor: { duration: 0.4 }
                }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative cursor-pointer group p-10 pt-14 rounded-[48px] border-2 flex flex-col items-center ${
                  selectedPlan === plan.id 
                  ? 'backdrop-blur-[40px] shadow-[0_50px_100px_rgba(28,136,255,0.18)] z-10' 
                  : 'backdrop-blur-[8px] opacity-70 hover:opacity-100'
                }`}
              >
                {selectedPlan === plan.id && (
                  <div className="absolute inset-0 rounded-[48px] overflow-hidden pointer-events-none">
                    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(28,136,255,0.08)_0%,transparent_70%)] animate-pulse" />
                  </div>
                )}

                {(plan.isPopular || plan.isBestValue) && (
                  <div className={`absolute top-0 inset-x-0 mx-auto w-max -translate-y-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-colors duration-500 ${
                    plan.isPopular ? 'bg-pocari-blue text-white shadow-[0_10px_25px_rgba(28,136,255,0.3)]' : 'bg-[#0052FF] text-white shadow-[0_10px_25px_rgba(0,82,255,0.3)]'
                  }`}>
                    {plan.tag}
                  </div>
                )}
                
                <div className="text-center w-full mb-10">
                  <motion.h3 
                    animate={{ color: selectedPlan === plan.id ? '#111827' : '#9CA3AF' }}
                    className="text-4xl font-bold group-hover:text-gray-900"
                  >
                    {plan.title}
                  </motion.h3>
                </div>

                <ul className="space-y-4 mb-10 flex-1 w-full flex flex-col items-start px-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-500 font-medium">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${selectedPlan === plan.id ? 'bg-pocari-blue/10 text-pocari-blue' : 'bg-gray-100 text-gray-300 group-hover:bg-pocari-blue/10 group-hover:text-pocari-blue'}`}>
                        {feature.icon}
                      </div>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <motion.button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedPlan === plan.id) setIsStep2Open(true);
                    else setSelectedPlan(plan.id);
                  }}
                  onMouseEnter={() => setIsButtonHovered(plan.id)}
                  onMouseLeave={() => setIsButtonHovered(null)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                  className={`w-full py-5 rounded-[24px] font-bold transition-all duration-300 flex items-center justify-center overflow-hidden relative min-h-[64px] ${
                    selectedPlan === plan.id ? 'bg-pocari-blue text-white shadow-lg shadow-pocari-blue/25' : 'bg-gray-100 text-gray-400 group-hover:bg-pocari-blue group-hover:text-white'
                  }`}
                >
                  <AnimatePresence>
                    {isButtonHovered === plan.id && selectedPlan === plan.id ? (
                      <motion.div
                        key="selected"
                        initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        exit={{ opacity: 0, filter: "blur(4px)", y: -8 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute flex items-center gap-2"
                      >
                        <span className="text-lg tracking-tight">Curate your flavor</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="unselected"
                        initial={{ opacity: 0, filter: "blur(4px)", y: 8 }}
                        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        exit={{ opacity: 0, filter: "blur(4px)", y: -8 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute text-xl font-bold tracking-tight"
                      >
                        ${plan.price}/mo
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* STEP 2 MODAL */}
      <AnimatePresence>
        {isStep2Open && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStep2Open(false)}
              className="absolute inset-0 bg-white/20 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              className={`relative w-full max-w-5xl h-[82vh] rounded-[48px] shadow-[0_50px_120px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col transition-colors duration-500 ${activeTheme === 5 ? 'bg-white' : 'bg-[#F8FAFC]'}`}
            >
              {/* PERSISTENT HEADER */}
              <div className="absolute top-10 left-10 right-10 z-[60] flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto">
                  <h3 className={`text-3xl font-medium tracking-tight transition-colors duration-500 ${activeTheme === 5 ? 'text-gray-900' : 'text-white'}`}>
                    Curation Studio
                  </h3>
                  <p className={`font-normal mt-1 transition-colors duration-500 ${activeTheme === 5 ? 'text-gray-400' : 'text-white/60'}`}>
                    {activeTheme === 5 ? 'All Collection Explorer' : 'Explore our 5 sensory themes.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsStep2Open(false)}
                  className={`w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center transition-all pointer-events-auto ${activeTheme === 5 ? 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* DASHBOARD STAGE */}
              <AnimatePresence>
                {activeTheme !== 5 && (
                  <motion.div
                    key="theater-stage"
                    initial={{ y: "-105%", height: 0 }}
                    animate={{ y: 0, height: '55%' }}
                    exit={{ y: "-105%", height: 0 }}
                    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                    className="relative flex-shrink-0 w-full overflow-hidden bg-black z-50 shadow-2xl"
                  >
                    <div className="absolute inset-0 w-full h-full">
                      <AnimatePresence mode="wait">
                        <motion.div key={activeTheme} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
                          {themes[activeTheme]?.video && (
                            <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-cover scale-105">
                              <source src={themes[activeTheme].video} type="video/mp4" />
                            </video>
                          )}
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 top-28 flex items-center justify-center px-10">
                      <div className="w-full max-w-5xl min-h-[360px] bg-black/40 backdrop-blur-[40px] rounded-[50px] border border-white/10 shadow-2xl flex flex-col p-12 gap-10 overflow-hidden">
                        
                        <div className="flex flex-col md:flex-row items-end justify-between gap-12">
                          <AnimatePresence mode="wait">
                            <motion.div 
                              key={activeTheme} 
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              exit={{ opacity: 0, y: -10 }} 
                              transition={{ duration: 0.5 }}
                              className="flex-shrink-0"
                            >
                              <h2 className="text-6xl md:text-7xl font-medium text-white tracking-tighter leading-none lowercase">
                                {themes[activeTheme]?.name}
                              </h2>
                            </motion.div>
                          </AnimatePresence>

                          <div className="flex-1 max-w-sm md:ml-auto">
                            <AnimatePresence mode="wait">
                              <motion.p 
                                key={activeTheme} 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }} 
                                transition={{ duration: 0.5 }} 
                                className="text-base text-white/40 font-normal leading-[1.6] text-right whitespace-pre-line line-clamp-3 ml-auto"
                              >
                                {themes[activeTheme]?.description}
                              </motion.p>
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-16 relative">
                          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                          
                          <div className="flex flex-col gap-6">
                            <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">Formula Composition</span>
                            <div className="flex flex-col gap-5">
                              {themes[activeTheme]?.formula?.map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                  <div className="flex justify-between items-center h-6">
                                    <span className="text-sm text-white/70 font-medium">{item.name}</span>
                                    <span className="text-xs text-white/30 font-mono tracking-tighter">{item.value}</span>
                                  </div>
                                  <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                      initial={{ width: 0 }} 
                                      animate={{ width: item.p }} 
                                      transition={{ duration: 1, delay: 0.5 }} 
                                      className="h-full bg-gradient-to-r from-white/10 to-white/20" 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-6">
                            <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">Flavor Parameters</span>
                            <div className="flex flex-col gap-5">
                              {themes[activeTheme]?.parameters?.map((param, idx) => {
                                const visualPos = 15 + (param.value * 0.7);
                                return (
                                  <div key={idx} className="flex flex-col gap-2">
                                    <div className="relative flex justify-between items-center h-6">
                                      <span className="text-sm text-white/70 font-medium z-10">{param.minLabel}</span>
                                      <motion.div 
                                        initial={{ x: "-35%" }} 
                                        animate={{ x: `${(visualPos - 50)}%` }} 
                                        transition={{ duration: 1, delay: 0.5 }} 
                                        className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-none"
                                      >
                                        <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] border-t-white/70" />
                                      </motion.div>
                                      <span className="text-sm text-white/70 font-medium z-10">{param.maxLabel}</span>
                                    </div>
                                    <div className="relative h-[2px] w-full bg-white/5 rounded-full group">
                                      <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${visualPos}%` }} 
                                        transition={{ duration: 1, delay: 0.5 }} 
                                        className="h-full bg-gradient-to-r from-white/10 to-white/20" 
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PILL NAVIGATION */}
              <div className={`relative w-full flex justify-center z-20 transition-all duration-500 ${activeTheme === 5 ? 'pt-40 pb-6' : 'py-6'}`}>
                <div className="inline-flex items-center gap-1 p-1.5 bg-gray-50/80 backdrop-blur-xl rounded-full">
                  {themes.map((theme, i) => (
                    <button key={theme.id} onClick={() => setActiveTheme(i)} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all relative ${activeTheme === i ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                      {activeTheme === i && <motion.div layoutId="themeActiveBg" className="absolute inset-0 bg-gray-900 rounded-full z-0 shadow-lg" />}
                      <span className="relative z-10">{theme.name}</span>
                    </button>
                  ))}
                  <button onClick={() => setActiveTheme(5)} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all relative ${activeTheme === 5 ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                    {activeTheme === 5 && <motion.div layoutId="themeActiveBg" className="absolute inset-0 bg-pocari-blue rounded-full z-0 shadow-lg" />}
                    <span className="relative z-10">Show All</span>
                  </button>
                </div>
              </div>

              {/* FLAVOR GRID */}
              <div className="flex-1 px-10 py-4 relative z-10 overflow-auto scrollbar-hide">
                <div className="max-w-7xl mx-auto h-full min-h-0">
                  <AnimatePresence mode="wait">
                    {activeTheme === 5 ? (
                      <motion.div 
                        key="show-all" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 w-full pb-40"
                      >
                        {themes.flatMap(t => t.flavors).map((flavor) => {
                          const isInCart = (cart[flavor.id] || 0) > 0;
                          return (
                            <motion.div 
                              key={flavor.id} 
                              animate={{ 
                                scale: 1,
                                y: 0,
                                borderColor: isInCart ? "#1C88FF" : "transparent"
                              }}
                              whileHover={{ 
                                scale: 1.05, 
                                y: -10,
                                transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
                              }} 
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                              className={`relative aspect-[4/5] rounded-[28px] overflow-hidden cursor-pointer shadow-xl border-[6px] ${isInCart ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]" : ""}`}
                              onClick={() => { setActiveFlavorId(flavor.id); handleAddToCart(flavor.id); }}
                            >
                              <img src={flavor.image} className="absolute inset-0 w-full h-full object-cover" alt={flavor.name} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-0 inset-x-0 p-5">
                                <h4 className="text-lg font-medium text-white mb-1">{flavor.name}</h4>
                                <span className="text-[10px] text-white/50 uppercase tracking-widest">{flavor.tag}</span>
                              </div>
                              {(cart[flavor.id] || 0) > 0 && <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold flex items-center justify-center shadow-lg">{cart[flavor.id]}</div>}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key={themes[activeTheme].id} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5 w-full pb-32"
                      >
                        {themes[activeTheme].flavors.map((flavor) => {
                          const isInCart = (cart[flavor.id] || 0) > 0;
                          return (
                            <motion.div 
                              key={flavor.id} 
                              animate={{ 
                                scale: 1,
                                y: 0,
                                borderColor: isInCart ? "#1C88FF" : "transparent"
                              }}
                              whileHover={{ 
                                scale: 1.05, 
                                y: -10,
                                transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
                              }} 
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                              className={`relative aspect-[4/5] rounded-[28px] overflow-hidden cursor-pointer shadow-xl border-[6px] ${isInCart ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.3)]" : ""}`}
                              onClick={() => { setActiveFlavorId(flavor.id); handleAddToCart(flavor.id); }}
                            >
                              <img src={flavor.image} className="absolute inset-0 w-full h-full object-cover" alt={flavor.name} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-0 inset-x-0 p-5">
                                <h4 className="text-lg font-medium text-white mb-1">{flavor.name}</h4>
                                <span className="text-[10px] text-white/50 uppercase tracking-widest">{flavor.tag}</span>
                              </div>
                              {(cart[flavor.id] || 0) > 0 && <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold flex items-center justify-center shadow-lg">{cart[flavor.id]}</div>}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* BASKET */}
              <div className="absolute bottom-8 inset-x-0 px-10 z-50">
                <div className="w-full max-w-[1000px] mx-auto bg-blue-50/80 backdrop-blur-3xl border border-white rounded-full shadow-lg flex items-center justify-between p-2.5">
                  <button onClick={() => setCart({})} className="h-12 px-8 rounded-full bg-[#1A1A1A] text-white font-medium text-sm hover:bg-black transition-all">Clear All</button>
                  <div className="flex-1 flex justify-center items-center gap-3 px-6">
                    {Array.from({ length: getPlanLimit(selectedPlan) }).map((_, i) => {
                      const items = Object.entries(cart).flatMap(([fid, q]) => Array(q).fill(fid));
                      const fid = items[i];
                      const flavor = themes.flatMap(t => t.flavors).find(f => f.id === fid);
                      return (
                        <div key={i} onClick={() => fid && handleRemoveFromCart(fid)} className={`h-11 flex-1 min-w-[80px] max-w-[140px] rounded-full flex items-center justify-center border transition-all ${fid ? "bg-white border-blue-100 shadow-sm text-[#1C88FF] cursor-pointer" : "bg-white/30 border-dashed border-blue-200/50"}`}>
                          {fid ? <span className="text-[11px] font-bold truncate px-3">{flavor?.name}</span> : <div className="w-1 h-1 bg-blue-200 rounded-full" />}
                        </div>
                      );
                    })}
                  </div>
                  {(() => {
                    const total = Object.values(cart).reduce((a, b) => a + b, 0);
                    const limit = getPlanLimit(selectedPlan);
                    const isFull = total >= limit;
                    
                    return (
                      <button 
                        disabled={!isFull}
                        onClick={() => isFull && router.push('/success')}
                        className={`h-12 min-w-[120px] rounded-full flex items-center justify-center px-8 shadow-sm font-bold text-sm transition-all duration-300 ${
                          isFull 
                          ? "bg-[#1C88FF] text-white cursor-pointer hover:bg-blue-600 scale-105" 
                          : "bg-white border border-blue-50 text-gray-400 cursor-default opacity-80"
                        }`}
                      >
                        {isFull ? (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2"
                          >
                            Check out
                          </motion.span>
                        ) : (
                          <>
                            <span className="text-[#1C88FF]">{total}</span>
                            <span className="mx-1">/</span>
                            {limit}
                          </>
                        )}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
