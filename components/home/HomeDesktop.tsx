'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import HalerQuizDesktop from '@/components/status/HalerQuizDesktop';
import { useContent } from '@/hooks/useContent';

export default function HomeDesktop() {
  const { t } = useContent();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [counterValue, setCounterValue] = useState(0);
  const [activeSpot, setActiveSpot] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  const threatsRef = useRef<HTMLDivElement>(null);
  const anatomyRef = useRef<HTMLDivElement>(null);
  const blizRef = useRef<HTMLDivElement>(null);

  // 1. Threats Scroll Logic
  const { scrollYProgress: threatsProgressRaw } = useScroll({
    target: threatsRef,
    offset: ["start start", "end end"]
  });
  const threatsProgress = useSpring(threatsProgressRaw, { stiffness: 50, damping: 40, restDelta: 0.001 });

  const zoomScale = useTransform(threatsProgress, [0, 0.2], [1, 3]);
  const housePanY = useTransform(threatsProgress, [0.2, 0.95], ["0%", "-160%"]);
  const threatsOpacity = useTransform(threatsProgress, [0, 0.1], [1, 0]);
  const threatsCarouselOpacity = useTransform(threatsProgress, [0.8, 0.85], [0, 1]);
  const threatsCarouselScale = useTransform(threatsProgress, [0.8, 0.85], [0.9, 1]);

  // 2. Breath Balance Slot Logic
  const balanceItems = ['Soothing Voice', 'Instant Hydration', 'Deep Airway', 'Active Refresh'];
  const [balanceIndex, setBalanceIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setBalanceIndex((prev) => (prev + 1) % balanceItems.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // 3. Anatomy Data
  const anatomyData = [
    { id: 1, title: 'Nasal Cavity', label: '01', desc: 'The entry point for hydration. Keeps air warm and moist.', pos: { top: '64%', left: '55.7%' }, cardPos: 'ac-1' },
    { id: 2, title: 'Sinuses', label: '02', desc: 'Moisturizing these areas reduces irritation from dry air.', pos: { top: '60%', left: '62%' }, cardPos: 'ac-2' },
    { id: 3, title: 'Pharynx', label: '03', desc: 'Crucial for throat comfort and immunity defense.', pos: { top: '75%', left: '54%' }, cardPos: 'ac-3' },
    { id: 4, title: 'Larynx', label: '04', desc: 'Deep hydration reaches here for total airway care.', pos: { top: '82%', left: '56%' }, cardPos: 'ac-4' }
  ];

  // 4. Bliz Intro Scroll Logic
  const { scrollYProgress: blizProgressRaw } = useScroll({
    target: blizRef,
    offset: ["start start", "end end"]
  });
  const blizProgress = useSpring(blizProgressRaw, { stiffness: 50, damping: 40 });

  const blizRotation = useTransform(blizProgress, [0.1, 0.9], [0, 120]);
  const blizScale = useTransform(blizProgress, [0.1, 0.9], [1, 0.45]);
  const blizY = useTransform(blizProgress, [0.1, 0.9], [0, -120]);
  const hugeTextOpacity = useTransform(blizProgress, [0, 0.35], [1, 0]);
  const finalBlizOpacity = useTransform(blizProgress, [0.7, 0.9], [0, 1]);
  const finalBlizY = useTransform(blizProgress, [0.7, 0.9], [50, 0]);

  useEffect(() => {
    const initTimer = setTimeout(() => setIsReady(true), 100);
    if (typeof window === 'undefined') return;

    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0; const end = 90; const startTime = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - startTime) / 2500, 1);
          setCounterValue(Math.floor(progress * end));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        counterObserver.disconnect();
      }
    }, { threshold: 0.5 });
    
    const cEl = document.getElementById('section-90');
    if (cEl) counterObserver.observe(cEl);

    return () => { 
      counterObserver.disconnect(); 
      clearTimeout(initTimer);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-white hidden md:block">
      {/* 1. HERO */}
      <section className="section-hero h-screen p-6" data-theme="dark">
        <div className="hero-container relative h-full rounded-[60px] overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/videos/main-compressed.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay absolute inset-0 bg-black/40" />
          <div className="hero-content relative z-10 h-full flex flex-col justify-center px-[8%]">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
              <span className="text-white/80 text-lg font-light mb-4 block">
                {t('hero_subtitle', 'en') || 'Daily breath care'}
              </span>
              <h1 className="text-white text-6xl md:text-7xl font-light leading-[1.05] tracking-tight">
                {(t('hero_title', 'en') || 'Breathe Better-with Airway Care').split('-')[0]}-<br/>
                <span className="font-extralight">{(t('hero_title', 'en') || 'Breathe Better-with Airway Care').split('-')[1]}</span>
              </h1>
            </motion.div>
          </div>
          <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="w-full max-w-xs">
              <button 
                onClick={() => setIsStatusOpen(true)}
                className="w-full bg-white text-black py-5 rounded-full text-lg font-bold shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t('hero_cta', 'en') || 'Check Your Status'}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. BREATH BALANCE */}
      <section className="py-40 bg-white" data-theme="light">
          <div className="container mx-auto px-6 text-center mb-24">
             <h2 className="text-6xl font-extralight leading-tight mb-8 text-gray-900 flex flex-col items-center">
                <div className="h-[1.2em] overflow-hidden relative w-full text-blue-500 font-medium">
                  <AnimatePresence mode="wait">
                    <motion.div key={balanceItems[balanceIndex]} initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: 0.8, ease: [0.85, 0, 0.15, 1] }} className="absolute inset-0 flex justify-center items-center">
                      {balanceItems[balanceIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <span className="font-extralight">helps balance your breath.</span>
             </h2>
             <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">Your breath begins with moisture balance. Keep your airway hydrated all day.</p>
          </div>
          <div className="flex gap-8 px-[5%] overflow-x-auto pb-10 scrollbar-hide">
             {[
               { title: 'Premium Hydration', img: '/images/fine-dust-2.png' },
               { title: 'Sinus Care', img: '/images/fine-dust-2.png' },
               { title: 'Deep Airway', img: '/images/fine-dust-2.png' },
               { title: 'Active Refresh', img: '/images/fine-dust-2.png' }
             ].map((card, i) => (
               <div key={i} className="flex-shrink-0 w-[420px] h-[520px] bg-gradient-to-b from-blue-50 to-blue-100/30 rounded-[48px] p-12 flex flex-col justify-end group cursor-pointer hover:shadow-2xl transition-all">
                  <h3 className="text-3xl font-light text-gray-800 transition-transform group-hover:-translate-y-2">{card.title}</h3>
               </div>
             ))}
          </div>
      </section>

      {/* 3. EVERYDAY THREATS */}
      <section ref={threatsRef} className="h-[450vh] relative bg-gray-50 rounded-[80px] mx-[2%] overflow-clip" data-theme="light">
        <div className="sticky top-0 h-screen flex flex-col items-center pt-24 overflow-hidden">
          <motion.div style={{ opacity: threatsOpacity }} className="text-center mb-10">
            <h2 className="text-6xl font-light mb-4 text-gray-900">
              {t('threats_title', 'en')?.split('.')[0] || 'You breathe in more than air'}.<br/>
              <span className="font-extralight text-gray-400">
                {t('threats_title', 'en')?.split('.')[1] || 'The air is full of everyday threats'}.
              </span>
            </h2>
          </motion.div>
          <motion.div style={{ y: housePanY }} className="relative w-full flex flex-col items-center">
            <motion.div style={{ scale: zoomScale }} className="relative w-full max-w-2xl origin-top rounded-3xl">
               <img src="/images/home-structure.png" className="w-full h-auto object-contain" alt="House" />
               <Popup text="Dust carried in on shoes" top="10%" right="5%" progress={threatsProgress} trigger={0.25} />
               <Popup text="Dust trapped in carpets" top="17%" left="2%" progress={threatsProgress} trigger={0.32} />
               <Popup text="Mold from damp walls" top="25%" right="5%" progress={threatsProgress} trigger={0.38} />
               <Popup text="Particles from floor" top="32%" left="2%" progress={threatsProgress} trigger={0.45} />
               <Popup text="Cooking fumes" top="45%" right="5%" progress={threatsProgress} trigger={0.52} />
               <Popup text="Wall particles" top="52%" left="2%" progress={threatsProgress} trigger={0.60} />
               <Popup text="Pet dander" top="63%" right="5%" progress={threatsProgress} trigger={0.68} />
               <Popup text="Furniture dust" top="69%" left="2%" progress={threatsProgress} trigger={0.75} />
               <Popup text="Car exhaust" top="82%" right="5%" progress={threatsProgress} trigger={0.82} />
               <Popup text="Plant allergens" top="87%" left="2%" progress={threatsProgress} trigger={0.88} />
            </motion.div>
          </motion.div>
          <motion.div style={{ opacity: threatsCarouselOpacity, scale: threatsCarouselScale }} className="absolute bottom-24 w-full flex flex-col gap-6">
             <div className="animate-infinite-scroll flex gap-6">
                {[1,2,3,4,5,6,1,2,3,4,5,6].map((i, idx) => (
                   <div key={`row1-${idx}`} className="flex-shrink-0 w-[300px] h-[300px] liquid-glass rounded-[48px] p-10 flex flex-col group">
                    <span className="text-2xl font-light text-gray-800">Indoor Threat {i}</span>
                    <img src="/images/fine-dust-2.png" className="mt-auto w-3/4 group-hover:scale-110 transition-transform" alt="" />
                  </div>
                ))}
             </div>
          </motion.div>
        </div>
      </section>

      {/* 4. 90% STATS */}
      <section id="section-90" className="py-60 container mx-auto flex flex-col lg:flex-row items-center justify-center gap-24 px-6" data-theme="light">
        <div className="text-[16rem] font-extralight tracking-tighter leading-none w-[3ch] text-right">
          <CountUp end={90} duration={2.5} />%
        </div>
        <div className="max-w-md">
          <p className="text-4xl font-extralight text-gray-400 leading-[1.4]">
            {t('stat_90_text', 'en')?.split('that')[0] || 'of people are exposed to everyday factors'}<br/>
            <span className="text-black font-normal">that {t('stat_90_text', 'en')?.split('that')[1] || 'impact how they breathe.'}</span>
          </p>
          <motion.div whileHover={{ x: 10 }} className="mt-12 inline-flex items-center gap-3 text-blue-500 text-xl font-normal group cursor-pointer">
            Check the evidence <ChevronRight className="transition-transform group-hover:translate-x-1" />
          </motion.div>
        </div>
      </section>

      {/* 5. ANATOMY */}
      <section ref={anatomyRef} className="py-40 bg-gradient-to-b from-[#0095FF] to-[#D0EBFF] rounded-[80px] mx-[2%] relative overflow-hidden" data-theme="dark">
        <div className="text-center mb-32 relative z-10 px-6">
          <span className="text-xs font-bold tracking-[0.5em] uppercase text-white/40 mb-6 block">Anatomical Hydration</span>
          <h2 className="text-6xl font-light text-white mb-8 leading-tight">Moisture is essential for <br/><span className="font-normal text-white/90">protecting your airway.</span></h2>
          <p className="text-xl text-white/60 font-light max-w-2xl mx-auto">When it dries out, your natural defense breaks down. Keep it hydrated with bliz.</p>
        </div>
        <div className="relative max-w-5xl mx-auto aspect-[4/3] flex justify-center items-center">
           <div className={`absolute inset-x-0 bottom-0 top-0 flex justify-center transition-opacity duration-700 ${activeSpot ? 'opacity-40' : 'opacity-100'}`}>
              <img src="/images/respiratory-structure-compressed.png" className="h-full w-auto object-contain select-none" alt="Anatomy" />
           </div>
           {anatomyData.map((item) => (
             <motion.div 
               key={`card-${item.id}`}
               onMouseEnter={() => setActiveSpot(item.id)}
               onMouseLeave={() => setActiveSpot(null)}
               className={`absolute z-30 transition-all duration-700 ${item.cardPos === 'ac-1' ? 'top-[22%] left-[4%]' : item.cardPos === 'ac-2' ? 'top-[15%] right-[4%]' : item.cardPos === 'ac-3' ? 'bottom-[25%] left-[8%]' : 'bottom-[15%] right-[4%]'} liquid-glass p-8 rounded-[48px] w-[340px] border-white/20 ${activeSpot === item.id ? 'bg-white/95 scale-105 shadow-[0_40px_100px_rgba(28,136,255,0.4)] border-white' : 'bg-white/10 opacity-30 blur-[2px]'}`}
             >
                <h3 className={`text-xl font-medium mb-3 flex items-center gap-3 transition-colors ${activeSpot === item.id ? 'text-black' : 'text-white'}`}>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${activeSpot === item.id ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/80'}`}>0{item.id}</span>
                   {item.title}
                </h3>
                <p className={`text-sm font-light leading-relaxed transition-colors ${activeSpot === item.id ? 'text-black/70' : 'text-white/70'}`}>{item.desc}</p>
             </motion.div>
           ))}
           {anatomyData.map((item) => (
             <motion.div 
               key={`spot-${item.id}`}
               style={{ top: item.pos.top, left: item.pos.left }}
               onMouseEnter={() => setActiveSpot(item.id)}
               onMouseLeave={() => setActiveSpot(null)}
               className={`absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center cursor-pointer z-40 transition-transform duration-500 ${activeSpot === item.id ? 'scale-125' : 'scale-100'}`}
             >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all duration-500 ${activeSpot === item.id ? 'scale-150' : 'scale-100 shadow-[0_0_20px_white]'}`} />
                <div className={`absolute inset-0 bg-white/50 rounded-full ${activeSpot === item.id ? 'animate-ping' : 'animate-pulse'}`} />
             </motion.div>
           ))}
        </div>
      </section>

      {/* 6. BLIZ INTRO */}
      <section ref={blizRef} className="h-[250vh] bg-white relative" data-theme="light">
          <div className="sticky top-0 h-screen flex flex-col justify-center items-center overflow-hidden">
              <motion.div style={{ opacity: hugeTextOpacity }} className="absolute inset-0 flex flex-col justify-between items-center py-24 pointer-events-none text-gray-100 font-medium text-[15vw] leading-none tracking-tighter uppercase">
                  <span>a new way to</span>
                  <span>hydrate airway</span>
              </motion.div>
              <motion.img 
                src="/images/bliz-compressed.png" 
                style={{ rotate: blizRotation, scale: blizScale, y: blizY }}
                className="w-[1400px] z-10 filter drop-shadow-[0_40px_80px_rgba(0,0,0,0.12)]"
              />
              <motion.div 
                style={{ opacity: finalBlizOpacity, y: finalBlizY }}
                className="absolute bottom-[11%] z-20 flex flex-col items-center"
              >
                  <h3 className="text-[12rem] font-medium text-gray-900 tracking-tighter mb-0 leading-none">bliz</h3>
                  <p className="text-xl font-extralight text-gray-500 tracking-[0.4em] uppercase mb-12">a daily nebulizer</p>
                  <Link href="#" className="bg-white/40 backdrop-blur-md border border-black/5 text-gray-800 px-12 py-4 rounded-full text-lg font-medium hover:bg-white/60 hover:scale-105 transition-all shadow-xl">Explore bliz</Link>
              </motion.div>
          </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-20 bg-gray-50 border-t border-gray-100" data-theme="light">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
             <img src="/white.svg" className="h-6 opacity-20 invert" alt="Logo" />
             <div className="flex gap-12 text-sm text-gray-400 font-light">
                <Link href="#">Terms</Link>
                <Link href="#">Privacy</Link>
                <Link href="#">Instagram</Link>
             </div>
             <p className="text-xs text-gray-300">© 2026 Haler Inc. All rights reserved.</p>
          </div>
      </footer>
      <AnimatePresence>
        {isStatusOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-white/60 backdrop-blur-3xl overflow-y-auto"
          >
            <HalerQuizDesktop onClose={() => setIsStatusOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function Popup({ text, top, left, right, progress, trigger }: any) {
  const opacity = useTransform(progress, [trigger - 0.05, trigger], [0, 1]);
  const scale = useTransform(progress, [trigger - 0.05, trigger], [0.8, 1]);
  const y = useTransform(progress, [trigger - 0.05, trigger], [10, 0]);

  return (
    <motion.div 
      style={{ top, left, right, opacity, scale, y }}
      className="absolute bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl px-4 py-2 text-[0.7rem] text-gray-900 shadow-lg pointer-events-none z-20 whitespace-nowrap"
    >
      {text}
    </motion.div>
  );
}

function CountUp({ end, duration }: { end: number, duration: number }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);

  useEffect(() => {
    let startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easedProgress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        requestAnimationFrame(animate);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={nodeRef}>{count}</span>;
}
