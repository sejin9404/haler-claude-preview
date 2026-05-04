'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, ArrowRight, ArrowLeft, Mail, ChevronRight, ShieldCheck, Info, AlertCircle, CheckCircle2, Waves, Activity } from 'lucide-react';
import { Syne, Poppins } from 'next/font/google';
import { QUIZ_STEPS, HALER_API, calcScore, getTier, MAX_SCORE } from '@/quiz/Quizfinal';
import { ScrollIndicator } from '@/components/common/ScrollIndicator';
import ReportDashboard from './ReportDashboard';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

interface HalerQuizProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export default function HalerQuiz({ onClose, isStandalone = false }: HalerQuizProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [phase, setPhase] = useState<'profile' | 'quiz' | 'voice' | 'email' | 'calculating' | 'result'>('profile');
  const [profile, setProfile] = useState({ age: '', gender: '' });
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [email, setEmail] = useState('');
  const [visibleInsight, setVisibleInsight] = useState<string | null>(null);
  const insightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Modal States
  const [activeModal, setActiveModal] = useState<'info' | 'score' | 'delete' | null>(null);
  
  const sessionId = useRef(Math.random().toString(36).slice(2));
  const optionsScrollRef = useRef<HTMLDivElement>(null);
  const reportScrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll on step change
  useEffect(() => {
    if (optionsScrollRef.current) {
      requestAnimationFrame(() => {
        if (optionsScrollRef.current) optionsScrollRef.current.scrollTop = 0;
      });
    }
  }, [stepIdx]);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      HALER_API.saveQuizState(sessionId.current, { answers, profile, phase });
    }
  }, [answers, phase, profile]);

  const toggleAnswer = useCallback((stepId: string, multi: boolean, optId: string) => {
    const step = QUIZ_STEPS.find(s => s.id === stepId);
    const isSelecting = multi ? !(answers[stepId] || []).includes(optId) : true;
    
    if (isSelecting && step && step.insight && (step.insight as any)[optId]) {
      const insightText = (step.insight as any)[optId];
      setVisibleInsight(insightText);
      if (insightTimeoutRef.current) clearTimeout(insightTimeoutRef.current);
      insightTimeoutRef.current = setTimeout(() => {
        setVisibleInsight(null);
      }, 3000);
    }

    setAnswers(prev => {
      const cur = prev[stepId] || [];
      if (multi) {
        if (optId === "none") return { ...prev, [stepId]: ["none"] };
        const f = cur.filter(x => x !== "none");
        return { ...prev, [stepId]: f.includes(optId) ? f.filter(x => x !== optId) : [...f, optId] };
      }
      return { ...prev, [stepId]: [optId] };
    });
  }, [answers]);

  const nextStep = () => {
    setVisibleInsight(null);
    if (insightTimeoutRef.current) clearTimeout(insightTimeoutRef.current);
    
    if (phase === 'profile') {
      setPhase('quiz');
    } else if (phase === 'quiz') {
      if (stepIdx < QUIZ_STEPS.length - 1) {
        setStepIdx(p => p + 1);
      } else {
        setPhase('voice');
      }
    } else if (phase === 'voice') {
      setPhase('email');
    } else if (phase === 'email') {
      setPhase('calculating');
      setTimeout(() => setPhase('result'), 1500);
    }
  };

  const prevStep = () => {
    setVisibleInsight(null);
    if (insightTimeoutRef.current) clearTimeout(insightTimeoutRef.current);
    
    if (phase === 'quiz') {
      if (stepIdx > 0) {
        setStepIdx(p => p - 1);
      } else {
        setPhase('profile');
      }
    } else if (phase === 'voice') {
      setPhase('quiz');
    } else if (phase === 'email') {
      setPhase('voice');
    }
  };

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const score = calcScore(answers);
    const tier = getTier(score);
    if (email) {
      await HALER_API.submitLead({
        email, sessionId: sessionId.current, score, tier, profile,
        occ: answers.occupation?.[0], timestamp: new Date().toISOString(), source: "quiz",
      });
    }
    nextStep();
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceText("I often feel a tickle in my throat after my evening runs, and it stays dry all night.");
    } else {
      setIsRecording(true);
      setVoiceText("");
    }
  };

  const currentQuizStep = QUIZ_STEPS[stepIdx];
  const hasAnswer = (answers[currentQuizStep?.id] || []).length > 0;

  return (
    <motion.div 
      initial={{ y: '100%', backgroundColor: 'rgba(255,255,255,0)' }}
      animate={{ 
        y: 0, 
        backgroundColor: phase === 'profile' ? 'rgba(255,255,255,0)' : phase === 'result' ? 'rgba(255,255,255,1)' : '#F0F7FF' 
      }}
      exit={{ y: '100%' }}
      transition={{ 
        y: { type: 'spring', damping: 28, stiffness: 220 },
        backgroundColor: { duration: 0.8, ease: "easeInOut" }
      }}
      className={`fixed inset-0 w-full flex flex-col items-center text-black z-[20000] overflow-hidden ${poppins.className}`}
    >
      {/* DRAG HANDLE */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 && onClose) onClose();
        }}
        className="absolute left-0 right-0 h-16 z-[20001] flex flex-col items-center cursor-grab active:cursor-grabbing"
        style={{ top: 'env(safe-area-inset-top, 0px)', paddingTop: '12px' }}
      >
        <div className="w-12 h-1.5 bg-black/50 rounded-full mb-1" />
      </motion.div>

      {/* GLOBAL MODALS */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[21000] overflow-y-auto bg-white/10 backdrop-blur-2xl no-scrollbar"
            onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
          >
            <div className="min-h-full flex items-center justify-center p-4 sm:p-6 pt-[calc(env(safe-area-inset-top,0px)+20px)] pb-[calc(env(safe-area-inset-bottom,0px)+20px)]">
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                exit={{ scale: 0.9, y: 20 }} 
                className="bg-white rounded-[40px] p-8 max-w-xl w-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative text-left border border-white/20"
              >
              {activeModal === 'info' && (
                <>
                  <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-black transition-colors"><X size={24} /></button>
                  <h4 className="text-xl font-bold mb-4 pr-8 uppercase tracking-tight text-blue-600">Understanding Your Metrics</h4>
                  <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                    <p>This profile is calculated based on environmental data from the EPA, clinical studies on mucosal health, and real-time peer comparison.</p>
                    <div className="p-4 bg-slate-50 rounded-2xl"><h5 className="font-bold text-black mb-1">US Average Data</h5><p>Derived from national respiratory baseline statistics (2025). This represents the median risk profile for the general US population.</p></div>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100"><h5 className="font-bold text-blue-900 mb-1">Your Peer Group</h5><p className="text-blue-800">Aggregated from users within your age and gender category who have shared their diagnostic profile.</p></div>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="w-full mt-8 py-4 bg-black text-white rounded-2xl font-bold transition-transform active:scale-95 text-sm uppercase tracking-widest">Got it</button>
                </>
              )}

              {activeModal === 'score' && (
                <>
                  <button onClick={() => setActiveModal(null)} className="absolute top-8 right-8 text-slate-300 hover:text-black transition-colors"><X size={24} /></button>
                  <div className="mb-10">
                    <span className="text-[11px] font-bold tracking-[0.2em] text-blue-500 uppercase mb-2 block">Diagnostic Criteria</span>
                    <h4 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Scale Guide</h4>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                      This score represents a percentage based on the weighted responses you selected throughout the assessment.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 relative">
                    {/* THINNER VERTICAL SCALE BAR */}
                    <div className="w-1.5 shrink-0 flex flex-col relative py-2">
                      <div className="flex-1 flex flex-col rounded-full overflow-hidden bg-slate-50 shadow-inner">
                        <div className="h-[25%] bg-emerald-500" /> {/* Ideal (0-20ish) */}
                        <div className="h-[45%] bg-amber-500" />   {/* Cautious (21-70ish) */}
                        <div className="h-[30%] bg-rose-500" />    {/* Danger (71-100) */}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* IDEAL / SAFE (0-20) */}
                      <div className="bg-emerald-50/30 p-5 rounded-[28px] border border-emerald-100/30">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-bold text-emerald-900 text-base">Ideal</h5>
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold tracking-tight">0-20</span>
                        </div>
                        <p className="text-[12px] text-emerald-700/80 leading-relaxed font-medium">Airway in good shape based on your environmental load.</p>
                      </div>

                      {/* CAUTIOUS / AT RISK (21-70) */}
                      <div className="bg-amber-50/30 p-5 rounded-[28px] border border-amber-100/30">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-bold text-amber-900 text-base">Cautious</h5>
                          <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-bold tracking-tight">21-70</span>
                        </div>
                        <p className="text-[12px] text-amber-700/80 leading-relaxed font-medium">Daily demand detected on your airway. Routine care recommended.</p>
                      </div>

                      {/* DANGER / COMPROMISED (71-100) */}
                      <div className="bg-rose-50/30 p-5 rounded-[28px] border border-rose-100/30">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-bold text-rose-900 text-base">Danger</h5>
                          <span className="px-3 py-1 bg-rose-500/10 text-rose-600 rounded-full text-[10px] font-bold tracking-tight">71+</span>
                        </div>
                        <p className="text-[12px] text-rose-700/80 leading-relaxed font-medium">High daily airway demand. Your defense needs proactive support.</p>
                      </div>
                    </div>
                  </div>

                  {/* SELECTED OPTIONS BREAKDOWN */}
                  <div className="mt-12 mb-2">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                      <h5 className="text-lg font-bold text-slate-900">Personalized Breakdown</h5>
                    </div>
                    <div className="space-y-3">
                      {QUIZ_STEPS.map(step => {
                        const selectedIds = answers[step.id] || [];
                        if (selectedIds.length === 0) return null;
                        
                        return selectedIds.map(optId => {
                          const opt = step.opts.find(o => o.id === optId);
                          if (!opt) return null;
                          return (
                            <div key={`${step.id}-${optId}`} className="bg-slate-50/80 rounded-2xl p-4 flex justify-between items-center border border-slate-100/50">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{step.id}</span>
                                <span className="text-[14px] font-bold text-slate-700 leading-tight">{opt.l}</span>
                              </div>
                              <div className="flex items-center shrink-0 ml-4">
                                <span className="text-[16px] font-extrabold text-blue-600">+{opt.score}</span>
                              </div>
                            </div>
                          );
                        });
                      })}
                    </div>

                    {/* TOTAL RAW SCORE FOOTER */}
                    <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center px-4">
                      <span className="text-[14px] font-bold text-slate-700">Total Raw Score</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-bold text-blue-600">{calcScore(answers)}</span>
                        <span className="text-[14px] font-bold text-slate-300">/</span>
                        <span className="text-[14px] font-bold text-slate-400">{MAX_SCORE}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => setActiveModal(null)} className="w-full mt-10 py-5 bg-black text-white rounded-[24px] font-bold transition-all active:scale-[0.98] text-sm uppercase tracking-widest shadow-xl shadow-black/10">Understood</button>
                </>
              )}

              {activeModal === 'delete' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle size={32} className="text-red-500" /></div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">Are you sure?</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">If you leave now, all your assessment data will be <span className="text-red-500 font-bold text-[16px]">permanently deleted.</span> You won&apos;t be able to recover this report.</p>
                  <div className="flex flex-col gap-3">
                    <button onClick={onClose} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200">Delete and Leave</button>
                    <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Go back to report</button>
                  </div>
                </div>
              )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={reportScrollRef}
        className={`w-full flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden relative no-scrollbar ${activeModal ? 'overflow-hidden' : ''} ${phase === 'result' ? 'p-0' : (phase === 'quiz' || phase === 'voice') ? 'p-0' : 'p-4 pt-12 pb-8 md:p-8'}`}
      >
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        
        <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700 ease-in-out ${phase === 'profile' ? 'bg-transparent' : phase === 'result' ? 'bg-white' : 'bg-[#F0F7FF]'}`} />

        <div className={`relative z-10 w-full flex flex-col h-full ${phase === 'result' ? 'max-w-none justify-start' : 'max-w-2xl mx-auto'}`}>
          <AnimatePresence mode="wait">
            {phase === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} className="flex-1 flex flex-col justify-center">
                <div className="bg-white/60 backdrop-blur-2xl border border-white/20 p-8 md:p-12 rounded-[40px] text-center shadow-[0_32px_80px_-20px_rgba(0,128,255,0.15)]">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-6"><img src="/images/halersymbol.png" alt="Haler Symbol" className="w-8 h-auto" /></div>
                  <h2 className="text-3xl font-medium mb-4 tracking-tight leading-tight">Check Your <br />Airway Status</h2>
                  <p className="text-slate-500 mb-12 max-w-sm mx-auto leading-relaxed">Get a detailed report analyzing potential respiratory threats in your daily life. It only takes 1 minute!</p>
                  <div className="flex gap-4 max-w-sm mx-auto mb-6 relative">
                    <div className="relative flex-1">
                      <button onClick={() => setVisibleInsight(visibleInsight === 'select-age' ? null : 'select-age')} className={`w-full p-5 bg-slate-50 border ${visibleInsight === 'select-age' ? 'border-blue-500 shadow-blue-100' : 'border-slate-100'} rounded-[24px] outline-none transition-all shadow-sm text-left flex justify-between items-center`}><span className={profile.age ? 'text-black font-medium' : 'text-slate-400'}>{profile.age || 'Age'}</span><ChevronRight size={16} className={`text-slate-300 transition-transform ${visibleInsight === 'select-age' ? 'rotate-90' : ''}`} /></button>
                      <AnimatePresence>{visibleInsight === 'select-age' && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full mb-3 left-0 right-0 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[30000] overflow-hidden p-2">
                          {['18–24', '25–34', '35–44', '45–54', '55+'].map(age => (<button key={age} onClick={() => { setProfile({...profile, age}); setVisibleInsight(null); }} className={`w-full p-4 rounded-xl text-sm font-medium transition-colors text-left ${profile.age === age ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>{age}</button>))}
                        </motion.div>
                      )}</AnimatePresence>
                    </div>
                    <div className="relative flex-1">
                      <button onClick={() => setVisibleInsight(visibleInsight === 'select-gender' ? null : 'select-gender')} className={`w-full p-5 bg-slate-50 border ${visibleInsight === 'select-gender' ? 'border-blue-500 shadow-blue-100' : 'border-slate-100'} rounded-[24px] outline-none transition-all shadow-sm text-left flex justify-between items-center`}><span className={profile.gender ? 'text-black font-medium' : 'text-slate-400'}>{profile.gender || 'Gender'}</span><ChevronRight size={16} className={`text-slate-300 transition-transform ${visibleInsight === 'select-gender' ? 'rotate-90' : ''}`} /></button>
                      <AnimatePresence>{visibleInsight === 'select-gender' && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full mb-3 left-0 right-0 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-[30000] overflow-hidden p-2">
                          {['Female', 'Male', 'Non-binary'].map(gender => (<button key={gender} onClick={() => { setProfile({...profile, gender}); setVisibleInsight(null); }} className={`w-full p-4 rounded-xl text-sm font-medium transition-colors text-left ${profile.gender === gender ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>{gender}</button>))}
                        </motion.div>
                      )}</AnimatePresence>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-400 mb-10 max-w-xs mx-auto">You can skip this information, but providing it allows us to offer Peer Comparison insights.</p>
                  <button onClick={nextStep} className="w-full max-w-sm mx-auto py-5 bg-black text-white rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10">Check my status</button>
                  <button onClick={nextStep} className="mt-8 text-sm text-slate-500 underline underline-offset-8 hover:text-slate-800 transition-colors">Skip for now</button>
                </div>
              </motion.div>
            )}

            {phase === 'quiz' && currentQuizStep && (
              <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col w-full h-full bg-[#F0F7FF]">
                <div className="shrink-0 mb-2 px-6 md:px-10 md:pt-14" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 40px)' }}>
                  <div className="flex justify-between items-center mb-4">
                    <AnimatePresence mode="wait"><motion.span key={`tag-${currentQuizStep.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-blue-600 font-bold uppercase text-[15px] tracking-normal">{currentQuizStep.tag}</motion.span></AnimatePresence>
                    <div className="flex items-center gap-1.5">{QUIZ_STEPS.map((_, idx) => (<div key={idx} className="w-4 sm:w-6 h-1 rounded-full overflow-hidden relative bg-slate-100"><motion.div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full" initial={{ width: 0 }} animate={{ width: idx <= stepIdx ? '100%' : '0%' }} transition={{ duration: 0.3 }} /></div>))}</div>
                  </div>
                  <AnimatePresence mode="wait"><motion.div key={`title-${currentQuizStep.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}><h2 className="text-xl font-bold mb-1 leading-tight text-slate-900">{currentQuizStep.title}</h2><p className="text-slate-500 text-[13px] md:text-[14px] leading-relaxed">{currentQuizStep.sub}</p></motion.div></AnimatePresence>
                </div>
                <div className="flex-1 relative min-h-0 bg-[#F0F7FF] overflow-hidden">
                  <div 
                    ref={optionsScrollRef}
                    className="w-full h-full overflow-y-auto pt-4 px-6 no-scrollbar"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div key={`opts-${currentQuizStep.id}`} initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }} transition={{ duration: 0.4 }} className="grid grid-cols-1 gap-3 pb-12">
                        {currentQuizStep.opts.map((opt) => { 
                          const isSelected = (answers[currentQuizStep.id] || []).includes(opt.id); 
                          return (
                            <button key={opt.id} onClick={() => toggleAnswer(currentQuizStep.id, currentQuizStep.multi, opt.id)} className={`group p-5 rounded-[28px] text-left transition-all duration-300 flex items-center gap-4 border ${isSelected ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/30' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}>
                              <span className="text-2xl shrink-0">{opt.e}</span>
                              <div className="flex-1 pr-2">
                                <h4 className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{opt.l}</h4>
                                {opt.s && <p className={`text-[12px] mt-0.5 leading-snug ${isSelected ? 'text-blue-50' : 'text-slate-500'}`}>{opt.s}</p>}
                              </div>
                            </button>
                          ); 
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <ScrollIndicator scrollRef={optionsScrollRef} bgColor="#F0F7FF" color="#1C88FF" />
                </div>
                <div className="shrink-0 px-6 pb-6 md:pb-8 flex flex-col bg-[#F0F7FF] z-[100] mt-auto relative">
                  <AnimatePresence>
                    {visibleInsight && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full left-0 w-full mb-4 flex flex-col z-[1000] pointer-events-none px-6"
                      >
                        <div className="p-5 bg-[#FF5859] border border-white/20 text-white rounded-[24px] flex gap-3 shadow-2xl shadow-red-500/30 pointer-events-auto mx-0">
                          <span className="text-xl leading-none shrink-0 mt-1">{visibleInsight.includes('🔴') ? '🔴' : visibleInsight.includes('🟡') ? '🟡' : '💡'}</span>
                          <p className="text-[14px] font-semibold leading-relaxed">{visibleInsight.replace(/[🔴🟡💡\uFFFD]/g, '').trim()}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="py-3.5 w-full">
                    <AnimatePresence mode="wait">
                      <motion.p key={`guide-${currentQuizStep.multi}`} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} className="text-center text-[13.5px] font-medium text-slate-500">
                        {currentQuizStep.multi ? (
                          <>Please select <span className="text-[#1C88FF] font-bold">all</span> options that apply to you.</>
                        ) : (
                          <>Please select the <span className="text-[#1C88FF] font-bold">one</span> option that fits you best.</>
                        )}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <div className="flex gap-4 w-full">
                    <button onClick={prevStep} className="flex-1 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10"><ArrowLeft size={20} /> Back</button>
                    <button onClick={nextStep} disabled={!hasAnswer} className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-500 ease-in-out flex items-center justify-center gap-2 border-2 ${hasAnswer ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-300 border-slate-100 cursor-not-allowed'}`}>Next <ArrowRight size={20} /></button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'voice' && (
              <motion.div key="voice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col justify-center px-6 text-center w-full max-w-md mx-auto">
                <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3 block">AI Assessment</span>
                <h2 className="text-3xl font-bold mb-3">In your own words.</h2>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">Any specific breathing discomfort or moments where your airway feels stressed?</p>
                <div className="relative flex flex-col items-center justify-center min-h-[220px] py-10 mb-6 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-blue-900/5 px-6">
                  <AnimatePresence mode="wait">
                    {voiceText ? (<motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center"><p className="text-blue-800 text-lg italic leading-relaxed font-medium">"{voiceText}"</p></motion.div>) : (
                      <motion.div key="wave" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 h-16 mb-4">{[...Array(12)].map((_, i) => (<motion.div key={i} animate={isRecording ? { height: [12, 40 + Math.random() * 30, 12] } : { height: 12 }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }} className={`w-1.5 rounded-full ${isRecording ? 'bg-blue-500' : 'bg-slate-200'}`} />))}</div>
                        <p className="text-slate-400 font-medium text-sm">{isRecording ? 'AI is listening...' : 'Ready to analyze your voice'}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex flex-col gap-4">
                  <button onClick={toggleRecording} className={`w-full py-5 rounded-2xl font-bold text-lg transition-colors duration-200 shadow-lg flex items-center justify-center ${isRecording ? 'bg-[#FF5859] text-white' : 'bg-blue-600 text-white'}`}>{isRecording ? 'Done!' : voiceText ? 'Re-record' : 'Tap to Speak'}</button>
                  <div className="flex gap-4">
                    <button onClick={prevStep} className="flex-1 py-4 bg-black text-white rounded-2xl font-bold text-base shadow-lg">Back</button>
                    <button onClick={nextStep} className={`flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-base transition-colors duration-200 flex items-center justify-center ${voiceText ? 'text-black' : 'text-slate-500'}`}>{voiceText ? 'Next' : 'Skip'}</button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'email' && (
              <motion.div 
                key="email" 
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} 
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} 
                className="flex-1 flex flex-col justify-center px-6 w-full max-w-md mx-auto"
              >
                <div className="bg-white p-10 md:p-12 rounded-[40px] text-center shadow-[0_32px_80px_-20px_rgba(0,128,255,0.1)] border border-white/50">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8">
                    <img src="/images/halersymbol.png" alt="Haler Symbol" className="w-10 h-auto" />
                  </div>
                  <h2 className="text-[32px] font-bold mb-4 tracking-tight text-slate-900 leading-tight">Report is Ready!</h2>
                  <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed text-[13.5px]">
                    Enter your email to save your full diagnostic report and instantly unlock 
                    <span className="text-blue-600 font-bold ml-1">Risk-Free Trial Kit offer.</span>
                  </p>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="w-full py-5 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-[24px] focus:border-blue-500 focus:bg-white outline-none transition-all text-[14px]" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-5 bg-blue-600 text-white rounded-full font-bold text-[16px] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98]"
                    >
                      Get My Report & Trial Kit
                    </button>
                  </form>
                  
                  <button 
                    onClick={() => nextStep()} 
                    className="mt-8 text-slate-400 underline underline-offset-8 hover:text-slate-600 transition-colors text-[12.5px] font-medium"
                  >
                    Just show me the report
                  </button>
                </div>
              </motion.div>
            )}

            {(phase === 'calculating' || phase === 'result') && (
              <motion.div
                key="calculating-layer"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: phase === 'calculating' ? 1 : 0,
                  filter: phase === 'calculating' ? 'blur(0px)' : 'blur(40px)',
                  scale: phase === 'calculating' ? 1 : 1.1
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center bg-[#F0F7FF] pointer-events-none"
              >
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                  <div className="relative mb-10">
                    <svg width="84" height="84" viewBox="0 0 722 669" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                      <defs>
                        <radialGradient id="p0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(360.811 501.215) rotate(90) scale(167.382 360.173)"><stop stopColor="#0095FF" /><stop offset="1" stopColor="#00B3E8" /></radialGradient>
                        <radialGradient id="p1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(360.811 170.151) rotate(90) scale(170.274 167.656)"><stop stopColor="#0095FF" /><stop offset="1" stopColor="#00B3E8" /></radialGradient>
                        <mask id="drawingMask"><motion.path d="M 340 460 C 240 320 40 380 40 510 C 40 640 240 680 360 500 C 480 320 680 380 680 510 C 680 640 480 680 380 540" fill="none" stroke="white" strokeWidth="85" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} /></mask>
                      </defs>
                      <g mask="url(#drawingMask)"><path d="M161.284 333.461C216.074 330.231 261.74 356.209 299.183 393.574C310.4 404.768 324.073 419.423 335.877 429.523C332.533 433.343 327.693 437.618 324.091 441.389C313.408 452.569 300.595 463.905 290.256 475.22C276.077 460.156 260.07 444.88 244.58 431.133C238.805 426.01 231.332 419.681 224.982 415.412C206.562 403.042 184.626 396.984 162.469 398.146C134.911 399.558 109.059 411.917 90.6551 432.478C73.0122 452.29 63.0769 479.163 64.6246 505.725C65.9637 533.435 78.3874 559.439 99.0999 577.893C114.349 591.523 133.334 600.268 153.603 603C178.085 606.248 202.924 600.674 223.672 587.276C231.226 582.348 239.474 575.312 246.436 569.441C257.864 559.807 270.284 548.39 280.824 537.834C291.688 526.95 302.238 514.138 313.086 503.215C337.05 479.082 361.164 455.065 385.188 430.995L412.343 403.787C429.214 386.894 447.42 368.978 467.948 356.671C490.747 343.002 518.085 335.202 544.555 333.614C588.924 331.281 632.417 346.583 665.552 376.183C699.608 406.481 718.432 448.594 720.984 493.842C723.275 537.301 708.211 579.887 679.111 612.243C654.054 640.277 620.364 659.157 583.374 665.89C574.315 667.521 567.565 667.983 558.408 668.481C557.381 668.548 556.353 668.587 555.326 668.597C522.756 669.003 488.424 658.631 461.216 640.856C445.919 630.862 432.624 617.679 419.718 604.85C408.421 593.525 397.064 582.26 385.647 571.054C390.399 565.805 397.304 559.344 402.43 554.303L431.551 525.569C433.563 527.822 436.232 530.484 438.442 532.57C453.315 546.635 467.373 562.779 482.454 576.516C503.191 595.375 530.519 605.302 558.521 604.151C586.106 602.884 612.008 590.528 630.351 569.889C648.458 549.749 657.813 523.236 656.355 496.194C654.996 468.59 642.615 442.684 621.985 424.291C588.853 394.615 540.421 389.549 501.867 411.72C482.888 422.625 459.776 447.316 443.67 463.16C410.659 495.491 377.88 528.058 345.337 560.862L308.786 597.461C293.683 612.543 276.539 630.007 258.532 641.491C234.686 657.011 207.224 666.08 178.827 667.821C133.717 670.666 89.3503 655.306 55.6549 625.181C22.5544 595.703 2.60901 554.218 0.25738 509.958C-2.22208 465.381 13.2931 421.672 43.3237 388.635C74.0977 354.567 115.635 335.748 161.284 333.461Z" fill="url(#p0)" /></g>
                    <motion.path d="M354.82 0.152555C356.667 0.016676 359.314 -0.0038563 361.178 0.00052838C405.469 0.0471817 447.935 17.6707 479.245 49.0009C511.349 81.1845 529.099 124.969 528.467 170.425C528.542 190.013 524.842 209.433 517.577 227.624C504.656 260.501 491.153 274.804 466.631 299.431L439.921 326.184L364.282 401.447C363.078 402.587 361.884 403.918 360.744 405.139L285.844 330.325L254.234 298.728C245.658 290.151 235.317 280.013 227.85 270.508C207.302 243.878 195.207 211.699 193.129 178.127C190.131 133.587 205.296 89.7318 235.166 56.5583C266.74 21.0758 307.817 2.84796 354.82 0.152555ZM360.691 315.017C361.433 314.164 362.209 313.23 362.979 312.413L410.143 265.465C430.195 245.369 447.331 231.737 457.767 204.561C462.045 193.573 464.234 181.881 464.213 170.09C464.506 111.302 419.28 64.8624 360.278 64.7208C358.7 64.7159 357.122 64.7268 355.548 64.754C327.578 66.2092 301.374 78.8736 282.856 99.8861C250.684 136.107 248.284 189.669 276.543 228.822C284.035 239.203 294.452 248.725 303.546 257.811L340.815 295.036C347.183 301.396 354.69 308.535 360.691 315.017Z" fill="url(#p1)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />
                    </svg>
                  </div>
                  <div className="mb-6">
                    <h3 className={`text-[11px] font-medium text-[#121212] mb-3 uppercase tracking-[0.2em] ${poppins.className}`}>Synthesizing Data...</h3>
                    <motion.div className={`text-[32px] font-medium text-[#121212] tabular-nums ${poppins.className}`}>
                      <CountUp value={100} duration={0.85} />%
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.3, duration: 0.8 }} className="w-full overflow-x-hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}>
                <ReportDashboard score={calcScore(answers)} tier={getTier(calcScore(answers))} answers={answers} profile={profile} voiceText={voiceText} sessionId={sessionId.current} onUpdateProfile={setProfile} onClose={onClose || (() => {})} onOpenModal={setActiveModal} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {phase === 'result' && <ScrollIndicator scrollRef={reportScrollRef} bgColor="#ffffff" color="#0080FF" bottom="0px" />}
      </div>
    </motion.div>
  );
}

function CountUp({ value, duration }: { value: number, duration: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalMiliseconds = duration * 1000;
    let incrementTime = totalMiliseconds / end;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
}
