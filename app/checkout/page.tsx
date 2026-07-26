'use client';

/**
 * Haler — Shopify Payments 스타일 결제 화면 (Mockup)
 *
 * /subscribe 에서 "Continue to checkout"을 누르면 넘어오는 화면.
 * 실제 Shopify 체크아웃 레이아웃을 최대한 비슷하게 재현한 미리보기용 목업이며,
 * 실제 결제는 일어나지 않는다. (카드 입력값은 어디로도 전송되지 않음)
 *
 * 실제 구현에서는 이 화면 대신 Shopify가 호스팅하는 진짜 체크아웃으로 리다이렉트된다.
 */

import React, { Suspense, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronDown, Check, Loader2, Tag } from 'lucide-react';
import { SUBSCRIPTION_PLANS, PLAN_LIMITS } from '@/constants/plans';
import { themes } from '@/app/pass/passData';

const FREQ_LABEL: Record<string, string> = {
  monthly: 'Every month',
  bimonthly: 'Every 2 months',
  quarterly: 'Every 3 months',
};

const money = (n: number) => `$${n.toFixed(2)}`;

type ParsedConfig = {
  planId: string;
  slots: { t: string | null; f: string | null }[];
  freq: string;
  freqLabel?: string;
  earnCredit?: number;
  credit: number;
  total: number;
};

function resolveFlavor(themeId: string | null, flavorId: string | null) {
  if (!themeId || !flavorId) return null;
  const t = themes.find((x) => x.id === themeId);
  return t?.flavors.find((f) => f.id === flavorId) ?? null;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CheckoutInner />
    </Suspense>
  );
}

function CheckoutInner() {
  const params = useSearchParams();

  const config: ParsedConfig = useMemo(() => {
    const raw = params.get('c');
    const fallback: ParsedConfig = {
      planId: 'essential',
      slots: [],
      freq: 'monthly',
      credit: 0,
      total: 49,
    };
    if (!raw) return fallback;
    try {
      return { ...fallback, ...JSON.parse(decodeURIComponent(raw)) };
    } catch {
      return fallback;
    }
  }, [params]);

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === config.planId) ?? SUBSCRIPTION_PLANS[1];
  const boxes = PLAN_LIMITS[config.planId as keyof typeof PLAN_LIMITS] ?? 3;
  const basePrice = parseInt(plan.price, 10);
  const credit = config.credit || 0;
  const subtotal = basePrice;
  const total = typeof config.total === 'number' ? config.total : Math.max(0, subtotal - credit);
  const freqLabel = config.freqLabel || FREQ_LABEL[config.freq] || 'Every month';
  const earnCredit = config.earnCredit || 0;

  const flavors = config.slots
    .map((s) => resolveFlavor(s.t, s.f))
    .filter(Boolean) as NonNullable<ReturnType<typeof resolveFlavor>>[];

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [payState, setPayState] = useState<'idle' | 'processing' | 'done'>('idle');

  const pay = () => {
    setPayState('processing');
    setTimeout(() => setPayState('done'), 1800);
  };

  return (
    <div className="min-h-screen bg-white text-[#333333]">
      {/* 목업 표시 리본 */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-700 text-[11px] text-center py-1.5 font-medium">
        미리보기 목업 — 실제 결제가 아닙니다. 카드 정보는 어디로도 전송되지 않아요.
      </div>

      {/* 상단 스토어 헤더 */}
      <header className="border-b border-slate-200">
        <div className="max-w-[1000px] mx-auto px-5 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight text-slate-900">HALER</span>
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5" /> Secure checkout
          </span>
        </div>
      </header>

      {/* 모바일: 주문 요약 접힘 바 */}
      <button
        onClick={() => setSummaryOpen((v) => !v)}
        className="lg:hidden w-full bg-[#FAFAFA] border-b border-slate-200 px-5 py-3 flex items-center justify-between text-sm"
      >
        <span className="flex items-center gap-1.5 text-[#1C88FF] font-medium">
          <Tag className="w-4 h-4" /> {summaryOpen ? 'Hide' : 'Show'} order summary
          <ChevronDown className={`w-4 h-4 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
        </span>
        <span className="font-bold text-slate-900">{money(total)}</span>
      </button>
      <AnimatePresence>
        {summaryOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-[#FAFAFA] border-b border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4">
              <OrderSummary {...{ plan, boxes, flavors, freqLabel, subtotal, credit, total, earnCredit }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1000px] mx-auto lg:grid lg:grid-cols-[1.15fr_0.85fr]">
        {/* ── 좌: 정보/결제 폼 ── */}
        <main className="px-5 py-8 lg:pr-10 order-1">
          {/* 익스프레스 체크아웃 */}
          <div>
            <div className="grid grid-cols-3 gap-3">
              <MockExpressBtn label="Shop Pay" className="bg-[#5A31F4] text-white" />
              <MockExpressBtn label="PayPal" className="bg-[#FFC439] text-[#003087]" />
              <MockExpressBtn label="G Pay" className="bg-black text-white" />
            </div>
            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
          </div>

          {/* Contact */}
          <SectionTitle>Contact</SectionTitle>
          <Field placeholder="Email" />
          <label className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <input type="checkbox" className="accent-[#1C88FF]" /> Email me with news and offers
          </label>

          {/* Delivery */}
          <SectionTitle className="mt-8">Delivery</SectionTitle>
          <SelectField value="United States" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field placeholder="First name" />
            <Field placeholder="Last name" />
          </div>
          <Field placeholder="Address" className="mt-3" />
          <Field placeholder="Apartment, suite, etc. (optional)" className="mt-3" />
          <div className="grid grid-cols-3 gap-3 mt-3">
            <Field placeholder="City" />
            <SelectField value="State" muted />
            <Field placeholder="ZIP code" />
          </div>
          <Field placeholder="Phone" className="mt-3" />

          {/* Shipping method */}
          <SectionTitle className="mt-8">Shipping method</SectionTitle>
          <div className="border-2 border-[#1C88FF] rounded-lg px-4 py-3.5 flex items-center justify-between bg-[#F5FAFF]">
            <span className="flex items-center gap-2.5 text-sm">
              <span className="w-4 h-4 rounded-full border-[5px] border-[#1C88FF]" />
              Standard shipping
            </span>
            <span className="text-sm font-semibold">Free</span>
          </div>

          {/* Payment */}
          <SectionTitle className="mt-8">Payment</SectionTitle>
          <p className="text-xs text-slate-400 -mt-1 mb-3">All transactions are secure and encrypted.</p>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-medium">Credit card</span>
              <span className="text-[10px] tracking-wider text-slate-400 font-bold">VISA · MC · AMEX</span>
            </div>
            <div className="p-4 space-y-3">
              <Field placeholder="Card number" bare />
              <div className="grid grid-cols-2 gap-3">
                <Field placeholder="Expiration date (MM / YY)" bare />
                <Field placeholder="Security code" bare />
              </div>
              <Field placeholder="Name on card" bare />
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <input type="checkbox" defaultChecked className="accent-[#1C88FF]" />
                Use shipping address as billing address
              </label>
            </div>
          </div>

          {/* Pay now */}
          <button
            onClick={pay}
            disabled={payState !== 'idle'}
            className="mt-6 w-full h-14 rounded-lg bg-[#1C88FF] text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-80"
          >
            {payState === 'processing' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
            ) : (
              <>Pay now</>
            )}
          </button>

          {/* Recurring 안내 — 우리 모델 반영 */}
          <p className="mt-3 text-[11px] text-slate-400 text-center leading-relaxed">
            By subscribing you agree to be charged {money(subtotal)} today, then {money(subtotal)} {freqLabel.toLowerCase()}.
            <br />You can pause or resume anytime — no cancellation needed.
          </p>

          {/* 푸터 */}
          <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#1C88FF]">
            <span>Refund policy</span><span>Shipping policy</span><span>Privacy policy</span><span>Terms of service</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-300">Powered by Shopify</p>
        </main>

        {/* ── 우: 주문 요약 (데스크톱) ── */}
        <aside className="hidden lg:block bg-[#FAFAFA] border-l border-slate-200 px-8 py-8 order-2">
          <div className="sticky top-8">
            <OrderSummary {...{ plan, boxes, flavors, freqLabel, subtotal, credit, total, earnCredit }} />
          </div>
        </aside>
      </div>

      {/* 결제 완료 오버레이 */}
      <AnimatePresence>
        {payState === 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center px-6"
          >
            <div className="text-center max-w-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 14 }}
                className="w-20 h-20 rounded-full bg-[#1C88FF] flex items-center justify-center mx-auto"
              >
                <Check className="w-10 h-10 text-white stroke-[3]" />
              </motion.div>
              <h2 className="mt-6 text-2xl font-bold text-slate-900">You&apos;re all set!</h2>
              <p className="mt-2 text-slate-500 text-sm">
                (목업) 결제가 확인되면 여기서 Shopify 주문이 생성되고 구독이 시작돼요.
                첫 박스가 곧 발송됩니다.
              </p>
              <div className="mt-7 flex flex-col gap-2">
                <Link href="/pass" className="h-12 rounded-xl bg-[#1C88FF] text-white font-bold flex items-center justify-center">
                  View my Boarding Pass
                </Link>
                <Link href="/subscribe" className="h-12 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center">
                  Back to configurator
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 주문 요약 ── */
function OrderSummary({
  plan, boxes, flavors, freqLabel, subtotal, credit, total, earnCredit = 0,
}: {
  plan: (typeof SUBSCRIPTION_PLANS)[number];
  boxes: number;
  flavors: NonNullable<ReturnType<typeof resolveFlavor>>[];
  freqLabel: string;
  subtotal: number;
  credit: number;
  total: number;
  earnCredit?: number;
}) {
  return (
    <div>
      {/* 구독 라인아이템 */}
      <div className="flex gap-3">
        <div className="relative w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0">
          <span className="text-2xl">📦</span>
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-500 text-white text-[11px] font-bold flex items-center justify-center">
            {boxes}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800">Haler {plan.title} Pass</div>
          <div className="text-xs text-slate-400">Subscription · {freqLabel}</div>
          <div className="text-xs text-slate-400 mt-0.5 truncate">
            {flavors.length ? flavors.map((f) => f.name).join(', ') : `${boxes} boxes`}
          </div>
        </div>
        <div className="text-sm font-semibold text-slate-800">{money(subtotal)}</div>
      </div>

      {/* 플레이버 썸네일 */}
      {flavors.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {flavors.map((f, i) => (
            <div key={i} className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center">
              <Image src={f.image} alt={f.name} width={26} height={26} className="w-6 h-6 object-contain" />
            </div>
          ))}
        </div>
      )}

      {/* 할인코드 */}
      <div className="flex gap-2 mt-5">
        <input
          placeholder="Discount code"
          className="flex-1 h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none"
        />
        <button className="h-11 px-4 rounded-lg bg-slate-200 text-slate-500 text-sm font-semibold">Apply</button>
      </div>

      {/* 합계 */}
      <div className="mt-5 space-y-2 text-sm">
        <Line label="Subtotal" value={money(subtotal)} />
        <Line label="Shipping" value="Free" />
        <Line label="Estimated taxes" value="$0.00" muted />
        {credit > 0 && (
          <div className="flex items-center justify-between text-[#1C88FF]">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Haler credits
            </span>
            <span className="font-semibold">− {money(credit)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 flex items-end justify-between">
        <span className="text-base font-semibold text-slate-800">Total</span>
        <span className="text-right">
          <span className="text-xs text-slate-400 mr-1.5">USD</span>
          <span className="text-2xl font-bold text-slate-900">{money(total)}</span>
        </span>
      </div>

      {/* 배송 간격 보상 크레딧 안내 */}
      {earnCredit > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#1C88FF] bg-[#F5FAFF] rounded-lg px-3 py-2">
          <Tag className="w-3.5 h-3.5" />
          You&apos;ll earn +{money(earnCredit)} in Haler credits with each delivery.
        </div>
      )}
    </div>
  );
}

/* ── 소품 ── */
function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold text-slate-800 mb-3 ${className}`}>{children}</h2>;
}

function Field({
  placeholder, className = '', bare = false,
}: { placeholder: string; className?: string; bare?: boolean }) {
  return (
    <input
      placeholder={placeholder}
      className={`w-full h-12 px-3.5 text-sm outline-none placeholder:text-slate-400 ${
        bare ? 'border-0' : 'border border-slate-300 rounded-lg'
      } focus:border-[#1C88FF] transition-colors ${className}`}
    />
  );
}

function SelectField({ value, muted = false }: { value: string; muted?: boolean }) {
  return (
    <div className="relative">
      <div
        className={`w-full h-12 px-3.5 flex items-center border border-slate-300 rounded-lg text-sm ${
          muted ? 'text-slate-400' : 'text-slate-700'
        }`}
      >
        {value}
      </div>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function MockExpressBtn({ label, className }: { label: string; className: string }) {
  return (
    <div className={`h-11 rounded-lg flex items-center justify-center text-sm font-bold ${className}`}>
      {label}
    </div>
  );
}

function Line({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-slate-400' : 'text-slate-500'}>{label}</span>
      <span className={`font-medium ${muted ? 'text-slate-400' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}
