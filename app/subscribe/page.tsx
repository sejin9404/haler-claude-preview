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
import {
  Check, Sparkles, Truck, Coins, ArrowRight, Lock,
  Package, PartyPopper, ChevronRight,
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, PLAN_LIMITS } from '@/constants/plans';
import { themes } from '@/app/pass/passData';

// 맛 선택 가능한 테마만 (innoscent 등 flavors 없는 건 제외)
const FLAVOR_THEMES = themes.filter((t) => t.flavors && t.flavors.length > 0);

const FREQUENCIES = [
  { id: 'monthly', label: 'Every month', hint: 'Most popular', mult: 1 },
  { id: 'bimonthly', label: 'Every 2 months', hint: 'Relaxed pace', mult: 1 },
  { id: 'quarterly', label: 'Every 3 months', hint: 'Stock up', mult: 1 },
] as const;

// 목업: 우리 크레딧 잔액 (Shopify Payments엔 저장되지 않는 우리만의 데이터)
const CREDIT_BALANCE = 12.0;

type Slot = { themeId: string | null; flavorId: string | null };

const money = (n: number) => `$${n.toFixed(0)}`;

export default function SubscribeConfigurator() {
  const [planId, setPlanId] = useState<string>('essential');
  const boxCount = PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS] ?? 3;

  // 슬롯: 플랜 박스 수에 맞춰 관리
  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: 3 }, () => ({ themeId: null, flavorId: null }))
  );
  const [activeSlot, setActiveSlot] = useState(0);
  const [activeTheme, setActiveTheme] = useState(FLAVOR_THEMES[0].id);

  const [frequency, setFrequency] = useState<string>('monthly');
  const [useCredits, setUseCredits] = useState(false);

  // 플랜 바뀌면 슬롯 개수 재조정 (기존 선택 보존)
  React.useEffect(() => {
    setSlots((prev) => {
      const next = prev.slice(0, boxCount);
      while (next.length < boxCount) next.push({ themeId: null, flavorId: null });
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
    // 다음 빈 슬롯으로 자동 이동
    setActiveSlot((cur) => {
      const after = slots.findIndex((s, i) => i > cur && !s.flavorId);
      if (after !== -1) return after;
      const anyEmpty = slots.findIndex((s, i) => i !== cur && !s.flavorId);
      return anyEmpty !== -1 ? anyEmpty : cur;
    });
  };

  const flavorById = (themeId: string | null, flavorId: string | null) => {
    if (!themeId || !flavorId) return null;
    const t = FLAVOR_THEMES.find((x) => x.id === themeId);
    return t?.flavors.find((f) => f.id === flavorId) ?? null;
  };

  const currentTheme = FLAVOR_THEMES.find((t) => t.id === activeTheme)!;

  const handleCheckout = () => {
    const summary = {
      planId,
      slots: slots.map((s) => ({ theme: s.themeId, flavor: s.flavorId })),
      frequency,
      useCredits,
      creditApplied,
      total,
    };
    // 실제 구현: Shopify Storefront cart(selling plan) 생성 후 checkout 리다이렉트
    // eslint-disable-next-line no-console
    console.log('[Handoff → Shopify Payments]', summary);
    alert(
      `[Mockup]\nMoving to secure Shopify checkout…\n\n` +
        `Plan: ${plan.title} (${boxCount} boxes)\n` +
        `Flavors filled: ${filledCount}/${boxCount}\n` +
        `Delivery: ${FREQUENCIES.find((f) => f.id === frequency)?.label}\n` +
        `Credits used: ${money(creditApplied)}\n` +
        `Total today: ${money(total)}`
    );
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] text-slate-900 pb-40">
      {/* ── HERO / 안심 헤더 ── */}
      <header className="px-5 pt-10 pb-6 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pocari-light text-pocari-blue text-[11px] font-bold tracking-widest uppercase mb-5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Last step — make it yours
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl md:text-4xl font-bold tracking-tight leading-tight"
        >
          Build your Haler pass.
        </motion.h1>
        <p className="mt-3 text-slate-500 text-sm md:text-base font-light">
          No card details here — just the fun part. Pick your vibe, we&apos;ll handle the rest.
        </p>

        {/* 진행 pills */}
        <div className="mt-7 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: s.done ? '#1C88FF' : '#E2E8F0',
                  color: s.done ? '#fff' : '#94A3B8',
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
              >
                {s.done ? <Check className="w-3 h-3" /> : <span className="w-3 text-center">{i + 1}</span>}
                {s.label}
              </motion.div>
              {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300" />}
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 space-y-6">
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
                  {p.isPopular && (
                    <span className="absolute -top-2 left-5 bg-pocari-blue text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                      Most pick
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      {p.boxes}
                    </span>
                    <AnimatePresence>
                      {selected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-5 h-5 rounded-full bg-pocari-blue flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-2 text-xl font-bold">{p.title}</div>
                  <div className="mt-1 text-2xl font-bold text-pocari-blue">
                    ${p.price}
                    <span className="text-xs text-slate-400 font-medium">{p.period}</span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {p.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="text-pocari-blue">{f.icon}</span>
                        {f.text}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>
        </Section>

        {/* ── 2. FLAVORS (박스 채우기) ── */}
        <Section
          index={2}
          title="Fill your box"
          caption={`Tap a slot, then pick a flavor · ${filledCount}/${boxCount} filled`}
        >
          {/* 슬롯 트레이 */}
          <div className="flex flex-wrap gap-2.5 mb-5">
            {slots.map((slot, i) => {
              const f = flavorById(slot.themeId, slot.flavorId);
              const active = i === activeSlot;
              return (
                <motion.button
                  key={i}
                  layout
                  onClick={() => setActiveSlot(i)}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-16 h-20 rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-colors ${
                    active ? 'border-pocari-blue' : 'border-slate-200'
                  } ${f ? 'bg-white' : 'bg-slate-50'}`}
                >
                  {f ? (
                    <>
                      <Image
                        src={f.image}
                        alt={f.name}
                        width={40}
                        height={40}
                        className="w-9 h-9 object-contain"
                      />
                      <span className="text-[8px] font-bold text-slate-500 mt-1 truncate max-w-[54px]">
                        {f.name}
                      </span>
                    </>
                  ) : (
                    <Package className={`w-6 h-6 ${active ? 'text-pocari-blue' : 'text-slate-300'}`} />
                  )}
                  {active && (
                    <motion.div
                      layoutId="slot-ring"
                      className="absolute inset-0 rounded-2xl ring-2 ring-pocari-blue/30"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* 팔레트: 테마 탭 + 맛 스와치 */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100">
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
              {FLAVOR_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t.id)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    activeTheme === t.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {currentTheme.flavors.map((f) => {
                const chosen = slots[activeSlot]?.flavorId === f.id && slots[activeSlot]?.themeId === currentTheme.id;
                return (
                  <motion.button
                    key={f.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => assignFlavor(currentTheme.id, f.id)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-colors ${
                      chosen ? 'border-pocari-blue bg-pocari-light' : 'border-transparent bg-slate-50'
                    }`}
                  >
                    <Image src={f.image} alt={f.name} width={32} height={32} className="w-8 h-8 object-contain" />
                    <span className="text-[8px] font-bold text-slate-500">{f.tag}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {allFilled && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center justify-center gap-2 text-pocari-blue text-sm font-bold"
              >
                <PartyPopper className="w-4 h-4" />
                Your box is complete!
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ── 3. DELIVERY RHYTHM ── */}
        <Section index={3} title="Delivery rhythm" caption="How often should the good stuff arrive?">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FREQUENCIES.map((fq) => {
              const selected = fq.id === frequency;
              return (
                <motion.button
                  key={fq.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFrequency(fq.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-colors ${
                    selected ? 'border-pocari-blue bg-white' : 'border-transparent bg-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Truck className={`w-5 h-5 ${selected ? 'text-pocari-blue' : 'text-slate-300'}`} />
                    {selected && <Check className="w-4 h-4 text-pocari-blue stroke-[3]" />}
                  </div>
                  <div className="mt-2 text-sm font-bold">{fq.label}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{fq.hint}</div>
                </motion.button>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Pause or change your rhythm anytime — no cancellation needed.
          </p>
        </Section>

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

        {/* ── 5. REVIEW ── */}
        <Section index={5} title="Quick look" caption="Everything good? Then let's go.">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 space-y-3">
            <Row label="Plan" value={`${plan.title} · ${boxCount} boxes`} />
            <Row label="Flavors" value={`${filledCount}/${boxCount} filled`} />
            <Row label="Delivery" value={FREQUENCIES.find((f) => f.id === frequency)?.label ?? ''} />
            {useCredits && <Row label="Credits" value={`− ${money(creditApplied)}`} accent />}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold">Total today</span>
              <div className="text-right">
                {creditApplied > 0 && (
                  <span className="text-xs text-slate-400 line-through mr-2">{money(basePrice)}</span>
                )}
                <span className="text-2xl font-bold text-pocari-blue">{money(total)}</span>
                <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
              </div>
            </div>
          </div>
        </Section>
      </main>

      {/* ── STICKY 요약 + 핸드오프 CTA ── */}
      <div className="fixed bottom-0 inset-x-0 z-50">
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] border border-white p-3 flex items-center gap-3"
          >
            <div className="pl-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {plan.title} · {boxCount} boxes
              </div>
              <div className="text-lg font-bold text-slate-900 leading-none mt-0.5">
                {money(total)}
                <span className="text-[11px] text-slate-400 font-medium">{plan.period}</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={!allFilled}
              onClick={handleCheckout}
              className={`ml-auto h-14 px-6 rounded-2xl font-bold text-sm flex items-center gap-2 transition-colors ${
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
      </div>
    </div>
  );
}

/* ── 재사용 소품 ── */
function Section({
  index, title, caption, children,
}: {
  index: number; title: string; caption?: string; children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      className="bg-transparent"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
          {index}
        </span>
        <div>
          <h2 className="text-base font-bold leading-none">{title}</h2>
          {caption && <p className="text-[11px] text-slate-400 mt-1">{caption}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${accent ? 'text-pocari-blue' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}
