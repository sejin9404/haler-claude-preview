'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import Link from 'next/link';
import HalerQuiz from '@/components/status/HalerQuiz';
import { useUI } from '@/context/UIContext';
import { useVeil } from '@/context/VeilContext';
import { useContent } from '@/hooks/useContent';

export default function HomeMobile() {
  const { t } = useContent();
  const [activeSpot, setActiveSpot] = useState<string>('nasal');
  const [isReady, setIsReady] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string, body: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const { setNavHidden } = useUI();
  const { startTransition } = useVeil();

  const openModal = (title: string, body: string) => {
    setModalContent({ title, body });
    setIsModalOpen(true);
  };

  const threatsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const anatomyRef = useRef<HTMLDivElement>(null);
  const blizRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const [threatsOffset, setThreatsOffset] = useState(0);
  const threatsHeight = 4200;

  useEffect(() => {
    if (threatsRef.current && isReady) {
      const rect = threatsRef.current.getBoundingClientRect();
      setThreatsOffset(rect.top + window.scrollY);
    }
  }, [isReady]);

  const threatsProgressRaw = useTransform(scrollY, [threatsOffset, threatsOffset + threatsHeight - 800], [0, 1], { clamp: true });
  const threatsProgress = threatsProgressRaw;

  const maskExpansionProgress = useMotionValue(0);
  const [zoomTriggered, setZoomTriggered] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    const unsubscribe = threatsProgressRaw.on("change", (v) => {
      if (v > 0.03 && !zoomTriggered) {
        setZoomTriggered(true);
        setIsZooming(true);
        animate(maskExpansionProgress, 1, {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
          onComplete: () => setIsZooming(false),
        });
      }
    });
    return () => unsubscribe();
  }, [threatsProgressRaw, zoomTriggered, maskExpansionProgress]);

  useEffect(() => {
    const unsubscribe = threatsProgress.on("change", (latest) => {
      if (latest > 0.02 && latest < 0.98) setNavHidden(true);
      else setNavHidden(false);
    });
    return () => {
      unsubscribe();
      setNavHidden(false);
    };
  }, [threatsProgress, setNavHidden]);

  const houseObjectPosition = useTransform(threatsProgress, [0.06, 0.81], ["center 0%", "center 100%"], { clamp: true });

  const carouselRawOpacity = useTransform(threatsProgress, [0.6, 0.65], [0, 1]);
  const carouselRawY = useTransform(threatsProgress, [0.6, 0.65], [100, 0]);
  const carouselRawScale = useTransform(threatsProgress, [0.6, 0.65], [0.8, 1]);

  const carouselOpacity = carouselRawOpacity;
  const carouselScale = carouselRawScale;

  const maskScale = useTransform(maskExpansionProgress, [0, 1], [0.8, 1]);
  const sectionDarkOpacity = useTransform(threatsProgressRaw, [0.9, 1.0], [0, 1]);
  const lightLayerOpacity = useTransform(maskExpansionProgress, [0, 1], [1, 0]);
  const darkLayerOpacity = useTransform(maskExpansionProgress, [0, 1], [0, 1]);
  const maskRadius = useTransform(maskExpansionProgress, [0, 1], [64, 0]);
  const maskPaddingTop = useTransform(maskExpansionProgress, [0, 1], [64, 80]);
  const titleTextColor = useTransform(maskExpansionProgress, [0, 0.5], ["#111111", "#ffffff"]);

  // 2. Breath Balance Slot Logic
  const balanceItems = useMemo(() => ['Soothing Voice', 'Instant Hydration', 'Delicate Relief', 'Active Refresh'], []);
  const [balanceIndex, setBalanceIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBalanceIndex((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const anatomyData = [
    { id: 'nasal', title: 'Nasal Cavity', desc: 'Where every breath begins.\nThe first surface your mist touches — warming, filtering, and setting the tone for everything that follows.', pos: { top: '31%', left: '65%' } },
    { id: 'sinuses', title: 'Sinuses', desc: 'The hidden spaces behind your nose. Connected to your nasal cavity, these areas benefit from the moisture that starts at the surface.', pos: { top: '36%', left: '57.7%' } },
    { id: 'pharynx', title: 'Pharynx', desc: 'The crossroads of your airway. Where air, comfort, and daily vocal demand all meet. One of the most overlooked spots to keep hydrated.', pos: { top: '47%', left: '53%' } },
    { id: 'larynx', title: 'Larynx', desc: 'Where your voice lives. The lowest point of your upper airway — and the one voice professionals feel first when the air around them is dry.', pos: { top: '60%', left: '56%' } }
  ];


  const { scrollYProgress: blizProgressRaw } = useScroll({ target: blizRef, offset: ["start start", "end end"] });
  const blizProgress = useSpring(blizProgressRaw, { stiffness: 50, damping: 40 });

  const [titleHeight, setTitleHeight] = useState(0);
  useEffect(() => {
    if (titleRef.current && isReady) setTitleHeight(titleRef.current.offsetHeight);
  }, [isReady]);

  const carouselTopVal = `max(45%, calc(${80 + titleHeight + 256}px + 4vh))`;
  const [carouselAutoHoldScale, setCarouselAutoHoldScale] = useState(1);
  useEffect(() => {
    if (isReady) {
      const vh = window.innerHeight / 100;
      const titleBottom = 80 + titleHeight;
      const safetyTopEdge = titleBottom + (4 * vh);
      const targetCenter = window.innerHeight * 0.45;
      const actualCenter = Math.max(targetCenter, safetyTopEdge + 256);
      const actualTopEdge = actualCenter - 256;
      const availableHeight = (95 * vh) - actualTopEdge;
      const newScale = Math.min(1, Math.max(0.4, availableHeight / 512));
      setCarouselAutoHoldScale(newScale);
    }
  }, [isReady, titleHeight]);

  const finalCarouselScale = useTransform(carouselScale, (s) => s * carouselAutoHoldScale);
  const carouselYCentered = useTransform(carouselRawY, (v) => `calc(${v}px - 50%)`);
  const blizTextOpacity = useTransform(blizProgress, [0.1, 0.4], [1, 0]);
  const blizTextScale = useTransform(blizProgress, [0.1, 0.4], [1, 1.2]);
  const blizRotation = useTransform(blizProgress, [0.1, 0.8], [0, 90]);
  const blizMainScale = useTransform(blizProgress, [0.1, 0.8], [1.2, 0.55]);
  const blizMainY = useTransform(blizProgress, [0.1, 0.8], [0, -100]);
  const blizFinalOpacity = useTransform(blizProgress, [0.7, 0.9], [0, 1]);
  const blizFinalY = useTransform(blizProgress, [0.7, 0.9], [50, 0]);

  useEffect(() => {
    const initTimer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(initTimer);
  }, []);

  if (!isReady) return null;

  return (
    <main className="bg-white md:hidden relative scroll-smooth">
      {/* 1. HERO */}
      <section
        data-theme="dark"
        className="section-hero relative z-20 overflow-hidden"
        style={{ height: '90dvh', minHeight: '600px' }}
      >
        <div
          style={{
            transform: 'translateZ(0)',
            isolation: 'isolate',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)' // Critical for Safari video clipping
          }}
          className="hero-container relative w-full h-full rounded-b-[64px] overflow-hidden shadow-2xl bg-black"
        >
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/videos/main-compressed.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay absolute inset-0 bg-black/40" />
          <div 
            className="hero-content relative z-10 w-full h-full flex flex-col justify-center px-8"
            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)' }}
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <span className="text-white/60 text-sm font-light mb-3 block uppercase tracking-widest">
                {t('hero_subtitle', 'en') || 'Daily breath care'}
              </span>
              <h1 className="text-white text-5xl font-light leading-tight tracking-tight">
                {(t('hero_title', 'en') || 'Breathe Better-with Airway Care').split('-')[0]}-<br />
                <span className="font-extralight opacity-80">{(t('hero_title', 'en') || 'Breathe Better-with Airway Care').split('-')[1]}</span>
              </h1>
            </motion.div>
          </div>
          <div
            className="absolute left-0 right-0 z-20 flex justify-center px-8"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)' }}
          >
            <button 
              onClick={() => setIsStatusOpen(true)}
              className="w-full bg-black/20 backdrop-blur-xl text-white py-5 rounded-full text-lg font-bold border border-white/20 flex items-center justify-center active:scale-95 transition-all"
            >
              {t('hero_cta', 'en') || 'Check Your Status'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. BREATH BALANCE */}
      <section data-theme="light" className="py-24 bg-white px-0 overflow-hidden">
        <div className="text-center mb-16 px-6">
          <h2 className="text-4xl leading-tight mb-6 text-gray-900 flex flex-col items-center gap-1">
            <div className="h-[1.2em] overflow-hidden relative w-full text-[#1C88FF] font-semibold text-[9vw]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={balanceIndex}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex justify-center items-center whitespace-nowrap"
                >
                  {balanceItems[balanceIndex % balanceItems.length]}
                </motion.div>
              </AnimatePresence>
            </div>
            <span className="font-[200] text-[6vw] text-gray-600 whitespace-nowrap">helps balance your breath.</span>
          </h2>
          <p className="text-[15px] text-black font-[200] max-w-[300px] mx-auto px-0 antialiased leading-relaxed">
            Breath begins with moisture balance. <br />
            Keep your airway hydrated all day.
          </p>
        </div>
        <div className="relative w-full overflow-hidden">
          <InfiniteCarousel items={balanceItems} activeIndex={balanceIndex} />
        </div>
      </section>

      {/* 3. EVERYDAY THREATS */}
      <motion.section data-theme="light" ref={threatsRef} className="h-[420vh] relative mb-24 block scroll-mt-0 bg-white" style={{ position: 'relative' }}>
        {/* Dark overlay for section end transition */}
        <motion.div style={{ opacity: sectionDarkOpacity }} className="absolute inset-0 bg-[#121416] z-0 pointer-events-none" />
        <div style={{ position: 'sticky', top: 0, height: '100dvh', zIndex: 50 }} className="w-full flex flex-col items-center justify-center">
          <motion.div
            style={{ scale: maskScale, borderRadius: maskRadius, paddingTop: maskPaddingTop }}
            className="w-full h-full overflow-hidden relative flex flex-col items-center origin-center"
          >
            {/* Light layer (initial state) */}
            <motion.div style={{ opacity: lightLayerOpacity }} className="absolute inset-0 z-0 bg-gradient-to-b from-white to-[#e2e8f0]" />
            {/* Dark layer (expanded state) */}
            <motion.div style={{ opacity: darkLayerOpacity }} className="absolute inset-0 z-0 bg-gradient-to-b from-[#2c3135] to-[#121416]" />
            <div className="text-center mb-4 px-8 z-10 relative" ref={titleRef}>
              <motion.h2 style={{ color: titleTextColor }} className="text-3xl font-light mb-2 leading-tight">
                You breathe in<br />
                more than air.
              </motion.h2>
            </div>
            <div className="relative w-full flex-1 z-20 overflow-hidden">
              <motion.img
                src="/images/home-structure-mobile.webp"
                style={{ objectPosition: houseObjectPosition }}
                className="w-full h-full object-cover px-6"
                alt="House"
              />
              <Popup text="Dust & Particles" top="15%" side="right" progress={threatsProgress} trigger={0.09} />
              <Popup text="Hidden Spores" top="30%" side="left" progress={threatsProgress} trigger={0.13} />
              <Popup text="Invisible Dander" top="45%" side="right" progress={threatsProgress} trigger={0.17} />
              <Popup text="Pollens" top="60%" side="left" progress={threatsProgress} trigger={0.21} />
              <Popup text="Molds" top="75%" side="right" progress={threatsProgress} trigger={0.25} />
              <Popup text="VOCs" top="90%" side="left" progress={threatsProgress} trigger={0.29} />
            </div>

            {/* Fixed Carousel Container */}
            <motion.div
              style={{
                opacity: carouselOpacity,
                scale: finalCarouselScale,
                y: carouselYCentered,
                top: carouselTopVal,
                willChange: "transform, opacity",
                transformOrigin: 'top center',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
              }}
              className="absolute left-0 z-40 w-full flex flex-col gap-4 overflow-hidden"
            >
              {/* Row 1 - Faster Marquee */}
              <div className="flex w-full overflow-hidden">
                <div className="animate-marquee flex gap-6 whitespace-nowrap px-4" style={{ animationDuration: '30s' }}>
                  <ThreatCard title="Hidden Spores" image="/images/fine-dust-2.png" />
                  <ThreatCard title="VOC Molecules" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Invisible Dander" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Fine Dust" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Bacteria" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Smoke" image="/images/fine-dust-2.png" />
                  {/* Duplicate set for seamless loop */}
                  <ThreatCard title="Hidden Spores" image="/images/fine-dust-2.png" />
                  <ThreatCard title="VOC Molecules" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Invisible Dander" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Fine Dust" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Bacteria" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Smoke" image="/images/fine-dust-2.png" />
                </div>
              </div>

              {/* Row 2 - Reverse Marquee */}
              <div className="flex w-full overflow-hidden">
                <div className="animate-marquee-reverse flex gap-6 whitespace-nowrap px-4 opacity-95" style={{ animationDuration: '30s' }}>
                  <ThreatCard title="Pollens" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Chemicals" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Molds" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Bacteria" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Smoke" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Fine Dust" image="/images/fine-dust-2.png" />
                  {/* Duplicate set */}
                  <ThreatCard title="Pollens" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Chemicals" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Molds" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Bacteria" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Smoke" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Fine Dust" image="/images/fine-dust-2.png" />
                </div>
              </div>

              {/* Row 3 - Normal Marquee */}
              <div className="flex w-full overflow-hidden">
                <div className="animate-marquee flex gap-6 whitespace-nowrap px-4 opacity-90" style={{ animationDuration: '30s' }}>
                  <ThreatCard title="Pet Dander" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Dust Mites" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Invisible Spores" image="/images/fine-dust-2.png" />
                  <ThreatCard title="VOCs" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Pollens" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Chemicals" image="/images/fine-dust-2.png" />
                  {/* Duplicate set */}
                  <ThreatCard title="Pet Dander" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Dust Mites" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Invisible Spores" image="/images/fine-dust-2.png" />
                  <ThreatCard title="VOCs" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Pollens" image="/images/fine-dust-2.png" />
                  <ThreatCard title="Chemicals" image="/images/fine-dust-2.png" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* 4. 90% STATS */}
      <section id="section-90-mobile" data-theme="light" className="py-40 bg-white px-8 flex flex-col items-center justify-center gap-12 overflow-hidden">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="text-[10rem] font-extralight tracking-tighter leading-[0.85] text-black flex items-center justify-center">
            <CountUp end={90} duration={2.5} />%
          </div>
          <div className="flex flex-col items-center px-10">
            <div className="text-[5.4vw] text-gray-900 text-center flex flex-col items-center gap-y-1.5">
              <span className="font-extralight whitespace-nowrap">of people are exposed to</span>
              <span className="font-extralight whitespace-nowrap">everyday factors that</span>
              <Highlighter color="#1C88FF" delay={2.5}>
                <span className="font-medium whitespace-nowrap px-1">impact how they breathe.</span>
              </Highlighter>
            </div>
            <button
              onClick={() => openModal("Fact Check", t('stat_90_text', 'en'))}
              className="mt-12 px-8 py-3.5 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2"
            >
              Fact Check <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. ANATOMY */}
      <section data-theme="dark" ref={anatomyRef} className="py-12 px-6 bg-white">
        <motion.div
          onPanEnd={(_, info) => {
            if (Math.abs(info.offset.x) < 50) return;
            const currentIndex = anatomyData.findIndex(d => d.id === activeSpot);
            if (info.offset.x < -50) {
              const nextIndex = (currentIndex + 1) % anatomyData.length;
              setActiveSpot(anatomyData[nextIndex].id);
            } else if (info.offset.x > 50) {
              const prevIndex = (currentIndex - 1 + anatomyData.length) % anatomyData.length;
              setActiveSpot(anatomyData[prevIndex].id);
            }
          }}
          className="bg-gradient-to-b from-[#0095FF] to-[#D0EBFF] rounded-[54px] overflow-hidden relative flex flex-col items-center pt-12 min-h-[92vh] touch-pan-y"
        >
          <div className="text-center relative z-10 px-8 flex-none">
            <h2 className="text-4xl font-light text-white mb-6 leading-tight flex flex-col items-center px-10">
              <span className="opacity-80 whitespace-nowrap">Moisture is</span>
              <span className="opacity-80 whitespace-nowrap">essential for</span>
              <span className="font-normal whitespace-nowrap">your airway.</span>
            </h2>
            <p className="text-base text-white font-[100] antialiased max-w-xs mx-auto flex flex-col items-center">
              <span className="whitespace-nowrap">Moisture promotes making mucus,</span>
              <span className="whitespace-nowrap">a natural defense of your airway.</span>
            </p>
          </div>

          <div className="w-full px-8 z-10 mt-6 mb-[70px] overflow-visible relative">
            <div className="flex justify-center relative">
              <div className="w-full bg-gradient-to-b from-white/85 to-white/60 backdrop-blur-xl pt-6 pb-4.5 px-6 rounded-[32px] border border-white/20 shadow-none relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <div className="flex items-center justify-between w-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSpot}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h4 className="text-xl font-normal text-black leading-none">
                          {anatomyData.find(d => d.id === activeSpot)?.title}
                        </h4>
                      </motion.div>
                    </AnimatePresence>

                    {/* Indicators - Stay Static outside AnimatePresence */}
                    <div className="flex gap-1.5 flex-none">
                      {anatomyData.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-500 ${anatomyData[i].id === activeSpot ? 'w-5 bg-blue-500' : 'w-1.5 bg-blue-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={activeSpot}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="text-gray-800 text-[12.5px] leading-snug font-[300] antialiased whitespace-pre-line"
                      >
                        {(() => {
                          const d = anatomyData.find(item => item.id === activeSpot)?.desc || '';
                          const splitChar = d.includes('\n') ? '\n' : '. ';
                          const parts = d.split(splitChar);
                          const first = parts[0] + (splitChar === '. ' ? '.' : '');
                          const rest = d.substring(first.length);
                          return (
                            <>
                              <span className="font-[500]">{first}</span>
                              {rest}
                            </>
                          );
                        })()}
                      </motion.p>
                    </AnimatePresence>
                    {/* Spacer to satisfy absolute formula: Desc Bottom to Section Bottom = PhotoHeight(413px) + 45px = 458px */}
                    <div className="h-[330px]" />
                  </div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[465px] flex justify-center items-end z-20">
            <div className="relative w-full flex justify-center">
              <img
                src="/images/respiratory-structure-compressed.png"
                className="w-full h-auto object-contain drop-shadow-[0_10px_40px_rgba(0,149,255,0.25)]"
                alt="Anatomy"
              />

              {/* Pulse Points (Synced with Carousel) */}
              {anatomyData.map((point) => {
                const isActive = point.id === activeSpot;
                return (
                  <div key={point.id} style={point.pos} className="absolute z-20">
                    <motion.button
                      onClick={() => setActiveSpot(point.id)}
                      className="group relative flex items-center justify-center w-8 h-8"
                    >
                      {/* 3x Larger Core Dot with Radial Gradient & Differentiated Opacity */}
                      <div
                        className={`w-[18px] h-[18px] rounded-full transition-all duration-500 ${isActive ? 'scale-125 opacity-80' : 'opacity-[0.35]'}`}
                        style={{ background: 'radial-gradient(circle, white 0%, rgba(255,255,255, 0.4) 100%)' }}
                      />

                      {/* 4x Slower Seamless Gentle Pulse */}
                      {isActive && (
                        <motion.div
                          animate={{
                            scale: [1, 2.5],
                            opacity: [0, 0.4, 0]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 rounded-full bg-white"
                        />
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 6. CAPSULE EXPERIENCE */}
      <section data-theme="dark" className="min-h-[100vh] relative overflow-hidden flex items-center justify-center px-6 py-24">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[0.8]">
            <source src="/videos/waterball.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/5" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[48px] p-12 flex flex-col items-center gap-14 shadow-2xl overflow-hidden"
        >
          <div className="text-center flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-[0.3em] opacity-80">The Core Technology</span>
              <h3 className="text-3xl font-light text-white leading-tight">
                It&apos;s not water - <br />
                <span className="font-semibold text-blue-100 whitespace-nowrap">hydro formula.</span>
              </h3>
            </div>
            <button
              onClick={() => startTransition('/product#xem')}
              className="px-7 py-3.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full text-[13px] font-bold active:scale-95 transition-all"
            >
              Learn More
            </button>
          </div>

          <div className="flex flex-col items-center gap-12 w-full">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-blue-400 blur-[60px] rounded-full"
              />
              <motion.img
                src="/images/capsule.png"
                animate={{ y: [-15, 15, -15], rotate: [-3, 3, -3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-44 h-auto object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(255,255,255,0.25)]"
                alt="Haler Capsule"
              />
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-[13px] text-white/70 font-[300] leading-relaxed max-w-[210px] antialiased">
                Precision-crafted moisture particles designed for your respiratory wellness.
              </p>
              <div className="w-10 h-[1px] bg-white/20" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* MODEL CARDS SECTION */}
      <section className="px-5 py-5 flex flex-col gap-4">
        {/* Card 1 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-square w-full rounded-[48px] overflow-hidden group"
        >
          <img
            src="/images/models/Model1.webp"
            alt="Model 1"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
            <h4 className="text-xl text-white font-normal mb-8 leading-snug max-w-[240px]">
              Reborn your breath <br /> with daily care routine
            </h4>
            <button
              onClick={() => startTransition('/pass')}
              className="px-7 py-3.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full text-[13px] font-bold active:scale-95 transition-all"
            >
              See plans
            </button>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative aspect-square w-full rounded-[48px] overflow-hidden group"
        >
          <img
            src="/images/models/modeltogether.webp"
            alt="Model Together"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center">
            <h4 className="text-xl text-white font-normal mb-4 leading-snug max-w-[240px]">
              Bring together, <br /> Breathe together.
            </h4>

            <p className="text-[13px] text-white/80 font-normal mb-10 max-w-[220px]">
              Invite loved ones and get credit
            </p>

            <button className="px-7 py-3.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full text-[13px] font-bold active:scale-95 transition-all">
              Be our ambassador
            </button>
          </div>
        </motion.div>
      </section>
      {/* PREMIUM FOOTER */}
      <footer data-theme="dark" className="relative bg-gradient-to-br from-[#0080FF] to-[#00B7FF] pt-0 pb-12 overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          {/* Reverted Logo Size */}
          <div className="mb-16 pt-[20px]">
            <img src="/white.svg" alt="Haler" className="h-5 w-auto opacity-90" />
          </div>

          {/* Rest of the content wrapped in padding */}
          <div className="px-8 w-full flex flex-col items-center text-white">
            {/* Navigation Links Grid */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-10 mb-24 w-full max-w-[280px]">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Company</span>
                <a href="#" className="text-sm text-white/90 font-light hover:text-white transition-colors">Our Story</a>
                <a href="/pass" className="text-sm text-white/90 font-light hover:text-white transition-colors">Membership</a>
                <a href="#" className="text-sm text-white/90 font-light hover:text-white transition-colors">Sustainability</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Support</span>
                <a href="/product" className="text-sm text-white/90 font-light hover:text-white transition-colors">Product</a>
                <a href="#" className="text-sm text-white/90 font-light hover:text-white transition-colors">FAQ</a>
                <a href="#" className="text-sm text-white/90 font-light hover:text-white transition-colors">Instagram</a>
              </div>
            </div>

            {/* Bottom Branding & Copyright */}
            <div className="w-full pt-12 border-t border-white/20 flex flex-col items-center gap-6 text-center">
              {/* White Color Symbol above Slogan */}
              <img src="/images/halersymbol.png" alt="Symbol" className="w-14 h-auto mb-2 brightness-0 invert" />

              <p className="text-[12px] text-white/80 font-light tracking-wide italic">"Better Breath, Better Life."</p>

              <div className="flex flex-col items-center gap-2 mt-4">
                <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-medium">© 2026 Haler Korea Inc.</p>
                <div className="flex gap-4 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <GlassModal isOpen={isModalOpen} content={modalContent} onClose={() => setIsModalOpen(false)} />
      
      <AnimatePresence>
        {isStatusOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white/60 backdrop-blur-3xl overflow-y-auto"
          >
            <HalerQuiz onClose={() => setIsStatusOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ThreatCard({ title, image }: { title: string, image: string }) {
  return (
    <div className="w-40 h-40 bg-gradient-to-br from-white/20 to-white/5 rounded-[32px] p-5 flex flex-col justify-between border border-white/10 shadow-lg flex-shrink-0">
      <span className="text-xs font-bold text-white leading-tight">{title}</span>
      <img src={image} className="w-full h-auto object-contain self-end" alt={title} />
    </div>
  );
}

function Popup({ text, top, side = "center", progress, trigger }: any) {
  const opacity = useTransform(progress, [trigger - 0.1, trigger], [0, 1]);
  const scale = useTransform(progress, [trigger - 0.1, trigger], [0.5, 1]);
  return (
    <motion.div
      style={{
        top,
        opacity,
        scale,
        left: side === "left" ? "16px" : side === "right" ? "auto" : "50%",
        right: side === "right" ? "16px" : "auto",
        x: side === "center" ? "-50%" : "0%"
      }}
      className="absolute bg-black/60 border border-white/10 rounded-full px-8 py-4 text-lg font-bold text-white z-[999] whitespace-nowrap"
    >
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse" />
        {text}
      </div>
    </motion.div>
  );
}

function InfiniteCarousel({ items, activeIndex }: { items: string[], activeIndex: number }) {
  const cardWidth = 260;
  const gap = 16;
  const totalWidth = cardWidth + gap;
  const virtualItems = useMemo(() => Array.from({ length: 200 }, (_, i) => items[i % items.length]), [items]);

  return (
    <div className="flex justify-center">
      <motion.div
        className="flex gap-4 px-4"
        animate={{ x: -(activeIndex + 100) * totalWidth }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ x: -100 * totalWidth }}
      >
        {virtualItems.map((item, i) => (
          <div key={i} className={`flex-shrink-0 w-64 h-80 bg-gradient-to-b from-blue-50 to-blue-100/30 rounded-[40px] p-8 flex flex-col justify-end transition-all duration-1000 shadow-[0_20px_50px_rgba(28,136,255,0.15)] ${(i % items.length) === (activeIndex % items.length) ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
            {/* Text Removed as requested */}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function CountUp({ end, duration = 2 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let startTime: number | null = null;
    const animateCount = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easedProgress * end));
      if (progress < 1) requestAnimationFrame(animateCount);
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(animateCount);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={nodeRef}>{count}</span>;
}

function Highlighter({ children, color, delay = 0.5 }: { children: React.ReactNode, color: string, delay?: number }) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setIsHighlighted(true), delay * 1000);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);
  return (
    <span ref={ref} className="relative inline-block px-2">
      <span className={`relative z-10 transition-colors duration-700 ${isHighlighted ? 'text-white' : 'text-inherit'}`}>{children}</span>
      <motion.span initial={{ width: 0 }} animate={isHighlighted ? { width: '100%' } : { width: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ backgroundColor: color }} className="absolute -inset-y-1 inset-x-0 z-0" />
    </span>
  );
}

function GlassModal({ isOpen, content, onClose }: { isOpen: boolean, content: { title: string, body: string } | null, onClose: () => void }) {
  if (!content) return null;
  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }} className="bg-white p-10 rounded-[40px] max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <h3 className="text-3xl font-bold mb-4">{content.title}</h3>
        <p className="text-gray-600 mb-8 leading-relaxed">{content.body}</p>
        <button onClick={onClose} className="w-full py-4 bg-black text-white rounded-full font-bold">Close</button>
      </motion.div>
    </div>
  );
}
