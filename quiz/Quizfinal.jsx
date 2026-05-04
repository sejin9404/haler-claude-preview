"use client";
// ═══════════════════════════════════════════════════════════════
// HalerBreathQuizUS_v4_COMPLETE.jsx  —  Next.js Client Component
// Haler "How's Your Airway?" Quiz — US Market v4 (FULL DATA)
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

import { supabase } from "@/lib/supabase";

// ══════════════════════════════════════════════
// API PORTS — replace stubs with real endpoints
// ══════════════════════════════════════════════
export const HALER_API = {
  submitLead: async (payload) => {
    console.log("[HALER_API] submitLead →", payload);
    const { error } = await supabase
      .from('quiz_submissions')
      .insert([{
        email: payload.email,
        score: payload.score,
        tier: payload.tier,
        answers: payload.answers,
        session_id: payload.sessionId,
        utm_source: payload.utmSource || 'direct',
        created_at: new Date().toISOString()
      }]);
    
    if (error) console.error("Error saving lead:", error);
    return { success: !error };
  },
  trackCompletion: async (payload) => {
    console.log("[HALER_API] trackCompletion →", payload);
    if (!payload.emailProvided) {
      await supabase.from('quiz_submissions').insert([{
        score: payload.score,
        tier: payload.tier,
        session_id: payload.sessionId,
        utm_source: payload.utmSource || 'direct',
        answers: payload.answers
      }]);
    }
  },
  trackCTAClick: async (cta, payload) => {
    console.log("[HALER_API] trackCTAClick →", cta, payload);
  },
  getPersonalizedURL: (type, data) => {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://haler.vercel.app";
    const params = new URLSearchParams({
      ref:    "quiz",
      tier:   data.tier    || "",
      score:  data.score   || "",
      occ:    data.occ     || "",
      age:    data.age     || "",
      gender: data.gender  || "",
      sid:    data.sessionId || "",
    });
    if (type === "trial") return `${base}/trial?${params}`;
    if (type === "plans") return `${base}/plans?${params}`;
    return `${base}?${params}`;
  },
  saveQuizState: async (sessionId, state) => {
    try { sessionStorage.setItem(`haler_quiz_${sessionId}`, JSON.stringify(state)); } catch (e) {}
  },
};

// ══════════════════════════════════════════════
// QUIZ STEPS — FULL DATA
// ══════════════════════════════════════════════
export const QUIZ_STEPS = [
  // ── STEP 1: OCCUPATION ──────────────────────
  {
    id: "occupation",
    tag: "01 · Lifestyle",
    title: "Your daily routine shapes your airway's moisture and immune capacity.",
    titleEm: "daily routine", // word(s) to italicize in green
    sub: "What best describes most of your days?",
    multi: false,
    opts: [
      {
        e: "💻",
        l: "Remote work / WFH",
        s: "In-home HVAC exposure",
        score: 2,
        id: "wfh",
      },
      {
        e: "🏢",
        l: "Office / open-plan workspace",
        s: "Shared air, heavy AC or heating",
        score: 3,
        id: "office",
      },
      {
        e: "🎤",
        l: "Teacher, presenter, singer, or voice actor",
        s: "High vocal demand = high airway dehydration",
        score: 4,
        id: "voice",
      },
      {
        e: "🏋️",
        l: "Fitness trainer / coach",
        s: "High-breath-volume environment",
        score: 3,
        id: "fitness",
      },
      {
        e: "🏃",
        l: "Endurance athlete (runner, cyclist, triathlete)",
        s: "Max-effort outdoor breathing",
        score: 4,
        id: "athlete",
      },
      {
        e: "✈️",
        l: "Frequent traveler or flight crew",
        s: "Cabin air = 10–20% humidity",
        score: 5,
        id: "travel",
      },
      {
        e: "🏗️",
        l: "Outdoor / labor / industrial job",
        s: "Dust, fumes, environmental exposure",
        score: 5,
        id: "labor",
      },
      {
        e: "🛋️",
        l: "Student / part-time / other",
        s: "",
        score: 1,
        id: "other",
      },
    ],
    insight: {
      travel:
        "🔴 Airplane cabin humidity averages 10–20% — drier than most deserts. A 5-hour flight strips your mucosal lining significantly.",
      voice:
        "🟡 Vocal professionals lose 2–3× more airway moisture daily. Unlike water, mist reaches the larynx directly.",
      athlete:
        "🟡 At peak effort, you inhale 50L/min. On high-AQI days, every breath concentrates pollutants into your airways.",
      labor:
        "🔴 Industrial dust and fumes directly damage airway epithelial cells — your first line of immune defense.",
    },
  },

  // ── STEP 2: ENVIRONMENT ──────────────────────
  {
    id: "environment",
    tag: "02 · Environment",
    title: "Your primary space determines your daily airway stress baseline.",
    titleEm: "primary space",
    sub: "Where do you spend most of your waking hours?",
    multi: false,
    opts: [
      {
        e: "❄️",
        l: "Air-conditioned or heated building all day",
        s: "HVAC drops humidity to 20–30%",
        score: 4,
        id: "hvac",
      },
      {
        e: "🏠",
        l: "Home with decent ventilation or air purifier",
        s: "Relatively controlled",
        score: 1,
        id: "home",
      },
      {
        e: "🚗",
        l: "My car — long commute or lots of driving",
        s: "Road pollution + recirculated cabin air",
        score: 3,
        id: "car",
      },
      {
        e: "✈️",
        l: "Airplanes or airports regularly",
        s: "Sub-20% humidity + crowd exposure",
        score: 5,
        id: "plane",
      },
      {
        e: "🏋️",
        l: "Gym or fitness studio",
        s: "High-exertion shared air",
        score: 3,
        id: "gym",
      },
      {
        e: "🏭",
        l: "Warehouse, factory, or outdoor work site",
        s: "Particulate, fumes, or dust",
        score: 6,
        id: "factory",
      },
      {
        e: "☕",
        l: "Coffee shops or coworking spaces",
        s: "Varied air quality, crowd density",
        score: 2,
        id: "cafe",
      },
    ],
    insight: {
      hvac: "💡 Office HVAC holds 20–30% RH — well below the 40–60% needed for healthy mucus. Your airway is in a constant low-grade drought.",
      plane:
        "🔴 Cabin air under 20% humidity. On long flights, mucosal moisture can drop 40% — compromising your pathogen filter.",
      factory:
        "🔴 Occupational particulate is the #1 preventable cause of airway damage in the US.",
    },
  },

  // ── STEP 3: LOCATION ─────────────────────────
  {
    id: "location",
    tag: "03 · Where You Live",
    title: "Your location shapes your baseline airway stress — year round.",
    titleEm: "location",
    sub: "Select all that describe your area.",
    multi: true,
    opts: [
      {
        e: "🌆",
        l: "Dense urban area (NYC, LA, Chicago, Houston…)",
        s: "PM2.5 + traffic pollution",
        score: 3,
        id: "urban",
      },
      {
        e: "🔥",
        l: "Wildfire-prone region (West Coast, Mountain West)",
        s: "Seasonal smoke = intense mucosal stress",
        score: 5,
        id: "wildfire",
      },
      {
        e: "🌾",
        l: "High pollen zone (Southeast, Midwest)",
        s: "Heavy seasonal allergen load",
        score: 3,
        id: "pollen",
      },
      {
        e: "🌵",
        l: "Arid / dry climate (Southwest desert)",
        s: "Chronically low ambient humidity",
        score: 3,
        id: "dry_climate",
      },
      {
        e: "🏔️",
        l: "High altitude (Denver, SLC, mountain towns)",
        s: "Thinner, drier air = faster dehydration",
        score: 3,
        id: "altitude",
      },
      {
        e: "🏡",
        l: "Suburban / rural with clean air",
        s: "Lower environmental burden",
        score: 0,
        id: "suburb",
      },
      {
        e: "🏗️",
        l: "Near highways, construction, or industrial areas",
        s: "PM2.5 + NOx exposure",
        score: 3,
        id: "industrial",
      },
    ],
    insight: {},
  },

  // ── STEP 4: SLEEP ────────────────────────────
  {
    id: "sleep",
    tag: "04 · Sleep",
    title: "Sleep is when your airway should recover. Does it?",
    titleEm: "should recover",
    sub: "What's your typical sleep experience?",
    multi: false,
    opts: [
      {
        e: "🌵",
        l: "Wake up with a dry, scratchy, or sore throat",
        s: "Overnight airway dehydration",
        score: 4,
        id: "dry",
      },
      {
        e: "👄",
        l: "Mouth breather — snoring, stuffy nose, or can't breathe through nose",
        s: "Completely bypasses nasal humidification",
        score: 5,
        id: "mouth",
      },
      {
        e: "🤧",
        l: "Morning congestion, phlegm, or coughing",
        s: "Poor overnight clearance",
        score: 4,
        id: "congestion",
      },
      {
        e: "⌚",
        l: "CPAP user or diagnosed sleep apnea",
        s: "Pressurized air further dries the airway",
        score: 4,
        id: "cpap",
      },
      {
        e: "😴",
        l: "I wake up feeling completely fine",
        s: "",
        score: 0,
        id: "good",
      },
    ],
    insight: {
      mouth:
        "🔴 Mouth breathing bypasses nasal humidification for 7–9 hours. Mucosal dryness increases bacterial adhesion up to 4×.",
      cpap: "🟡 CPAP worsens airway dryness — a commonly overlooked side effect. Pre-sleep misting helps offset this significantly.",
      dry: "🟡 That scratchy morning throat means your airway barrier failed to recover overnight. This compounds every single night.",
    },
  },

  // ── STEP 5: EXERCISE ─────────────────────────
  {
    id: "exercise",
    tag: "05 · Fitness",
    title: "How you work out determines your weekly pollutant intake.",
    titleEm: "work out",
    sub: "What does your typical week look like?",
    multi: false,
    opts: [
      {
        e: "🏃",
        l: "Daily outdoor runs or rides — serious mileage",
        s: "High ventilation × outdoor exposure",
        score: 4,
        id: "outdoor_intense",
      },
      {
        e: "🚴",
        l: "Cycling outdoors near roads or traffic",
        s: "Exhaust at road level + heavy breathing",
        score: 4,
        id: "road_cycling",
      },
      {
        e: "🏋️",
        l: "Gym — lifting, HIIT, group classes",
        s: "Indoor shared air + high exertion",
        score: 2,
        id: "gym_workout",
      },
      {
        e: "🧘",
        l: "Yoga, pilates, or mindfulness movement",
        s: "Indoor, low intensity",
        score: 1,
        id: "yoga",
      },
      {
        e: "🚶",
        l: "Light activity — walks, casual movement",
        s: "",
        score: 1,
        id: "light",
      },
      {
        e: "🛋️",
        l: "Mostly sedentary",
        s: "",
        score: 1,
        id: "sedentary",
      },
    ],
    insight: {
      outdoor_intense:
        "🔴 At pace, you inhale 50L/min. On a moderate AQI day, you're absorbing pollutants at a rate far exceeding casual breathing — straight to your airways.",
      road_cycling:
        "🔴 Road cyclists have 2–3× higher particulate exposure than pedestrians on the same route.",
    },
  },

  // ── STEP 6: SYMPTOMS ─────────────────────────
  {
    id: "symptoms",
    tag: "06 · Symptoms",
    title: "These everyday signals are your airway's calls for help.",
    titleEm: "calls for help",
    sub: "Experienced in the past month? Select all that apply.",
    multi: true,
    opts: [
      {
        e: "😤",
        l: "Persistent throat clearing or tickle — even when well",
        s: "",
        score: 3,
        id: "clearing",
      },
      {
        e: "💨",
        l: "Coughing or phlegm without being sick",
        s: "",
        score: 4,
        id: "cough",
      },
      {
        e: "🌬️",
        l: "Short of breath in specific environments",
        s: "Offices, gyms, smoky or polluted days",
        score: 3,
        id: "breath",
      },
      {
        e: "🤧",
        l: "Getting sick 3+ times/year or slow recovery",
        s: "",
        score: 4,
        id: "sick",
      },
      {
        e: "👃",
        l: "Sensitivity to smells, smoke, or pollen",
        s: "",
        score: 3,
        id: "allergy",
      },
      {
        e: "🌙",
        l: "Nighttime coughing or disrupted sleep breathing",
        s: "",
        score: 3,
        id: "night",
      },
      {
        e: "✅",
        l: "None of the above — I feel fine",
        s: "",
        score: 0,
        id: "none",
      },
    ],
    insight: {},
  },
];

// ══════════════════════════════════════════════
// SCORING UTILITIES
// ══════════════════════════════════════════════
export const MAX_SCORE = 34;

export function calcScore(answers, steps = QUIZ_STEPS) {
  let total = 0;
  steps.forEach((s) => {
    (answers[s.id] || []).forEach((sid) => {
      const opt = s.opts.find((o) => o.id === sid);
      if (opt) total += opt.score;
    });
  });
  return Math.max(0, total);
}

export function getTier(score) {
  if (score <= 9)  return "safe";
  if (score <= 19) return "warn";
  return "danger";
}

export function getTierLabel(tier) {
  return { safe: "🟢 Ideal", warn: "🟡 Cautious", danger: "🔴 Danger" }[tier];
}

export function getTierColor(tier) {
  return { safe: "#3B82F6", warn: "#FF5859", danger: "#FF5859" }[tier];
}

// ══════════════════════════════════════════════
// COMPARISON UTILITY
// ══════════════════════════════════════════════
export function getComparisonData(score, profile) {
  const ageAdj  = { "18–24": -2, "25–34": 0, "35–44": 1, "45–54": 2, "55+": 3 };
  const gAdj    = { Male: 0.5, Female: -0.5, "Non-binary": 0, "Prefer not to say": 0 };
  const segAvg  = 14 + (ageAdj[profile.age] || 0) + (gAdj[profile.gender] || 0);
  const userPct = Math.min(Math.round((score / MAX_SCORE) * 100), 100);
  const segPct  = Math.min(Math.round((segAvg / MAX_SCORE) * 100), 100);
  const label =
    profile.age && profile.gender && profile.gender !== "Prefer not to say"
      ? `${profile.age}-year-old ${profile.gender.toLowerCase()}s`
      : profile.age
      ? `people in their ${profile.age}s`
      : "US adults";
  const percentile = Math.min(Math.round(20 + (score / MAX_SCORE) * 75), 97);
  return {
    segAvg:     segAvg.toFixed(1),
    segPct,
    userPct,
    label,
    diff:       (score - segAvg).toFixed(1),
    percentile,
    worse:      100 - percentile,
  };
}

// ══════════════════════════════════════════════
// RADAR DATA CALCULATOR (6 axes)
// ══════════════════════════════════════════════
export function calcRadarData(answers) {
  const occ  = answers.occupation?.[0];
  const env  = answers.environment?.[0];
  const sl   = answers.sleep?.[0];
  const ex   = answers.exercise?.[0];
  const loc  = answers.location  || [];
  const syms = answers.symptoms  || [];
  const cap  = (v) => Math.min(v, 100);

  let h = 0, p = 0, sr = 0, l = 0, s = 0, e = 0;

  // Hydration Deficit
  if (sl === "mouth")    h += 55;
  if (sl === "dry")      h += 40;
  if (sl === "congestion") h += 30;
  if (env === "hvac")    h += 30;
  if (env === "plane")   h += 50;
  if (occ === "travel")  h += 40;
  if (occ === "voice")   h += 30;

  // Pollution Exposure
  if (env === "factory") p += 60;
  if (occ === "labor")   p += 55;
  if (loc.includes("wildfire"))   p += 50;
  if (loc.includes("urban"))      p += 30;
  if (ex === "road_cycling")      p += 40;
  if (ex === "outdoor_intense")   p += 25;
  if (env === "car")     p += 25;
  if (loc.includes("industrial")) p += 30;

  // Sleep Recovery
  if (sl === "mouth")    sr += 50;
  if (sl === "cpap")     sr += 40;
  if (sl === "dry")      sr += 35;
  if (sl === "congestion") sr += 30;
  if (syms.includes("night")) sr += 30;

  // Airway Load
  if (occ === "voice")   l += 55;
  if (occ === "athlete") l += 45;
  if (occ === "travel")  l += 40;
  if (ex === "outdoor_intense") l += 40;
  if (ex === "road_cycling")    l += 35;
  if (occ === "labor")   l += 35;

  // Symptom Burden
  if (syms.includes("sick"))     s += 40;
  if (syms.includes("cough"))    s += 40;
  if (syms.includes("clearing")) s += 25;
  if (syms.includes("breath"))   s += 30;
  if (syms.includes("allergy"))  s += 25;
  if (syms.includes("night"))    s += 25;

  // Environmental Risk
  if (loc.includes("wildfire"))   e += 55;
  if (loc.includes("dry_climate")) e += 35;
  if (loc.includes("altitude"))   e += 30;
  if (loc.includes("pollen"))     e += 30;
  if (loc.includes("urban"))      e += 25;
  if (loc.includes("industrial")) e += 30;
  if (env === "factory") e += 40;

  return [
    { label: "Hydration\nDeficit",   val: cap(h)  },
    { label: "Pollution\nExposure",  val: cap(p)  },
    { label: "Sleep\nRecovery",      val: cap(sr) },
    { label: "Airway\nLoad",         val: cap(l)  },
    { label: "Symptom\nBurden",      val: cap(s)  },
    { label: "Env\nRisk",            val: cap(e)  },
  ];
}

// ══════════════════════════════════════════════
// PLAN RECOMMENDATION
// ══════════════════════════════════════════════
import { SUBSCRIPTION_PLANS, STARTER_KIT } from '../constants/plans';

export const PLANS = {
  intensive: {
    id: "intensive",
    name: SUBSCRIPTION_PLANS[2].title,
    price: `$${SUBSCRIPTION_PLANS[2].price}`,
    period: SUBSCRIPTION_PLANS[2].period,
    desc: "For high-exposure lifestyles. Full daily protection for your busiest days.",
    features: SUBSCRIPTION_PLANS[2].features.map(f => f.text),
  },
  standard: {
    id: "standard",
    name: SUBSCRIPTION_PLANS[1].title,
    price: `$${SUBSCRIPTION_PLANS[1].price}`,
    period: SUBSCRIPTION_PLANS[1].period,
    desc: "For consistent daily users building a solid airway routine.",
    features: SUBSCRIPTION_PLANS[1].features.map(f => f.text),
  },
  essentials: {
    id: "essentials",
    name: SUBSCRIPTION_PLANS[0].title,
    price: `$${SUBSCRIPTION_PLANS[0].price}`,
    period: SUBSCRIPTION_PLANS[0].period,
    desc: "Perfect for maintenance and prevention — build the habit before you need it.",
    features: SUBSCRIPTION_PLANS[0].features.map(f => f.text),
  },
  trial: {
    id: "trial",
    name: STARTER_KIT.name,
    price: `$${STARTER_KIT.price}`,
    period: STARTER_KIT.period,
    desc: "Try before you commit. 30-day risk-free.",
    features: STARTER_KIT.features,
  },
};

export function getRecommendedPlan(score, occ, sl, ex) {
  const scorePercent = Math.min(Math.round((score / MAX_SCORE) * 100), 100);
  
  if (scorePercent > 70) return "intensive";
  if (scorePercent > 20) return "standard";
  return "essentials";
}

// ══════════════════════════════════════════════
// BLIZ SOLUTION CARDS — answer-mapped
// ══════════════════════════════════════════════
export function buildSolutionCards(answers) {
  const occ  = answers.occupation?.[0];
  const env  = answers.environment?.[0];
  const sl   = answers.sleep?.[0];
  const ex   = answers.exercise?.[0];
  const loc  = answers.location  || [];
  const syms = answers.symptoms  || [];
  const cards = [];

  if (sl === "mouth" || sl === "dry") {
    cards.push({
      icon: "🌙",
      problem: "Your airway dries out overnight",
      how: "Bliz's 6-micron mist deposits directly on the upper airway epithelium before sleep — giving the mucosal tissue the hydration reserves it needs to repair itself overnight.",
      formula: "🧪 Xylitol inhibits bacterial biofilm that forms on dry mucosal surfaces — reducing overnight pathogen load significantly.",
      result: "Waking without a scratchy throat. Stronger mucosal barrier by morning.",
    });
  }

  if (occ === "voice" || syms.includes("clearing")) {
    cards.push({
      icon: "🎤",
      problem: "Your vocal cords and larynx are chronically dehydrated",
      how: "Drinking water hydrates systemically — it reaches the larynx only through slow absorption. Bliz's mist deposits directly on the vocal folds in seconds. This is the same principle used in professional voice therapy.",
      formula: "🧪 Menthol (TRPM8 activation) creates immediate open-airway sensation and promotes nasal clearance — critical for voice professionals under sustained load.",
      result: "Less vocal fatigue. Fewer throat-clearing interruptions. Longer endurance before hoarseness.",
    });
  }

  if (occ === "travel" || env === "plane") {
    cards.push({
      icon: "✈️",
      problem: "Flights strip your airway lining dry",
      how: "Cabin air at <20% humidity for hours reduces the mucus layer and slows ciliary movement — leaving you vulnerable to airborne pathogens during and after flights. Bliz before and during flight restores that layer continuously.",
      formula: "🧪 Eucalyptol (mucociliary stimulation): Clinically shown to increase cilia beat frequency — keeping your airway's debris-clearing mechanism active despite the dehydrating cabin environment.",
      result: "Arrive less congested. Recover faster post-flight. Stop getting sick after long-haul travel.",
    });
  }

  if (ex === "outdoor_intense" || ex === "road_cycling" || occ === "athlete") {
    cards.push({
      icon: "🏃",
      problem: "Your workouts deliver pollutants deep into your airways",
      how: "At high ventilation rates (50L/min+), pollutant delivery scales proportionally. Pre-exercise misting thickens the mucus layer — giving particles something to trap in rather than reaching the epithelium. Post-exercise misting rehydrates and supports clearance.",
      formula: "🧪 Full formula synergy: Saline loosens trapped particles, Xylitol prevents bacterial adhesion, Eucalyptol stimulates the cilia to sweep debris out.",
      result: "Better breathing during exercise. Faster airway recovery after. Fewer sick days during peak training blocks.",
    });
  }

  if (loc.includes("wildfire") || loc.includes("urban") || env === "factory") {
    cards.push({
      icon: "🌫️",
      problem: "Your environment constantly overwhelms your airway defense",
      how: "When your environment delivers more irritants than your mucosal immune system can process, the mucus layer gets exhausted. Daily Bliz use maintains optimal mucus viscosity so your immune barrier stays functional even under persistent environmental load.",
      formula: "🧪 Saline + Xylitol: Saline optimizes osmotic balance. Xylitol reduces viscosity and prevents bacteria from exploiting a compromised barrier.",
      result: "Fewer sick days during smoke or high-pollution periods. Less environmental sensitivity over time.",
    });
  }

  if (syms.includes("sick") || syms.includes("cough")) {
    cards.push({
      icon: "🛡️",
      problem: "Your immune barrier is failing — you're getting sick repeatedly",
      how: "Frequent illness signals that common pathogens are bypassing your mucosal defense regularly. Bliz rebuilds that barrier from the surface up: restoring moisture, optimizing mucus viscosity, and stimulating cilia to clear pathogens before they penetrate.",
      formula: "🧪 Complete formula: All three actives — Xylitol (biofilm disruption), Eucalyptol (cilia stimulation), Menthol (nasal clearance) — work synergistically to restore the full mucosal immune cycle.",
      result: "Fewer colds. Shorter duration when you do get sick. A functional first line of defense again.",
    });
  }

  // Default fallback
  if (cards.length === 0) {
    cards.push({
      icon: "✅",
      problem: "Preventing airway health decline before it starts",
      how: "Your current profile shows manageable risk — but airway health is cumulative. Daily Bliz maintains optimal upper airway hydration, keeping the mucosal immune system at full capacity so that when stressors increase, your defense is ready.",
      formula: "🧪 6-micron mist + saline + Xylitol + Eucalyptol + Menthol: The complete mucosal hydration-clearance cycle in one session.",
      result: "Stay healthy longer. Maintain the baseline. Don't wait for symptoms to tell you there's a problem.",
    });
  }

  return cards;
}

// ══════════════════════════════════════════════
// PERSONALIZED ROUTINE BUILDER
// ══════════════════════════════════════════════
export function buildRoutine(answers) {
  const occ  = answers.occupation?.[0];
  const env  = answers.environment?.[0];
  const sl   = answers.sleep?.[0];
  const ex   = answers.exercise?.[0];
  const loc  = answers.location  || [];
  const routines = [];

  routines.push({
    title: "Morning airway wake-up (right after waking)",
    desc: `Your airway has been in low-humidity conditions for 7–9 hours.${
      sl === "mouth" ? " As a mouth breather, nasal humidification was completely offline all night." : ""
    } 90 seconds with Bliz before you speak or head out restores the mucosal surface.`,
  });

  if (occ === "travel" || env === "plane") {
    routines.push({
      title: "Pre-boarding + in-flight session",
      desc: "Use Bliz at the gate before boarding. On any flight over 90 minutes, a mid-flight session offsets cumulative cabin dehydration. Arrive with your immune barrier intact.",
    });
  }

  if (occ === "voice") {
    routines.push({
      title: "30 min before any sustained vocal use",
      desc: "Pre-moistening the larynx before class, recording, or performance reduces friction and fatigue. Unlike water, mist deposits directly on the mucosal surface — the difference is immediate.",
    });
  }

  if (ex === "outdoor_intense" || ex === "road_cycling") {
    routines.push({
      title: "Pre- and post-workout airway flush",
      desc: "Before: thicken the mucus layer for high-volume breathing. After: rehydrate and support clearance of any particulate that deposited in your upper airways during exertion.",
    });
  }

  if (loc.includes("wildfire")) {
    routines.push({
      title: "Smoke day protocol",
      desc: "On AQI 'Unhealthy' days, use Bliz during smoke exposure and again after any outdoor time to support ciliary clearance of trapped particles.",
    });
  }

  if (env === "hvac" || occ === "office") {
    routines.push({
      title: "Office desk reset every 2–3 hours",
      desc: "A 60-second session replenishes what 3 hours of HVAC air removes. Keep Bliz at your desk — highest ROI habit for office workers.",
    });
  }

  routines.push({
    title: "Pre-sleep airway close-down",
    desc: "Your body runs mucosal repair during sleep. A final session before bed gives the epithelium the hydration it needs — and significantly reduces morning dryness.",
  });

  return routines;
}

// ══════════════════════════════════════════════
// VOICE ANALYSIS — pattern matching
// (Replace with Claude API call for higher fidelity)
// ══════════════════════════════════════════════
export function analyzeVoiceInput(text) {
  if (!text || text.trim().length < 5) return "";
  const t = text.toLowerCase();
  if (t.includes("hoars") || t.includes("raspy") || t.includes("voice"))
    return "<strong>Noted:</strong> Voice hoarseness or rasp points to laryngeal mucosal dryness — the vocal folds need direct moisture. Added a vocal-specific step to your routine.";
  if (t.includes("morn") || t.includes("wake") || t.includes("sleep"))
    return "<strong>Noted:</strong> Morning-specific symptoms point to nighttime airway dehydration. Pre-sleep misting becomes your highest-priority habit.";
  if (t.includes("run") || t.includes("workout") || t.includes("gym") || t.includes("exercise"))
    return "<strong>Noted:</strong> Exercise-triggered symptoms indicate your airway isn't recovering between sessions. Pre- and post-workout misting is the primary intervention.";
  if (t.includes("dry") || t.includes("thirst"))
    return "<strong>Noted:</strong> Persistent dryness despite water intake suggests systemic hydration isn't reaching your mucosal surface — a common and directly addressable gap.";
  if (t.includes("cough") || t.includes("phlegm") || t.includes("mucus"))
    return "<strong>Noted:</strong> Chronic cough or phlegm indicates persistent airway irritation. Your mucosal system is signaling it's overwhelmed — this is exactly the pattern Bliz is designed to break.";
  if (t.includes("allerg") || t.includes("pollen") || t.includes("season"))
    return "<strong>Noted:</strong> Allergy sensitivity is amplified by a compromised mucosal barrier. Rebuilding mucus viscosity reduces allergen adhesion to epithelial cells.";
  return "<strong>Noted:</strong> We've recorded your specific concern and incorporated it into your personalized report and routine.";
}

// ══════════════════════════════════════════════
// REPORT COPY — by tier
// ══════════════════════════════════════════════
export const REPORT_COPY = {
  safe: {
    meaning: {
      p1: "Your upper airway mucosal lining appears to be maintaining reasonable function. The cilia — microscopic structures that sweep inhaled debris out — are likely working near capacity. Your immune barrier is largely intact.",
      p2: "But 'good' doesn't mean invulnerable. A cross-country flight, wildfire season, or a new training block can shift your status rapidly. Building a consistent routine now prevents the kind of cumulative damage that takes months to reverse.",
      callout: "You're ahead of most people. The goal is to stay there.",
    },
    cta: {
      eyebrow: "Start your 30-day trial",
      title:   "Try Bliz risk-free.",
      sub:     "See how a 90-second daily routine changes how you feel. Return anytime in 30 days for a full refund — or subscribe and get $99 back as credit.",
      primary: "Get My Trial Kit — $99 →",
      secondary: "Browse all plans first",
    },
  },
  warn: {
    meaning: {
      p1: "Your answers reveal a pattern of cumulative airway stress. When the mucus layer coating your airway gets chronically thin, it stops trapping and expelling pathogens efficiently. You're not sick — but your defenses are working overtime.",
      p2: "Left unaddressed, this pattern leads to increased frequency of colds, worsening allergy symptoms, and growing sensitivity to polluted or dry environments. The good news: the mucosal surface responds quickly when given targeted support.",
      callout: "This is the window where intervention works. The barrier is stressed — not broken. Yet.",
    },
    cta: {
      eyebrow: "Your airway is asking for help",
      title:   "Start fixing it today.",
      sub:     "Bliz is designed for exactly your situation. Try it risk-free for 30 days. Return the device for a full refund — or subscribe and get your $99 back as credit.",
      primary: "Get My Trial Kit — $99 →",
      secondary: "Browse all plans first",
    },
  },
  danger: {
    meaning: {
      p1: "Your risk profile indicates your upper airway's mucosal immune barrier is under serious, likely chronic stress. When cilia motility decreases, viruses, bacteria, and allergens adhere directly to exposed epithelial cells. The symptoms you've reported are the predictable result.",
      p2: "This is not irreversible. But it doesn't improve on its own. Every day without targeted airway support is a day your baseline gets harder to recover from.",
      callout: "Your body responds fast when given the right support. The first week matters most.",
    },
    cta: {
      eyebrow: "Your airway needs this now",
      title:   "Stop the damage. Start today.",
      sub:     "You've been running on a compromised barrier. Try Bliz for 30 days completely risk-free — return for a full refund, or subscribe and get $99 back as credit.",
      primary: "Get My Trial Kit — $99 →",
      secondary: "Browse all plans first",
    },
  },
};

// ══════════════════════════════════════════════
// RISK CARD DEFINITIONS
// ══════════════════════════════════════════════
export function buildRiskCards(answers) {
  const occ  = answers.occupation?.[0];
  const env  = answers.environment?.[0];
  const sl   = answers.sleep?.[0];
  const ex   = answers.exercise?.[0];
  const loc  = answers.location  || [];
  const syms = answers.symptoms  || [];

  const defs = [
    { cond: occ === "travel",       level: "high", icon: "✈️", title: "Frequent flying — cabin dehydration",       desc: "Cabin air at 10–20% humidity strips your mucosal lining on every flight. Flying more than twice a month makes this your dominant airway risk factor." },
    { cond: occ === "voice",        level: "high", icon: "🎤", title: "Voice professional — chronic airway overdrive", desc: "Vocal use pulls moisture from the larynx and pharynx at 2–3× the normal daily rate. Your airway is running a cumulative hydration deficit." },
    { cond: occ === "labor",        level: "high", icon: "🏗️", title: "Occupational dust or fume exposure",        desc: "Industrial particles bypass the nasal filter and land directly on epithelial cells. This is the most preventable form of chronic airway damage in the US." },
    { cond: occ === "athlete",      level: "mid",  icon: "🏃", title: "Endurance athlete — high-volume pollutant intake", desc: "At peak exertion you inhale 50L/min. Even moderate outdoor AQI becomes a concentrated dose when you're working that hard." },
    { cond: env === "plane",        level: "high", icon: "✈️", title: "Regular pressurized cabin exposure",        desc: "Sub-20% humidity for hours at a time disrupts mucus viscosity and cilia movement — your airway's two primary defense mechanisms." },
    { cond: env === "hvac",         level: "mid",  icon: "❄️", title: "Chronic HVAC exposure — daily moisture deficit", desc: "8+ hours/day at 20–30% RH slowly thins the mucous membrane. Most people don't notice until cumulative damage shows up as recurring illness." },
    { cond: env === "factory",      level: "high", icon: "🏭", title: "Industrial or warehouse environment",       desc: "Occupational particulate is the leading preventable cause of chronic airway disease in the US — and most workers don't protect against it until damage appears." },
    { cond: sl === "mouth",         level: "high", icon: "👄", title: "Mouth breathing during sleep",              desc: "Your nose filters, warms, and humidifies every breath. Bypassing it for 7–9 hours nightly increases mucosal bacterial load 3–4× and prevents overnight recovery." },
    { cond: sl === "cpap",          level: "mid",  icon: "⌚", title: "CPAP — pressurized airway drying",          desc: "CPAP delivers continuous pressure that worsens mucosal dehydration overnight — a commonly overlooked side effect of sleep apnea therapy." },
    { cond: ex === "outdoor_intense", level: "high", icon: "🏃", title: "Daily high-intensity outdoor exercise", desc: "High ventilation volume × outdoor pollution = concentrated pollutant delivery. Your airways absorb more particulate in one run than most people inhale in a week." },
    { cond: ex === "road_cycling",  level: "high", icon: "🚴", title: "Road cycling — exhaust-level exposure",    desc: "Cyclists ride at exhaust height and breathe heavily. Research shows 2–3× higher particulate exposure than pedestrians taking the same route." },
    { cond: loc.includes("wildfire"), level: "high", icon: "🔥", title: "Wildfire smoke region",                 desc: "PM2.5 from wildfire smoke is ultra-fine, bypasses nasal filtration, and reaches lung tissue. Even 'mild smoke' days accumulate damage across a season." },
    { cond: loc.includes("altitude"), level: "mid",  icon: "🏔️", title: "High altitude — chronically dry air",   desc: "At 5,000+ feet, ambient humidity is consistently lower and breathing volume increases. Your airway loses moisture faster than at sea level — all day, every day." },
    { cond: syms.includes("sick"),  level: "high", icon: "🤧", title: "Frequent illness — immune barrier failing", desc: "Getting sick 3+ times/year means pathogens are regularly bypassing your mucosal defense. Your barrier isn't intercepting threats — it's letting them through." },
    { cond: syms.includes("cough"), level: "high", icon: "💨", title: "Chronic cough or phlegm — active airway distress", desc: "Coughing without illness means your airway is producing excess mucus to manage persistent irritation. This is a sign of chronic low-grade mucosal inflammation." },
  ].filter((r) => r.cond);

  if (defs.length === 0) {
    defs.push({
      level: "low",
      icon: "✅",
      title: "No major risk factors identified",
      desc: "Your current lifestyle patterns do not trigger significant airway risk. Focus on maintaining your baseline and protecting against seasonal or environmental spikes.",
    });
  }

  return defs;
}

// ══════════════════════════════════════════════
// FEAR METER DATA
// ══════════════════════════════════════════════
export function buildFearItems(answers) {
  const occ  = answers.occupation?.[0];
  const env  = answers.environment?.[0];
  const sl   = answers.sleep?.[0];
  const ex   = answers.exercise?.[0];
  const loc  = answers.location  || [];
  const syms = answers.symptoms  || [];
  const items = [];

  if (sl === "mouth" || sl === "dry")
    items.push({ icon: "🦠", level: "hi", title: "Bacterial load in your airway tonight", sub: "Up to 4× higher than in nasal breathers — overnight, every night", pct: 82 });
  if (occ === "travel" || env === "plane")
    items.push({ icon: "✈️", level: "hi", title: "Post-flight mucosal moisture loss", sub: "Up to 40% below pre-flight baseline on a 5-hour flight", pct: 80 });
  if (ex === "outdoor_intense" || ex === "road_cycling")
    items.push({ icon: "🌫️", level: "hi", title: "Pollutant intake vs. sedentary person", sub: "2–5× higher on a typical workout day", pct: 75 });
  if (loc.includes("wildfire"))
    items.push({ icon: "🔥", level: "hi", title: "Smoke season exposure", sub: "200+ unhealthy breathing hours/year in wildfire regions", pct: 88 });
  if (syms.includes("sick"))
    items.push({ icon: "🛡️", level: "md", title: "Your mucosal immune barrier", sub: "Compromised — pathogens reaching your epithelial cells regularly", pct: 70 });
  if (env === "hvac" || occ === "office")
    items.push({ icon: "💧", level: "md", title: "Daily airway moisture deficit", sub: "~35% below optimal RH for 8+ hours per workday", pct: 58 });

  if (items.length === 0)
    items.push({ icon: "🛡️", level: "lo", title: "Current mucosal defense status", sub: "Relatively intact — maintain with consistent daily hydration", pct: 22 });

  return items;
}

// ══════════════════════════════════════════════
// MAIN COMPONENT STUB
// Full render logic mirrors the interactive widget.
// Implement using the data/utility functions above.
// ══════════════════════════════════════════════
export default function HalerBreathQuizUS() {
  const [steps,           setSteps]          = useState(QUIZ_STEPS);
  const [loading,         setLoading]        = useState(true);
  const [stepIdx,        setStepIdx]        = useState(0);
  const [answers,        setAnswers]         = useState({});
  const [phase,          setPhase]           = useState("profile"); // profile|quiz|voice|email|result
  const [profile,        setProfile]         = useState({ age: "", gender: "" });
  const [voiceText,      setVoiceText]       = useState("");
  const [voiceAna,       setVoiceAna]        = useState("");
  const [emailSubmitted, setEmailSubmitted]  = useState(false);
  const [cmpUnlocked,    setCmpUnlocked]     = useState(false);
  const [animated,       setAnimated]        = useState(false);
  const sessionId = useRef(Math.random().toString(36).slice(2));
  const recRef    = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  // ── DYNAMIC DATA FETCHING ──────────────────
  useEffect(() => {
    async function fetchQuizData() {
      try {
        const { data: configData, error: configError } = await supabase
          .from('quiz_config')
          .select('*, quiz_options(*)')
          .order('step_order', { ascending: true });

        if (configError) throw configError;

        if (configData && configData.length > 0) {
          const formattedSteps = configData.map(config => ({
            id: config.key,
            tag: `${String(config.step_order).padStart(2, '0')} · ${config.key.charAt(0).toUpperCase() + config.key.slice(1)}`,
            title: config.title_en,
            titleKo: config.title_ko,
            sub: config.subtitle_en,
            subKo: config.subtitle_ko,
            multi: config.is_multi,
            opts: config.quiz_options.map((opt) => ({
              id: opt.id.toString(),
              e: opt.emoji,
              l: opt.label_en,
              lKo: opt.label_ko,
              s: opt.sub_text_en,
              score: opt.score
            }))
          }));
          setSteps(formattedSteps);
        }
      } catch (err) {
        console.error("Failed to load quiz data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizData();
  }, []);

  const currentSteps = steps || QUIZ_STEPS;
  const score = calcScore(answers, currentSteps);
  const tier  = getTier(score);
  const occ   = answers.occupation?.[0];
  const sl    = answers.sleep?.[0];
  const ex    = answers.exercise?.[0];

  const currentStep = currentSteps[stepIdx];

  // Animate result elements
  useEffect(() => {
    if (phase === "result") {
      setTimeout(() => setAnimated(true), 300);
      HALER_API.trackCompletion({
        sessionId: sessionId.current,
        score, tier, profile,
        occ, loc: answers.location, syms: answers.symptoms,
        voiceProvided: !!voiceText,
        emailProvided: emailSubmitted,
        timestamp: new Date().toISOString(),
      });
    }
  }, [phase]);

  // Save state for retargeting
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      HALER_API.saveQuizState(sessionId.current, { answers, profile, phase });
    }
  }, [answers, phase]);

  const toggle = useCallback((stepId, multi, optId) => {
    setAnswers((prev) => {
      const cur = prev[stepId] || [];
      if (multi) {
        if (optId === "none") return { ...prev, [stepId]: ["none"] };
        const f = cur.filter((x) => x !== "none");
        return { ...prev, [stepId]: f.includes(optId) ? f.filter((x) => x !== optId) : [...f, optId] };
      }
      return { ...prev, [stepId]: [optId] };
    });
  }, []);

  const handleEmailSubmit = async (email) => {
    setEmailSubmitted(true);
    await HALER_API.submitLead({
      email, sessionId: sessionId.current,
      score, tier, profile,
      occ, env: answers.environment?.[0],
      sleep: answers.sleep?.[0], exercise: answers.exercise?.[0],
      location: answers.location, symptoms: answers.symptoms,
      voiceText: voiceText || null,
      timestamp: new Date().toISOString(),
      source: "quiz",
    });
    setPhase("result");
  };

  const handleTrialClick = () => {
    HALER_API.trackCTAClick("trial_kit", { score, tier, profile, emailSubmitted });
    window.open(HALER_API.getPersonalizedURL("trial", { tier, score, occ, age: profile.age, gender: profile.gender, sessionId: sessionId.current }), "_blank");
  };

  const handleBrowseClick = () => {
    HALER_API.trackCTAClick("browse_plans", { score, tier, profile });
    window.open(HALER_API.getPersonalizedURL("plans", { tier, score, occ }), "_blank");
  };

  const handleVoiceNext = () => {
    setVoiceAna(analyzeVoiceInput(voiceText));
    setPhase("email");
  };

  // Precomputed report data (memoize in production)
  const radarData    = calcRadarData(answers);
  const riskCards    = buildRiskCards(answers);
  const fearItems    = buildFearItems(answers);
  const solutions    = buildSolutionCards(answers);
  const routine      = buildRoutine(answers);
  const recPlanId    = getRecommendedPlan(score, occ, sl, ex);
  const reportCopy   = REPORT_COPY[tier];
  const hasProfile   = !!(profile.age || profile.gender);
  const cmpData      = hasProfile || cmpUnlocked ? getComparisonData(score, profile) : null;
  const planList     = [PLANS[recPlanId], ...Object.values(PLANS).filter(p => p.id !== recPlanId && p.id !== "trial"), PLANS.trial];

  // ── RENDER ────────────────────────────────
  // Implement JSX phases using the data above.
  // Each phase (profile/quiz/voice/email/result)
  // renders its corresponding UI section.
  // See interactive widget for exact HTML structure.

  return (
    <div>
      {/* TODO: render phases using data utilities above */}
      {/* Phase: profile  → age/gender pill pickers + incentive banner */}
      {/* Phase: quiz     → QUIZ_STEPS[stepIdx] with opts + insight */}
      {/* Phase: voice    → mic button + textarea + analyzeVoiceInput */}
      {/* Phase: email    → Trial Kit box + email input + CTA */}
      {/* Phase: result   → score ring, cmpData, fearItems, radarData,
                            riskCards, reportCopy, solutions, planList,
                            routine, trial CTA */}
    </div>
  );
}

/*
═══════════════════════════════════════════════
KLAVIYO FLOWS TO BUILD (post-launch):

1. "Quiz Completed — No Purchase"
   Trigger: quiz_completed event
   Delay: immediate → 3 days → 7 days → 14 days → 30 days
   Content: Report summary → Social proof → Urgency → Last offer

2. "High Risk Score" (danger tier)
   Trigger: quiz_completed WHERE tier = 'danger'
   Delay: immediate → 2 days → 5 days
   Content: Stronger urgency copy, specific risk factor callouts

3. "7-Day Re-engagement"
   Trigger: quiz_completed, no purchase after 7 days
   Content: "Retake the quiz — see if anything changed"

4. "Post-Trial Day 14"
   Trigger: trial_kit_purchased + 14 days
   Content: Usage tips, flavor recommendations

5. "Post-Trial Day 28 — Subscribe"
   Trigger: trial_kit_purchased + 28 days, no subscription
   Content: Last-chance subscription nudge, $99 credit reminder

═══════════════════════════════════════════════
GA4 / MIXPANEL EVENTS:

quiz_started         { source, ref, utm_* }
quiz_step_viewed     { step_num, step_id }
quiz_step_completed  { step_num, step_id, selection_count }
quiz_voice_used      { has_content: bool }
quiz_email_submitted { tier, score }
quiz_email_skipped   { tier, score }
quiz_completed       { score, tier, occ, profile_provided, email_provided }
comparison_unlocked  {}
cta_trial_kit        { score, tier, from_email: bool }
cta_browse_plans     { score, tier }
═══════════════════════════════════════════════
*/
