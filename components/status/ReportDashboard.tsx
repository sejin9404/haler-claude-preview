'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Syne, Poppins } from 'next/font/google';
import { CheckCircle2, AlertTriangle, AlertOctagon, ChevronRight, Share2, Sparkles, AlertCircle, ChevronDown, Info, X, Settings2 } from 'lucide-react';
import {
  getTierLabel,
  getTierColor,
  getComparisonData,
  calcRadarData,
  getRecommendedPlan,
  PLANS,
  buildSolutionCards,
  buildRoutine,
  analyzeVoiceInput,
  HALER_API,
  QUIZ_STEPS
} from '@/quiz/Quizfinal';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface ReportDashboardProps {
  score: number;
  tier: string;
  answers: any;
  profile: { age: string; gender: string };
  voiceText: string;
  sessionId: string;
  onUpdateProfile: (profile: { age: string; gender: string }) => void;
  onClose: () => void;
  onOpenModal: (type: 'info' | 'score' | 'delete') => void;
}

export default function ReportDashboard({
  score: rawScore,
  tier,
  answers,
  profile,
  voiceText,
  sessionId,
  onUpdateProfile,
  onClose,
  onOpenModal
}: ReportDashboardProps) {
  const [animated, setAnimated] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [isEditingProfile, setIsEditingProfile] = useState(!profile.age || !profile.gender ? false : true);
  const [activeFactor, setActiveFactor] = useState<number>(0);
  const [visibleInsight, setVisibleInsight] = useState<string | null>(null);

  const score = Math.min(Math.round((rawScore / 34) * 100), 100);
  const MAX_DISPLAY_SCORE = 100;

  useEffect(() => {
    setTimeout(() => setAnimated(true), 300);
  }, []);

  const color = getTierColor(tier);
  const label = getTierLabel(tier);
  
  const radarData = calcRadarData(answers).map(d => ({
    ...d,
    val: Math.min(Math.round((d.val / 100) * 100), 100)
  }));

  const peerRadarPoints = useMemo(() => {
    return radarData.map((_, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const r = (45 + (i * 7 % 20)) * 0.9;
      return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
    }).join(" ");
  }, [radarData]);

  const recPlanId = getRecommendedPlan(rawScore, answers.occupation?.[0], answers.sleep?.[0], answers.exercise?.[0]);
  const recommendedPlan = PLANS[recPlanId as keyof typeof PLANS];
  const solutions = buildSolutionCards(answers);
  const routines = buildRoutine(answers);
  const cmp = getComparisonData(score, profile);

  const getLabelById = (stepId: string, optId: string) => {
    const step = QUIZ_STEPS.find(s => s.id === stepId);
    const opt = step?.opts.find((o: any) => o.id === optId);
    return opt?.l || optId;
  };

  const identifiedRiskCards = Object.entries(answers)
    .filter(([key]) => !['age', 'gender', 'email'].includes(key))
    .map(([key, val]: [string, any]) => {
      if (!val || val.length === 0) return null;
      const iconMap: Record<string, string> = {
        occupation: "🏙️", sleep: "🌙", exercise: "🏃",
        stress: "💆", diet: "🥗", symptoms: "🤒", environment: "🌫️"
      };
      return { icon: iconMap[key] || "⚠️", title: getLabelById(key, val[0]) };
    })
    .filter(Boolean)
    .slice(0, 5);

  const handleProfileSave = () => {
    if (tempProfile.age && tempProfile.gender) {
      onUpdateProfile(tempProfile);
      setIsEditingProfile(true);
    }
  };

  return (
    <div className={`w-full text-black relative bg-white overflow-x-hidden ${poppins.className}`}>
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="flex flex-col items-center mb-12 text-center" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <div className="w-16 h-16 flex items-center justify-center mb-4"><img src="/images/halersymbol.png" alt="Haler Symbol" className="w-12 h-auto" /></div>
          <h1 className="text-3xl font-bold mb-1">Your Airway Report</h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide uppercase mb-6">Issued on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <section className="bg-white rounded-[40px] p-10 mb-8 shadow-[0_0_60px_rgba(96,165,250,0.2)] text-center relative overflow-hidden z-10">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="6" />
              <motion.circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" initial={{ strokeDasharray: "283", strokeDashoffset: 283 }} animate={{ strokeDashoffset: animated ? 283 - (283 * (score / MAX_DISPLAY_SCORE)) : 283 }} transition={{ duration: 2, ease: "easeOut", delay: 0.2 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-5xl font-bold tracking-tighter" style={{ color }}>{score}</span></div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <h2 className="text-3xl font-bold" style={{ color }}>{label.replace(/[🔴🟡🟢]/g, '').trim()}</h2>
          </div>
          <p className="text-slate-600 max-w-sm mx-auto text-[14px] sm:text-[16px] leading-snug mb-8">
            {tier === 'safe' && "Your airway appears to be in good shape based on your answers."}
            {tier === 'warn' && "Your lifestyle suggests your airway could use some daily attention."}
            {tier === 'danger' && "Based on your answers, Bliz could make a real difference for you."}
          </p>

          <button 
            onClick={() => onOpenModal('score')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-black hover:bg-slate-900 text-white rounded-full text-[14px] font-bold transition-all active:scale-95 shadow-lg shadow-black/20 mx-auto"
          >
            <Settings2 size={16} />
            Specifications
          </button>
        </section>

        <section className="bg-white rounded-[32px] p-8 mb-8 shadow-[0_0_40px_rgba(96,165,250,0.12)] relative z-20">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold">Peer Comparison</h3>
            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="p-2 bg-slate-50 rounded-full text-slate-400"><ChevronDown size={20} className={`transition-transform duration-300 ${isEditingProfile ? 'rotate-180' : ''}`} /></button>
          </div>
          <AnimatePresence mode="wait">
            {isEditingProfile && (
              <motion.div 
                key={!profile.age || !profile.gender ? 'form' : 'results'}
                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                transition={{ duration: 0.4 }}
              >
                {!profile.age || !profile.gender ? (
                  <div className="pt-4"><p className="text-xs text-slate-500 mb-6 text-center">Enter your details to see how you compare to your peers.</p>
                    <div className="flex gap-4 mb-6 relative">
                      <div className="relative flex-1">
                        <button onClick={() => setVisibleInsight(visibleInsight === 'select-age' ? null : 'select-age')} className={`w-full p-4 bg-slate-50 border ${visibleInsight === 'select-age' ? 'border-blue-500 shadow-blue-100' : 'border-slate-200'} rounded-2xl outline-none transition-all text-left flex justify-between items-center text-sm`}><span className={tempProfile.age ? 'text-black font-medium' : 'text-slate-400'}>{tempProfile.age || 'Age'}</span><ChevronRight size={14} className={`text-slate-300 transition-transform ${visibleInsight === 'select-age' ? 'rotate-90' : ''}`} /></button>
                        <AnimatePresence>{visibleInsight === 'select-age' && (
                          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full mb-3 left-0 right-0 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[30000] overflow-hidden p-2">
                            {['18–24', '25–34', '35–44', '45–54', '55+'].map(age => (<button key={age} onClick={() => { setTempProfile({...tempProfile, age}); setVisibleInsight(null); }} className={`w-full p-3 rounded-xl text-xs font-medium transition-colors text-left ${tempProfile.age === age ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>{age}</button>))}
                          </motion.div>
                        )}</AnimatePresence>
                      </div>
                      <div className="relative flex-1">
                        <button onClick={() => setVisibleInsight(visibleInsight === 'select-gender' ? null : 'select-gender')} className={`w-full p-4 bg-slate-50 border ${visibleInsight === 'select-gender' ? 'border-blue-500 shadow-blue-100' : 'border-slate-200'} rounded-2xl outline-none transition-all text-left flex justify-between items-center text-sm`}><span className={tempProfile.gender ? 'text-black font-medium' : 'text-slate-400'}>{tempProfile.gender || 'Gender'}</span><ChevronRight size={14} className={`text-slate-300 transition-transform ${visibleInsight === 'select-gender' ? 'rotate-90' : ''}`} /></button>
                        <AnimatePresence>{visibleInsight === 'select-gender' && (
                          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full mb-3 left-0 right-0 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[30000] overflow-hidden p-2">
                            {['Female', 'Male', 'Non-binary'].map(gender => (<button key={gender} onClick={() => { setTempProfile({...tempProfile, gender}); setVisibleInsight(null); }} className={`w-full p-3 rounded-xl text-xs font-medium transition-colors text-left ${tempProfile.gender === gender ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>{gender}</button>))}
                          </motion.div>
                        )}</AnimatePresence>
                      </div>
                    </div>
                    <button onClick={handleProfileSave} disabled={!tempProfile.age || !tempProfile.gender} className="w-full py-4 bg-black text-white rounded-2xl font-bold disabled:opacity-30 transition-opacity text-sm shadow-lg active:scale-[0.98] transition-transform">Unlock Comparison</button>
                  </div>
                ) : (
                  <div className="pt-4 space-y-6 text-center"><p className="text-slate-600 text-[15px]">You are at higher risk than <br /><strong className="text-black text-lg">{cmp.worse}%</strong> <br />of {cmp.label}.</p>
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden"><div className="absolute top-0 bottom-0 w-1 bg-slate-300 z-10" style={{ left: `${cmp.segPct}%` }} /><motion.div initial={{ width: 0 }} animate={{ width: `${cmp.userPct}%` }} transition={{ duration: 1, delay: 0.5 }} className="absolute top-0 bottom-0 rounded-full" style={{ backgroundColor: color }} /></div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider"><span>Low Risk</span><span>Average ({cmp.segAvg})</span><span>High Risk</span></div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="bg-white rounded-[32px] p-8 mb-10 shadow-[0_0_40px_rgba(96,165,250,0.12)] overflow-hidden relative text-center z-[8]">
          <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Your Risk Profile</h3><button onClick={() => onOpenModal('info')} className="p-1.5 text-slate-300 hover:text-blue-500 transition-colors"><Info size={20} /></button></div>
          <div className="flex justify-center items-center mb-10 w-full overflow-hidden px-2 font-bold text-[10px] sm:text-[12px] text-slate-500 uppercase tracking-tight gap-4 sm:gap-8">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span> You</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-black"></span> US Average</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Peer Group</span>
          </div>
          <div className="relative w-full aspect-square max-w-[360px] mx-auto mb-12">
            <svg viewBox="0 0 200 200" className="w-full h-full scale-[0.98] origin-center overflow-visible">
              {[20, 40, 60, 80, 100].map(r => (<polygon key={r} points={radarData.map((_, i) => { const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; const rad = r * 0.9; return `${100 + rad * Math.cos(angle)},${100 + rad * Math.sin(angle)}`; }).join(" ")} fill="none" stroke="#f1f5f9" strokeWidth="1" />))}
              <polygon points={radarData.map((_, i) => { const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; return `${100 + 55 * 0.9 * Math.cos(angle)},${100 + 55 * 0.9 * Math.sin(angle)}`; }).join(" ")} fill="none" stroke="#000000" strokeWidth="1.5" />
              <polygon points={peerRadarPoints} fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              <motion.polygon initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.8 }} style={{ originX: "100px", originY: "100px" }} points={radarData.map((d, i) => { const r = Math.max((d.val || 10) * 0.9, 8); const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`; }).join(" ")} fill="#FF585930" stroke="#FF5859" strokeWidth="3.5" />
              {radarData.map((d, i) => {
                const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2; const x = 100 + 95 * Math.cos(angle); const y = 100 + 95 * Math.sin(angle); const isActive = activeFactor === i;
                return (
                  <g key={i} className="cursor-pointer" onMouseEnter={() => setActiveFactor(i)} onClick={() => setActiveFactor(i)}>
                    {isActive && <motion.circle cx={x} cy={y} r="10" stroke={color} strokeWidth="2" initial={{ opacity: 0.5, scale: 1 }} animate={{ opacity: 0, scale: 2 }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }} />}
                    <circle cx={x} cy={y} r="10" fill={isActive ? color : "white"} stroke={color} strokeWidth="1.5" className="transition-all duration-300 shadow-sm" /><text x={x} y={y} textAnchor="middle" alignmentBaseline="middle" fill={isActive ? "white" : color} className="text-[9px] font-bold">{Math.round(d.val)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="w-full bg-black rounded-full py-4 px-6 text-center min-h-[56px] flex items-center justify-center border-none shadow-lg shadow-black/10">
            <AnimatePresence mode="wait">
              <motion.span key={activeFactor} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`${poppins.className} text-white font-medium text-sm`}>{radarData[activeFactor].label.replace('\n', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</motion.span>
            </AnimatePresence>
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#FF5859] to-[#FF7A7B] rounded-[32px] p-8 mb-10 shadow-[0_0_50px_rgba(255,88,89,0.25)] text-center relative z-[7]">
          <div className="flex flex-col items-center mb-6">
            <AlertCircle size={32} className="text-white mb-2" />
            <h3 className="text-lg font-bold text-white">Identified Airway Risks</h3>
          </div>
          <div className="space-y-3">{identifiedRiskCards.map((card, i) => card && (<div key={i} className="bg-white/15 backdrop-blur-md rounded-2xl p-5 flex items-center gap-4 border border-white/20 shadow-sm text-left"><span className="text-2xl shrink-0">{card.icon}</span><span className="font-bold text-white text-base leading-tight">{card.title}</span></div>))}</div>
        </section>

        {voiceText && (
          <section className="bg-gradient-to-br from-[#0080FF] to-[#3399FF] rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,128,255,0.25)] text-center relative z-[6]"><h3 className="text-xl font-bold mb-4 flex items-center justify-center gap-2 text-white"><Sparkles size={20} className="text-white" /> AI Voice Insight</h3><p className="text-blue-50 leading-relaxed italic text-[15px]" dangerouslySetInnerHTML={{ __html: analyzeVoiceInput(voiceText) }} /></section>
        )}
        
        {/* RECOMMENDED SOLUTION SECTION - Moved Inside Container */}
        <section className="bg-gradient-to-br from-[#0080FF] to-[#3399FF] rounded-[32px] p-8 mb-10 shadow-[0_0_50px_rgba(0,128,255,0.25)] text-center relative z-[5]">
          <div className="flex flex-col items-center mb-10">
            <CheckCircle2 size={32} className="text-white mb-3" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Recommended solution
            </h3>
          </div>
          <div className="space-y-6 text-left">
            {solutions.map((sol, i) => (
              <div 
                key={i} 
                className="bg-white/95 backdrop-blur-md rounded-[28px] p-8 shadow-xl relative"
              >
                <div className="mb-6 flex flex-col items-center text-center">
                  <span className="text-4xl mb-3 block">{sol.icon}</span>
                  <h4 className="font-bold text-xl leading-tight text-blue-900">{sol.problem}</h4>
                </div>
                <div className="text-left">
                  <p className="text-slate-600 mb-6 leading-relaxed text-[15px]">{sol.how}</p>
                  <div className="w-full bg-[#1C88FF] rounded-2xl p-5 mb-5 border border-white/20 shadow-lg shadow-blue-500/20">
                    <p className="text-[12px] text-white font-semibold leading-relaxed tracking-wide">
                      <span className="opacity-60 uppercase text-[10px] block mb-1 tracking-[0.1em]">Recommended Formula</span>
                      {sol.formula.replace(/[^\x00-\x7F]/g, "").trim()}
                    </p>
                  </div>
                  <div className="text-blue-600 font-bold text-[14px]">
                    {sol.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>


      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="flex justify-center mb-12"><span className="bg-blue-600 px-10 py-4 rounded-full text-white font-bold tracking-widest uppercase text-sm shadow-xl shadow-blue-200">Your Routine</span></div>
        <div className="relative ml-8 pl-9 pr-5 space-y-12">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-100" />
          {routines.map((routine, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-9 top-1 w-6 h-6 rounded-full bg-white shadow-xl shadow-blue-500/10 flex items-center justify-center -translate-x-1/2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-blue-900">{routine.title}</h4><p className="text-slate-500 leading-relaxed text-base">{routine.desc}</p>
            </div>
          ))}
        </div>
        <section className="bg-black text-white rounded-[40px] p-12 text-center relative overflow-hidden shadow-[0_0_80px_rgba(0,128,255,0.25)] mt-24">
          <div className="relative z-10"><span className="inline-block px-4 py-1 bg-white/10 rounded-full text-[11px] font-bold tracking-widest uppercase mb-5">Recommended Plan</span><h3 className="text-4xl font-bold mb-3">{recommendedPlan.name}</h3><div className="flex items-end justify-center gap-1 mb-8"><span className="text-5xl font-bold">{recommendedPlan.price}</span><span className="text-white/60 mb-1">{recommendedPlan.period}</span></div>
            <ul className="text-left space-y-4 mb-10 max-w-xs mx-auto">{recommendedPlan.features.map((f, i) => (<li key={i} className="flex items-center gap-4"><CheckCircle2 size={20} className="text-blue-400 shrink-0" /><span className="text-white/80 text-base">{f}</span></li>))}</ul>
            <button className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4 shadow-xl shadow-blue-600/30">Get Free trial kit <ChevronRight size={24} /></button>
            <button className="w-full py-4 text-white/40 hover:text-white transition-colors underline underline-offset-4 text-sm text-center w-full block">Browse all plans first</button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-500/10 blur-[120px] pointer-events-none" />
        </section>

        <section className="mt-24 pt-12 border-t border-slate-100 text-center">
          <h4 className={`${poppins.className} text-xl font-semibold mb-3`}>Save Your Results</h4>
          <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">Save your results and get personalized plan recommendations via email! <br/><span className="text-slate-400 italic">Skip for now — your results won&apos;t be saved.</span></p>
          <div className="flex flex-col gap-3 max-w-md mx-auto mb-12"><input type="email" placeholder="Enter your email" className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-center" /><button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-100">Send My Report</button></div>
          <button onClick={() => onOpenModal('delete')} className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2">Just Leave</button>
        </section>
      </div>
    </div>
  );
}
