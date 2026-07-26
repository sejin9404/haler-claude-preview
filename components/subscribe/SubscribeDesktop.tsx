'use client';

/**
 * Haler — Pre-checkout Configurator (Mockup)
 *
 * 결제 직전 "마지막으로 내 걸 완성하는" 단계.
 * 결제 피로를 주지 않도록, 한 페이지에서 즐겁게 옵션을 고르는 흐름으로 설계.
 *   Plan → Flavors(박스 채우기) → Delivery rhythm → Credits → Review → Shopify Checkout
 *
 * 실제 결제(카드 입력)는 여기서 하지 않는다. 마지막 CTA에서 Shopify Payments로 핸드오프.
 * (지금은 목업이라 핸드오프를 alert/log로 대체)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Check, Sparkles, Truck, Coins, ArrowRight, Lock,
  Package, ChevronRight,
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, PLAN_LIMITS } from '@/constants/plans';
import { themes, AQUA_FLAVOR, AQUA_ID } from '@/app/pass/passData';
import CurationStudioRenewed, { StudioBasket } from '@/components/subscribe/CurationStudioRenewed';

// 맛 선택 가능한 테마만 (innoscent 등 flavors 없는 건 제외)
const FLAVOR_THEMES = themes.filter((t) => t.flavors && t.flavors.length > 0);

const FREQUENCIES = [
  { id: 'monthly', label: 'Every month', months: 1, badge: 'Most popular' },
  { id: 'bimonthly', label: 'Every 2 months', months: 2, badge: 'Relaxed pace' },
  { id: 'quarterly', label: 'Every 3 months', months: 3, badge: 'Stock up' },
] as const;

// 배송 간격 크레딧 보상: 한 달 늘릴 때마다 +$5 (매달 +$0, 2달 +$5, 3달 +$10, N달 (N-1)×$5)
const CREDIT_PER_EXTRA_MONTH = 5;
const deliveryCredit = (months: number) => Math.max(0, (months - 1) * CREDIT_PER_EXTRA_MONTH);

// 목업: 우리 크레딧 잔액 (Shopify Payments엔 저장되지 않는 우리만의 데이터)
const CREDIT_BALANCE = 12.0;

// 마지막 선택 저장 키 (재방문 시 복원)
const STORAGE_KEY = 'haler.subscribe.config.v2';

// 공통 부드러운 전환 (블록 확장/재배치)
const SPRING = { type: 'spring', stiffness: 280, damping: 30 } as const;
// 값/텍스트 교체 시 짧은 페이드
const swap = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.2 },
} as const;

type Slot = { themeId: string | null; flavorId: string | null };

// 기본 슬롯 = Aqua (빈칸 대신). 다른 맛을 고르면 이 자리를 대체한다.
const aquaSlot = (): Slot => ({ themeId: AQUA_ID, flavorId: AQUA_ID });
const isDefaultSlot = (s: Slot) => !s.flavorId || s.flavorId === AQUA_ID;

const money = (n: number) => `$${n.toFixed(0)}`;

// Plan 페이지와 동일한 배경 (PassDesktop의 LiquidBackground)
const LiquidBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden isolate bg-[#F8FAFC]">
    <div className="absolute top-[-20%] left-[-10%] w-full h-full bg-[radial-gradient(circle,rgba(28,136,255,0.22)_0%,transparent_60%)] animate-liquid-flow blur-[60px] will-change-transform transform-gpu" />
    <div className="absolute bottom-[-20%] right-[-10%] w-full h-full bg-[radial-gradient(circle,rgba(0,212,255,0.15)_0%,transparent_60%)] animate-liquid-flow-delayed blur-[50px] will-change-transform transform-gpu" />
  </div>
);

export default function SubscribeDesktop() {
  const router = useRouter();
  const [planId, setPlanId] = useState<string>('essential');
  const boxCount = PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS] ?? 3;

  // 슬롯: 플랜 박스 수에 맞춰 관리
  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: 3 }, () => aquaSlot())
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [activeTheme, setActiveTheme] = useState(FLAVOR_THEMES[0].id);

  const [frequency, setFrequency] = useState<string>('monthly');
  const [customMonths, setCustomMonths] = useState<number>(4);
  const [useCredits, setUseCredits] = useState(false);

  // 이 페이지는 재방문해서 구독을 수정하는 관리 페이지 → 마지막 선택을 저장/복원.
  // (목업: localStorage. 실제 구현에서는 Supabase box_configs / Shopify contract에 저장)
  const [hydrated, setHydrated] = useState(false);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.planId) setPlanId(saved.planId);
        if (Array.isArray(saved.slots)) setSlots(saved.slots);
        if (saved.frequency) setFrequency(saved.frequency);
        if (typeof saved.customMonths === 'number') setCustomMonths(saved.customMonths);
        if (typeof saved.useCredits === 'boolean') setUseCredits(saved.useCredits);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // 현재 배송 간격/보상 크레딧 (커스텀 포함)
  const currentMonths =
    frequency === 'custom'
      ? Math.max(1, customMonths || 1)
      : FREQUENCIES.find((f) => f.id === frequency)?.months ?? 1;
  const earnCredit = deliveryCredit(currentMonths);
  const freqLabel = frequency === 'custom' ? `Every ${currentMonths} months` : (FREQUENCIES.find((f) => f.id === frequency)?.label ?? '');

  React.useEffect(() => {
    if (!hydrated) return; // 복원 전에는 저장하지 않음(기본값 덮어쓰기 방지)
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ planId, slots, frequency, customMonths, useCredits })
      );
    } catch {
      /* ignore */
    }
  }, [hydrated, planId, slots, frequency, useCredits]);

  // 플랜 바뀌면 슬롯 개수 재조정 (기존 선택 보존)
  React.useEffect(() => {
    setSlots((prev) => {
      const next = prev.slice(0, boxCount);
      while (next.length < boxCount) next.push(aquaSlot());
      return next;
    });
    setActiveSlot((s) => Math.min(s, boxCount - 1));
  }, [boxCount]);

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)!;
  const basePrice = parseInt(plan.price, 10);

  const filledCount = slots.filter((s) => s.flavorId).length;
  const allFilled = filledCount === boxCount;

  const creditApplied = useCredits ? Math.min(CREDIT_BALANCE, basePrice) : 0;
  const total = Math.max(0, basePrice - creditApplied);

  // 진행 단계 완료 여부
  const steps = [
    { key: 'plan', label: 'Plan', done: !!planId },
    { key: 'flavors', label: 'Flavors', done: allFilled },
    { key: 'delivery', label: 'Delivery', done: !!frequency },
    { key: 'credits', label: 'Credits', done: true },
  ];

  const assignFlavor = (themeId: string, flavorId: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[activeSlot] = { themeId, flavorId };
      return next;
    });
    // 다음 기본(Aqua) 슬롯으로 자동 이동
    setActiveSlot((cur) => {
      const after = slots.findIndex((s, i) => i > cur && isDefaultSlot(s));
      if (after !== -1) return after;
      const anyDefault = slots.findIndex((s, i) => i !== cur && isDefaultSlot(s));
      return anyDefault !== -1 ? anyDefault : cur;
    });
  };

  // ── Curation Studio(데스크탑) ↔ slots 브릿지 ──
  const [studioOpen, setStudioOpen] = useState(false);
  // 드로어 폭 = 페이지가 왼쪽으로 밀리는 폭 (동기화)
  const [studioW, setStudioW] = useState(0);
  React.useEffect(() => {
    const calc = () => setStudioW(Math.min(880, Math.round(window.innerWidth * 0.6)));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  const themeOfFlavor = (flavorId: string) =>
    themes.find((t) => t.flavors.some((f) => f.id === flavorId)) ?? null;
  // 다른 맛을 고르면 첫 기본(Aqua) 슬롯을 대체
  const addFlavorToFirstEmpty = (flavorId: string) => {
    setSlots((prev) => {
      const idx = prev.findIndex((s) => isDefaultSlot(s));
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { themeId: themeOfFlavor(flavorId)?.id ?? null, flavorId };
      return next;
    });
  };
  // 제거 = 기본(Aqua)으로 되돌림
  const clearSlot = (index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = aquaSlot();
      return next;
    });
  };
  const clearAllSlots = () => setSlots((prev) => prev.map(() => aquaSlot()));

  const flavorById = (themeId: string | null, flavorId: string | null) => {
    if (flavorId === AQUA_ID) return AQUA_FLAVOR;
    if (!themeId || !flavorId) return null;
    const t = FLAVOR_THEMES.find((x) => x.id === themeId);
    return t?.flavors.find((f) => f.id === flavorId) ?? null;
  };

  const currentTheme = FLAVOR_THEMES.find((t) => t.id === activeTheme)!;

  const handleCheckout = () => {
    // 실제 구현: Shopify Storefront cart(selling plan) 생성 후 checkout 리다이렉트.
    // 지금은 목업 결제 화면(/checkout)으로 선택값을 넘겨 핸드오프를 시뮬레이션.
    const config = {
      planId,
      slots: slots.map((s) => ({ t: s.themeId, f: s.flavorId })),
      freq: frequency,
      freqLabel,
      earnCredit,
      credit: creditApplied,
      total,
    };
    const c = encodeURIComponent(JSON.stringify(config));
    router.push(`/checkout?c=${c}`);
  };

  return (
    <div className="relative h-screen text-slate-900">
      <LiquidBackground />

      {/* 슬롯머신처럼 각 섹션이 화면 중앙에 오도록 scroll-snap */}
      <motion.div
        animate={{ paddingRight: studioOpen ? studioW : 0 }}
        transition={SPRING}
        className="relative z-10 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {/* ── Panel 1: Hero + Plan (플랜이 화면 중앙, 히어로는 그 위 패딩에 종속) ── */}
        <section className="snap-center min-h-screen flex items-center justify-center px-6">
          <div className="relative w-full max-w-4xl">
            {/* 히어로 — 플랜 위에 떠 있어(패딩 종속), 플랜은 화면 중앙 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full inset-x-0 pb-16 md:pb-24 text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 leading-[0.95]">
                Ritualize your breath.
              </h1>
              <p className="mt-5 text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                Fill your every breath full of scent with daily hydration routine.
              </p>
            </motion.div>
            {/* ── 1. PLAN ── */}
            <Section index={1} title="Choose your plan" caption="How much hydration fits your life?">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUBSCRIPTION_PLANS.map((p) => {
              const selected = p.id === planId;
              return (
                <motion.button
                  key={p.id}
                  layout
                  onClick={() => setPlanId(p.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`relative text-left p-5 rounded-3xl border-2 transition-colors ${
                    selected
                      ? 'border-pocari-blue bg-white shadow-[0_12px_30px_rgba(28,136,255,0.15)]'
                      : 'border-transparent bg-white/70 hover:bg-white'
                  }`}
                >
                  {/* 상단: 박스 수(좌) + 뱃지(우, 기존 체크 자리) */}
                  <div className="flex items-center justify-between min-h-[18px]">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      {p.boxes}
                    </span>
                    {(p.isPopular || p.isBestValue) && (
                      <span className="bg-pocari-blue text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                        {p.tag}
                      </span>
                    )}
                  </div>

                  {/* 플랜 이름 + 가격 — 같은 줄, 같은 크기, 위아래 넉넉한 간격 */}
                  <div className="flex items-baseline justify-between gap-2 my-6">
                    <span className="text-[26px] font-bold leading-none">{p.title}</span>
                    <span className="text-[26px] font-bold leading-none text-pocari-blue">${p.price}</span>
                  </div>

                  <ul className="space-y-1.5">
                    {p.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="text-pocari-blue">{f.icon}</span>
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  {/* 선택 체크 — 우하단 모서리 */}
                  <AnimatePresence>
                    {selected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-pocari-blue flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
            </Section>
          </div>
        </section>

        {/* ── Panel 2: Fill your box ── */}
        <section className="snap-start min-h-screen flex flex-col items-center justify-center px-6 py-[10vh]">
          <div className="w-full max-w-4xl">
            {/* ── 2. FLAVORS (박스 채우기) ── */}
        <Section
          index={2}
          title="Fill your box"
          caption={`Curate your ${boxCount} flavors — Aqua is the default.`}
        >
          {/* 데스크탑: Curation Studio(고정 삽입) + 그 아래 장바구니(별도 레이어) */}
          <CurationStudioRenewed
            boxCount={boxCount}
            slots={slots}
            onAdd={addFlavorToFirstEmpty}
            onRemoveSlot={clearSlot}
            onClear={clearAllSlots}
          />
          <div className="mt-5">
            <StudioBasket
              boxCount={boxCount}
              slots={slots}
              onRemoveSlot={clearSlot}
              onClear={clearAllSlots}
            />
          </div>

            </Section>
          </div>
        </section>

        {/* ── Panel 3: Delivery ── */}
        <section className="snap-center min-h-[64vh] flex items-center justify-center px-6">
          <div className="w-full max-w-4xl">
            {/* ── 3. DELIVERY RHYTHM ── */}
        <Section
          index={3}
          title="Delivery rhythm"
          caption={`You'll earn +${money(earnCredit)} credit every delivery. · Pause anytime — no cancellation needed.`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FREQUENCIES.map((fq) => {
              const selected = fq.id === frequency;
              const credit = deliveryCredit(fq.months);
              return (
                <motion.button
                  key={fq.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFrequency(fq.id)}
                  className={`relative p-4 rounded-2xl border-2 text-left transition-colors ${
                    selected ? 'border-pocari-blue bg-white' : 'border-transparent bg-white/70'
                  }`}
                >
                  {/* 우상단: 크레딧 보상 뱃지 (프로모 뱃지 자리) */}
                  <div className="absolute top-2.5 right-2.5">
                    <CreditTag amount={credit} />
                  </div>
                  <Truck className={`w-5 h-5 ${selected ? 'text-pocari-blue' : 'text-slate-300'}`} />
                  <div className="mt-3 text-sm font-bold whitespace-nowrap">{fq.label}</div>
                  {selected && (
                    <Check className="absolute bottom-3 right-3 w-4 h-4 text-pocari-blue stroke-[3]" />
                  )}
                </motion.button>
              );
            })}

            {/* 커스텀 슬롯 — 몇 달에 한 번 받을지 직접 입력 */}
            <div
              onClick={() => setFrequency('custom')}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-colors col-span-2 sm:col-span-1 ${
                frequency === 'custom' ? 'border-pocari-blue bg-white' : 'border-transparent bg-white/70'
              }`}
            >
              <div className="absolute top-2.5 right-2.5">
                <CreditTag amount={deliveryCredit(Math.max(1, customMonths || 1))} />
              </div>
              <Truck className={`w-5 h-5 ${frequency === 'custom' ? 'text-pocari-blue' : 'text-slate-300'}`} />
              <div className="mt-3 text-sm font-bold flex items-center gap-1 whitespace-nowrap">
                Every
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={customMonths}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFrequency('custom');
                  }}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(12, parseInt(e.target.value || '1', 10)));
                    setCustomMonths(v);
                    setFrequency('custom');
                  }}
                  className="w-10 text-center rounded-lg border border-slate-200 py-0.5 text-pocari-blue font-bold outline-none focus:border-pocari-blue"
                />
                mo
              </div>
              {frequency === 'custom' && (
                <Check className="absolute bottom-3 right-3 w-4 h-4 text-pocari-blue stroke-[3]" />
              )}
            </div>
          </div>
            </Section>
          </div>
        </section>

        {/* ── Panel 4: Credits ── */}
        <section className="snap-center min-h-[64vh] flex items-center justify-center px-6">
          <div className="w-full max-w-4xl">
            {/* ── 4. CREDITS (우리만의 데이터) ── */}
        <Section index={4} title="Your Haler credits" caption="Only ours — never touches your card.">
          <div className="bg-white rounded-3xl p-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-pocari-light flex items-center justify-center">
                  <Coins className="w-5 h-5 text-pocari-blue" />
                </div>
                <div>
                  <div className="text-sm font-bold">Available balance</div>
                  <div className="text-lg font-bold text-pocari-blue">{money(CREDIT_BALANCE)}</div>
                </div>
              </div>
              {/* 토글: 이번 결제에 크레딧 사용 (auto/manual 선택 개념) */}
              <button
                onClick={() => setUseCredits((v) => !v)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  useCredits ? 'bg-pocari-blue' : 'bg-slate-200'
                }`}
                aria-pressed={useCredits}
              >
                <motion.span
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow ${
                    useCredits ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
            <AnimatePresence>
              {useCredits && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-50 text-sm text-slate-500 flex items-center justify-between"
                >
                  <span>Applying to this order</span>
                  <span className="font-bold text-pocari-blue">− {money(creditApplied)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
            </Section>
          </div>
        </section>
      </motion.div>

      {/* ── STICKY 요약 + 핸드오프 CTA ── */}
      <motion.div
        animate={{ paddingRight: studioOpen ? studioW : 0 }}
        transition={SPRING}
        className="fixed bottom-0 inset-x-0 z-50"
      >
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] border border-white p-3 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            {/* 진행상황 요약 — 선택 내용을 순서대로 (플랜 › 플레이버 › 배송 › 크레딧 › 합계) */}
            <motion.div layout className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pl-1 sm:pl-2 min-w-0">
              <Seg label="Plan" value={`${plan.title} · ${boxCount}`} done />
              <SegDivider />
              <Seg
                label="Flavors"
                value={`${filledCount}/${boxCount}`}
                done={allFilled}
                thumbs={slots.map((s) => flavorById(s.themeId, s.flavorId)?.image ?? null)}
              />
              <SegDivider />
              <Seg label="Delivery" value={freqLabel.replace('Every ', '')} done />
              <AnimatePresence mode="popLayout">
                {useCredits && creditApplied > 0 && (
                  <motion.div
                    key="credit-seg"
                    layout
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={SPRING}
                    className="flex items-center gap-1.5 overflow-hidden"
                  >
                    <SegDivider />
                    <Seg label="Credits" value={`− ${money(creditApplied)}`} done accent />
                  </motion.div>
                )}
              </AnimatePresence>
              <SegDivider />
              {/* 합계 — 기존 가격 블록 대신 요약 끝에 통합 */}
              <motion.div layout className="shrink-0 pr-1">
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Total</div>
                <div className="text-lg font-bold text-pocari-blue leading-none mt-0.5 whitespace-nowrap flex items-baseline">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={total} {...swap} className="tabular-nums">
                      {money(total)}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[11px] text-slate-400 font-medium">{plan.period}</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={!allFilled}
              onClick={handleCheckout}
              className={`sm:ml-auto shrink-0 h-14 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                allFilled
                  ? 'bg-pocari-blue text-white shadow-[0_8px_20px_rgba(28,136,255,0.35)]'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {allFilled ? (
                <>
                  Continue to checkout
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>Fill your box to continue</>
              )}
            </motion.button>
          </motion.div>
          {/* 안심 문구 — 결제 피로 완화 */}
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3 h-3" />
            Payment is handled securely by Shopify. We never see your card.
          </div>
        </div>
      </motion.div>

    </div>
  );
}

/* ── 재사용 소품 ── */
function Section({
  index, title, caption, children, className = '',
}: {
  index: number; title: string; caption?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={SPRING}
      className={`bg-transparent ${className}`}
    >
      <motion.div layout className="flex items-center gap-x-3 gap-y-1 mb-4 flex-wrap">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {index}
        </span>
        <h2 className="text-base font-bold leading-none">{title}</h2>
        {caption && (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={caption}
              {...swap}
              className="text-[11px] text-pocari-blue font-medium leading-tight"
            >
              {caption}
            </motion.p>
          </AnimatePresence>
        )}
      </motion.div>
      {children}
    </motion.section>
  );
}

/* 플로팅 바 진행상황 세그먼트 */
function Seg({
  label, value, done, accent, thumbs,
}: {
  label: string; value: string; done?: boolean; accent?: boolean; thumbs?: (string | null)[];
}) {
  return (
    <motion.div layout className="shrink-0">
      <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
        {done && <Check className="w-2.5 h-2.5 text-pocari-blue stroke-[3]" />}
        {label}
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        {thumbs && (
          <div className="flex -space-x-1">
            {thumbs.filter(Boolean).slice(0, 3).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src as string}
                alt=""
                className="w-4 h-4 rounded-full bg-white border border-slate-200 object-contain"
              />
            ))}
          </div>
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            {...swap}
            className={`text-sm font-bold whitespace-nowrap ${accent ? 'text-pocari-blue' : 'text-slate-800'}`}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SegDivider() {
  return <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />;
}

/* 배송 간격 크레딧 보상 뱃지 (카드 우상단, 크고 잘 보이게) */
function CreditTag({ amount }: { amount: number }) {
  return (
    <motion.span
      layout
      transition={SPRING}
      className={`shrink-0 inline-flex items-center gap-0.5 text-sm font-bold rounded-full px-2 py-0.5 transition-colors duration-300 ${
        amount > 0 ? 'text-pocari-blue bg-pocari-light' : 'text-slate-400 bg-slate-100'
      }`}
    >
      <Coins className="w-3.5 h-3.5 shrink-0" />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={amount} {...swap} className="tabular-nums">
          +{money(amount)}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
