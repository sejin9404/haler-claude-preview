import React from 'react';
import { RefreshCw, Truck, Tag, Star, Package, Coins, Crown } from 'lucide-react';
import { MEDIA_ASSETS } from '@/lib/mediaConfig';

export const THEME_VIDEO = MEDIA_ASSETS.THEME_MASTER_VIDEO;

export const themes = [
  {
    id: 'nectar',
    name: 'Nectar',
    tag: 'Fruity & Sweet',
    description: 'A sun-drenched explosion of tropical energy.\nAwakening senses with pure bio-vitality and rhythm.',
    video: MEDIA_ASSETS.THEME_VIDEOS.nectar,
    formula: [
      { name: "Xylitol", value: "350mg", p: "85%" },
      { name: "Eucalyptus", value: "100mg", p: "60%" },
      { name: "Menthol", value: "50mg", p: "30%" }
    ],
    parameters: [
      { minLabel: "Clean", maxLabel: "Sweet", value: 88 },
      { minLabel: "Light", maxLabel: "Deep", value: 72 },
      { minLabel: "Warm", maxLabel: "Cool", value: 35 }
    ],
    flavors: [
      { id: 'f-mangobomb', name: 'Mangobomb', tag: 'Mango', image: MEDIA_ASSETS.FLAVORS.mango },
      { id: 'f-melona', name: 'Melona', tag: 'Melon', image: MEDIA_ASSETS.FLAVORS.melon },
      { id: 'f-berrish', name: 'Berrish', tag: 'Berry', image: MEDIA_ASSETS.FLAVORS.berry },
      { id: 'f-peachy', name: 'Peachy', tag: 'Peach', image: MEDIA_ASSETS.FLAVORS.peach },
      { id: 'f-lemonic', name: 'Lemonic', tag: 'Lemon', image: MEDIA_ASSETS.FLAVORS.lemon }
    ]
  },
  {
    id: 'terrascent',
    name: 'Terrascent',
    tag: 'Ritual & Relaxing',
    description: 'Earthy whispers from the ancient deep.\nA grounding ritual for physiological stability and balance.',
    video: MEDIA_ASSETS.THEME_VIDEOS.terrascent,
    formula: [
      { name: "Xylitol", value: "200mg", p: "45%" },
      { name: "Eucalyptus", value: "500mg", p: "90%" },
      { name: "Menthol", value: "150mg", p: "65%" }
    ],
    parameters: [
      { minLabel: "Clean", maxLabel: "Sweet", value: 15 },
      { minLabel: "Light", maxLabel: "Deep", value: 92 },
      { minLabel: "Warm", maxLabel: "Cool", value: 25 }
    ],
    flavors: [
      { id: 'f-mossy', name: 'Mossy Wood', tag: 'Woods', image: MEDIA_ASSETS.FLAVORS.mango },
      { id: 'f-earthy', name: 'Earthy Root', tag: 'Roots', image: MEDIA_ASSETS.FLAVORS.melon },
      { id: 'f-temple', name: 'Ancient Temple', tag: 'Incense', image: MEDIA_ASSETS.FLAVORS.berry },
      { id: 'f-rain', name: 'Rain Forest', tag: 'Mist', image: MEDIA_ASSETS.FLAVORS.peach },
      { id: 'f-soil', name: 'Deep Soil', tag: 'Earth', image: MEDIA_ASSETS.FLAVORS.lemon }
    ]
  },
  {
    id: 'sylvana',
    name: 'Sylvana',
    tag: 'Awakening & Fresh',
    description: 'The sharp clarity of morning dew.\nRevitalizing spirit with absolute respiratory clarity.',
    video: MEDIA_ASSETS.THEME_VIDEOS.sylvana,
    formula: [
      { name: "Xylitol", value: "150mg", p: "30%" },
      { name: "Eucalyptus", value: "350mg", p: "75%" },
      { name: "Menthol", value: "400mg", p: "95%" }
    ],
    parameters: [
      { minLabel: "Clean", maxLabel: "Sweet", value: 8 },
      { minLabel: "Light", maxLabel: "Deep", value: 30 },
      { minLabel: "Warm", maxLabel: "Cool", value: 95 }
    ],
    flavors: [
      { id: 'f-mist', name: 'Morning Mist', tag: 'Ozone', image: MEDIA_ASSETS.FLAVORS.mango },
      { id: 'f-pine', name: 'Green Pine', tag: 'Needles', image: MEDIA_ASSETS.FLAVORS.melon },
      { id: 'f-herbal', name: 'Wild Herbal', tag: 'Stems', image: MEDIA_ASSETS.FLAVORS.berry },
      { id: 'f-dew', name: 'Dewy Leaf', tag: 'Green', image: MEDIA_ASSETS.FLAVORS.peach },
      { id: 'f-breeze', name: 'Fresh Breeze', tag: 'Air', image: MEDIA_ASSETS.FLAVORS.lemon }
    ]
  },
  {
    id: 'flor',
    name: 'Flor',
    tag: 'Aromatic & Comfort',
    description: 'Vibrant botanical synergy.\nNotes that harmonize with your well-being and inner peace.',
    video: MEDIA_ASSETS.THEME_VIDEOS.flor,
    formula: [
      { name: "Xylitol", value: "250mg", p: "55%" },
      { name: "Eucalyptus", value: "200mg", p: "50%" },
      { name: "Menthol", value: "100mg", p: "40%" }
    ],
    parameters: [
      { minLabel: "Clean", maxLabel: "Sweet", value: 65 },
      { minLabel: "Light", maxLabel: "Deep", value: 25 },
      { minLabel: "Warm", maxLabel: "Cool", value: 40 }
    ],
    flavors: [
      { id: 'f-rose', name: 'Damask Rose', tag: 'Floral', image: MEDIA_ASSETS.FLAVORS.mango },
      { id: 'f-lavender', name: 'Moondew', tag: 'Lavender', image: MEDIA_ASSETS.FLAVORS.melon },
      { id: 'f-lily', name: 'White Lily', tag: 'Clean', image: MEDIA_ASSETS.FLAVORS.berry },
      { id: 'f-jasmine', name: 'Midnight', tag: 'Jasmine', image: MEDIA_ASSETS.FLAVORS.peach },
      { id: 'f-violet', name: 'Wild Violet', tag: 'Gentle', image: MEDIA_ASSETS.FLAVORS.lemon }
    ]
  },
  {
    id: 'innoscent',
    name: 'Innoscent',
    tag: 'Pure & Neutral',
    description: 'The purity of silence.\nAbsolute water for your deepest focus and mental clarity.',
    video: MEDIA_ASSETS.THEME_VIDEOS.innoscent,
    formula: [
      { name: "Xylitol", value: "Zero", p: "0%" },
      { name: "Eucalyptus", value: "Zero", p: "0%" },
      { name: "Menthol", value: "Pure", p: "5%" }
    ],
    parameters: [
      { minLabel: "Clean", maxLabel: "Sweet", value: 5 },
      { minLabel: "Light", maxLabel: "Deep", value: 2 },
      { minLabel: "Warm", maxLabel: "Cool", value: 99 }
    ],
    flavors: []
  }
];

// 기본(디폴트) 플레이버 — 빈 슬롯 대신 채워지고, 다른 맛을 고르면 대체된다.
export const AQUA_FLAVOR = { id: 'aqua', name: 'Aqua', tag: 'Pure', image: '', isDefault: true };
export const AQUA_ID = 'aqua';

// 콤보 팩 — 일반 팩(같은 맛 5개)과 달리, 그 테마의 플레이버 5종이 1개씩 들어있는 구성.
// id 규칙: `combo-${themeId}` — 일반 flavorId 와 겹치지 않게 접두어로 구분해 슬롯/장바구니 로직을 그대로 재사용한다.
export const COMBO_THEMES = themes.filter((t) => t.id !== 'innoscent' && t.flavors.length > 0);
export const comboIdFor = (themeId: string) => `combo-${themeId}`;
export const isComboId = (id: string) => id.startsWith('combo-');
export const comboThemeId = (comboId: string) => comboId.replace('combo-', '');
export const COMBO_FLAVORS = COMBO_THEMES.map((t) => ({
  id: comboIdFor(t.id),
  name: `${t.name} Combo`,
  tag: 'MIX',
  image: t.flavors[0]?.image ?? '',
  isCombo: true as const,
  themeId: t.id,
  // 콤보 바 UI에서 미니 썸네일 5개를 한 줄로 보여줄 때 쓰는 원본 목록
  thumbnails: t.flavors.map((f) => f.image),
}));

export { SUBSCRIPTION_PLANS as plans, BENEFIT_PILLS as benefitPills } from '@/constants/plans';

export const getPlanLimit = (selectedPlan: string | null) => {
  if (selectedPlan === 'light') return 2;
  if (selectedPlan === 'essential') return 3;
  if (selectedPlan === 'daily') return 6;
  return 0;
};
