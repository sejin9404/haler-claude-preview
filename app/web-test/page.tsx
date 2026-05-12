'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import Image from 'next/image';
import HalerQuiz from '@/components/status/HalerQuiz';
import { useUI } from '@/context/UIContext';
import { useVeil } from '@/context/VeilContext';
import { useContent } from '@/hooks/useContent';

export default function HomeWebTest() {
  const { t } = useContent();
  const [activeSpot, setActiveSpot] = useState<string>('nasal');
  const [isReady, setIsReady] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);
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
  const blizRef = useRef<HTMLDivElement>(null);

  // ── Everyday Threats: useScroll target for device-accurate progress ──
  const { scrollYProgress: threatsProgressRaw } = useScroll({
    target: threatsRef,
    offset: ['start start', 'end end'],
  });
  const threatsProgress = threatsProgressRaw;

  // ── Mask expansion: one-time animate(), no scroll coupling ──
  const maskExpansionProgress = useMotionValue(0);
  const [zoomTriggered, setZoomTriggered] = useState(false);

  useEffect(() => {
    const unsub = threatsProgressRaw.on('change', (v: number) => {
      if (v > 0.03 && !zoomTriggered) {
        setZoomTriggered(true);
        animate(maskExpansionProgress, 1, {
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        });
      }
    });
    return () => unsub();
  }, [threatsProgressRaw, zoomTriggered, maskExpansionProgress]);

  // ── Nav hide ──
  useEffect(() => {
    const unsub = threatsProgress.on('change', (v: number) => {
      setNavHidden(v > 0.02 && v < 0.98);
    });
    return () => {
      unsub();
      setNavHidden(false);
    };
  }, [threatsProgress, setNavHidden]);

  // ── House pan: transform only, no width/height ──
  const housePanY = useTransform(threatsProgress, [0.06, 0.81], ['0%', '-160%'], { clamp: true });

  // ── Carousel ──
  const carouselOpacity = useTransform(threatsProgress, [0.6, 0.68], [0, 1]);
  const carouselY = useTransform(threatsProgress, [0.6, 0.68], [80, 0]);
  const carouselScale = useTransform(threatsProgress, [0.6, 0.68], [0.88, 1]);

  // ── Mask: scale instead of width/height → no reflow ──
  const maskScale = useTransform(maskExpansionProgress, [0, 1], [0.82, 1]);
  const maskRadius = useTransform(maskExpansionProgress, [0, 1], [80, 0]);

  // ── Background layers: opacity only → no repaint ──
  const sectionDarkOpacity = useTransform(threatsProgressRaw, [0.88, 0.98], [0, 1]);
  const lightLayerOpacity = useTransform(maskExpansionProgress, [0, 1], [1, 0]);
  const darkLayerOpacity = useTransform(maskExpansionProgress, [0, 1], [0, 1]);
  const titleTextColor = useTransform(maskExpansionProgress, [0, 0.5], ['#111111', '#ffffff']);

  // ── Breath Balance ──
  const balanceItems = useMemo(() => ['Soothing Voice', 'Instant Hydration', 'Delicate Relief', 'Active Refresh'], []);
  const [balanceIndex, setBalanceIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setBalanceIndex((p) => p + 1), 3500);
    return () => clearInterval(t);
  }, []);

  // ── Anatomy ──
  const anatomyData = [
    { id: 'nasal', title: 'Nasal Cavity', desc: 'Where every breath begins.\nThe first surface your mist touches — warming, filtering, and setting the tone for everything that follows.', pos: { top: '31%', left: '65%' } },
    { id: 'sinuses', title: 'Sinuses', desc: 'The hidden spaces behind your nose. Connected to your nasal cavity, these areas benefit from the moisture that starts at the surface.', pos: { top: '36%', left: '57.7%' } },
    { id: 'pharynx', title: 'Pharynx', desc: 'The crossroads of your airway. Where air, comfort, and daily vocal demand all meet. One of the most overlooked spots to keep hydrated.', pos: { top: '47%', left: '53%' } },
    { id: 'larynx', title: 'Larynx', desc: 'Where your voice lives. The lowest point of your upper airway — and the one voice professionals feel first when the air around them is dry.', pos: { top: '60%', left: '56%' } },
  ];

  // ── Bliz section ──
  const { scrollYProgress: blizProgressRaw } = useScroll({ target: blizRef, offset: ['start start', 'end end'] });
  const blizProgress = useSpring(blizProgressRaw, { stiffness: 50, damping: 40 });
  const blizTextOpacity = useTransform(blizProgress, [0.1, 0.4], [1, 0]);
  const blizTextScale = useTransform(blizProgress, [0.1, 0.4], [1, 1.1]);
  const blizMainScale = useTransform(blizProgress, [0.1, 0.8], [1.15, 0.55]);
  const blizMainY = useTransform(blizProgress, [0.1, 0.8], [0, -80]);
  const blizFinalOpacity = useTransform(blizProgress, [0.7, 0.9], [0, 1]);
  const blizFinalY = useTransform(blizProgress, [0.7, 0.9], [40, 0]);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return null;

  return (
    <main className="bg-white relative overflow-x-hidden">

      {/* ── 1. HERO ── */}
      <section data-theme="dark" className="relative z-20 overflow-hidden" style={{ height: '100svh', minHeight: 800 }}>
        <div
          style={{ transform: 'translateZ(0)', isolation: 'isolate', WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
          className="relative w-full h-full rounded-b-[80px] overflow-hidden shadow-2xl bg-black"
        >
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/videos/main-compressed.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full h-full flex flex-col justify-center px-[8%]">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
              <span className="text-white/50 text-sm font-light mb-5 block uppercase tracking-[0.3em]">
                {t('hero_subtitle', 'en') || 'Daily breath care'}
              </span>
              <h1 className="text-white font-light leading-[0.92] tracking-tight" style={{ fontSize: 'clamp(64px, 8vw, 120px)' }}>
                {(t('hero_title', 'en') || 'Breathe Better-with Airway Care').split('-')[0]}—<br />
                <span className="font-extralight opacity-70">
                  {(t('hero_title', 'en') || 'Breathe Better-with Airway Care').split('-')[1]}
                </span>
              </h1>
            </motion.div>
          </div>
          <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              onClick={() => setIsStatusOpen(true)}
              className="bg-white/10 backdrop-blur-2xl text-white px-14 py-5 rounded-full text-lg font-semibold border border-white/20 hover:bg-white/15 active:scale-95 transition-all shadow-2xl"
            >
              {t('hero_cta', 'en') || 'Check Your Status'}
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── 2. BREATH BALANCE ── */}
      <section data-theme="light" className="py-48 bg-white overflow-hidden">
        <div className="text-center mb-28 px-8">
          <h2 className="font-light leading-tight mb-10 text-gray-900 flex flex-col items-center gap-3" style={{ fontSize: 'clamp(40px, 5vw, 80px)' }}>
            <div className="overflow-hidden relative w-full text-[#1C88FF] font-semibold" style={{ height: '1.2em' }}>
              <AnimatePresence initial={false} mode="wait">
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
            <span className="font-extralight text-gray-400">helps balance your breath.</span>
          </h2>
          <p className="text-xl text-gray-600 font-extralight max-w-2xl mx-auto leading-relaxed">
            Breath begins with moisture balance.<br />Keep your airway hydrated all day.
          </p>
        </div>
        <div className="relative w-full overflow-hidden">
          <InfiniteCarousel items={balanceItems} activeIndex={balanceIndex} />
        </div>
      </section>

      {/* ── 3. EVERYDAY THREATS ── */}
      <motion.section
        data-theme="light"
        ref={threatsRef}
        className="h-[450vh] relative mb-32"
        style={{ position: 'relative' }}
      >
        {/* Dark overlay at section end */}
        <motion.div style={{ opacity: sectionDarkOpacity }} className="absolute inset-0 bg-[#121416] z-0 pointer-events-none" />

        <div style={{ position: 'sticky', top: 0, height: '100svh', zIndex: 50 }} className="w-full flex items-center justify-center">
          <motion.div
            style={{
              scale: maskScale,
              borderRadius: maskRadius,
              willChange: 'transform',
            }}
            className="w-full h-full overflow-hidden relative flex flex-col items-center origin-center"
          >
            {/* Light layer */}
            <motion.div style={{ opacity: lightLayerOpacity }} className="absolute inset-0 z-0 bg-gradient-to-b from-white to-[#e2e8f0]" />
            {/* Dark layer */}
            <motion.div style={{ opacity: darkLayerOpacity }} className="absolute inset-0 z-0 bg-gradient-to-b from-[#2c3135] to-[#121416]" />

            {/* Title */}
            <div className="text-center pt-20 pb-8 px-8 z-10 relative" ref={titleRef}>
              <motion.h2
                style={{ color: titleTextColor, fontSize: 'clamp(40px, 5.5vw, 88px)', lineHeight: '1.05' }}
                className="font-light leading-tight"
              >
                You breathe in<br />more than air.
              </motion.h2>
            </div>

            {/* House image */}
            <motion.div
              style={{ y: housePanY, willChange: 'transform' }}
              className="relative w-full max-w-4xl flex flex-col items-center z-20"
            >
              <div className="relative w-full flex justify-center" style={{ scale: 0.9, transformOrigin: 'top center' }}>
                <Image
                  src="/images/home-structure.webp"
                  width={1509}
                  height={6188}
                  priority
                  className="w-full h-auto px-8"
                  alt="House"
                />
                <Popup text="Dust & Particles" top="15%" side="right" progress={threatsProgress} trigger={0.09} />
                <Popup text="Hidden Spores" top="30%" side="left" progress={threatsProgress} trigger={0.14} />
                <Popup text="Invisible Dander" top="45%" side="right" progress={threatsProgress} trigger={0.19} />
                <Popup text="Pollens" top="60%" side="left" progress={threatsProgress} trigger={0.24} />
                <Popup text="Molds" top="75%" side="right" progress={threatsProgress} trigger={0.29} />
                <Popup text="VOCs" top="90%" side="left" progress={threatsProgress} trigger={0.34} />
              </div>
            </motion.div>

            {/* Carousel */}
            <motion.div
              style={{
                opacity: carouselOpacity,
                scale: carouselScale,
                y: useTransform(carouselY, (v: number) => `calc(${v}px - 50%)`),
                top: '50%',
                willChange: 'transform, opacity',
                transformOrigin: 'top center',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
              }}
              className="absolute left-0 z-40 w-full flex flex-col gap-6 overflow-hidden"
            >
              <MarqueeRow speed={45} items={['Hidden Spores', 'VOC Molecules', 'Invisible Dander', 'Fine Dust', 'Bacteria', 'Smoke']} />
              <MarqueeRow speed={45} reverse items={['Pollens', 'Chemicals', 'Molds', 'Bacteria', 'Smoke', 'Fine Dust']} />
              <MarqueeRow speed={45} items={['Pet Dander', 'Dust Mites', 'Invisible Spores', 'VOCs', 'Pollens', 'Chemicals']} />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── 4. 90% STATS ── */}
      <section data-theme="light" className="py-60 bg-white px-8 flex flex-col items-center justify-center gap-16 overflow-hidden">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="font-extralight tracking-tighter leading-[0.8] text-black flex items-center justify-center" style={{ fontSize: 'clamp(100px, 18vw, 280px)' }}>
            <CountUp end={90} duration={2.5} />%
          </div>
          <div className="flex flex-col items-center max-w-4xl">
            <div className="text-gray-900 text-center flex flex-col items-center gap-y-4 font-extralight" style={{ fontSize: 'clamp(22px, 3vw, 44px)' }}>
              <span>of people are exposed to everyday factors that</span>
              <Highlighter color="#1C88FF" delay={2.5}>
                <span className="font-normal px-2">impact how they breathe.</span>
              </Highlighter>
            </div>
            <button
              onClick={() => openModal('Fact Check', t('stat_90_text', 'en'))}
              className="mt-16 px-14 py-6 bg-blue-600 text-white rounded-full font-bold shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
            >
              Fact Check <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. ANATOMY — Side-by-Side ── */}
      <section data-theme="dark" className="py-32 px-[5%] bg-white">
        <div className="bg-gradient-to-b from-[#0095FF] to-[#D0EBFF] rounded-[80px] overflow-visible relative pt-24 pb-0 min-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="text-center px-8 flex-none mb-16 z-10 relative">
            <h2 className="font-light text-white leading-tight flex flex-col items-center mb-6" style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}>
              <span className="opacity-80">Moisture is essential for</span>
              <span className="font-normal">your airway.</span>
            </h2>
            <p className="text-white font-extralight antialiased max-w-2xl mx-auto" style={{ fontSize: 'clamp(16px, 1.5vw, 22px)' }}>
              Moisture promotes making mucus, a natural defense of your airway.
            </p>
          </div>

          {/* Side-by-side layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-end gap-0 w-full max-w-7xl mx-auto px-8">
            {/* Left: Model with dot navigation */}
            <div className="relative flex justify-center items-end" style={{ height: 600 }}>
              <img
                src="/images/respiratory-structure-compressed.png"
                className="h-full w-auto object-contain drop-shadow-[0_20px_60px_rgba(0,149,255,0.35)]"
                alt="Anatomy"
                style={{ maxWidth: '100%' }}
              />
              {anatomyData.map((point) => {
                const isActive = point.id === activeSpot;
                return (
                  <div key={point.id} style={{ position: 'absolute', ...point.pos }}>
                    <motion.button
                      onMouseEnter={() => setActiveSpot(point.id)}
                      onClick={() => setActiveSpot(point.id)}
                      className="relative flex items-center justify-center w-12 h-12"
                    >
                      <div
                        className={`w-5 h-5 rounded-full transition-all duration-500 ${isActive ? 'scale-150 opacity-100' : 'opacity-35 hover:opacity-60'}`}
                        style={{ background: 'radial-gradient(circle, white 0%, rgba(255,255,255,0.4) 100%)' }}
                      />
                      {isActive && (
                        <motion.div
                          animate={{ scale: [1, 2.8], opacity: [0, 0.35, 0] }}
                          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-0 rounded-full bg-white"
                        />
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </div>

            {/* Right: Info card */}
            <div className="flex justify-center lg:justify-start items-end pb-16">
              <div className="w-full max-w-lg bg-white/10 backdrop-blur-3xl p-14 rounded-[56px] border border-white/20 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSpot}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-3xl font-medium text-white">
                        {anatomyData.find((d) => d.id === activeSpot)?.title}
                      </h4>
                      <div className="flex gap-2 ml-4">
                        {anatomyData.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => setActiveSpot(d.id)}
                            className={`h-2 rounded-full transition-all duration-500 ${d.id === activeSpot ? 'w-8 bg-white' : 'w-2 bg-white/25 hover:bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/85 font-extralight leading-relaxed whitespace-pre-line antialiased" style={{ fontSize: 'clamp(15px, 1.3vw, 19px)' }}>
                      {(() => {
                        const d = anatomyData.find((item) => item.id === activeSpot)?.desc || '';
                        const parts = d.split('\n');
                        return (
                          <>
                            <span className="font-light">{parts[0]}</span>
                            {parts[1] && <span className="opacity-70">{'\n' + parts[1]}</span>}
                          </>
                        );
                      })()}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CAPSULE EXPERIENCE ── */}
      <section data-theme="dark" className="relative overflow-hidden flex items-center justify-center px-[8%] py-40" style={{ minHeight: '100svh' }}>
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover brightness-[0.65]">
            <source src="/videos/waterball.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-6xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[80px] p-24 grid grid-cols-1 md:grid-cols-2 gap-20 items-center shadow-2xl"
        >
          <div className="flex flex-col items-start gap-10">
            <div className="flex flex-col items-start gap-5">
              <span className="text-xs text-blue-300 font-bold uppercase tracking-[0.4em] opacity-80">The Core Technology</span>
              <h3 className="font-light text-white leading-tight" style={{ fontSize: 'clamp(36px, 4vw, 64px)' }}>
                It&apos;s not water—<br />
                <span className="font-semibold text-blue-100">hydro formula.</span>
              </h3>
            </div>
            <button
              onClick={() => startTransition('/product#xem')}
              className="px-10 py-5 bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-full font-bold hover:bg-white/18 active:scale-95 transition-all"
              style={{ fontSize: 'clamp(14px, 1.2vw, 18px)' }}
            >
              Learn More
            </button>
          </div>
          <div className="relative flex justify-center">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.22, 0.1] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute inset-0 bg-blue-500 blur-[100px] rounded-full"
            />
            <motion.img
              src="/images/capsule.png"
              animate={{ y: [-20, 20, -20], rotate: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-72 h-auto object-contain relative z-10 drop-shadow-[0_30px_70px_rgba(255,255,255,0.3)]"
              alt="Haler Capsule"
            />
          </div>
        </motion.div>
      </section>

      {/* ── 7. MODEL CARDS ── */}
      <section className="px-[5%] py-24 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ModelCard
          image="/images/models/Model1.webp"
          title="Reborn your breath with daily care routine"
          cta="See plans"
          href="/pass"
        />
        <ModelCard
          image="/images/models/modeltogether.webp"
          title="Bring together, Breathe together."
          subtitle="Invite loved ones and get credit"
          cta="Be our ambassador"
          href="#"
        />
      </section>

      {/* ── FOOTER ── */}
      <footer data-theme="dark" className="relative bg-gradient-to-br from-[#0080FF] to-[#00B7FF] pt-32 pb-20 overflow-hidden rounded-t-[100px]">
        <div className="container mx-auto px-12 flex flex-col items-center">
          <div className="mb-24">
            <img src="/white.svg" alt="Haler" className="h-8 w-auto opacity-90" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-24 mb-32 w-full max-w-5xl">
            <FooterColumn title="Company" links={['Our Story', 'Membership', 'Sustainability']} />
            <FooterColumn title="Support" links={['Product', 'FAQ', 'Instagram']} />
            <div className="col-span-2 flex flex-col items-end gap-6">
              <img src="/images/halersymbol.png" alt="Symbol" className="w-16 h-auto brightness-0 invert opacity-40" />
              <p className="text-2xl text-white/80 font-light italic">"Better Breath, Better Life."</p>
            </div>
          </div>
          <div className="w-full pt-12 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs text-white/40 uppercase tracking-[0.4em] font-medium">© 2026 Haler Korea Inc.</p>
            <div className="flex gap-6">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <div className="w-2 h-2 rounded-full bg-white/20" />
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

// ── Sub-components ──────────────────────────────────────────

function MarqueeRow({ items, speed = 40, reverse = false }: { items: string[]; speed?: number; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="flex w-full overflow-hidden">
      <div
        className={`flex gap-8 whitespace-nowrap px-4 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((title, i) => (
          <ThreatCard key={i} title={title} image="/images/fine-dust-2.png" />
        ))}
      </div>
    </div>
  );
}

function ThreatCard({ title, image }: { title: string; image: string }) {
  return (
    <div className="w-72 h-72 bg-gradient-to-br from-white/20 to-white/5 rounded-[48px] p-10 flex flex-col justify-between border border-white/10 shadow-2xl flex-shrink-0">
      <span className="text-xl font-medium text-white leading-tight">{title}</span>
      <img src={image} className="w-full h-auto object-contain self-end opacity-80" alt={title} />
    </div>
  );
}

function Popup({ text, top, side = 'center', progress, trigger }: { text: string; top: string; side?: string; progress: any; trigger: number }) {
  const opacity = useTransform(progress, [trigger - 0.08, trigger], [0, 1]);
  const scale = useTransform(progress, [trigger - 0.08, trigger], [0.6, 1]);
  return (
    <motion.div
      style={{
        top,
        opacity,
        scale,
        left: side === 'left' ? '40px' : side === 'right' ? 'auto' : '50%',
        right: side === 'right' ? '40px' : 'auto',
        x: side === 'center' ? '-50%' : '0%',
        position: 'absolute',
      }}
      className="bg-black/55 border border-white/10 rounded-full px-10 py-5 font-bold text-white z-[999] whitespace-nowrap backdrop-blur-xl shadow-2xl"
      style={{ fontSize: 'clamp(14px, 1.2vw, 20px)' } as React.CSSProperties}
    >
      <div className="flex items-center gap-4">
        <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse flex-shrink-0" />
        {text}
      </div>
    </motion.div>
  );
}

function ModelCard({ image, title, subtitle, cta, href }: { image: string; title: string; subtitle?: string; cta: string; href: string }) {
  const { startTransition } = useVeil();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full rounded-[64px] overflow-hidden group shadow-2xl"
      style={{ aspectRatio: '1 / 1' }}
    >
      <img src={image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={title} />
      <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/25" />
      <div className="absolute inset-0 p-16 flex flex-col items-center justify-center text-center">
        <h4 className="text-white font-light mb-6 leading-tight max-w-xs" style={{ fontSize: 'clamp(22px, 2.5vw, 38px)' }}>{title}</h4>
        {subtitle && <p className="text-white/65 mb-10 font-extralight" style={{ fontSize: 'clamp(14px, 1.2vw, 18px)' }}>{subtitle}</p>}
        <button
          onClick={() => startTransition(href)}
          className="px-12 py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-bold hover:bg-white/18 active:scale-95 transition-all shadow-2xl"
          style={{ fontSize: 'clamp(13px, 1vw, 17px)' }}
        >
          {cta}
        </button>
      </div>
    </motion.div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-6">
      <span className="text-xs text-white/50 font-bold uppercase tracking-widest">{title}</span>
      {links.map((link) => (
        <a key={link} href="#" className="text-lg text-white/80 font-extralight hover:text-white transition-colors">{link}</a>
      ))}
    </div>
  );
}

function InfiniteCarousel({ items, activeIndex }: { items: string[]; activeIndex: number }) {
  const cardWidth = 420;
  const gap = 32;
  const totalWidth = cardWidth + gap;
  const virtualItems = useMemo(() => Array.from({ length: 200 }, (_, i) => items[i % items.length]), [items]);
  return (
    <div className="flex justify-center overflow-hidden">
      <motion.div
        className="flex gap-8 px-8"
        animate={{ x: -(activeIndex + 100) * totalWidth }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ x: -100 * totalWidth }}
      >
        {virtualItems.map((item, i) => (
          <div
            key={i}
            className={`flex-shrink-0 bg-gradient-to-b from-blue-50 to-blue-100/30 rounded-[64px] p-12 flex flex-col justify-end transition-all duration-1000 shadow-[0_30px_70px_rgba(28,136,255,0.1)] ${(i % items.length) === (activeIndex % items.length) ? 'opacity-100 scale-100' : 'opacity-35 scale-95'}`}
            style={{ width: cardWidth, height: 500 }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const p = Math.min(elapsed / (duration * 1000), 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setCount(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { requestAnimationFrame(animate); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (nodeRef.current) observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={nodeRef}>{count}</span>;
}

function Highlighter({ children, color, delay = 0.5 }: { children: React.ReactNode; color: string; delay?: number }) {
  const [highlighted, setHighlighted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setHighlighted(true), delay * 1000);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);
  return (
    <span ref={ref} className="relative inline-block px-2">
      <span className={`relative z-10 transition-colors duration-700 ${highlighted ? 'text-white' : 'text-inherit'}`}>{children}</span>
      <motion.span
        initial={{ width: 0 }}
        animate={highlighted ? { width: '100%' } : { width: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ backgroundColor: color }}
        className="absolute -inset-y-1 inset-x-0 z-0"
      />
    </span>
  );
}

function GlassModal({ isOpen, content, onClose }: { isOpen: boolean; content: { title: string; body: string } | null; onClose: () => void }) {
  if (!isOpen || !content) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/20 backdrop-blur-3xl" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/10 border border-white/20 p-16 rounded-[64px] max-w-2xl w-full text-center shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-4xl font-light text-white mb-8">{content.title}</h3>
        <p className="text-xl text-white/70 font-extralight leading-relaxed">{content.body}</p>
        <button onClick={onClose} className="mt-12 text-white/50 hover:text-white transition-colors">Close</button>
      </motion.div>
    </div>
  );
}
