// MODAL_CONTENT_DATA.ts
// Haler Bliz + Xem — 모달 콘텐츠 전체 (실제 데이터 + 출처 포함)
// 페이지 컴포넌트에서 import해서 사용

export interface ModalSource {
  label: string;
  text: string;
}

export interface ModalContent {
  title: string;
  eyebrow?: string;
  stat?: string;
  paragraphs: string[];
  sources?: ModalSource[];
  warning?: string;
  // 성분 전용
  ingredientRole?: string;
  ingredientName?: string;
  // 특수 컴포넌트 타입
  type?: 'default' | 'comparison' | 'ingredients' | 'howto' | 'steps';
}

export const MODAL_CONTENT: Record<string, ModalContent> = {

  // ── PROBLEM STATS ─────────────────────────────────────────

  statOffice: {
    title: 'Office Humidity & Airway Comfort',
    eyebrow: 'The Data',
    stat: '20–30%',
    paragraphs: [
      'Most HVAC-controlled office environments maintain relative humidity between 20–30%. Research consistently shows that airway comfort is associated with 40–60% RH — roughly double what most offices deliver.',
      'A 2020 University of Arizona study found that individuals spending the majority of their time in 30–60% RH environments experienced measurably lower stress responses and better sleep quality than those in drier conditions.',
    ],
    sources: [
      {
        label: 'ASHRAE Standard 55',
        text: '"Humidity below 30% may cause dry skin, mucous membrane irritation, and upper respiratory discomfort." (American Society of Heating, Refrigerating and Air-Conditioning Engineers)',
      },
      {
        label: 'NIH / PMC — "Wellbuilt for Wellbeing"',
        text: 'University of Arizona observational study, 2020. PMID: 31900997',
      },
      {
        label: 'WHO',
        text: '"Humans feel most comfortable between 40–60% relative humidity."',
      },
    ],
    warning: 'For general wellness context only. Bliz is not intended to treat any medical condition.',
  },

  statFlight: {
    title: 'Airplane Cabin Humidity',
    eyebrow: 'The Data',
    stat: '10–20%',
    paragraphs: [
      'Aircraft cabins typically maintain 10–20% relative humidity at cruising altitude — a level the National Academies of Sciences notes is "below ASHRAE comfort guidelines." The Sahara Desert averages 25%.',
      'On a 10-hour flight, you can lose up to 1.5 to 2 liters of water through breathing alone, before accounting for any other activity. A peer-reviewed laboratory study found that passengers perceived significantly more dryness on flights without humidification.',
    ],
    sources: [
      {
        label: 'National Academies of Sciences',
        text: '"The Airliner Cabin Environment and the Health of Passengers and Crew." NCBI Bookshelf, NBK207472',
      },
      {
        label: 'ScienceDirect — Building and Environment (2011)',
        text: '"Low humidity in the aircraft cabin environment and its impact on well-being." doi:10.1016/j.buildenv.2011.01.024',
      },
      {
        label: 'PubMed — PMC7126907',
        text: '"Low moisture content in cabins is known to be responsible for headache, tiredness and many other non-specific symptoms."',
      },
    ],
    warning: 'For general wellness context only. Bliz is not intended to treat any medical condition.',
  },

  statRun: {
    title: 'Breathing Volume During Exercise',
    eyebrow: 'The Data',
    stat: '100L/min',
    paragraphs: [
      'At peak exercise intensity, your lungs can process up to 100 liters of air per minute. At rest, that figure is around 5–6 liters. The increase can be 15–20 fold during maximal effort.',
      'A peer-reviewed study published in CHEST Journal (1991) measured mean ventilation at maximal exercise at 97 ± 25 L/min in men and 69 ± 22 L/min in women. Whatever is in the air you breathe during exercise — dry conditions, allergens, or pollutants — is entering your airway at a proportionally higher rate.',
    ],
    sources: [
      {
        label: 'CHEST Journal — "Normal Values and Ranges for Ventilation and Breathing Pattern at Maximal Exercise"',
        text: 'University of British Columbia, Pulmonary Research Laboratory. 1991. PMID: 1905613',
      },
      {
        label: 'PT Direct — "Respiratory Responses to Exercise"',
        text: '"Breathing rates may increase from 15 breaths per minute at rest up to 40–50 breaths per minute during intense exercise."',
      },
    ],
    warning: 'For general wellness context only. Bliz is not intended to treat any medical condition.',
  },

  // ── SYSTEM ─────────────────────────────────────────────────

  systemCompare: {
    title: 'How Bliz compares',
    type: 'comparison',
    paragraphs: [
      'When your airway feels dry, the instinct is to drink water or run a humidifier. Both help — but they work differently from direct airway misting.',
      'The distinction between systemic and surface hydration is well-documented in vocal health research. "Systemic hydration refers to fluid within the body and vocal fold tissue, whereas superficial hydration is the fluid lining the vocal fold surface" — the surface your comfort depends on.',
    ],
    sources: [
      {
        label: 'ScienceDirect — "The Effect of Surface Hydration on Teachers\' Voice Quality"',
        text: '5-minute nebulization with saline before teaching, 4-week study period. Journal of Voice, 2016.',
      },
      {
        label: 'PMC — "The role of hydration in vocal fold physiology"',
        text: '"Nebulizing solutions into the airway demonstrate positive trends." NIH, PMC2925668.',
      },
    ],
    warning: 'For general wellness context only. Bliz is not intended to treat any medical condition.',
  },

  // ── BLIZ ───────────────────────────────────────────────────

  blizScience: {
    title: 'Why 6 microns?',
    eyebrow: 'Particle Size & Airway Deposition',
    paragraphs: [
      'Particle size determines where mist lands in your airway. This is established physics — not specific to any product.',
      'Below 5μm: Particles travel to the lower airways and lungs. This is why medical nebulizers — designed for drug delivery — use this range.',
      'Above ~10μm: Particles are too large to travel further than the mouth and throat.',
      'Around 6μm: The particle size that deposits in the nose, throat, and upper airway — where daily comfort and surface hydration are relevant.',
      'Bliz is calibrated to 6 microns specifically to support upper airway comfort. It is not designed for, and should not be used as, a medical device or drug delivery system.',
    ],
    warning: 'Bliz is a general wellness product. It is not a medical device, drug delivery system, or substitute for any prescribed treatment.',
  },

  // ── XEM INGREDIENTS ────────────────────────────────────────

  xylitol: {
    title: 'Xylitol',
    type: 'default',
    ingredientRole: 'Airway environment support',
    ingredientName: 'Xylitol',
    paragraphs: [
      'A naturally occurring sugar alcohol found in many fruits, vegetables, and trees. Xylitol has been used in oral care, nasal rinses, and throat wellness products for decades. It is classified by the FDA as Generally Recognized as Safe (GRAS).',
      'Research has explored xylitol\'s role in supporting the airway surface environment, particularly in the context of moisture balance.',
    ],
    sources: [
      {
        label: 'Zabner et al. — PNAS (2000)',
        text: '"The osmolyte xylitol reduces the salt concentration of airway surface liquid." Proceedings of the National Academy of Sciences, 97(21):11614–11619. PMID: 11005848',
      },
      {
        label: 'Kang et al. — Clinical Otolaryngology (2026)',
        text: 'Systematic review and meta-analysis: nasal irrigation with xylitol significantly improved sinonasal well-being. DOI: 10.1111/coa.70057',
      },
      {
        label: 'PubMed — NCBI PMC11202173',
        text: 'Randomized controlled study on xylitol nasal irrigation (70 participants). "Xylitol is a naturally occurring antibacterial agent generally believed to enhance the body\'s own innate bactericidal mechanisms."',
      },
    ],
    warning: 'These studies were conducted for medical purposes. Xem is a general wellness product. We do not claim that Xem treats, prevents, or cures any condition. Consult your healthcare provider for any medical concerns.',
  },

  eucalyptol: {
    title: 'Eucalyptol',
    ingredientRole: 'Clarifying & refreshing sensation',
    ingredientName: 'Eucalyptol (1,8-Cineole)',
    paragraphs: [
      'The primary active compound in eucalyptus essential oil, with a long history of use in wellness, aromatherapy, and respiratory comfort products worldwide. Recognized for its distinctive clarifying sensation.',
      'Eucalyptol has been the subject of significant research interest in the respiratory wellness field.',
    ],
    sources: [
      {
        label: 'PubMed — PMID 22477544',
        text: '"Myrtol standardized accelerated both ciliary beat frequency and mucociliary transport in a concentration-dependent manner. 1,8-cineole accelerated mucociliary clearance in vivo."',
      },
      {
        label: 'PubMed — PMID 20722639',
        text: '"1,8-Cineole prevented the reduction of mucociliary clearance induced by antigen presentation." Pharmaceutical Biology, 2010.',
      },
      {
        label: 'SAGE Journals (2024)',
        text: '"Protective Effect of 1,8-Cineole (Eucalyptol) on Respiratory System: A Systematic Review and Meta-analysis." DOI: 10.1177/09731296241296202',
      },
      {
        label: 'Journal of Essential Oil Research (2020)',
        text: '"Eucalyptol is an underutilized ally in respiratory wellness... Several clinical trials have been performed with positive results." DOI: 10.1080/10412905.2020.1716867',
      },
    ],
    warning: 'These studies were conducted for medical research purposes. Xem is a general wellness product. Eucalyptol in Xem is used for its sensory properties. We do not claim any medical effect.',
  },

  menthol: {
    title: 'Menthol',
    ingredientRole: 'Open-airway feeling',
    ingredientName: 'Menthol',
    paragraphs: [
      'Derived from mint plants, menthol creates the immediate sensation of clear, easy breathing. It activates cold-sensing receptors (TRPM8) in your nasal passages — giving you that refreshing, open feeling the moment you inhale.',
      'This is a sensory mechanism, not a structural one — menthol changes how your airway feels, not its physical dimensions. The research on this is clear and consistent.',
    ],
    sources: [
      {
        label: 'PubMed — PMID 21991571',
        text: '"The menthol and cold sensation receptor TRPM8 in normal human nasal mucosa and rhinitis." TRPM8 nerve fibres are abundant in nasal mucosa and mediate neurovascular reflexes. Rhinology, 2011.',
      },
      {
        label: 'European Respiratory Society (2017)',
        text: '"L-Menthol activates TRPM8 on nasal trigeminal neurons, creating a cognitive sensation of increased airway flow." ERJ, 49(4). DOI: 10.1183/13993003.01823-2016',
      },
      {
        label: 'Journal of Applied Physiology (2013)',
        text: '"Due to its cooling and soothing effects on mucosal surfaces, menthol has been employed for centuries in medical applications and consumer products." American Physiological Society.',
      },
    ],
    warning: 'Menthol in Xem is used for its sensory comfort properties. Xem is a general wellness product. We do not claim any medical effect. Not for use by infants without medical guidance.',
  },

  fullIngredients: {
    title: 'Full Ingredient List',
    type: 'ingredients',
    eyebrow: 'Complete formula',
    paragraphs: [
      'All ingredients in Xem are used in commonly available wellness and personal care products. Xylitol is classified by the FDA as Generally Recognized as Safe (GRAS). Eucalyptol and menthol have long histories of use in consumer wellness products.',
    ],
    warning: 'Xem is for general wellness purposes only. Not intended to diagnose, treat, cure, or prevent any disease or medical condition. These statements have not been evaluated by the Food and Drug Administration. Consult your healthcare provider before use, particularly if you are pregnant, nursing, or have any respiratory condition.',
  },

  howItWorks: {
    title: 'How to use Bliz',
    type: 'howto',
    eyebrow: 'Step by step',
    paragraphs: [],
    warning: undefined,
  },

};

// ── FULL INGREDIENTS LIST ────────────────────────────────────
export const XEM_INGREDIENTS = [
  'Purified Water',
  'Sodium Chloride (Saline, 0.9%)',
  'Xylitol',
  'Eucalyptol (1,8-Cineole)',
  'Menthol',
];

export const XEM_CLAIMS = [
  'No alcohol',
  'No preservatives',
  'No artificial fragrance',
  'No artificial color',
  'Drug-free',
  'Non-prescription',
];

// ── HOW TO USE STEPS ─────────────────────────────────────────
export const HOW_TO_USE_STEPS = [
  {
    num: '01',
    title: 'Load the capsule',
    desc: 'Take one Xem capsule and drop it into the top of Bliz. It clicks into place. One capsule = one 90-second session.',
  },
  {
    num: '02',
    title: 'Press once',
    desc: 'Press the single button on the side of Bliz. The mist begins automatically. No settings, no adjustments.',
  },
  {
    num: '03',
    title: 'Breathe in gently',
    desc: 'Place the mouthpiece to your lips and breathe in slowly and naturally. You can also breathe in through your nose for nasal comfort. 90 seconds. The device stops automatically.',
  },
  {
    num: '04',
    title: "That's it",
    desc: 'Cap the device. Bliz is ready for your next session. Recommended: 1–2 sessions per day, or as needed.',
  },
];

// ── COMPARISON TABLE DATA ─────────────────────────────────────
export const COMPARISON_TABLE = {
  headers: ['', 'Drinking water', 'Humidifier', 'Bliz'],
  rows: [
    {
      label: 'Reaches airway surface directly',
      values: ['No — systemic', 'No — ambient air', 'Yes'],
      highlight: 3,
    },
    {
      label: 'Time to notice a difference',
      values: ['20–30 min', 'Hours', '~90 seconds'],
      highlight: 3,
    },
    {
      label: 'Works in-flight',
      values: ['Limited', 'No', 'Yes'],
      highlight: 3,
    },
    {
      label: 'Portable',
      values: ['Yes', 'No', 'Yes'],
      highlight: 3,
    },
    {
      label: 'Flavor options',
      values: ['No', 'No', 'Yes'],
      highlight: 3,
    },
  ],
};
