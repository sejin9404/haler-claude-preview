'use client';

/**
 * Curation Studio (Renewed) — /subscribe 데스크탑 Fill your box 내부에 고정 삽입.
 *
 * - 스튜디오 전체 배경을 테마 영상으로 채우고, 그 위에 하나의 큰 유리(블러) 블록을 얹는다.
 *   유리 블록: 테마 이름 + Formula/Parameter + 테마 탭 + 플레이버 선택 그리드.
 * - 'Innoscent'는 맛이 없어 테마에서 제외하고, 그 영상을 'Show All' 배경으로 사용.
 * - 장바구니는 이 컴포넌트 밖(StudioBasket)으로 분리해 스튜디오 아래에 배치.
 * 선택 상태는 부모(/subscribe)의 slots 를 단일 진실로 삼고, add/removeSlot/clear 콜백으로 동기화.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, AQUA_FLAVOR, AQUA_ID } from '@/app/pass/passData';

type Slot = { themeId: string | null; flavorId: string | null };

// 맛이 있는 테마만 (Innoscent 제외)
const STUDIO_THEMES = themes.filter((t) => t.id !== 'innoscent' && t.flavors.length > 0);
const SHOW_ALL_ID = STUDIO_THEMES.length; // 마지막 인덱스 = Show All
const SHOW_ALL_VIDEO = themes.find((t) => t.id === 'innoscent')?.video;

interface Props {
  open?: boolean;
  onClose?: () => void;
  boxCount: number;
  slots: Slot[];
  width?: number;
  embedded?: boolean;
  onAdd: (flavorId: string) => void;
  onRemoveSlot: (index: number) => void;
  onClear: () => void;
}

const findFlavor = (flavorId: string): { id: string; name: string; tag: string; image: string } | null =>
  flavorId === AQUA_ID
    ? (AQUA_FLAVOR as { id: string; name: string; tag: string; image: string })
    : themes.flatMap((t) => t.flavors).find((f) => f.id === flavorId) ?? null;

const isDefaultSlot = (s: Slot) => !s.flavorId || s.flavorId === AQUA_ID;

export default function CurationStudioRenewed({ boxCount, slots, onAdd }: Props) {
  const [activeTheme, setActiveTheme] = useState(0); // 0..n-1: 테마, SHOW_ALL_ID: Show All

  const cart = useMemo(() => {
    const c: Record<string, number> = {};
    slots.forEach((s) => {
      if (s.flavorId && s.flavorId !== AQUA_ID) c[s.flavorId] = (c[s.flavorId] || 0) + 1;
    });
    return c;
  }, [slots]);

  const hasSlotToFill = slots.some(isDefaultSlot);
  const isShowAll = activeTheme === SHOW_ALL_ID;
  const currentTheme = STUDIO_THEMES[activeTheme];
  const bgVideo = isShowAll ? SHOW_ALL_VIDEO : currentTheme?.video;
  const gridFlavors = isShowAll ? STUDIO_THEMES.flatMap((t) => t.flavors) : currentTheme?.flavors ?? [];

  const add = (flavorId: string) => {
    if (!hasSlotToFill) return;
    onAdd(flavorId);
  };

  return (
    <div className="relative w-full rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(28,136,255,0.2)] bg-black">
      {/* 전체 배경 영상 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTheme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {bgVideo && (
            <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-cover scale-105">
              <source src={bgVideo} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* 콘텐츠 — 하나의 큰 유리 블록 (높이는 콘텐츠에 맞춤) */}
      <div className="relative z-10 p-6 md:p-8">
        <div className="flex flex-col gap-6 rounded-[28px] bg-black/40 backdrop-blur-[40px] border border-white/10 shadow-2xl p-6 md:p-8 overflow-hidden">
          {/* 테마 정보 (Show All에서는 숨김) */}
          {!isShowAll && currentTheme && (
            <div className="shrink-0 flex flex-col gap-5">
              <div className="flex items-end justify-between gap-8">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={activeTheme}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-4xl md:text-5xl font-medium text-white tracking-tighter leading-none lowercase flex-shrink-0"
                  >
                    {currentTheme.name}
                  </motion.h2>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeTheme}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm text-white/40 font-normal leading-[1.6] text-right whitespace-pre-line line-clamp-2 max-w-xs ml-auto"
                  >
                    {currentTheme.description}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-12 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">Formula Composition</span>
                  <div className="flex flex-col gap-3">
                    {currentTheme.formula?.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center h-5">
                          <span className="text-sm text-white/70 font-medium">{item.name}</span>
                          <span className="text-xs text-white/30 font-mono tracking-tighter">{item.value}</span>
                        </div>
                        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: item.p }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-gradient-to-r from-white/10 to-white/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">Flavor Parameters</span>
                  <div className="flex flex-col gap-3">
                    {currentTheme.parameters?.map((param, idx) => {
                      const visualPos = 15 + param.value * 0.7;
                      return (
                        <div key={idx} className="flex flex-col gap-1.5">
                          <div className="relative flex justify-between items-center h-5">
                            <span className="text-sm text-white/70 font-medium z-10">{param.minLabel}</span>
                            <span className="text-sm text-white/70 font-medium z-10">{param.maxLabel}</span>
                          </div>
                          <div className="relative h-[2px] w-full bg-white/5 rounded-full">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${visualPos}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-gradient-to-r from-white/10 to-white/20" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 테마 탭 */}
          <div className="shrink-0 flex justify-center py-3">
            <div className="inline-flex items-center gap-1 p-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10">
              {STUDIO_THEMES.map((theme, i) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(i)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all relative ${activeTheme === i ? 'text-gray-900' : 'text-white/60 hover:text-white'}`}
                >
                  {activeTheme === i && <motion.div layoutId="studioActiveBg" className="absolute inset-0 bg-white rounded-full z-0 shadow-lg" />}
                  <span className="relative z-10">{theme.name}</span>
                </button>
              ))}
              <button
                onClick={() => setActiveTheme(SHOW_ALL_ID)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all relative ${isShowAll ? 'text-white' : 'text-white/60 hover:text-white'}`}
              >
                {isShowAll && <motion.div layoutId="studioActiveBg" className="absolute inset-0 bg-pocari-blue rounded-full z-0 shadow-lg" />}
                <span className="relative z-10">Show All</span>
              </button>
            </div>
          </div>

          {/* 플레이버 선택 그리드 */}
          <div className="max-h-[380px] overflow-auto scrollbar-hide">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-3 lg:grid-cols-5 gap-3 pb-2"
              >
                {gridFlavors.map((flavor) => {
                  const qty = cart[flavor.id] || 0;
                  const inCart = qty > 0;
                  return (
                    <motion.div
                      key={flavor.id}
                      animate={{ borderColor: inCart ? '#1C88FF' : 'rgba(255,255,255,0.3)' }}
                      whileHover={{ scale: 1.04, y: -6, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                      className={`relative aspect-[4/5] rounded-[20px] overflow-hidden cursor-pointer shadow-[0_12px_30px_rgba(0,0,0,0.35)] border-[4px] ${
                        !hasSlotToFill && !inCart ? 'opacity-50' : ''
                      }`}
                      onClick={() => add(flavor.id)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flavor.image} className="absolute inset-0 w-full h-full object-cover" alt={flavor.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-3">
                        <h4 className="text-sm font-medium text-white mb-0.5 truncate">{flavor.name}</h4>
                        <span className="text-[9px] text-white/50 uppercase tracking-widest">{flavor.tag}</span>
                      </div>
                      <AnimatePresence>
                        {qty > 0 && (
                          <motion.div
                            key="qty"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold flex items-center justify-center shadow-lg"
                          >
                            {qty}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 장바구니 (스튜디오 밖, 아래에 별도 배치) ── */
export function StudioBasket({
  boxCount, slots, onRemoveSlot, onClear,
}: {
  boxCount: number;
  slots: Slot[];
  onRemoveSlot: (index: number) => void;
  onClear: () => void;
}) {
  const customized = slots.filter((s) => s.flavorId && s.flavorId !== AQUA_ID).length;
  const allCustomized = customized >= boxCount;

  return (
    <div className="w-full bg-blue-50/85 backdrop-blur-3xl border border-white rounded-[32px] shadow-[0_20px_50px_rgba(28,136,255,0.25)] p-5">
      {/* 담긴 플레이버 카드 (Aqua 포함) — boxCount 기준 고정 폭, 스튜디오와 같은 너비 */}
      <div className="flex flex-nowrap justify-center items-center gap-3 mb-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {slots.map((s, i) => {
            const flavor = s.flavorId ? findFlavor(s.flavorId) : null;
            if (!flavor) return null;
            const isAqua = flavor.id === AQUA_ID;
            return (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                onClick={() => !isAqua && onRemoveSlot(i)}
                style={{ width: `calc((100% - ${(boxCount - 1) * 12}px) / ${boxCount})` }}
                className={`relative shrink-0 aspect-[4/5] rounded-[18px] overflow-hidden shadow-[0_10px_24px_rgba(28,136,255,0.22)] ${
                  isAqua ? '' : 'cursor-pointer'
                }`}
              >
                {isAqua ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#DCEEFF] via-[#A9D6FF] to-[#7BC0FF]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.65),transparent_46%)]" />
                    <div className="absolute bottom-0 inset-x-0 p-2.5">
                      <h4 className="text-xs font-semibold text-[#0B5CAB] truncate">{flavor.name}</h4>
                      <span className="text-[8px] text-[#0B5CAB]/60 uppercase tracking-widest">{flavor.tag}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flavor.image} className="absolute inset-0 w-full h-full object-cover" alt={flavor.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-2.5">
                      <h4 className="text-xs font-medium text-white truncate">{flavor.name}</h4>
                      <span className="text-[8px] text-white/50 uppercase tracking-widest">{flavor.tag}</span>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <button
        disabled={!allCustomized}
        onClick={() => allCustomized && onClear()}
        className={`w-full h-12 rounded-full font-bold text-sm transition-all duration-300 ${
          allCustomized
            ? 'bg-[#1C88FF] text-white hover:bg-blue-600 cursor-pointer'
            : 'bg-white text-slate-400 cursor-default'
        }`}
      >
        {allCustomized
          ? 'Clear all'
          : `Pick ${boxCount - customized} flavor${boxCount - customized > 1 ? 's' : ''} more!`}
      </button>
    </div>
  );
}
