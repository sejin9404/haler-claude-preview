'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Syne, Poppins } from 'next/font/google';
import { CheckCircle2, ChevronRight, Sparkles, AlertCircle, ChevronDown, Info, X, ArrowRight, Mail } from 'lucide-react';
import {
  getTierLabel,
  getTierColor,
  getComparisonData,
  calcRadarData,
  getRecommendedPlan,
  PLANS,
  buildSolutionCards,
  buildRoutine,
  analyzeVoiceInput
} from '@/quiz/Quizfinal';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function ReportDashboardDesktop({
  score: rawScore = 0,
  tier = 'safe',
  answers = {},
  profile = { age: '', gender: '' },
  voiceText = '',
  sessionId = '',
  onUpdateProfile = (p) => {},
  onClose = () => {}
}) {
  const [animated, setAnimated] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [isEditingProfile, setIsEditingProfile] = useState(!profile.age || !profile.gender ? true : false);
  const [activeFactor, setActiveFactor] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [visibleInsight, setVisibleInsight] = useState(null);
  const [email, setEmail] = useState('');

  const score = Math.min(Math.round((rawScore / 34) * 100), 100);
  
  useEffect(() => {
    setTimeout(() => setAnimated(true), 300);
  }, []);

  const color = getTierColor(tier);
  const labelText = getTierLabel(tier);
  
  const radarData = (calcRadarData(answers) || []).map(d => ({
    ...d,
    val: Math.min(Math.round((d.val / 100) * 100), 100)
  }));

  const recPlanId = getRecommendedPlan(score, answers?.occupation?.[0], answers?.sleep?.[0], answers?.exercise?.[0]);
  const recommendedPlan = PLANS[recPlanId] || PLANS.essential;
  const solutions = buildSolutionCards(answers) || [];
  const routines = buildRoutine(answers) || [];
  const cmp = getComparisonData(score, profile);

  const identifiedRiskCards = Object.entries(answers || {})
    .filter(([key]) => !['age', 'gender', 'email'].includes(key))
    .map(([key, val]) => {
      if (!val || val.length === 0) return null;
      const iconMap = {
        occupation: "🏙️", sleep: "🌙", exercise: "🏃", stress: "💆", diet: "🥗", symptoms: "🤒", environment: "🌫️"
      };
      return { icon: iconMap[key] || "⚠️", title: val[0] };
    })
    .filter(Boolean)
    .slice(0, 5);

  const handleProfileSave = () => {
    if (tempProfile.age && tempProfile.gender) {
      onUpdateProfile(tempProfile);
      setIsEditingProfile(false);
      setVisibleInsight(null);
    }
  };

  const getFactorInsight = (factor) => {
    const val = factor.val || 0;
    if (val > 70) return `Critical drivers. Primary source of airway stress.`;
    if (val > 40) return `Moderate impact. Defense is under active load.`;
    return `Minimal impact. Baseline defense is stable.`;
  };

  const getInsightBoxStyle = (val) => {
    if (val > 70) return "bg-red-500 text-white shadow-lg shadow-red-200/50";
    if (val > 40) return "bg-amber-500 text-white shadow-lg shadow-amber-200/50";
    return "bg-blue-600 text-white shadow-lg shadow-blue-200/50";
  };

  // Shared Blue Glow Aesthetic for all boxes
  const premiumBoxShadow = "shadow-[0_0_30px_rgba(0,128,255,0.12)]";
  const blueBorderStyle = "border border-blue-100/30";
  const leftBoxStyle = `bg-white/40 backdrop-blur-md rounded-[24px] ${blueBorderStyle} ${premiumBoxShadow}`;

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-8 ${poppins.className} text-black`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-6xl h-[85vh] bg-white/80 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_80px_-15px_rgba(0,128,255,0.12)] border border-white/40 flex flex-col overflow-hidden"
      >
        {/* FIXED HEADER */}
        <header className="flex justify-between items-center p-8 lg:px-12 lg:pt-10 lg:pb-6 shrink-0 border-b border-black/5">
          <div className="flex items-center gap-4">
            <img src="/images/halersymbol.png" alt="Haler" className="w-8 h-auto" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Diagnostic Report</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider opacity-60">Verified Data • {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-100/80 hover:bg-red-50 text-slate-800 hover:text-red-600 rounded-full transition-all border border-slate-200 shadow-md active:scale-90 group"
          >
            <X size={22} className="transition-transform group-hover:rotate-90" />
          </button>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR */}
          <div className="w-[42%] h-full p-8 lg:p-12 border-r border-black/5 flex flex-col gap-8 relative overflow-visible">
            
            {/* 1. SMART SCORE CARD */}
            <div className={`${leftBoxStyle} p-6 flex items-center justify-between shrink-0 relative z-10`}>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold" style={{ color }}>{labelText.replace(/[🔴🟡🟢]/g, '').trim()}</h2>
                  <Info size={14} className="text-slate-300" />
                </div>
                <p className="text-slate-600 text-[12px] leading-snug font-medium max-w-[180px]">
                  {tier === 'safe' && "Airway defense is stable."}
                  {tier === 'warn' && "Airway is under stress."}
                  {tier === 'danger' && "Critical airway load detected."}
                </p>
              </div>
              <div className="relative w-24 h-24 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" 
                    initial={{ strokeDasharray: "283", strokeDashoffset: 283 }} 
                    animate={{ strokeDashoffset: animated ? 283 - (283 * (score / 100)) : 283 }} 
                    transition={{ duration: 2, ease: "easeOut" }} 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold tracking-tighter" style={{ color }}>{score}</span>
                </div>
              </div>
            </div>

            {/* 2. Peer Comparison */}
            <div className={`${leftBoxStyle} p-5 shrink-0 transition-all min-h-[160px] flex flex-col justify-between ${isEditingProfile ? 'z-40 relative' : 'z-10 relative'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Peer Comparison</h3>
                <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-1 hover:bg-white/60 rounded-full transition-colors"><ChevronDown size={16} className={isEditingProfile ? 'rotate-180' : ''} /></button>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {isEditingProfile ? (
                    <motion.div key="editing" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <button onClick={() => setVisibleInsight(visibleInsight === 'age' ? null : 'age')} className={`w-full p-2.5 bg-white/60 border ${visibleInsight === 'age' ? 'border-blue-500' : 'border-white/20'} rounded-xl text-[10px] font-bold flex justify-between items-center transition-all`}>
                            {tempProfile.age || 'Age'} <ChevronDown size={12} className={visibleInsight === 'age' ? 'rotate-180' : ''} />
                          </button>
                          <AnimatePresence>
                            {visibleInsight === 'age' && (
                              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] p-1 flex flex-col gap-0.5">
                                {['18–24', '25–34', '35–44', '45–54', '55+'].map(v => (
                                  <button key={v} onClick={() => {setTempProfile({...tempProfile, age: v}); setVisibleInsight(null)}} className="px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-bold transition-colors text-left">{v}</button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="relative">
                          <button onClick={() => setVisibleInsight(visibleInsight === 'gender' ? null : 'gender')} className={`w-full p-2.5 bg-white/60 border ${visibleInsight === 'gender' ? 'border-blue-500' : 'border-white/20'} rounded-xl text-[10px] font-bold flex justify-between items-center transition-all`}>
                            {tempProfile.gender || 'Gender'} <ChevronDown size={12} className={visibleInsight === 'gender' ? 'rotate-180' : ''} />
                          </button>
                          <AnimatePresence>
                            {visibleInsight === 'gender' && (
                              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] p-1 flex flex-col gap-0.5">
                                {['Female', 'Male', 'Non-binary'].map(v => (
                                  <button key={v} onClick={() => {setTempProfile({...tempProfile, gender: v}); setVisibleInsight(null)}} className="px-3 py-1.5 hover:bg-blue-600 hover:text-white rounded-lg text-[9px] font-bold transition-colors text-left">{v}</button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <button onClick={handleProfileSave} className="w-full py-2.5 bg-black text-white rounded-xl text-[10px] font-bold shadow-lg active:scale-95 transition-transform">Update & Sync</button>
                    </motion.div>
                  ) : (
                    <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <p className="text-slate-600 text-[13px] leading-snug font-medium">Higher risk than <strong className="text-black font-bold">{cmp.worse}%</strong> of {cmp.label}.</p>
                      <div className="space-y-2">
                        <div className="relative h-2 bg-black/5 rounded-full overflow-hidden">
                          <div className="absolute top-0 bottom-0 w-1 bg-slate-300 z-10" style={{ left: `${cmp.segPct}%` }} />
                          <motion.div initial={{ width: 0 }} animate={{ width: `${cmp.userPct}%` }} transition={{ duration: 1.5 }} className="absolute top-0 bottom-0 rounded-full" style={{ backgroundColor: color }} />
                        </div>
                        <div className="flex justify-between text-[7px] font-black text-slate-400 uppercase tracking-widest px-0.5"><span>Low Risk</span><span>High Risk</span></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 3. Biometric Profile */}
            <div className={`${leftBoxStyle} p-6 flex-1 flex flex-col relative z-10 overflow-hidden`}>
              <div className="flex justify-between items-end mb-4 shrink-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Biometric Profile</h3>
                <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span> You</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Avg</span>
                </div>
              </div>
              
              <div className="relative flex-1 w-full mx-auto min-h-0 pt-8 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-auto max-h-full overflow-visible max-w-[280px]">
                  {[20, 40, 60, 80, 100].map(r => (
                    <polygon key={r} points={radarData.map((_, i) => { const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; const rad = r * 0.95; return `${100 + rad * Math.cos(angle)},${100 + rad * Math.sin(angle)}`; }).join(" ")} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
                  ))}
                  <polygon points={radarData.map((_, i) => { const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; return `${100 + 55 * 0.95 * Math.cos(angle)},${100 + 55 * 0.95 * Math.sin(angle)}`; }).join(" ")} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
                  <motion.polygon 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 1.2 }} 
                    style={{ originX: "100px", originY: "100px" }} 
                    points={radarData.map((d, i) => { const r = Math.max((d.val || 10) * 0.95, 10); const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`; }).join(" ")} 
                    fill={`${color}35`} 
                    stroke={color} 
                    strokeWidth="5" 
                    strokeLinejoin="round"
                  />
                  {radarData.map((d, i) => {
                    const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; const x = 100 + 102 * Math.cos(angle); const y = 100 + 102 * Math.sin(angle);
                    return (
                      <g key={i} className="cursor-pointer" onMouseEnter={() => setActiveFactor(i)}>
                        <circle cx={x} cy={y} r="10" fill={activeFactor === i ? color : "white"} stroke={color} strokeWidth="2" />
                        <text x={x} y={y} textAnchor="middle" alignmentBaseline="middle" fill={activeFactor === i ? "white" : color} className="text-[8px] font-black">{Math.round(d.val)}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className={`rounded-xl p-4 text-center w-full mt-8 mb-0 shrink-0 ${getInsightBoxStyle(radarData[activeFactor]?.val)} transition-all duration-300`}>
                <p className="text-[9px] font-black uppercase mb-1 opacity-80">{radarData[activeFactor]?.label.replace('\n', ' ')}</p>
                <p className="text-[11px] font-bold leading-tight">{getFactorInsight(radarData[activeFactor])}</p>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Scrollable Actions */}
          <div className="flex-1 h-full p-8 lg:p-12 overflow-y-auto no-scrollbar space-y-12">
            <style jsx>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            {/* Identified Airway Risks Box */}
            <div className={`bg-gradient-to-br from-[#FF5859] to-[#FF7A7B] rounded-[28px] p-8 text-white ${premiumBoxShadow}`}>
              <h3 className="text-xs font-bold flex items-center gap-2 mb-6 uppercase tracking-wider"><AlertCircle size={20} /> Identified Airway Risks</h3>
              <div className="grid grid-cols-2 gap-3">
                {identifiedRiskCards.map((card, i) => card && (
                  <div key={i} className="bg-white/15 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 border border-white/10 text-sm font-bold">
                    <span className="text-2xl">{card.icon}</span> {card.title}
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Solution Protocol Box */}
            <div className={`bg-gradient-to-br from-[#0080FF] to-[#3399FF] rounded-[28px] p-8 text-white ${premiumBoxShadow}`}>
              <h3 className="text-xs font-bold flex items-center gap-2 mb-6 uppercase tracking-wider"><Sparkles size={20} /> Clinical Solution Protocol</h3>
              <div className="grid grid-cols-1 gap-4">
                {solutions.map((sol, i) => (
                  <div key={i} className="bg-white/15 backdrop-blur-md rounded-[24px] p-6 border border-white/10">
                    <div className="flex items-center gap-5 mb-4">
                      <span className="text-4xl">{sol.icon}</span>
                      <h4 className="font-bold text-xl leading-tight text-white">{sol.problem}</h4>
                    </div>
                    <p className="text-blue-50 text-sm mb-5 leading-relaxed font-medium opacity-90">{sol.how}</p>
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10 flex items-start gap-3">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5"><Info size={12} className="text-white" /></div>
                      <p className="text-[11px] text-white font-bold italic leading-relaxed">Solution Formula: {sol.formula}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Routine Box */}
            <div className={`bg-white/40 backdrop-blur-md rounded-[28px] p-8 ${blueBorderStyle} ${premiumBoxShadow}`}>
              <div className="flex justify-center mb-10"><span className="bg-blue-600 px-6 py-2 rounded-full text-white font-bold tracking-widest uppercase text-[10px] shadow-lg shadow-blue-200">Daily Routine</span></div>
              <div className="relative ml-4 pl-8 space-y-10"><div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-100" />
                {routines.map((routine, i) => (
                  <div key={i} className="relative"><div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center border border-blue-100"><div className="w-1.5 h-1.5 rounded-full bg-blue-600" /></div>
                    <h4 className="font-bold text-lg mb-2 text-blue-900">{routine.title}</h4><p className="text-slate-500 leading-relaxed text-sm font-medium">{routine.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Strategy Box */}
            <div className={`bg-black text-white rounded-[32px] p-12 text-center relative overflow-hidden ${premiumBoxShadow}`}>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase mb-4">Recommended Strategy</span>
                <h3 className="text-4xl font-bold mb-3">{recommendedPlan.name}</h3>
                <div className="flex items-end justify-center gap-1 mb-8">
                  <span className="text-5xl font-bold text-blue-500">{recommendedPlan.price}</span>
                  <span className="text-white/40 text-sm mb-1.5">{recommendedPlan.period}</span>
                </div>
                <ul className="text-left space-y-4 mb-4 max-w-[260px] mx-auto text-sm font-medium text-white/80">
                  {recommendedPlan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3"><CheckCircle2 size={18} className="text-blue-400 shrink-0" />{f}</li>
                  ))}
                </ul>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-500/10 blur-[80px] pointer-events-none" />
            </div>

            {voiceText && (
              <div className="bg-blue-50 rounded-[28px] p-8 border border-blue-100 shadow-sm mb-12">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-blue-600 uppercase tracking-wider"><Sparkles size={18} /> AI Context Analysis</h3>
                <p className="text-blue-900/70 leading-relaxed italic text-sm font-medium" dangerouslySetInnerHTML={{ __html: analyzeVoiceInput(voiceText) }} />
              </div>
            )}
            
            <div className="h-10" />
          </div>
        </div>

        {/* FIXED FOOTER */}
        <footer className="p-8 lg:px-12 lg:py-8 shrink-0 border-t border-black/5 bg-white/40 backdrop-blur-xl flex items-center justify-between gap-12 z-20">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
              <input 
                type="email" 
                placeholder="Enter your email to save results" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-4 pl-12 pr-6 bg-blue-50 border border-blue-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold placeholder:text-blue-200 text-blue-900" 
              />
            </div>
            <button className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">Save Report</button>
          </div>
          
          <button className="flex-1 max-w-sm py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 group">
            Start My Free Trial Kit <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </footer>

      </motion.div>
    </div>
  );
}
