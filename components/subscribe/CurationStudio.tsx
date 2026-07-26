'use client';

/**
 * Curation Studio — 우측에서 슬라이딩해 들어오는 플레이버 선택 드로어 (데스크탑 전용)
 *
 * app/pass 의 PassDesktop "Curation Studio"(Step 2 모달)를 /subscribe 섹션 2에 통합한 버전.
 * 선택 상태는 부모(/subscribe)의 slots 를 단일 진실로 삼고, add/removeSlot/clear 콜백으로 동기화한다.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { themes } from '@/app/pass/passData';

type Slot = { themeId: string | null; flavorId: string | null };

interface Props {
  open: boolean;
  onClose: () => void;
  boxCount: number;
  slots: Slot[];
  onAdd: (flavorId: string) => void;
  onRemoveSlot: (index: number) => void;
  onClear: () => void;
}

const findFlavor = (flavorId: string) =>
  themes.flatMap((t) => t.flavors).find((f) => f.id === flavorId) ?? null;

export default function CurationStudio({
  open, onClose, boxCount, slots, onAdd, onRemoveSlot, onClear,
}: Props) {
  const [activeTheme, setActiveTheme] = useState(0); // 0-4: themes, 5: Show All

  // slots → cart(수량 맵) 파생
  const cart = useMemo(() => {
    const c: Record<string, number> = {};
    slots.forEach((s) => {
      if (s.flavorId) c[s.flavorId] = (c[s.flavorId] || 0) + 1;
    });
    return c;
  }, [slots]);

  const total = slots.filter((s) => s.flavorId).length;
  const isFull = total >= boxCount;

  const add = (flavorId: string) => {
    if (isFull) return;
    onAdd(flavorId);
  };

  const gridFlavors =
    activeTheme === 5 ? themes.flatMap((t) => t.flavors) : themes[activeTheme]?.flavors ?? [];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120]">
          {/* 배경 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
          />

          {/* 드로어 — 오른쪽에서 슬라이딩 */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 34 }}
            className={`absolute top-0 right-0 h-full w-[94vw] max-w-[1080px] shadow-[0_0_120px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden transition-colors duration-500 ${
              activeTheme === 5 ? 'bg-white' : 'bg-[#F8FAFC]'
            }`}
          >
            {/* HEADER */}
            <div className="absolute top-8 left-8 right-8 z-[60] flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto">
                <h3
                  className={`text-2xl font-medium tracking-tight transition-colors duration-500 ${
                    activeTheme === 5 ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  Curation Studio
                </h3>
                <p
                  className={`text-sm font-normal mt-0.5 transition-colors duration-500 ${
                    activeTheme === 5 ? 'text-gray-400' : 'text-white/60'
                  }`}
                >
                  {activeTheme === 5 ? 'All Collection Explorer' : 'Explore our sensory themes.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all pointer-events-auto ${
                  activeTheme === 5
                    ? 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* THEATER STAGE */}
            <AnimatePresence>
              {activeTheme !== 5 && (
                <motion.div
                  key="theater"
                  initial={{ y: '-105%', height: 0 }}
                  animate={{ y: 0, height: '48%' }}
                  exit={{ y: '-105%', height: 0 }}
                  transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                  className="relative flex-shrink-0 w-full overflow-hidden bg-black z-50 shadow-2xl"
                >
                  <div className="absolute inset-0 w-full h-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTheme}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0"
                      >
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

                  <div className="absolute inset-x-0 bottom-0 top-24 flex items-center justify-center px-8">
                    <div className="w-full max-w-4xl bg-black/40 backdrop-blur-[40px] rounded-[40px] border border-white/10 shadow-2xl flex flex-col p-8 gap-6 overflow-hidden">
                      <div className="flex items-end justify-between gap-8">
                        <AnimatePresence mode="wait">
                          <motion.h2
                            key={activeTheme}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-5xl font-medium text-white tracking-tighter leading-none lowercase flex-shrink-0"
                          >
                            {themes[activeTheme]?.name}
                          </motion.h2>
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={activeTheme}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-sm text-white/40 font-normal leading-[1.6] text-right whitespace-pre-line line-clamp-2 max-w-xs ml-auto"
                          >
                            {themes[activeTheme]?.description}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      <div className="grid grid-cols-2 gap-12 relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                        <div className="flex flex-col gap-4">
                          <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">Formula Composition</span>
                          <div className="flex flex-col gap-3.5">
                            {themes[activeTheme]?.formula?.map((item, idx) => (
                              <div key={idx} className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center h-5">
                                  <span className="text-sm text-white/70 font-medium">{item.name}</span>
                                  <span className="text-xs text-white/30 font-mono tracking-tighter">{item.value}</span>
                                </div>
                                <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: item.p }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-gradient-to-r from-white/10 to-white/20" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-4">
                          <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">Flavor Parameters</span>
                          <div className="flex flex-col gap-3.5">
                            {themes[activeTheme]?.parameters?.map((param, idx) => {
                              const visualPos = 15 + param.value * 0.7;
                              return (
                                <div key={idx} className="flex flex-col gap-1.5">
                                  <div className="relative flex justify-between items-center h-5">
                                    <span className="text-sm text-white/70 font-medium z-10">{param.minLabel}</span>
                                    <span className="text-sm text-white/70 font-medium z-10">{param.maxLabel}</span>
                                  </div>
                                  <div className="relative h-[2px] w-full bg-white/5 rounded-full">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${visualPos}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-gradient-to-r from-white/10 to-white/20" />
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
            <div className={`relative w-full flex justify-center z-20 transition-all duration-500 ${activeTheme === 5 ? 'pt-32 pb-4' : 'py-5'}`}>
              <div className="inline-flex items-center gap-1 p-1.5 bg-gray-50/80 backdrop-blur-xl rounded-full">
                {themes.map((theme, i) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(i)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all relative ${activeTheme === i ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {activeTheme === i && <motion.div layoutId="studioActiveBg" className="absolute inset-0 bg-gray-900 rounded-full z-0 shadow-lg" />}
                    <span className="relative z-10">{theme.name}</span>
                  </button>
                ))}
                <button
                  onClick={() => setActiveTheme(5)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all relative ${activeTheme === 5 ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {activeTheme === 5 && <motion.div layoutId="studioActiveBg" className="absolute inset-0 bg-pocari-blue rounded-full z-0 shadow-lg" />}
                  <span className="relative z-10">Show All</span>
                </button>
              </div>
            </div>

            {/* FLAVOR GRID */}
            <div className="flex-1 px-8 py-2 relative z-10 overflow-auto scrollbar-hide">
              <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTheme}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="grid grid-cols-3 lg:grid-cols-5 gap-4 w-full pb-32"
                  >
                    {gridFlavors.map((flavor) => {
                      const qty = cart[flavor.id] || 0;
                      const inCart = qty > 0;
                      return (
                        <motion.div
                          key={flavor.id}
                          animate={{ borderColor: inCart ? '#1C88FF' : 'transparent' }}
                          whileHover={{ scale: 1.05, y: -8, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                          className={`relative aspect-[4/5] rounded-[24px] overflow-hidden cursor-pointer shadow-xl border-[5px] ${
                            isFull && !inCart ? 'opacity-50' : ''
                          }`}
                          onClick={() => add(flavor.id)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={flavor.image} className="absolute inset-0 w-full h-full object-cover" alt={flavor.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-0 inset-x-0 p-4">
                            <h4 className="text-base font-medium text-white mb-0.5">{flavor.name}</h4>
                            <span className="text-[10px] text-white/50 uppercase tracking-widest">{flavor.tag}</span>
                          </div>
                          {qty > 0 && (
                            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                              {qty}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* BASKET */}
            <div className="absolute bottom-6 inset-x-0 px-8 z-50">
              <div className="w-full max-w-[960px] mx-auto bg-blue-50/80 backdrop-blur-3xl border border-white rounded-full shadow-lg flex items-center justify-between p-2.5">
                <button
                  onClick={onClear}
                  className="h-11 px-6 rounded-full bg-[#1A1A1A] text-white font-medium text-sm hover:bg-black transition-all"
                >
                  Clear All
                </button>
                <div className="flex-1 flex justify-center items-center gap-2.5 px-5">
                  {Array.from({ length: boxCount }).map((_, i) => {
                    const s = slots[i];
                    const flavor = s?.flavorId ? findFlavor(s.flavorId) : null;
                    return (
                      <div
                        key={i}
                        onClick={() => flavor && onRemoveSlot(i)}
                        className={`h-10 flex-1 min-w-[70px] max-w-[130px] rounded-full flex items-center justify-center border transition-all ${
                          flavor ? 'bg-white border-blue-100 shadow-sm text-[#1C88FF] cursor-pointer' : 'bg-white/30 border-dashed border-blue-200/50'
                        }`}
                      >
                        {flavor ? (
                          <span className="text-[11px] font-bold truncate px-2">{flavor.name}</span>
                        ) : (
                          <div className="w-1 h-1 bg-blue-200 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  disabled={!isFull}
                  onClick={() => isFull && onClose()}
                  className={`h-11 min-w-[110px] rounded-full flex items-center justify-center px-6 shadow-sm font-bold text-sm transition-all duration-300 ${
                    isFull ? 'bg-[#1C88FF] text-white cursor-pointer hover:bg-blue-600 scale-105' : 'bg-white border border-blue-50 text-gray-400 cursor-default opacity-80'
                  }`}
                >
                  {isFull ? (
                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                      Done
                    </motion.span>
                  ) : (
                    <>
                      <span className="text-[#1C88FF]">{total}</span>
                      <span className="mx-1">/</span>
                      {boxCount}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
