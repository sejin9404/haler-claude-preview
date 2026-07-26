# Haler 자체 구독 시스템 설계 (Shopify 네이티브 구독 위 하이브리드)

> 상태: 설계안 (v1) · 작성 목적: "기존 구독앱(Recharge 등) 대신 우리 크레딧/박스 커스터마이징을 직접 만들어 Shopify 네이티브 구독 API 위에 얹는다"는 방향의 실행 설계.

---

## 0. 전제 (확정)

- **결제**: Shopify Payments 사용 예정 → Shopify **네이티브 구독 청구(Subscription Contract + Billing Attempt)** 사용 가능. (이게 이 설계의 전제조건이며 확정됨)
- **최초 가입 결제**는 Shopify 체크아웃을 통과한다. (selling plan이 붙은 상품을 구매하는 순간 Subscription Contract가 생성됨) — 이 부분만은 우리가 대체하지 않는다.
- **가입 이후의 모든 관리 경험(보딩패스)**과 **크레딧/박스 규칙**은 100% 우리 것.
- 스택: Next.js(App Router) + Supabase + Vercel. (기존 그대로)

---

## 1. 핵심 원칙 — "Shopify는 정산 레일, 두뇌는 우리 것"

크레딧 시스템과 박스 커스터마이징은 **Shopify 위에 얹는 게 아니라 우리 백엔드(Supabase) 안에 산다.** Shopify는 "이번 주기 최종 청구액 + 배송 품목"만 실행한다. 그 값을 **매 결제 주기마다 우리가 계산해서 Contract에 투영**한다.

```
┌───────────────────────────────────────────────────────────┐
│ 3층 · 프론트 (보딩패스 UI)                    100% 우리 것    │
│   components/BoardingPass.tsx · app/pass · app/dashboard    │
│   맛 슬롯 선택 · 박스 수량 · 크레딧 잔액 · Skip/Stop/Restart  │
├───────────────────────────────────────────────────────────┤
│ 2층 · 백엔드 = 두뇌 (Next.js API + Supabase)  100% 우리 것    │
│   • 크레딧 원장 (적립/사용/잔액)                              │
│   • 박스 커스터마이징 규칙 엔진 (PLAN_LIMITS, 테마/맛 검증)    │
│   • "이번 주기 = 얼마 청구 / 크레딧 얼마 차감 / 어떤 맛" 계산  │
│   • Shopify Admin GraphQL 호출 어댑터                        │
├───────────────────────────────────────────────────────────┤
│ 1층 · Shopify = 정산 레일 (네이티브 구독 API)  Shopify 것    │
│   • 카드 볼팅(안전 보관) · 실제 청구 실행                     │
│   • Subscription Contract (공식 청구 기록/스케줄)            │
│   • 주문 생성 · 배송 · 세금                                  │
└───────────────────────────────────────────────────────────┘
```

**Shopify는 "크레딧"이나 "보딩패스"라는 개념을 몰라도 된다.** 그래서 우리가 이 로직을 무제한으로 자유롭게 만들 수 있다. (역설적으로 이게 기존 앱을 못 쓰는 이유이자 = 직접 만들면 자유로운 이유)

---

## 2. Shopify 쪽 세팅 (1층)

### 2.1 커스텀 앱 + 권한(Scopes)
스토어 관리자에서 커스텀 앱 생성 → Admin API 토큰 발급. `.env`의 `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`에 연결(이미 자리 잡혀 있음).

필요 scope(초안):
- `read_own_subscription_contracts`, `write_own_subscription_contracts` — 구독 계약 읽기/수정
- `read_customer_payment_methods` — 청구 시 결제수단 참조
- `write_products`, `read_products` — selling plan / variant
- `read_orders` — 청구 결과 주문 확인
- `write_discounts` — (크레딧을 할인으로 반영할 경우)

> ⚠️ 체크: 구독 API는 스토어에 **구독 지원 결제수단(Shopify Payments)** 이 활성화돼 있어야 실제 청구가 돈다. 프로텍티드 고객 데이터 접근 승인 여부는 앱 설정 단계에서 확인.

### 2.2 Selling Plan Group / Selling Plans
우리 3개 플랜을 Shopify Selling Plan으로 정의한다.

| 우리 플랜 | 박스 수 | 가격 | Selling Plan (배송/청구 주기) | 가격 정책 |
|-----------|--------|------|------------------------------|-----------|
| `light`     | 2 | $39 | Monthly | (플랜 자체 할인 or 정가) |
| `essential` | 3 | $49 | Monthly | 18% off |
| `daily`     | 6 | $79 | Monthly | 34% off |

- 배송 주기(Monthly)와 **플랜 기본 할인**은 Selling Plan의 `pricingPolicy`로 표현.
- **크레딧으로 인한 추가 할인**은 selling plan이 아니라 "결제 주기 훅"에서 계약별로 동적으로 적용(§6).

### 2.3 상품 / Variant = 맛(Flavor)
`app/pass/passData.tsx`의 테마별 맛 5종을 Shopify **product variant**로 매핑한다.

- 테마(Nectar, Terrascent, Sylvana, Flor, Innoscent) → 상품(Product) 또는 옵션
- 개별 맛(Mangobomb, Melona…) → variant
- 우리 코드의 `flavor.id`(예: `f-mangobomb`) ↔ Shopify `variantId` 매핑 테이블을 Supabase에 둔다(§4 `flavor_variant_map`).

박스 하나 = 계약 line item 하나(variant + 수량). "Essential 3박스 = 특정 맛 3개" → Contract에 line item 3개(또는 수량 합산).

---

## 3. 데이터 모델 매핑 (우리 ↔ Shopify ↔ Supabase)

기존 코드의 구성값을 3계층으로 흩뿌린다.

| 개념 (우리 코드) | 어디에 저장? | Shopify 표현 |
|---|---|---|
| `planId` (`light/essential/daily`) | Supabase `subscriptions.plan_id` + Contract line의 sellingPlan | SellingPlan |
| `flavors: [{ name, qty }]` (보딩패스) | Supabase `box_configs` (원본) → Contract lines(투영) | SubscriptionContract lines |
| 테마/슬롯 선택 상태 | Supabase `box_configs.slots` (JSON) | Contract metafield(스냅샷) |
| 크레딧 잔액/이력 | Supabase `credit_ledger` (**단독 소유**) | 없음(청구 시 할인으로만 반영) |
| next delivery / term | Shopify Contract (billing cycle) | SubscriptionBillingCycle |
| 결제수단/배송지 | Shopify (볼팅) | Customer payment method / address |

핵심: **크레딧 원장은 Shopify에 존재하지 않는다.** 우리 DB가 유일한 진실. Shopify와 만나는 지점은 청구 직전 "할인 반영" 한 번뿐.

---

## 4. Supabase 스키마 (초안 DDL)

```sql
-- 4.1 구독 (Shopify Contract와 1:1 매핑)
create table subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id),
  shopify_contract_id text unique not null,          -- gid://shopify/SubscriptionContract/123
  shopify_customer_id text not null,
  plan_id           text not null,                    -- 'light' | 'essential' | 'daily'
  status            text not null default 'active',   -- active | paused | cancelled
  next_billing_at   timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- 4.2 박스 커스터마이징(보딩패스 원본 상태)
create table box_configs (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  slots           jsonb not null,   -- [{ theme:'Nectar', flavorId:'f-mangobomb', variantId:'gid://…' }, ...]
  effective_from  timestamptz default now(),          -- 이 설정이 적용되는 주기 시작
  created_at      timestamptz default now()
);

-- 4.3 맛 ↔ Shopify variant 매핑
create table flavor_variant_map (
  flavor_id   text primary key,        -- 'f-mangobomb'
  theme_id    text not null,           -- 'nectar'
  variant_id  text not null,           -- gid://shopify/ProductVariant/…
  display_name text not null
);

-- 4.4 크레딧 원장 (append-only, 단일 진실)
create table credit_ledger (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id),
  subscription_id uuid references subscriptions(id),
  delta           integer not null,        -- +적립 / -사용 (센트 or 포인트 단위 통일)
  reason          text not null,           -- 'earn_cycle' | 'spend_cycle' | 'promo' | 'adjust'
  billing_run_id  uuid,                    -- 어느 청구에서 발생했는지
  created_at      timestamptz default now()
);
-- 잔액 = select coalesce(sum(delta),0) from credit_ledger where user_id = ?

-- 4.5 청구 실행 로그 (멱등성 + 감사)
create table billing_runs (
  id              uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id),
  cycle_index     integer not null,        -- 몇 번째 주기
  gross_amount    integer not null,        -- 할인 전 금액(센트)
  credit_applied  integer not null default 0,
  net_amount      integer not null,        -- 실제 청구 금액
  shopify_billing_attempt_id text,
  status          text not null default 'pending', -- pending | success | failed
  created_at      timestamptz default now(),
  unique (subscription_id, cycle_index)     -- 같은 주기 중복 청구 방지
);
```

원칙:
- `credit_ledger`는 **append-only**(수정/삭제 금지, 조정도 새 row). 잔액은 항상 SUM으로 계산 → 정합성 사고 방지.
- `billing_runs`의 `unique(subscription_id, cycle_index)`로 **중복 청구 멱등성** 확보.

---

## 5. 크레딧 시스템 설계 (2층, 100% 우리 것)

### 5.1 적립 (Earn)
플랜 features의 크레딧 %를 청구 성공 시 적립.
- `essential`: 결제액의 5% 크레딧
- `daily`: 결제액의 10% 크레딧
- `light`: 없음

트리거: `subscription_billing_attempts/success` 웹훅 → `credit_ledger`에 `+` row(`reason='earn_cycle'`).

### 5.2 사용 (Spend)
다음 청구 때 잔액을 (정책에 따라) 자동/선택 차감.
- 정책 예: "매 주기 잔액의 최대 X까지 자동 차감" 또는 "고객이 보딩패스에서 사용 토글".
- 차감분은 **Shopify Contract에 할인으로 반영**(§6.3).

### 5.3 Shopify 반영 방식 (권장 A)
- **A. 계약 드래프트에 정액 할인 추가** (권장): 청구 직전 `subscriptionContractUpdate`로 draft를 열고, 사용 크레딧만큼 fixed-amount 할인 add → commit → 그 주기 청구. 통제력 최상.
- B. Shopify 네이티브 Store Credit(`storeCreditAccountDebit`): 체크아웃엔 자동 적용되지만 구독 청구 주기 제어가 제한적 → 보조 수단으로만 검토.

> 크레딧 로직 자체(적립률, 상한, 소멸, 프로모)는 전부 우리 코드. Shopify엔 "이번에 $N 할인"이라는 결과만 전달.

---

## 6. 박스 커스터마이징 설계 (2층 규칙 + 1층 투영)

### 6.1 규칙 엔진 (우리 것)
- `PLAN_LIMITS = { light:2, essential:3, daily:6 }` = 슬롯 개수 상한(기존 `getPlanLimit`과 동일).
- 검증: 슬롯 수 == 플랜 박스 수, 각 슬롯의 (테마, 맛) 유효성, 재고.
- 원본 상태는 `box_configs.slots`(JSON)에 저장 — 보딩패스 UI의 소스 오브 트루스.

### 6.2 Contract로 번역
보딩패스 저장 시(현재 `handleSave`의 `{ planId, flavors:[{name,qty}] }`) →
1. `flavor_variant_map`으로 `name → variantId` 변환
2. `subscriptionContractUpdate`(draft) → 기존 lines 제거/갱신, 새 lines add(variant+qty+sellingPlan)
3. 플랜 변경 시 sellingPlan 교체(박스 수/가격 정책 변경)
4. `subscriptionDraftCommit`
5. 성공 시 `box_configs`에 새 row(`effective_from`) + Contract metafield에 스냅샷

### 6.3 "이번 주기 최종값" 계산 (두뇌의 핵심 함수)
```
computeCycle(subscription):
  gross   = 플랜 가격(sellingPlan 반영)
  credit  = 크레딧 사용 정책(잔액, 상한) 적용
  net     = gross - credit
  lines   = box_configs.slots → variant lines
  return { lines, gross, credit, net }
```

---

## 7. 결제 주기 훅 — 전체를 연결하는 단 하나의 흐름

매 청구 예정일에 우리 백엔드(Vercel Cron)가 실행:

```
[Vercel Cron: 매일]  ── 오늘 청구 예정 subscriptions 조회
   └─ 각 구독마다:
      1. billing_runs에 (subscription_id, cycle_index) 선점 INSERT  ← 멱등성 락
      2. computeCycle() → { lines, gross, credit, net }
      3. Shopify: subscriptionContractUpdate(draft)
            - lines = 이번 주기 맛 구성
            - discountAdd = credit (있으면)
         → subscriptionDraftCommit
      4. Shopify: subscriptionBillingCycleCharge / BillingAttemptCreate  ← 실제 청구
      5. 결과 대기(웹훅)
         success → billing_runs.status='success'
                   credit_ledger: -credit(spend) & +earn(적립률)
         failure → billing_runs.status='failed' → 재시도(dunning) 정책
```

웹훅 구독(App Router route handlers):
- `subscription_billing_attempts/success` → 적립/차감 확정, 주문 확인
- `subscription_billing_attempts/failure` → 재시도 스케줄, 고객 알림
- `subscription_contracts/update` → 우리 DB 동기화

> 결제 실패 재시도(dunning)·카드 만료·부분 환불·프로레이션 = **직접 만들 때 우리가 떠안는 영역.** 초기엔 "N회 재시도 후 일시정지" 수준으로 단순하게 시작 권장.

---

## 8. 기존 코드 접점 (Mock → 실제 전환 지도)

`lib/subscriptionApi.ts`는 현재 전부 목업(`console.log` + `setTimeout`). 각 메서드가 바뀔 실제 동작:

| 현재 mock 메서드 | 실제 구현 | Shopify API |
|---|---|---|
| `updateSubscription({planId,flavors})` | 규칙검증 → variant 번역 → draft 갱신 → commit | `subscriptionContractUpdate` / `subscriptionDraft*` / `subscriptionDraftCommit` |
| `skipSubscription(nextDate)` | 다음 청구 주기 스킵 | `subscriptionBillingCycleSkip` |
| `cancelSubscription()` | 계약 취소(or 일시정지) | `subscriptionContractCancel` / `subscriptionContractPause` |
| `restartSubscription()` | 재활성화 | `subscriptionContractActivate` |
| `getPortalUrl()` / `redirectToPortal()` | 우리 배송/결제 관리 라우트(또는 Shopify 고객 포털) | Customer payment method update |
| `redirectToStore()` | 스토어/추가주문 | Storefront cart + sellingPlan |

프론트(`BoardingPass.tsx`)는 이미 이 서비스 인터페이스를 통해 호출 중 → **인터페이스 유지한 채 내부만 실제 API로 교체**하면 UI 변경 최소.

관리자 `app/admin/subscriptions/page.tsx`도 하드코딩 `SUBSCRIBERS` → 실제 `subscriptions` + Shopify contract 조회로 연결.

---

## 9. 구현 로드맵 (단계)

- **Phase 0 — 기반**: 커스텀 앱/scope, Selling Plan Group 3개, 테마·맛 variant 생성 + `flavor_variant_map` 시드, Supabase 스키마 마이그레이션.
- **Phase 1 — 읽기 경로**: 실제 Contract 1건을 보딩패스/어드민에 표시(read-only). `subscriptionApi` read 메서드 실제화.
- **Phase 2 — 박스 수정**: `updateSubscription` 실제화(draft→commit). 규칙 엔진 + variant 번역.
- **Phase 3 — 생명주기**: skip / cancel / restart 실제화.
- **Phase 4 — 크레딧**: 원장 테이블 + 적립(웹훅) + 사용(할인 반영).
- **Phase 5 — 청구 엔진**: Vercel Cron + 결제 주기 훅 + billing_runs 멱등성 + dunning.
- **Phase 6 — 견고화**: 웹훅 서명 검증, 재시도, 관측성(로그/알림), 엣지케이스(세금/통화/환불).

가입(체크아웃) 플로우는 Phase 1과 병렬로: selling plan 붙은 상품을 Storefront cart로 담아 체크아웃 → contract 생성 확인.

---

## 10. 리스크 & 열린 질문

1. **결제 실패/재시도(dunning)**: 기존 앱이 대신 해주던 부분. 정책 단순화로 시작하되 반드시 설계 필요.
2. **가입 결제는 Shopify 체크아웃 고정**: 완전한 커스텀 결제 화면은 불가(스토어프론트 커스터마이징 범위 내에서만).
3. **세금/통화/다국가**: Shopify가 처리하지만, 크레딧 할인과 세금 계산 순서를 검증해야 함.
4. **크레딧 ↔ 할인 정합성**: 우리 원장 차감과 Shopify 할인 반영이 원자적이지 않음 → `billing_runs`로 상태 기계 관리, 실패 시 롤백/보정 규칙 필요.
5. **환불/부분취소 시 크레딧 원복** 규칙 정의 필요.

### 확인이 필요한 결정들
- 크레딧 단위: **센트(금액)** vs 포인트? (권장: 센트로 통일해 계산 단순화)
- 크레딧 사용: 자동 최대 차감 vs 고객 선택?
- 취소 시: 즉시 취소 vs 현재 주기 말까지 유지?
- skip 정책: 1회 스킵 = 다음 주기로 밀기(청구일 이동)로 통일?

---

## 부록 A. 참고 Shopify GraphQL 뮤테이션(초안)
- 계약 수정: `subscriptionContractUpdate` → `subscriptionDraftUpdate` / `subscriptionDraftLineAdd|Update|Remove` / `subscriptionDraftDiscountAdd` → `subscriptionDraftCommit`
- 청구: `subscriptionBillingCycleCharge`(또는 `subscriptionBillingAttemptCreate`)
- 주기 스킵: `subscriptionBillingCycleSkip`
- 생명주기: `subscriptionContractPause` / `subscriptionContractCancel` / `subscriptionContractActivate`
- 조회: `subscriptionContract`, `subscriptionBillingCycles`
- (스펙은 실제 구현 시 현재 API 버전 문서로 최종 확인)
