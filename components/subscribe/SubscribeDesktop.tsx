'use client';

/**
 * Haler — Pre-checkout Configurator (Mockup · 데스크탑 3분할)
 *
 * 결제 직전 "마지막으로 내 걸 완성하는" 단계.
 *   [패널 0]  인트로 — 구독권 소개 (대제목+소제목만 가운데 정렬, 양옆 비움)
 *   [패널 1~4] 선택 시스템 — Plan → Flavors → Delivery → Credits (scroll-snap)
 *     [왼쪽]   현재 섹션 대제목/소제목(한 줄) + 진행상태 바 — 2번째 섹션 진입 시 오른→왼 슬라이드 인
 *     [오른쪽] 상시 요약 패널(장바구니+요약+합계+CTA) — 왼→오른 슬라이드 인
 *
 * 실제 결제(카드 입력)는 여기서 하지 않는다. 마지막 CTA에서 Shopify Payments로 핸드오프.
 * (지금은 목업이라 /checkout 목업 화면으로 이동)
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Lock, X } from 'lucide-react';
import { SUBSCRIPTION_PLANS, PLAN_LIMITS } from '@/constants/plans';
import {
  CREDIT_BALANCE, extraPackPrice, canUpgrade, upgradeCost, deliveryCredit, betterPlanHint,
} from '@/constants/creditPolicy';
import { themes, AQUA_FLAVOR, AQUA_ID, COMBO_FLAVORS, isComboId, comboThemeId } from '@/app/pass/passData';
import CurationStudioRenewed from '@/components/subscribe/CurationStudioRenewed';

// 신선도 상한 4개월 — 배송을 4개월 넘게 묶을 수 없다 (MAX_BUNDLE_MONTHS 와 일치)
const FREQUENCIES = [
  { id: 'monthly', label: 'Monthly', months: 1 },
  { id: 'bimonthly', label: '2 months', months: 2 },
  { id: 'quarterly', label: '3 months', months: 3 },
  { id: 'fourmonthly', label: '4 months', months: 4 },
] as const;
// Extra Pack 으로 받을 수 있는 전체 플레이버 (Aqua + 일반 플레이버 + 테마별 콤보 팩)
const ALL_FLAVORS = [AQUA_FLAVOR, ...themes.flatMap((t) => t.flavors), ...COMBO_FLAVORS];

// 마지막 선택 저장 키 (재방문 시 복원)
const STORAGE_KEY = 'haler.subscribe.config.v2';
// ⚠️ 테스트용 임시 스위치 (2026-08-01 진 요청): false = 저장/복원 끔 → 새로고침마다 기본값으로 리셋.
// 테스트 끝나면 true 로 되돌릴 것 (원래 사양 = 마지막 선택 기억).
const PERSIST_SELECTIONS = false;

// 공통 부드러운 전환 (블록 확장/재배치) — 전체 체감 속도 1/2 로 감속 (2026-08-01 요청)
const SPRING = { type: 'spring', stiffness: 120, damping: 26 } as const;
// 대제목과 동일한 '블러 스루 슬라이드' — 드로어의 선택값 교체에 공용 (mode="wait" 와 함께 사용)
const titleSwap = {
  initial: { opacity: 0, y: 24, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  // 퇴장은 빠르게(0.3s), 진입은 여유 있게(0.6s) — 총 교체 ~0.9s
  exit: { opacity: 0, y: -24, filter: 'blur(10px)', transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } },
  transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
} as const;

type Slot = { themeId: string | null; flavorId: string | null };

// 기본 슬롯 = Aqua (빈칸 대신). 다른 맛을 고르면 이 자리를 대체한다.
const aquaSlot = (): Slot => ({ themeId: AQUA_ID, flavorId: AQUA_ID });
const isDefaultSlot = (s: Slot) => !s.flavorId || s.flavorId === AQUA_ID;

const money = (n: number) => `$${n.toFixed(0)}`;

// React 가 muted 를 DOM attribute 로 누락시켜 autoplay 가 차단되는 브라우저 이슈 대응:
// ref 에서 muted 를 강제하고 재생을 직접 시도한다 (실패는 무시 — 사용자 인터랙션 후 자동 재개)
const forceAutoplay = (el: HTMLVideoElement | null) => {
  if (!el) return;
  el.muted = true;
  el.play().catch(() => {});
};

// 아크릴 질감의 핵심: 미세 노이즈 텍스처 (인라인 SVG data URI — 외부 요청 없음)
const ACRYLIC_NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

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

  const [frequency, setFrequency] = useState<string>('monthly');
  // 소진 2종 토글: extraPack(추가팩 담기) / planBoost(업그레이드 체험 — 크레딧 전용)
  const [extraPack, setExtraPack] = useState(false);
  // Extra Pack: 추가 '구매' — 맛별로 여러 개 담을 수 있다 (티어별 $18/$15/$12)
  const [extraPacks, setExtraPacks] = useState<{ flavorId: string; qty: number }[]>([]);
  // 추가팩 결제수단: 기본은 현금, 켜면 크레딧으로 결제(모자라면 나머지는 현금)
  const [packsOnCredit, setPacksOnCredit] = useState(false);
  const [planBoost, setPlanBoost] = useState(false);
  // 섹션2 전체 화면 배경 영상 (CurationStudio가 현재 테마 영상을 알려줌)
  const [studioBg, setStudioBg] = useState<string | undefined>(undefined);

  // 이 페이지는 재방문해서 구독을 수정하는 관리 페이지 → 마지막 선택을 저장/복원.
  // (목업: localStorage. 실제 구현에서는 Supabase box_configs / Shopify contract에 저장)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (PERSIST_SELECTIONS) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.planId) setPlanId(saved.planId);
          if (Array.isArray(saved.slots)) setSlots(saved.slots);
          if (saved.frequency) setFrequency(saved.frequency);
          if (typeof saved.extraPack === 'boolean') setExtraPack(saved.extraPack);
          if (typeof saved.packsOnCredit === 'boolean') setPacksOnCredit(saved.packsOnCredit);
          if (Array.isArray(saved.extraPacks)) setExtraPacks(saved.extraPacks);
          if (typeof saved.planBoost === 'boolean') setPlanBoost(saved.planBoost);
        }
      } catch {
        /* ignore */
      }
    } else {
      // 테스트 모드: 남아있는 저장값도 지워서 어떤 경로로도 복원되지 않게
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    setHydrated(true);
  }, []);

  // 현재 배송 간격/보상 크레딧
  const currentMonths = FREQUENCIES.find((f) => f.id === frequency)?.months ?? 1;
  const earnCredit = deliveryCredit(currentMonths);
  const freqLabel = FREQUENCIES.find((f) => f.id === frequency)?.label ?? 'Monthly';

  useEffect(() => {
    if (!hydrated || !PERSIST_SELECTIONS) return; // 복원 전(또는 테스트 스위치 꺼짐)에는 저장하지 않음
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ planId, slots, frequency, extraPack, packsOnCredit, extraPacks, planBoost })
      );
    } catch {
      /* ignore */
    }
  }, [hydrated, planId, slots, frequency, extraPack, packsOnCredit, extraPacks, planBoost]);

  // 플랜 바뀌면 슬롯 개수 재조정 (기존 선택 보존)
  // ⚠️ hydrated 가드 필수: 마운트 flush에서 이 effect가 stale boxCount(기본 3)로 실행되면
  // localStorage에서 복원된 6슬롯(Daily)이 3개로 잘리고 그 상태가 다시 저장돼 영구 소실된다.
  useEffect(() => {
    if (!hydrated) return;
    setSlots((prev) => {
      const next = prev.slice(0, boxCount);
      while (next.length < boxCount) next.push(aquaSlot());
      return next;
    });
  }, [hydrated, boxCount]);

  // 플랜이 바뀌면 플랜 전용 옵션은 의미가 달라지므로 자동 해제
  useEffect(() => {
    setPlanBoost(false);
  }, [planId]);

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)!;
  const basePrice = parseInt(plan.price, 10);

  // 커스터마이즈된 슬롯 수(기본 Aqua 제외) — 플레이버 게이트·CTA·picked 카운터의 기준
  const customizedCount = slots.filter((s) => s.flavorId && s.flavorId !== AQUA_ID).length;

  // ── 크레딧 정책 체인 (v5) ──
  // 소진 2종뿐: ①업그레이드 체험(크레딧 전용) ②추가팩(현금 기본 · 크레딧 선택 가능).
  // 어느 쪽도 구독료 현금 결제액을 깎지 않는다 — v4 의 '요금 차감'은 폐지.
  const upgradeAvailable = canUpgrade(planId); // Light·Ritual → Daily. Daily 는 대상 아님
  const packPrice = extraPackPrice(planId);
  // 업그레이드는 주문 1건당 1회 — 4개월 묶음이면 ×4 차감
  const upgradePrice = upgradeCost(planId, currentMonths);
  let creditLeft = CREDIT_BALANCE;
  const boostActive = planBoost && upgradeAvailable && creditLeft >= upgradePrice;
  if (boostActive) creditLeft -= upgradePrice;
  // 추가팩: 담은 수량 전부가 주문에 들어간다. extraPack(토글)=크레딧으로 결제할지 여부.
  // 크레딧이 모자라면 살 수 있는 만큼만 크레딧, 나머지는 현금으로 넘어간다(주문에서 빠지지 않음).
  const extraQtyTotal = extraPacks.reduce((a, pk) => a + pk.qty, 0);
  const extraQtyByCredit = extraPack && packsOnCredit
    ? Math.min(extraQtyTotal, Math.floor(creditLeft / packPrice))
    : 0;
  const extraCreditUsed = extraQtyByCredit * packPrice;
  creditLeft -= extraCreditUsed;
  const extraQtyByCash = extraQtyTotal - extraQtyByCredit;
  const extraCashDue = extraQtyByCash * packPrice;
  const totalCreditUsed = (boostActive ? upgradePrice : 0) + extraCreditUsed;
  // 현금 결제액 = 구독료 + 현금으로 사는 추가팩. 크레딧은 구독료에 절대 닿지 않는다.
  const total = basePrice + extraCashDue;
  // 이번 주문 후 예상 잔액 = 현재 잔액 − 차감 + 묶음배송 보너스
  const balanceAfter = CREDIT_BALANCE - totalCreditUsed + earnCredit;
  // 같은 값에 더 받을 수 있는 경로가 있으면 알림 (규칙으로 막지 않고 안내만 — 문서 7절)
  const planHint = betterPlanHint(planId, extraQtyTotal);
  // 드로어 Credits 행 보조설명 — 켜진 정책 나열
  const creditSubs = [
    boostActive ? `Upgrade to Daily${currentMonths > 1 ? ` ×${currentMonths}` : ''}` : null,
    extraQtyByCredit > 0 ? `Extra pack ×${extraQtyByCredit}` : null,
  ].filter(Boolean).join(' + ') || undefined;
  // Extra Pack 수량 조작
  const addExtraPack = (id: string) =>
    setExtraPacks((prev) => {
      const found = prev.find((pk) => pk.flavorId === id);
      return found
        ? prev.map((pk) => (pk.flavorId === id ? { ...pk, qty: pk.qty + 1 } : pk))
        : [...prev, { flavorId: id, qty: 1 }];
    });
  const decExtraPack = (id: string) =>
    setExtraPacks((prev) => prev.flatMap((pk) => (pk.flavorId === id ? (pk.qty > 1 ? [{ ...pk, qty: pk.qty - 1 }] : []) : [pk])));
  const removeExtraPack = (id: string) => setExtraPacks((prev) => prev.filter((pk) => pk.flavorId !== id));
  const flavorName = (id: string) => ALL_FLAVORS.find((f) => f.id === id)?.name ?? id;

  // ── Curation Studio ↔ slots 브릿지 ──
  // 콤보 id('combo-nectar' 등)는 어느 테마의 flavors 배열에도 없으므로 별도 분기로 원래 테마를 되찾는다.
  const themeOfFlavor = (flavorId: string) =>
    isComboId(flavorId)
      ? themes.find((t) => t.id === comboThemeId(flavorId)) ?? null
      : themes.find((t) => t.flavors.some((f) => f.id === flavorId)) ?? null;
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

  // ── 드로어 계산서(플레이버 리스트)용 조작/집계 ──
  // 같은 맛의 마지막 슬롯 하나를 기본(Aqua)으로 되돌림 = 수량 −1
  const removeOneFlavor = (flavorId: string) => {
    setSlots((prev) => {
      const idx = prev.map((s) => s.flavorId).lastIndexOf(flavorId);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = aquaSlot();
      return next;
    });
  };
  // 그 맛 전부 제거
  const removeAllFlavor = (flavorId: string) => {
    setSlots((prev) => prev.map((s) => (s.flavorId === flavorId ? aquaSlot() : s)));
  };
  const hasSlotToFill = slots.some(isDefaultSlot);
  // 맛별 집계 (첫 추가 순서 유지) — 계산서 행의 원천
  const basketLines = useMemo(() => {
    const lines: { flavorId: string; name: string; themeName: string; qty: number }[] = [];
    slots.forEach((s) => {
      if (!s.flavorId || s.flavorId === AQUA_ID) return;
      const found = lines.find((l) => l.flavorId === s.flavorId);
      if (found) {
        found.qty += 1;
        return;
      }
      if (isComboId(s.flavorId)) {
        const theme = themes.find((t) => t.id === comboThemeId(s.flavorId!));
        const combo = COMBO_FLAVORS.find((c) => c.id === s.flavorId);
        lines.push({ flavorId: s.flavorId, name: combo?.name ?? s.flavorId, themeName: theme?.name ?? '', qty: 1 });
        return;
      }
      const theme = themes.find((t) => t.flavors.some((f) => f.id === s.flavorId));
      const fl = theme?.flavors.find((f) => f.id === s.flavorId);
      lines.push({ flavorId: s.flavorId, name: fl?.name ?? s.flavorId, themeName: theme?.name ?? '', qty: 1 });
    });
    return lines;
  }, [slots]);
  const aquaCount = slots.filter(isDefaultSlot).length;

  // ── 현재 화면 중앙에 있는 패널 추적 (0=인트로, 1~4=선택 시스템) ──
  // IntersectionObserver 대신 scroll 이벤트로 직접 계산 — 환경(숨김 탭 등)에 관계없이 확실하게 동작.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(0);
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const secs = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));
    // 스크롤 컨테이너의 세로 중앙선이 걸쳐 있는 패널 = 활성 패널
    const onScroll = () => {
      const rootRect = root.getBoundingClientRect();
      const mid = rootRect.top + rootRect.height / 2;
      let best = 0;
      secs.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) best = i;
      });
      setActivePanel(best); // 같은 값이면 React가 리렌더 스킵
    };
    onScroll();
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, []);

  // 진행 게이트 없음 (2026-08-01 확정): 빈 슬롯은 Aqua 가 채우므로 다 고르지 않아도 자유롭게 스크롤/점프
  const goTo = (i: number) => {
    scrollRef.current
      ?.querySelector(`[data-panel="${i}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 선택 시스템 단계(패널 1~3)의 제목 — 왼쪽 컬럼에 표시 (caption 의 \n 은 줄바꿈으로 렌더)
  const SECTION_META = [
    { key: 'plan', short: 'Routine', title: 'Your Routine', caption: 'Hydrate your breath\nwith daily routine.' },
    { key: 'flavors', short: 'Curation', title: 'Your Curation', caption: 'Fill your breath\nwith joy and energy.' },
    { key: 'options', short: 'Options', title: 'Your Option', caption: 'Get bonus credits\nor Use it as you want' },
  ];
  // 인트로(0)에선 사이드 숨김. 선택 시스템에선 activePanel-1 이 현재 스텝.
  const stepIndex = Math.max(0, activePanel - 1);
  const meta = SECTION_META[stepIndex];
  const inSystem = activePanel >= 1;
  // 섹션2(플레이버) = 전체 화면 영상 위 다크 모드 — 텍스트는 흰색, 드로어는 어두운 유리 블록
  const dark = activePanel === 2;

  // ── 좌우 창 높이 동기화 ──
  // 드로어는 콘텐츠에 맞는 자동 높이(내부 스크롤 없음), 왼쪽 창은 드로어의 실측 높이를 따라간다.
  // (inSystem 선언 이후에 위치해야 함 — deps 에서 참조)
  const drawerRef = useRef<HTMLDivElement>(null);
  const [drawerH, setDrawerH] = useState<number | null>(null);
  useEffect(() => {
    const el = drawerRef.current;
    if (!el) {
      setDrawerH(null);
      return;
    }
    const measure = () => setDrawerH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [inSystem]);

  const handleCheckout = () => {
    // 실제 구현: Shopify Storefront cart(selling plan) 생성 후 checkout 리다이렉트.
    // 지금은 목업 결제 화면(/checkout)으로 선택값을 넘겨 핸드오프를 시뮬레이션.
    const config = {
      planId,
      slots: slots.map((s) => ({ t: s.themeId, f: s.flavorId })),
      freq: frequency,
      freqLabel,
      earnCredit,
      credit: totalCreditUsed,
      total,
    };
    const c = encodeURIComponent(JSON.stringify(config));
    router.push(`/checkout?c=${c}`);
  };

  return (
    <div className="relative h-screen text-slate-900 overflow-hidden">
      <LiquidBackground />

      {/* 상시 배경 영상 (섹션2 제외 — 섹션2에선 전체 화면 테마 영상 레이어(z-1)가 위를 덮는다).
          원본 720×1280 세로 영상이라 와이드 화면에선 중앙 크롭(object-cover) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video ref={forceAutoplay} autoPlay loop muted playsInline preload="auto" className="w-full h-full object-cover" src="/videos/ambient_bg.mp4" />
      </div>

      {/* 섹션2 전체 화면 배경 영상.
          - 항상 마운트: 진입 순간 영상 로드가 시작되면 첫 프레임 지연으로 끊겨 보임 → 미리 로드/재생.
          - 전체 화면 filter blur 애니메이션은 프레임 드랍의 주범이라 쓰지 않는다.
            등장/퇴장은 opacity+scale(합성 전용, 저비용)로, '블러 감각'은 콘텐츠(제목/블록) 전환이 담당. */}
      <motion.div
        initial={false}
        animate={{ opacity: dark ? 1 : 0, scale: dark ? 1 : 1.06 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="fixed inset-0 z-[1] pointer-events-none will-change-[opacity,transform]"
      >
        {/* 테마 변경 시 영상 크로스페이드 (스튜디오와 같은 톤의 어둠 오버레이) */}
        <AnimatePresence initial={false}>
          <motion.div
            key={studioBg ?? 'none'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {studioBg && (
              <video ref={forceAutoplay} autoPlay loop muted playsInline preload="auto" className="w-full h-full object-cover scale-105">
                <source src={studioBg} type="video/mp4" />
              </video>
            )}
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* 3분할: [대제목] [선택 컨트롤(스크롤)] [요약 드로어]
          좌·우 컬럼 폭을 '동일'하게 고정 — 가운데 컬럼의 중심이 항상 화면 정중앙에 오게 하기 위함 */}
      <div className="relative z-10 h-screen grid grid-cols-[clamp(360px,25vw,520px)_minmax(0,1fr)_clamp(360px,25vw,520px)]">

        {/* ── 왼쪽: 제목/진행바 창 — 오른쪽 드로어와 '대칭' 컨셉.
            왼쪽 가장자리에 붙는 풀하이트 유리 블록, 왼쪽 화면 밖에서 밀고 들어온다.
            섹션2에선 드로어와 동일하게 어두운 유리로 전환 ── */}
        <aside className="h-screen flex items-center">
          <AnimatePresence>
            {inSystem && (
              <motion.div
                key="left-col"
                initial={{ x: '-110%' }}
                animate={{ x: 0, height: drawerH ?? 'auto' }}
                exit={{ x: '-110%' }}
                transition={{ duration: 1.0, ease: [0.32, 0.72, 0, 1] }}
                className={`relative min-h-[380px] w-full rounded-r-[32px] border flex flex-col justify-center px-14 xl:px-16 [backdrop-filter:blur(40px)_saturate(160%)] transition-colors duration-700 ${
                  // 아크릴 질감: 파란 틴트 + 채도 부스트(saturate) + 노이즈 + 상단 하이라이트.
                  // 섹션2 = 블랙 아크릴 / 나머지 = 블루 아크릴
                  dark
                    ? 'bg-black/40 border-white/10 shadow-2xl'
                    : 'bg-white/55 border-white/40'
                }`}
              >
                {/* 아크릴 노이즈 텍스처 */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-r-[32px] pointer-events-none opacity-[0.05] mix-blend-overlay"
                  style={{ backgroundImage: ACRYLIC_NOISE }}
                />
                {/* 제목/소제목 — 스텝이 바뀌면 위아래로 + 블러로 부드럽게 교체. 섹션2에선 흰색 */}
                <div className="min-h-[190px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${stepIndex}-${dark}`}
                      initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -24, filter: 'blur(10px)', transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                      transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    >
                      {/* 한 줄 고정(nowrap) — 1440px 하한에서도 컬럼을 넘지 않게 vw 유동, 와이드에선 60px */}
                      <h2
                        className={`text-[clamp(42px,3.6vw,60px)] font-bold tracking-tighter leading-tight whitespace-nowrap ${
                          dark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {meta.title}
                      </h2>
                      {/* whitespace-pre-line: caption 의 \n 을 그대로 줄바꿈으로 */}
                      <p
                        className={`mt-4 text-[clamp(18px,1.55vw,24px)] font-light leading-relaxed whitespace-pre-line ${
                          dark ? 'text-white/65' : 'text-slate-500'
                        }`}
                      >
                        {meta.caption}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* 진행상태 바 — 지나온 스텝은 채움, 클릭하면 자유롭게 이동. 섹션2에선 흰색 */}
                <div className="mt-12 max-w-[400px]">
                  <div className="flex items-start gap-2">
                    {SECTION_META.map((s, i) => {
                      return (
                        <button
                          key={s.key}
                          onClick={() => goTo(i + 1)}
                          className="group flex-1 text-left"
                        >
                          {/* 호버 시 밝기 변화 — 지나온/현재 구간도 클릭 가능함을 알려줌 */}
                          <span
                            className={`block h-1.5 rounded-full transition-all duration-300 ${
                              i <= stepIndex
                                ? dark ? 'bg-white group-hover:bg-white/80' : 'bg-pocari-blue group-hover:brightness-125'
                                : dark ? 'bg-white/25 group-hover:bg-white/40' : 'bg-slate-200 group-hover:bg-slate-300'
                            }`}
                          />
                          {/* 호버 시 라벨이 살짝 커짐(scale) — 클릭해서 이동 가능함을 알려줌 */}
                          <span
                            className={`mt-2.5 block text-sm font-bold tracking-wide origin-left transition-all duration-300 group-hover:scale-110 ${
                              i === stepIndex
                                ? dark ? 'text-white' : 'text-slate-900'
                                : dark ? 'text-white/50 group-hover:text-white/80' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          >
                            {s.short}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* ── 가운데: 인트로 + 선택 컨트롤 (슬롯머신 scroll-snap) ── */}
        <div
          ref={scrollRef}
          className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        >
          {/* Panel 0: 인트로 — 구독권 소개 (대제목+소제목만 가운데 정렬) */}
          <section data-panel={0} className="snap-center min-h-screen flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
              className="text-center"
            >
              <h1 className="text-5xl xl:text-6xl font-bold tracking-tighter text-gray-900 leading-[0.95]">
                Ritualize your breath.
              </h1>
              <p className="mt-6 text-lg xl:text-xl text-gray-400 font-light max-w-xl mx-auto leading-relaxed">
                Fill your every breath full of scent with daily hydration routine.
              </p>
            </motion.div>
          </section>

          {/* Panel 1: Plan */}
          <section data-panel={1} className="snap-center min-h-screen flex items-center justify-center px-8">
            <div className="w-full max-w-5xl">
              <Fade>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {SUBSCRIPTION_PLANS.map((p) => {
                    const selected = p.id === planId;
                    return (
                      <motion.button
                        key={p.id}
                        layout
                        onClick={() => setPlanId(p.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`relative text-left p-8 rounded-[28px] border-2 transition-colors ${
                          selected
                            ? 'border-pocari-blue bg-white shadow-[0_12px_30px_rgba(28,136,255,0.15)]'
                            : 'border-transparent bg-white/70 hover:bg-white'
                        }`}
                      >
                        {/* 상단: 박스 수(좌) + 뱃지(우) */}
                        <div className="flex items-center justify-between min-h-[22px]">
                          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                            {p.boxes}
                          </span>
                          {(p.isPopular || p.isBestValue) && (
                            <span className="bg-pocari-blue text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                              {p.tag}
                            </span>
                          )}
                        </div>

                        {/* 플랜 이름 + 가격 — 같은 줄, 같은 크기 */}
                        <div className="flex items-baseline justify-between gap-2 my-10">
                          <span className="text-4xl font-bold leading-none">{p.title}</span>
                          <span className="text-4xl font-bold leading-none text-pocari-blue">${p.price}</span>
                        </div>

                        <ul className="space-y-2.5">
                          {p.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                              <span className="text-pocari-blue">{f.icon}</span>
                              {f.text}
                            </li>
                          ))}
                        </ul>

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
              </Fade>
            </div>
          </section>

          {/* Panel 2: Fill your box — 배경 영상은 전체 화면 레이어가 담당, 여기엔 유리 블록만.
              장바구니는 우측 요약 드로어에 있음 */}
          <section data-panel={2} className="snap-start min-h-screen flex flex-col items-center justify-center px-8">
            <div className="w-full max-w-5xl">
              <Fade>
                <CurationStudioRenewed
                  boxCount={boxCount}
                  slots={slots}
                  onAdd={addFlavorToFirstEmpty}
                  onRemoveOne={removeOneFlavor}
                  onRemoveSlot={clearSlot}
                  onClear={clearAllSlots}
                  fullscreenBg
                  onBgChange={setStudioBg}
                  drawerH={drawerH}
                />
              </Fade>
            </div>
          </section>

          {/* Panel 3: Options — 배송 + 크레딧 통합 */}
          <section data-panel={3} className="snap-center min-h-screen flex items-center justify-center px-8">
            <div className="w-full max-w-5xl">
              <Fade>
                {/* Credit — 배송 텀·플랜 옵션·Extra Pack 을 한 카드에. 내부 좌=선택 / 우=크레딧 명세 */}
                {/* 높이 = 양옆 드로어 실측 높이와 동기화 (드로어 계산서가 자라면 함께 자람) */}
                <div
                  className="bg-white rounded-[28px] p-7 border border-slate-100 flex flex-col gap-7"
                  style={{ minHeight: drawerH ?? '60vh' }}
                >

                  {/* ── 위: 선택 영역 (전폭) ── */}
                  <div className="flex flex-col gap-6 min-w-0 flex-1">
                    {/* Delivery Term (Credit 안으로 통합) */}
                    <div>
                      <div className="text-xl font-bold mb-3">Delivery Term</div>
                      <div className="grid grid-cols-4 gap-2">
                        {FREQUENCIES.map((fq) => {
                          const selected = fq.id === frequency;
                          const credit = deliveryCredit(fq.months);
                          return (
                            <motion.button
                              key={fq.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setFrequency(fq.id)}
                              className={`h-14 rounded-xl border-2 flex items-center justify-center gap-2 transition-colors ${
                                selected ? 'border-pocari-blue bg-white' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-base font-bold whitespace-nowrap">{fq.label}</span>
                              {credit > 0 && (
                                <span className="text-sm font-bold text-pocari-blue whitespace-nowrap">+${credit}</span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* 업그레이드 체험 — 크레딧 전용. Light→Daily $40 / Ritual→Daily $30. Daily 는 대상 아님.
                        등장/퇴장은 height 펼침, 플랜 전환 시 제목·설명은 블러 스루 */}
                    <AnimatePresence initial={false}>
                      {upgradeAvailable && (
                        <motion.div
                          key="boost-row"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden -my-3"
                        >
                          <div className="py-3 flex items-center justify-between gap-6">
                            <div className="min-w-0">
                              <AnimatePresence mode="wait" initial={false}>
                                <motion.div key={`${planId}-${currentMonths}`} {...titleSwap}>
                                  <div className="text-xl font-bold">Upgrade to Daily</div>
                                  <div className="mt-1 text-base text-slate-500 font-light">
                                    {`Turn this order into a full Daily set — ${money(upgradePrice)} credit${
                                      currentMonths > 1 ? ` for ${currentMonths} deliveries` : ' per order'
                                    }, never your card.`}
                                  </div>
                                </motion.div>
                              </AnimatePresence>
                            </div>
                            <Toggle on={planBoost} onClick={() => setPlanBoost((v) => !v)} />
                          </div>
                          <div className="h-px bg-slate-100 mb-3" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Extra Pack — 추가 '구매'. 티어별 가격($18/$15/$12), 수량 상한 없음.
                        현금 구매가 기본이고, 크레딧으로 결제할지는 아래 하위 토글로 고른다 */}
                    <div className="flex items-center justify-between gap-6">
                      <div>
                        <div className="text-xl font-bold">Extra Pack</div>
                        <div className="mt-1 text-base text-slate-500 font-light">
                          Add packs on top of your box — {money(packPrice)} each, as many as you like.
                        </div>
                      </div>
                      <Toggle on={extraPack} onClick={() => setExtraPack((v) => !v)} />
                    </div>
                    <AnimatePresence initial={false}>
                      {extraPack && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden"
                        >
                          {/* 결제수단 — 기본 현금, 켜면 크레딧 우선 사용(모자란 만큼은 현금) */}
                          <div className="mb-3 flex items-center justify-between gap-6 rounded-2xl bg-slate-50 px-4 py-3">
                            <div className="min-w-0">
                              <div className="text-base font-bold text-slate-700">Pay with credits</div>
                              <div className="mt-0.5 text-sm text-slate-500 font-light">
                                {`Balance ${money(CREDIT_BALANCE)} — covers ${Math.floor(CREDIT_BALANCE / packPrice)} packs. Anything over goes on your card.`}
                              </div>
                            </div>
                            <Toggle on={packsOnCredit} onClick={() => setPacksOnCredit((v) => !v)} />
                          </div>
                          <div className="grid grid-cols-7 gap-2">
                            {ALL_FLAVORS.map((f) => {
                              const qty = extraPacks.find((pk) => pk.flavorId === f.id)?.qty ?? 0;
                              return (
                                <button
                                  key={f.id}
                                  onClick={() => addExtraPack(f.id)}
                                  className={`relative rounded-xl flex flex-col items-center justify-center gap-1.5 py-2.5 border-2 transition-colors ${
                                    qty > 0 ? 'border-pocari-blue bg-pocari-light' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                                  }`}
                                >
                                  {f.id === AQUA_ID ? (
                                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#DCEEFF] via-[#A9D6FF] to-[#7BC0FF]" />
                                  ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={f.image} alt={f.name} className="w-9 h-9 rounded-full object-cover" />
                                  )}
                                  <span className="max-w-full px-1 truncate text-[10px] font-bold text-slate-500">{f.name}</span>
                                  <AnimatePresence>
                                    {qty > 0 && (
                                      <motion.span
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                                        className="absolute -top-1 -right-1 min-w-[18px] min-h-[18px] rounded-full bg-pocari-blue text-white text-[9px] font-bold flex items-center justify-center tabular-nums"
                                      >
                                        {qty}
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </button>
                              );
                            })}
                          </div>

                          {/* 담은 팩 리스트 — 드로어 계산서와 같은 −/＋/× 컨트롤 */}
                          <AnimatePresence initial={false}>
                            {extraPacks.map((pk) => (
                              <motion.div
                                key={pk.flavorId}
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-center gap-3 pt-3">
                                  <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{flavorName(pk.flavorId)}</span>
                                  <span className="text-sm text-slate-500 font-light tabular-nums">
                                    <AnimatedAmount prefix="$" value={pk.qty * packPrice} />
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <QtyBtn onClick={() => decExtraPack(pk.flavorId)}>−</QtyBtn>
                                    <span className="w-5 text-center text-sm font-bold tabular-nums text-slate-800">{pk.qty}</span>
                                    <QtyBtn onClick={() => addExtraPack(pk.flavorId)}>+</QtyBtn>
                                    <button
                                      onClick={() => removeExtraPack(pk.flavorId)}
                                      aria-label={`${flavorName(pk.flavorId)} 삭제`}
                                      className="ml-1 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── 아래: Credit Balance — 같은 규격 블록 3개 (적립+ / 차감− / 토탈). 사유 좌 / 금액 우 ── */}
                  <div>
                    <div className="text-xl font-bold mb-3">Credit Balance</div>
                    <div className="grid grid-cols-3 gap-4">
                      {/* ① 매 주문 적립 */}
                      <div className="rounded-2xl bg-pocari-light p-5">
                        <div className="text-xs uppercase tracking-widest font-bold text-slate-500">Earn every order</div>
                        <div className="mt-3 flex items-baseline justify-between gap-3">
                          <span className="text-base text-slate-700 font-light truncate min-w-0">
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span key={freqLabel} {...titleSwap} className="block truncate">
                                {earnCredit > 0 ? `Delivery bonus · ${freqLabel}` : 'No bonus on monthly'}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                          <span className="text-3xl font-bold text-pocari-blue tabular-nums shrink-0">
                            <AnimatedAmount prefix="+ $" value={earnCredit} />
                          </span>
                        </div>
                      </div>
                      {/* ② 매 주문 차감 */}
                      <div className="rounded-2xl bg-pocari-light p-5">
                        <div className="text-xs uppercase tracking-widest font-bold text-slate-500">Spend every order</div>
                        <div className="mt-3 flex items-baseline justify-between gap-3">
                          <span className="text-base text-slate-700 font-light truncate min-w-0">
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.span key={creditSubs ?? 'none'} {...titleSwap} className="block truncate">
                                {creditSubs ?? 'Nothing selected yet'}
                              </motion.span>
                            </AnimatePresence>
                          </span>
                          <span className="text-3xl font-bold text-pocari-blue tabular-nums shrink-0">
                            <AnimatedAmount prefix="− $" value={totalCreditUsed} />
                          </span>
                        </div>
                      </div>
                      {/* ③ 크레딧 토탈 — 순 변화와 결과 잔액. Balance $45(고정) → 뒤 숫자만 롤링 */}
                      <div className="rounded-2xl bg-pocari-light p-5">
                        <div className="text-xs uppercase tracking-widest font-bold text-slate-500">Credit total</div>
                        <div className="mt-3 flex items-baseline justify-between gap-3">
                          <span className="text-base text-slate-700 font-light truncate min-w-0">
                            Balance {money(CREDIT_BALANCE)} → <AnimatedAmount value={balanceAfter} />
                          </span>
                          <span className="text-3xl font-bold text-pocari-blue tabular-nums shrink-0">
                            <AnimatedAmount
                              prefix={earnCredit - totalCreditUsed >= 0 ? '+ $' : '− $'}
                              value={Math.abs(earnCredit - totalCreditUsed)}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Fade>
            </div>
          </section>
        </div>

        {/* ── 오른쪽: 요약 드로어(영수증) — 화면 오른쪽 밖에서 왼쪽으로 밀고 들어오는 풀하이트 창 ── */}
        <aside className="h-screen flex items-center">
          <AnimatePresence>
            {inSystem && (
              <motion.div
                ref={drawerRef}
                key="summary"
                initial={{ x: '110%' }}
                animate={{ x: 0 }}
                exit={{ x: '110%' }}
                transition={{ duration: 1.0, ease: [0.32, 0.72, 0, 1] }}
                className={`relative w-full min-h-[60vh] flex flex-col rounded-l-[32px] border [backdrop-filter:blur(40px)_saturate(160%)] transition-colors duration-700 ${
                  // 아크릴 질감(왼쪽 창과 대칭): 파란 틴트 + 채도 부스트 + 노이즈 + 상단 하이라이트.
                  // 기본 높이 60vh — 콘텐츠가 더 많으면 늘어난다(내부 스크롤 없음). 왼쪽 창이 이 높이를 따라온다
                  dark
                    ? 'bg-black/40 border-white/10 shadow-2xl' // 섹션2: 스튜디오와 같은 어두운 유리 블록
                    : 'bg-white/55 border-white/40'
                }`}
              >
                {/* 아크릴 노이즈 텍스처 */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-l-[32px] pointer-events-none opacity-[0.05] mix-blend-overlay"
                  style={{ backgroundImage: ACRYLIC_NOISE }}
                />
                {/* 선택 순서(플랜 → 플레이버 → 배송 → 크레딧)대로 정렬된 계산서.
                    flex-1 + Total 의 mt-auto: 내용이 75vh 보다 적으면 합계/CTA가 영수증 하단에 정렬 */}
                {/* 우측 패딩을 좌측보다 크게: 오른쪽 정렬된 선택값이 화면 경계에서 더 떨어지도록 */}
                <div className="flex-1 pl-14 xl:pl-16 pr-16 xl:pr-20 py-10 flex flex-col gap-6">

                  {/* 1. Plan — 이름만(가격은 Total 몫), 아래에 구성 설명 */}
                  <SummaryRow dark={dark} title="Plan" value={plan.title} onClick={() => goTo(1)} />

                  <SectionDivider dark={dark} />

                  {/* 2. Your box — 계산서 형식: [카테고리] [플레이버] [수량 −/＋/삭제] */}
                  <div>
                    {/* 헤더 행 클릭 시 큐레이션(패널2)으로 이동 — 아래 리스트의 수량 버튼들은 별도 영역이라 영향 없음 */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => goTo(2)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(2); } }}
                      className="group flex items-baseline justify-between gap-3 cursor-pointer"
                    >
                      <h4
                        className={`text-2xl font-bold tracking-tight origin-left transition-all duration-300 group-hover:scale-[1.04] group-hover:text-pocari-blue ${dark ? 'text-white' : 'text-slate-900'}`}
                      >
                        Curation
                      </h4>
                      {/* 남은 기본(Aqua) 슬롯 수 — boxCount 에서 시작해 고른 만큼 줄어듦(다 고르면 +0 Aqua).
                          "+"와 "Aqua"는 고정 텍스트, 숫자만 오도미터처럼 블러 스루로 교체된다. */}
                      <span className="shrink-0 flex items-baseline gap-1 text-xl font-bold text-pocari-blue origin-right transition-transform duration-300 group-hover:scale-[1.04]">
                        <span>+</span>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={aquaCount} {...titleSwap} className="inline-block tabular-nums">
                            {aquaCount}
                          </motion.span>
                        </AnimatePresence>
                        <span>Aqua</span>
                      </span>
                    </div>
                    <ul className="mt-2">
                      {/* Aqua 는 리스트에 표시하지 않음 — 위 카운터가 그 역할을 대신한다 */}
                      <AnimatePresence initial={false}>
                        {basketLines.map((line) => (
                          <motion.li
                            key={line.flavorId}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center gap-3 py-2.5">
                              <span className="flex-1 text-base font-semibold truncate text-pocari-blue/90">
                                {line.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <QtyBtn dark={dark} onClick={() => removeOneFlavor(line.flavorId)}>−</QtyBtn>
                                <span className={`w-5 text-center text-base font-bold tabular-nums transition-colors duration-700 ${dark ? 'text-white' : 'text-slate-800'}`}>
                                  <AnimatePresence mode="wait" initial={false}>
                                    <motion.span key={line.qty} {...titleSwap} className="block">
                                      {line.qty}
                                    </motion.span>
                                  </AnimatePresence>
                                </span>
                                <QtyBtn dark={dark} disabled={!hasSlotToFill} onClick={() => addFlavorToFirstEmpty(line.flavorId)}>+</QtyBtn>
                                <button
                                  onClick={() => removeAllFlavor(line.flavorId)}
                                  aria-label={`${line.name} 삭제`}
                                  className={`ml-1 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                    dark ? 'text-white/40 hover:text-white hover:bg-white/15' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/10'
                                  }`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </div>

                  <SectionDivider dark={dark} />

                  {/* 3. Delivery — 'Monthly'는 통짜 스왑, 'N months'는 숫자만 롤링(' months'는 고정) */}
                  <SummaryRow dark={dark} title="Delivery" valueNode={<AnimatedMonths months={currentMonths} />} onClick={() => goTo(3)} />

                  <SectionDivider dark={dark} />

                  {/* 4. Credit — Plan/Curation/Delivery 는 '내가 확정한 고정 구성'이지만
                      크레딧은 그 구성에서 파생되는 매달 변동 흐름(+적립/−지출)이라 성격이 다르다.
                      그래서 같은 텍스트 행이 아니라 독립된 블록 카드로 분리해 표시한다. */}
                  <div>
                    {/* 다른 행들과 같은 규격: 제목 좌 / 이번 달 순 증감(net) 우 — 블록 안 세부 내역의 합계.
                        헤더 클릭 시 옵션(패널3)으로 이동 — 아래 블록 카드는 순수 정보 표시라 클릭 범위에서 제외 */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => goTo(3)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(3); } }}
                      className="group flex items-baseline justify-between gap-3 cursor-pointer"
                    >
                      <h4
                        className={`text-2xl font-bold tracking-tight origin-left transition-all duration-300 group-hover:scale-[1.04] group-hover:text-pocari-blue ${dark ? 'text-white' : 'text-slate-900'}`}
                      >
                        Credit
                      </h4>
                      <span className="text-xl font-bold text-pocari-blue tabular-nums shrink-0 origin-right transition-transform duration-300 group-hover:scale-[1.04]">
                        <AnimatedAmount
                          prefix={earnCredit - totalCreditUsed >= 0 ? '+ $' : '− $'}
                          value={Math.abs(earnCredit - totalCreditUsed)}
                        />
                      </span>
                    </div>
                    <div className={`mt-3 rounded-2xl p-5 transition-colors duration-700 ${dark ? 'bg-white/10' : 'bg-pocari-light'}`}>
                      {/* 매달 적립 (+) */}
                      <div className="flex items-baseline justify-between gap-3">
                        <span className={`text-sm font-light truncate min-w-0 transition-colors duration-700 ${dark ? 'text-white/70' : 'text-slate-700'}`}>
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span key={freqLabel} {...titleSwap} className="block truncate">
                              {earnCredit > 0 ? `Delivery bonus · ${freqLabel}` : 'No bonus on monthly'}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                        <span className="text-lg font-bold text-pocari-blue tabular-nums shrink-0">
                          <AnimatedAmount prefix="+ $" value={earnCredit} />
                        </span>
                      </div>

                      <div className={`my-3 h-[2px] rounded-full transition-colors duration-700 ${dark ? 'bg-white/15' : 'bg-white'}`} />

                      {/* 매달 지출 (−) */}
                      <div className="flex items-baseline justify-between gap-3">
                        <span className={`text-sm font-light truncate min-w-0 transition-colors duration-700 ${dark ? 'text-white/70' : 'text-slate-700'}`}>
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span key={creditSubs ?? 'none'} {...titleSwap} className="block truncate">
                              {creditSubs ?? 'Nothing selected'}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                        <span className="text-lg font-bold text-pocari-blue tabular-nums shrink-0">
                          <AnimatedAmount prefix="− $" value={totalCreditUsed} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 합계 + CTA — mt-auto 로 하단 정렬, 구분선은 공통 규격(흰 실선) */}
                  <div className="mt-auto">
                    <SectionDivider dark={dark} />
                    {/* 현금으로 사는 추가팩은 구독료 위에 더해진다 (크레딧은 구독료에 닿지 않음) */}
                    <AnimatePresence initial={false}>
                      {extraCashDue > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden"
                        >
                          <div className={`pt-4 flex items-baseline justify-between text-base font-light ${dark ? 'text-white/60' : 'text-slate-500'}`}>
                            <span>{`Extra packs ×${extraQtyByCash}`}</span>
                            <span className="tabular-nums">
                              <AnimatedAmount prefix="+ $" value={extraCashDue} />
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="pt-5 flex items-baseline justify-between">
                      <span className={`text-2xl font-bold tracking-tight transition-colors duration-700 ${dark ? 'text-white' : 'text-slate-900'}`}>
                        Monthly
                      </span>
                      <span className="flex items-baseline text-pocari-blue">
                        <AnimatedAmount value={total} className="text-xl font-bold" />
                      </span>
                    </div>

                    {/* 함정 알림 — 규칙으로 막지 않고 더 나은 경로만 안내 (문서 7절) */}
                    <AnimatePresence initial={false}>
                      {planHint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                          className="overflow-hidden"
                        >
                          <div className={`mt-3 rounded-xl px-3 py-2 text-sm font-light ${dark ? 'bg-white/10 text-white/80' : 'bg-pocari-light text-pocari-blue'}`}>
                            {planHint}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* CTA — 박스를 다 채워야 활성화 (진행 게이트와 같은 기준) */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      className="mt-5 w-full min-h-[56px] rounded-2xl font-bold text-base flex items-center justify-center gap-2 bg-pocari-blue text-white shadow-[0_8px_20px_rgba(28,136,255,0.35)] hover:bg-blue-600 transition-colors duration-700"
                    >
                      Continue to checkout
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>

                    {/* 안심 문구 — 결제 피로 완화 */}
                    <div className={`mt-4 flex items-center justify-center gap-1.5 text-xs font-light transition-colors duration-700 ${dark ? 'text-white/40' : 'text-slate-900'}`}>
                      <Lock className="w-3.5 h-3.5" />
                      Payment is handled securely by Shopify.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

/* ── 재사용 소품 ── */

/* 섹션 진입 페이드 (기존 Section의 whileInView 유지, 헤더는 왼쪽 컬럼으로 이동) */
function Fade({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={SPRING}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* 금액 전환 — prefix('$', '+ $', '− $' 등)는 고정 텍스트, 숫자만 블러 스루로 롤링.
   중복되는 기호/단위가 매번 같이 슬라이드하면 서식이 산만해지므로 바뀌는 숫자만 움직인다. */
function AnimatedAmount({ prefix = '$', value, className = '' }: { prefix?: string; value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className={`inline-flex items-baseline whitespace-nowrap ${className}`}>
      <span>{prefix}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={rounded} {...titleSwap} className="inline-block tabular-nums">
          {rounded}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* 배송 주기 값 — 'Monthly'는 숫자가 없어 통짜로 스왑하고, 'N months'는 숫자만 롤링 + ' months'는 고정 */
function AnimatedMonths({ months, className = 'block text-xl font-bold truncate text-pocari-blue' }: { months: number; className?: string }) {
  if (months === 1) {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key="monthly" {...titleSwap} className={className}>Monthly</motion.span>
      </AnimatePresence>
    );
  }
  return (
    <span className={className}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={months} {...titleSwap} className="inline-block tabular-nums">{months}</motion.span>
      </AnimatePresence>
      {' months'}
    </span>
  );
}

/* 요약 드로어 행 — 대제목(2xl, 좌) + 선택값(동일선상 우) + 보조설명(우, 아래).
   선택된 값은 브랜드 파란색, 미선택(muted)만 회색. dark = 섹션2 어두운 유리 위.
   valueNode 를 주면 기본 문자열 스왑 대신 그 노드를 그대로 렌더(부분 애니메이션 등 커스텀 케이스용). */
function SummaryRow({
  title, value, valueNode, sub, muted, dark, onClick,
}: {
  title: string; value?: string; valueNode?: React.ReactNode; sub?: string; muted?: boolean; dark?: boolean; onClick?: () => void;
}) {
  return (
    <div>
      {/* onClick 이 있으면 그 섹션으로 이동 — 헤더 행 전체가 클릭 타깃.
          role="button": 안에 <h4> 를 두므로 실제 <button> 대신 div 로 접근성만 확보(키보드 Enter/Space 지원) */}
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
        className={`flex items-baseline justify-between gap-3 ${onClick ? 'group cursor-pointer' : ''}`}
      >
        <h4
          className={`shrink-0 text-2xl font-bold tracking-tight origin-left transition-all duration-300 ${
            onClick ? 'group-hover:scale-[1.04] group-hover:text-pocari-blue' : ''
          } ${dark ? 'text-white' : 'text-slate-900'}`}
        >
          {title}
        </h4>
        <span className={`text-right min-w-0 origin-right transition-transform duration-300 ${onClick ? 'group-hover:scale-[1.04]' : ''}`}>
          {valueNode ?? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={value}
                {...titleSwap}
                className={`block text-xl truncate transition-colors duration-700 ${
                  muted ? (dark ? 'text-white/45 font-bold' : 'text-slate-900 font-light') : 'text-pocari-blue font-bold'
                }`}
              >
                {value}
              </motion.span>
            </AnimatePresence>
          )}
        </span>
      </div>
      {sub && (
        <div className={`text-right text-sm mt-0.5 transition-colors duration-700 ${dark ? 'text-white/45' : 'text-slate-900 font-light'}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={sub} {...titleSwap}>
              {sub}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* 드로어 섹션 구분선 — Total 위 점선(절취선)과 구별되는 얇은 실선 */
function SectionDivider({ dark }: { dark?: boolean }) {
  return (
    <div
      aria-hidden
      className={`h-[2px] w-full shrink-0 rounded-full transition-colors duration-700 ${dark ? 'bg-white/15' : 'bg-white'}`}
    />
  );
}

/* 크레딧 정책 토글 스위치 */
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`relative shrink-0 w-16 h-9 rounded-full transition-colors ${on ? 'bg-pocari-blue' : 'bg-slate-200'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow ${on ? 'right-1' : 'left-1'}`}
      />
    </button>
  );
}

/* 계산서 수량 조절 버튼 (− / +) */
function QtyBtn({
  dark, disabled, onClick, children,
}: {
  dark?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-6 h-6 rounded-full border text-sm font-bold leading-none flex items-center justify-center transition-colors ${
        disabled
          ? dark ? 'border-white/15 text-white/25 cursor-default' : 'border-slate-400/40 text-slate-400 cursor-default'
          : dark ? 'border-white/30 text-white hover:bg-white/15' : 'border-slate-500/50 text-slate-800 hover:bg-slate-900/10'
      }`}
    >
      {children}
    </button>
  );
}

