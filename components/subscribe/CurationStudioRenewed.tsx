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

import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { X } from 'lucide-react';
import { themes, AQUA_FLAVOR, AQUA_ID, COMBO_FLAVORS, comboIdFor } from '@/app/pass/passData';

// 클릭(탭) = 추가(+1) / 상하좌우 아무 방향 스와이프 = 제거(−1).
// 끈 '거리'가 아니라 '횟수'가 기준 — 한 번의 연속 드래그가 임계값을 넘는 순간 딱 1개만 빠지고,
// 그 상태로 더 끌어도 추가로 빠지지 않는다(손을 떼고 다시 스와이프해야 한 번 더 빠짐).
//
// ⚠️ 두 가지 실측 함정을 피한 구현이다:
//  1) framer-motion 의 제스처 prop(drag, onPan 둘 다 확인)은 같은 엘리먼트의 onTap/onClick 을 완전히
//     죽인다(v11.18.2). → framer 제스처를 안 쓰고 순수 포인터 이벤트로 직접 감지한다.
//  2) 브라우저는 같은 엘리먼트에서 pointerdown→pointerup 이 끝나면 '드래그였어도' click 을 한 번 더
//     쏜다. 그대로 두면 스와이프로 −1 한 직후 onTap 이 +1 해서 상쇄돼 아무 일도 안 일어난 것처럼 보인다
//     (특히 1개→0개가 안 되는 증상). → 움직인 제스처였으면 뒤따라오는 click 을 삼킨다(movedRef).
const SWIPE_REMOVE_THRESHOLD = 18; // 이 거리를 넘으면 1개 제거 (2026-08-03: 36 → 18, 진 요청으로 절반)
const SWIPE_VISUAL_CAP = 28; // 카드가 실제로 밀려나 보이는 최대 거리 (임계값과 같은 비율로 축소)
const TAP_SLOP = 6; // 이보다 많이 움직였으면 탭이 아니라 스와이프로 본다

/** 스와이프 시 카드가 밀려나는 '보이는 방향' — 실제 끈 방향과 별개로 고정한다 */
type SwipeVisual =
  | 'up' // 어느 방향으로 끌든 항상 위로 (일반 플레이버 카드)
  | 'lateral'; // 좌우는 끈 그대로, 상하는 오른쪽으로 (콤보 카드)

function useSwipeToRemove({
  onTap, onRemoveOne, enabled, visual,
}: {
  onTap: () => void;
  onRemoveOne: () => void;
  enabled: boolean;
  visual: SwipeVisual;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false); // 이번 제스처에서 이미 1개 뺐는지
  const movedRef = useRef(false); // 이번 제스처가 탭이 아니라 스와이프였는지

  const snapBack = () => {
    const spring = { type: 'spring' as const, stiffness: 500, damping: 30 };
    animate(x, 0, spring);
    animate(y, 0, spring);
  };

  return {
    style: { x, y },
    onPointerDown: (e: React.PointerEvent) => {
      startRef.current = { x: e.clientX, y: e.clientY };
      firedRef.current = false;
      movedRef.current = false;
      // 포인터가 이미 사라졌으면 throw 한다 — 캡처 실패는 제스처 자체를 막을 이유가 아니다
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!startRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist > TAP_SLOP) movedRef.current = true;

      // 보이는 이동 — 방향은 visual 규칙으로 고정, 크기만 실제 드래그를 따른다
      const capped = Math.min(SWIPE_VISUAL_CAP, dist);
      if (visual === 'up') {
        x.set(0);
        y.set(-capped); // 항상 위로
      } else {
        const horizontal = Math.abs(dx) >= Math.abs(dy);
        // 좌우 스와이프는 끈 방향 그대로, 상하 스와이프는 오른쪽으로
        x.set(horizontal ? Math.max(-SWIPE_VISUAL_CAP, Math.min(SWIPE_VISUAL_CAP, dx)) : capped);
        y.set(0);
      }

      if (!enabled || firedRef.current) return;
      if (dist > SWIPE_REMOVE_THRESHOLD) {
        firedRef.current = true;
        onRemoveOne();
      }
    },
    onPointerUp: () => {
      startRef.current = null;
      snapBack();
    },
    onPointerCancel: () => {
      startRef.current = null;
      snapBack();
    },
    // 스와이프 뒤에 따라오는 click 은 삼킨다 — 안 그러면 방금 뺀 1개가 도로 붙는다
    onClick: () => {
      if (movedRef.current) {
        movedRef.current = false;
        return;
      }
      onTap();
    },
  };
}

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
  /** true면 자체 배경(영상·검정 라운드 컨테이너)을 그리지 않는다 — 부모가 전체 화면 배경을 담당 */
  fullscreenBg?: boolean;
  /** 현재 테마 배경 영상이 바뀔 때 부모에 알림 (전체 화면 배경 크로스페이드용) */
  onBgChange?: (video?: string) => void;
  onAdd: (flavorId: string) => void;
  /** 좌우 스와이프로 이 맛(또는 콤보) 하나를 뺀다 — 드로어의 '−'와 동일한 동작 재사용 */
  onRemoveOne?: (flavorId: string) => void;
  onRemoveSlot: (index: number) => void;
  onClear: () => void;
  /** 오른쪽 드로어의 실측 높이(px) — 전달되면 유리 블록 높이를 이 값에 맞춘다(개별 테마/Show All 공통) */
  drawerH?: number | null;
}

const findFlavor = (flavorId: string): { id: string; name: string; tag: string; image: string } | null =>
  flavorId === AQUA_ID
    ? (AQUA_FLAVOR as { id: string; name: string; tag: string; image: string })
    : themes.flatMap((t) => t.flavors).find((f) => f.id === flavorId) ?? null;

const isDefaultSlot = (s: Slot) => !s.flavorId || s.flavorId === AQUA_ID;

// SSR 안전한 useLayoutEffect (Next.js 서버 렌더 경고 방지)
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// 왼쪽 창 대제목과 동일한 '블러 스루 슬라이드' — 테마 이름/카드 그리드 교체에 사용 (mode="wait" 와 함께)
const titleSwap = {
  initial: { opacity: 0, y: 24, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  // 퇴장은 빠르게(0.3s), 진입은 여유 있게(0.6s) — 총 교체 ~0.9s
  exit: { opacity: 0, y: -24, filter: 'blur(10px)', transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } },
  transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
} as const;

export default function CurationStudioRenewed({ boxCount, slots, onAdd, onRemoveOne, fullscreenBg = false, onBgChange, drawerH }: Props) {
  const [activeTheme, setActiveTheme] = useState(0); // 0..n-1: 테마, SHOW_ALL_ID: Show All

  // 유리 블록 높이 애니메이션의 단일 주체:
  // 안쪽 콘텐츠의 '자연 높이'를 측정해서 래퍼의 실제 height 를 tween 한다.
  // (framer 의 layout=transform 방식은 자식을 세로로 찌그러뜨려 덜컹거리므로 사용하지 않음)
  const contentRef = useRef<HTMLDivElement>(null);
  const [blockHeight, setBlockHeight] = useState<number | 'auto'>('auto');

  useIsoLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setBlockHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // activeTheme 이 바뀌면 콘텐츠가 교체되므로 다시 측정
  }, [activeTheme]);

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
  const removeOne = (flavorId: string) => onRemoveOne?.(flavorId);

  // 전체 화면 배경 모드: 부모가 배경 영상을 그릴 수 있게 현재 영상 경로를 알려준다
  useEffect(() => {
    if (fullscreenBg) onBgChange?.(bgVideo);
  }, [fullscreenBg, bgVideo, onBgChange]);

  return (
    <div
      className={
        fullscreenBg
          ? 'relative w-full' // 배경은 부모(전체 화면)가 담당 — 유리 블록만 그린다
          : 'relative w-full rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(28,136,255,0.2)] bg-black'
      }
    >
      {/* 전체 배경 영상 — 크로스페이드(이전 배경이 사라지기 전에 새 배경이 겹쳐 들어옴) */}
      {!fullscreenBg && (
        <AnimatePresence initial={false}>
          <motion.div
            key={activeTheme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
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
      )}

      {/* 콘텐츠 — 하나의 큰 유리 블록. 래퍼는 '실제 height' 만 tween (transform 없음 → 찌그러짐/바운스 없음) */}
      <div className={fullscreenBg ? 'relative z-10' : 'relative z-10 p-6 md:p-8'}>
        <motion.div
          animate={{ height: blockHeight }}
          transition={{ duration: 1.1, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-[28px] bg-black/40 backdrop-blur-[40px] border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* 자연 높이 측정 대상 (height 애니메이션의 영향을 받지 않는 안쪽 컨테이너).
              drawerH 가 있으면 그 높이로 '고정'(개별 테마/Show All 공통) — 남는/모자란 공간은 그리드 영역(flex-1)이 흡수.
              min-h-[60vh]는 drawerH 미측정 시(초기 마운트)의 폴백 하한선 */}
          <div
            ref={contentRef}
            style={drawerH ? { height: drawerH } : undefined}
            className="relative flex flex-col justify-between gap-8 px-8 md:px-10 pt-10 md:pt-12 pb-2 md:pb-3 min-h-[60vh]"
          >
          {/* 테마 정보 (Show All에서는 흐름에서 즉시 빠지고 opacity 로만 사라짐 → 높이는 래퍼가 담당)
              key에 activeTheme 포함: 테마 전환 시 제목·설명·Formula 수치가 '한 스냅샷'으로 함께 crossfade.
              (제목만 mode="wait"로 늦게 바뀌면 옛 제목 + 새 수치가 섞여 보이는 순간이 생긴다) */}
          <AnimatePresence mode="popLayout" initial={false}>
          {!isShowAll && currentTheme && (
            <motion.div
              key="theme-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="shrink-0 flex flex-col gap-14">
              {/* 테마 이름/설명 — 왼쪽 창 대제목과 동일한 블러 스루 슬라이드 */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={activeTheme} {...titleSwap} className="flex items-end justify-between gap-8">
                  <h2 className="text-5xl md:text-6xl font-medium text-white tracking-tighter leading-none lowercase flex-shrink-0">
                    {currentTheme.name}
                  </h2>
                  <p className="text-base text-white/45 font-normal leading-[1.6] text-right whitespace-pre-line line-clamp-2 max-w-sm ml-auto">
                    {currentTheme.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* 파라미터 섹션 — 블러 스루 제외 대상: 기존 크로스페이드 유지 */}
              <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`params-${activeTheme}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="grid grid-cols-2 gap-12 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
                <div className="flex flex-col gap-4">
                  <span className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Formula Composition</span>
                  <div className="flex flex-col gap-5">
                    {currentTheme.formula?.map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-center h-7">
                          <span className="text-lg text-white/75 font-medium">{item.name}</span>
                          <span className="text-sm text-white/35 font-mono tracking-tighter">{item.value}</span>
                        </div>
                        <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: item.p }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-gradient-to-r from-white/10 to-white/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-xs text-white/40 uppercase tracking-[0.3em] font-medium">Flavor Parameters</span>
                  <div className="flex flex-col gap-5">
                    {currentTheme.parameters?.map((param, idx) => {
                      const visualPos = 15 + param.value * 0.7;
                      return (
                        <div key={idx} className="flex flex-col gap-2">
                          <div className="relative flex justify-between items-center h-7">
                            <span className="text-lg text-white/75 font-medium z-10">{param.minLabel}</span>
                            <span className="text-lg text-white/75 font-medium z-10">{param.maxLabel}</span>
                          </div>
                          <div className="relative h-[3px] w-full bg-white/5 rounded-full">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${visualPos}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-gradient-to-r from-white/10 to-white/20" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
          </AnimatePresence>

          {/* 테마 탭 — 위치 변화는 translate 로 슬라이드 (툭 튀지 않게).
              layoutRoot: 검은 필(layoutId)의 이동 좌표를 이 줄 '내부 기준'으로 계산 —
              Show All 전환으로 탭 줄이 위아래로 이동해도 필은 줄 안에서 수평으로만 미끄러진다 */}
          <motion.div
            layout="position"
            layoutRoot
            transition={{ layout: { duration: 1.1, ease: [0.32, 0.72, 0, 1] } }}
            className="shrink-0 flex justify-center py-3"
          >
            <div className="inline-flex items-center gap-1 p-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10">
              {STUDIO_THEMES.map((theme, i) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(i)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all relative ${activeTheme === i ? 'text-white' : 'text-white/60 hover:text-white'}`}
                >
                  {activeTheme === i && (
                    <motion.div
                      layoutId="theme-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      className="absolute inset-0 bg-black rounded-full z-0 shadow-lg"
                    />
                  )}
                  <span className="relative z-10">{theme.name}</span>
                </button>
              ))}
              <button
                onClick={() => setActiveTheme(SHOW_ALL_ID)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all relative ${isShowAll ? 'text-white' : 'text-white/60 hover:text-white'}`}
              >
                {isShowAll && (
                  <motion.div
                    layoutId="theme-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    className="absolute inset-0 bg-black rounded-full z-0 shadow-lg"
                  />
                )}
                <span className="relative z-10">Show All</span>
              </button>
            </div>
          </motion.div>

          {/* 플레이버 선택 그리드 — 스크롤로 잘리는 위/아래는 마스크로 부드럽게 페이드 */}
          <motion.div
            layout="position"
            transition={{ layout: { duration: 1.1, ease: [0.32, 0.72, 0, 1] } }}
            // 스와이프로 카드가 밀려나는 만큼(SWIPE_VISUAL_CAP=28px) overflow-auto 가 잘라먹지 않게
            // 위·좌·우에 여유 패딩을 주고 음수 마진으로 레이아웃엔 영향 없게 상쇄. 아래는 아무것도
            // 밀려나지 않으니 원래 값(12px) 유지 — flex-1 높이 예산을 불필요하게 깎지 않기 위해서.
            className="relative flex-1 min-h-0 overflow-auto overscroll-contain scrollbar-hide pt-8 px-8 pb-3 -mt-8 -mx-8 -mb-3"
            style={
              isShowAll
                ? {
                    maskImage:
                      'linear-gradient(to bottom, transparent 0, #000 34px, #000 calc(100% - 34px), transparent 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, transparent 0, #000 34px, #000 calc(100% - 34px), transparent 100%)',
                  }
                : undefined
            }
          >
            {/* 카드+콤보 교체 — 왼쪽 창 대제목과 동일한 블러 스루 슬라이드.
                콤보 바 위치: Show All = 맨 위(테마별 4개), 개별 테마 탭 = 그리드 아래(그 테마 1개) */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={activeTheme} {...titleSwap} className="flex flex-col gap-3 pb-2">
                {isShowAll && (
                  <div className="flex flex-col gap-2">
                    {STUDIO_THEMES.map((t) => (
                      <ComboBar
                        key={t.id}
                        theme={t}
                        qty={cart[comboIdFor(t.id)] || 0}
                        canAdd={hasSlotToFill}
                        onAdd={() => add(comboIdFor(t.id))}
                        onRemoveOne={() => removeOne(comboIdFor(t.id))}
                      />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 lg:grid-cols-5 gap-3">
                  {gridFlavors.map((flavor) => (
                    <FlavorCard
                      key={flavor.id}
                      flavor={flavor}
                      qty={cart[flavor.id] || 0}
                      hasSlotToFill={hasSlotToFill}
                      onAdd={() => add(flavor.id)}
                      onRemoveOne={() => removeOne(flavor.id)}
                    />
                  ))}
                </div>

                {!isShowAll && currentTheme && (
                  <ComboBar
                    theme={currentTheme}
                    qty={cart[comboIdFor(currentTheme.id)] || 0}
                    canAdd={hasSlotToFill}
                    onAdd={() => add(comboIdFor(currentTheme.id))}
                    onRemoveOne={() => removeOne(comboIdFor(currentTheme.id))}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* 플레이버 카드 — 클릭(탭) = 추가, 좌우 스와이프 = 1개 제거.
   드래그와 클릭은 framer-motion 이 알아서 구분한다(움직임이 거의 없으면 탭 → onClick,
   임계값을 넘게 움직이면 드래그로 인식 → onClick 이 발화하지 않음). */
function FlavorCard({
  flavor, qty, hasSlotToFill, onAdd, onRemoveOne,
}: {
  flavor: { id: string; name: string; tag: string; image: string };
  qty: number;
  hasSlotToFill: boolean;
  onAdd: () => void;
  onRemoveOne: () => void;
}) {
  const inCart = qty > 0;
  // 일반 플레이버 카드: 어느 방향으로 스와이프하든 카드는 '위'로 밀려난다
  const swipe = useSwipeToRemove({ onTap: onAdd, onRemoveOne, enabled: inCart, visual: 'up' });
  return (
    <motion.div
      {...swipe}
      animate={{ borderColor: inCart ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
      // hover 로 y 를 건드리지 않는다 — 스와이프 이동(style.y)과 같은 값을 두고 싸우기 때문
      whileHover={{ scale: 1.04, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className={`relative aspect-square rounded-[20px] overflow-hidden cursor-pointer shadow-[0_12px_30px_rgba(0,0,0,0.35)] border-[4px] touch-none ${
        !hasSlotToFill && !inCart ? 'opacity-50' : ''
      }`}
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
}

/* 콤보 팩 바 — 같은 맛 5개짜리 일반 팩과 달리, 그 테마의 플레이버 5종이 1개씩 들어있는 구성.
   플레이버 카드가 정사각으로 낮아진 만큼 빈 높이가 생기므로, 이 바를 넉넉한 높이(큰 제목+큰 원)로
   채워서 블록 전체 높이가 줄어들지 않게 한다. 레이아웃: [제목 — 맨 왼쪽, 크게] … [설명][원 5개 — 오른쪽]
   클릭(탭) = 추가, 좌우 스와이프 = 1개 제거 — 플레이버 카드와 동일한 규칙. */
function ComboBar({
  theme, qty, canAdd, onAdd, onRemoveOne,
}: {
  theme: (typeof STUDIO_THEMES)[number];
  qty: number;
  canAdd: boolean;
  onAdd: () => void;
  onRemoveOne: () => void;
}) {
  const combo = COMBO_FLAVORS.find((c) => c.themeId === theme.id);
  const inCart = qty > 0;
  // 콤보 카드: 좌우 스와이프는 끈 방향 그대로, 상하 스와이프는 오른쪽으로 밀려난다
  const swipe = useSwipeToRemove({ onTap: onAdd, onRemoveOne, enabled: inCart, visual: 'lateral' });
  if (!combo) return null;
  return (
    <motion.div
      {...swipe}
      // 테두리를 일반 플레이버 카드와 동일 규격으로: border-[4px] + 같은 기본/선택 색상
      animate={{ borderColor: inCart ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)' }}
      whileHover={{ scale: 1.01, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      // 검은 톤을 진하게(bg-black/50) — 배경 유리 블록(black/40)보다 더 어둡게 눌러서 버튼임이 뚜렷이 보이게.
      // 높이는 컴팩트하게(py-3.5) — 드로어 높이와 맞추기 위해 줄임
      className={`relative flex items-center justify-between gap-6 rounded-[20px] border-[4px] bg-black/50 hover:bg-black/60 px-6 py-2.5 cursor-pointer shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition-colors touch-none ${
        !canAdd && !inCart ? 'opacity-50' : ''
      }`}
    >
      {/* 제목 — 맨 왼쪽, 크게 */}
      <h4 className="text-xl font-semibold text-white truncate shrink-0">{theme.name} Combo</h4>

      {/* 설명 + 미니 원 5개(오른쪽 정렬) + 수량 */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xs text-white/45 uppercase tracking-widest whitespace-nowrap">1 of each flavor</span>
        <div className="flex -space-x-3">
          {combo.thumbnails.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={img}
              alt=""
              className="w-9 h-9 rounded-full object-cover border-2 border-black/60 shadow-sm"
              style={{ zIndex: combo.thumbnails.length - i }}
            />
          ))}
        </div>
        <AnimatePresence>
          {qty > 0 && (
            <motion.div
              key="qty"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold flex items-center justify-center shadow-lg"
            >
              {qty}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── 장바구니 — 우측 요약 패널에 삽입되는 컴팩트 버전 ──
 * 카드 디자인·선택 시스템(탭하면 Aqua로 되돌림)·스프링 애니메이션은 기존 그대로.
 * 컨테이너만 패널에 맞게 슬림화: 자체 유리 박스를 없애고 그리드로 감긴다(6박스=3×2). */
export function StudioBasket({
  boxCount, slots, onRemoveSlot, onClear, variant = 'light',
}: {
  boxCount: number;
  slots: Slot[];
  onRemoveSlot: (index: number) => void;
  onClear: () => void;
  /** 'glass' = 어두운 블러 블록(섹션2 전체화면 영상) 위에 놓일 때 — 버튼 색만 달라지고 카드 디자인은 동일 */
  variant?: 'light' | 'glass';
}) {
  const customized = slots.filter((s) => s.flavorId && s.flavorId !== AQUA_ID).length;
  const allCustomized = customized >= boxCount;
  const glass = variant === 'glass';

  return (
    <div className="w-full">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(boxCount, 3)}, minmax(0, 1fr))` }}
      >
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
                className={`relative aspect-[4/5] rounded-[16px] overflow-hidden shadow-[0_8px_20px_rgba(28,136,255,0.18)] ${
                  isAqua ? '' : 'cursor-pointer'
                }`}
              >
                {isAqua ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#DCEEFF] via-[#A9D6FF] to-[#7BC0FF]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.65),transparent_46%)]" />
                    <div className="absolute bottom-0 inset-x-0 p-2">
                      <h4 className="text-xs font-semibold text-[#0B5CAB] truncate">{flavor.name}</h4>
                      <span className="text-[8px] text-[#0B5CAB]/60 uppercase tracking-widest">{flavor.tag}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={flavor.image} className="absolute inset-0 w-full h-full object-cover" alt={flavor.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {/* 취소(X) — 스튜디오 카드 수량 동그라미와 같은 양식 */}
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg">
                      <X className="w-3 h-3" />
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-2">
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
        className={`mt-3 w-full h-10 rounded-full font-bold text-sm transition-all duration-300 ${
          allCustomized
            ? glass
              ? 'bg-white/15 text-white hover:bg-white/25 cursor-pointer'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer'
            : glass
              ? 'bg-white/10 text-white/45 cursor-default'
              : 'bg-slate-50 text-slate-400 cursor-default'
        }`}
      >
        {allCustomized
          ? 'Clear all'
          : `Pick ${boxCount - customized} flavor${boxCount - customized > 1 ? 's' : ''} more!`}
      </button>
    </div>
  );
}
