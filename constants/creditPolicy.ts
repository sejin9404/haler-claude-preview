/**
 * BLIZ 구독·크레딧 시스템 v5 (2026-08-02)
 *
 * ⚠️ 롤백 지점 — 가격·크레딧 정책 수치는 전부 이 파일에만 있다.
 *    v4 로 되돌리려면 이 파일만 되돌리면 된다(호출부 수정 불필요).
 *
 * 핵심 원칙 3가지 (문서 최상단):
 *  1) 크레딧은 어떤 경로로도 '구독료 현금 결제액'을 감소시키지 않는다.
 *     → 소진은 캡슐(추가팩·업그레이드)로만. v4 의 '요금 차감'은 폐지됨.
 *  2) 환산가 비노출 — 캡당 단가를 계산해 보여주지 않는다.
 *  3) % 할인 표기 금지 — 16 CFR §233.1(a) 실판매 요건 충족 불가(단일 기준가 없음).
 *     절대금액만 표기한다.
 */

/** 추가팩(5캡) 가격 — 티어별. 현금 구매가 기본, 크레딧으로도 구매 가능. 수량 상한 없음. */
export const EXTRA_PACK_PRICE: Record<string, number> = {
  light: 18,
  essential: 15, // Ritual
  daily: 12,
};

/**
 * 업그레이드 체험 — 크레딧 전용(현금 구매 불가). 목적지는 Daily 하나뿐.
 * Light→Ritual 은 영구 금지, Daily 는 더 올라갈 곳이 없어 대상 아님.
 * 주문 1건당 1회 적용 — 4개월 묶음 주문이면 차감 ×4 (아래 upgradeCost 참조).
 */
export const UPGRADE_TO_DAILY_COST: Record<string, number> = {
  light: 40, // 20캡 = 4팩 추가
  essential: 30, // 15캡 = 3팩 추가
};

/** 묶음배송 보너스: $5 × (N−1). 유일한 반복 크레딧 유입원. */
export const CREDIT_PER_EXTRA_MONTH = 5;

/** 신선도 상한 — 배송을 4개월 넘게 묶을 수 없다(품질 근거). */
export const MAX_BUNDLE_MONTHS = 4;

/**
 * 목업 잔액 = 트라이얼 킷 전환 $99 (1회성, 유입 3종 중 최대).
 * 실제 구현에선 Supabase 잔액을 읽어온다.
 */
export const CREDIT_BALANCE = 99.0;

export const extraPackPrice = (planId: string) => EXTRA_PACK_PRICE[planId] ?? 15;

/** 이 플랜에서 업그레이드 체험이 가능한가 (Daily 는 대상 아님) */
export const canUpgrade = (planId: string) => planId in UPGRADE_TO_DAILY_COST;

/** 묶음 개월수만큼 차감 배수 적용 — 4개월 묶음이면 ×4 */
export const upgradeCost = (planId: string, months: number) =>
  (UPGRADE_TO_DAILY_COST[planId] ?? 0) * Math.max(1, months);

export const deliveryCredit = (months: number) =>
  Math.max(0, (months - 1) * CREDIT_PER_EXTRA_MONTH);

/**
 * 고객이 모르고 손해 보는 함정 — 규칙으로 막지 않고 '알림'으로 처리한다(문서 7절).
 * 같은 팩 수를 더 싸게 얻는 경로가 있으면 그 안내 문구를 돌려준다.
 * 팩 수: Light 2 / Ritual 3 / Daily 6 + 추가팩 n
 */
export const betterPlanHint = (
  planId: string,
  extraPacks: number
): string | null => {
  if (extraPacks < 1) return null;
  if (planId === 'light') {
    // Light($39) + 추가팩×n($18) vs Ritual($49) + 추가팩×(n-1)($15)
    const here = 39 + extraPacks * 18;
    const there = 49 + Math.max(0, extraPacks - 1) * 15;
    if (there < here) return `Ritual gives you the same packs for $${here - there} less.`;
  }
  if (planId === 'essential') {
    // Ritual($49) + 추가팩×n($15) vs Daily($79) + 추가팩×(n-3)($12)
    const here = 49 + extraPacks * 15;
    const there = 79 + Math.max(0, extraPacks - 3) * 12;
    if (there <= here) return `Daily gives you the same packs for $${here - there} less — or more for the same.`;
  }
  return null;
};
