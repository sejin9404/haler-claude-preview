'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, ArrowRight, ArrowLeft, Mail, ChevronRight, ShieldCheck } from 'lucide-react';
import { Syne, Poppins } from 'next/font/google';
import { QUIZ_STEPS, HALER_API, calcScore, getTier } from '@/quiz/Quizfinal';
import ReportDashboardDesktop from './ReportDashboardDesktop.jsx';

const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

interface HalerQuizProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export default function HalerQuizDesktop({ onClose, isStandalone = false }: HalerQuizProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [phase, setPhase] = useState<'profile' | 'quiz' | 'voice' | 'email' | 'calculating' | 'result'>('profile');
  const [profile, setProfile] = useState({ age: '', gender: '' });
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [email, setEmail] = useState('');
  const [visibleInsight, setVisibleInsight] = useState<string | null>(null);
  const insightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const sessionId = useRef(Math.random().toString(36).slice(2));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [stepIdx]);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      HALER_API.saveQuizState(sessionId.current, { answers, profile, phase });
    }
  }, [answers, phase, profile]);

  const toggleAnswer = useCallback((stepId: string, multi: boolean, optId: string) => {
    setAnswers(prev => {
      const cur = prev[stepId] || [];
      const isSelecting = multi ? !cur.includes(optId) : true;
      
      if (isSelecting) {
        const step = QUIZ_STEPS.find(s => s.id === stepId);
        if (step && step.insight && (step.insight as any)[optId]) {
          setVisibleInsight((step.insight as any)[optId]);
          if (insightTimeoutRef.current) clearTimeout(insightTimeoutRef.current);
          insightTimeoutRef.current = setTimeout(() => {
            setVisibleInsight(null);
          }, 3000);
        }
      }

      if (multi) {
        if (optId === "none") return { ...prev, [stepId]: ["none"] };
        const f = cur.filter(x => x !== "none");
        return { ...prev, [stepId]: f.includes(optId) ? f.filter(x => x !== optId) : [...f, optId] };
      }
      return { ...prev, [stepId]: [optId] };
    });
  }, []);

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

  return (
    <motion.div 
      initial={{ y: '100%', backgroundColor: 'rgba(255,255,255,0)' }}
      animate={{ 
        y: 0, 
        backgroundColor: 'rgba(255,255,255,0)' 
      }}
      exit={{ y: '100%' }}
      transition={{ 
        y: { type: 'spring', damping: 28, stiffness: 220 },
        backgroundColor: { duration: 0.8, ease: "easeInOut" }
      }}
      className={`fixed inset-0 w-full flex flex-col items-center text-black z-[20000] overflow-x-hidden overflow-y-hidden ${poppins.className}`}
    >
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 && onClose) onClose();
        }}
        className="absolute top-0 left-0 right-0 h-16 z-[20001] flex flex-col items-center pt-3 cursor-grab active:cursor-grabbing"
      >
        <div className="w-12 h-1.5 bg-slate-300/40 rounded-full mb-1" />
      </motion.div>

      <div 
        ref={scrollRef}
        className={`w-full flex-1 flex flex-col items-center overflow-y-auto overflow-x-hidden relative no-scrollbar ${phase === 'result' ? 'p-0' : 'p-4 pt-12 pb-8 md:p-8'}`}
      >
        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        {phase !== 'result' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full z-50" />
        )}
        
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-transparent" />

        <div className={`relative z-10 w-full flex flex-col ${phase === 'result' ? 'max-w-none justify-start min-h-0' : 'max-w-2xl mx-auto flex-1 justify-center'} ${phase !== 'profile' && phase !== 'result' ? 'justify-start h-full' : ''}`}>
          <AnimatePresence mode="wait">
            {phase === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} className="bg-white/60 backdrop-blur-2xl border border-white/20 p-8 md:p-12 rounded-[40px] text-center shadow-[0_32px_80px_-20px_rgba(0,128,255,0.15)]">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-6"><img src="/images/halersymbol.png" alt="Haler Symbol" className="w-8 h-auto" /></div>
                <h2 className="text-4xl font-medium mb-4 tracking-tight leading-tight">Check Your <br />Airway Status</h2>
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
                <div className="flex flex-col items-center gap-6">
                  <button onClick={nextStep} className="w-full max-w-sm mx-auto py-5 bg-black text-white rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10">Continue to Assessment</button>
                  <button onClick={nextStep} className="text-sm text-slate-500 underline underline-offset-8 hover:text-slate-800 transition-colors">Skip for now</button>
                </div>
              </motion.div>
            )}

            {phase === 'quiz' && currentQuizStep && (
              <motion.div 
                key="quiz" 
                layout 
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} 
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} 
                transition={{ 
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 }
                }}
                className="flex flex-col w-full max-w-2xl mx-auto bg-white/60 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,128,255,0.15)] overflow-hidden"
              >
                <motion.div layout className="shrink-0 mb-4 px-6 pt-8 md:px-10 md:pt-12">
                  <motion.div layout className="flex justify-between items-center mb-4">
                    <AnimatePresence mode="wait">
                      <motion.span key={`tag-${currentQuizStep.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-blue-600 font-bold uppercase text-[15px] tracking-normal">
                        {currentQuizStep.tag}
                      </motion.span>
                    </AnimatePresence>
                    <motion.div layout className="flex items-center gap-1.5">
                      {QUIZ_STEPS.map((_, idx) => (
                        <div key={idx} className="w-4 sm:w-6 h-1 rounded-full overflow-hidden relative bg-slate-100">
                          <motion.div className="absolute top-0 left-0 h-full bg-blue-600 rounded-full" initial={{ width: 0 }} animate={{ width: idx <= stepIdx ? '100%' : '0%' }} transition={{ duration: 0.3 }} />
                        </div>
                      ))}
                    </motion.div>
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.div key={`title-${currentQuizStep.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                      <h2 className="text-xl md:text-2xl font-bold mb-2 leading-tight text-slate-900">{currentQuizStep.title}</h2>
                      <p className="text-slate-500 text-[13px] md:text-[14px] leading-relaxed">{currentQuizStep.sub}</p>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                <motion.div 
                  layout 
                  className="flex-1 relative min-h-0 bg-transparent overflow-hidden"
                  transition={{ 
                    layout: { type: "spring", stiffness: 220, damping: 28 }
                  }}
                >
                  <motion.div className="w-full h-full overflow-y-auto py-6 px-6 md:px-10 no-scrollbar">
                    <motion.div className="max-w-[640px] mx-auto relative">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div 
                          key={`opts-${currentQuizStep.id}`} 
                          layout
                          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} 
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                          exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }} 
                          transition={{ 
                            opacity: { duration: 0.3 },
                            layout: { type: "spring", stiffness: 220, damping: 28 }
                          }} 
                          style={{ width: '100%' }}
                          className="grid grid-cols-1 gap-3 md:gap-4 pb-[68px]"
                        >
                          {currentQuizStep.opts.map((opt) => { 
                            const isSelected = (answers[currentQuizStep.id] || []).includes(opt.id); 
                            return (
                              <button 
                                key={opt.id} 
                                onClick={() => toggleAnswer(currentQuizStep.id, currentQuizStep.multi, opt.id)} 
                                className={`group p-5 md:p-6 rounded-[28px] text-left transition-all flex items-center gap-4 border ${isSelected ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/30' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}
                              >
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
                    </motion.div>
                  </motion.div>
                </motion.div>

                <div className="shrink-0 p-6 md:p-8 pt-0 relative z-50">
                  <div className="flex gap-4 w-full relative">
                    <AnimatePresence>
                      {visibleInsight && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-full left-0 w-full mb-4 flex flex-col z-[100] pointer-events-none">
                          <div className="p-5 bg-[#FF5859] border border-white/20 text-white rounded-[24px] flex gap-3 shadow-2xl shadow-red-500/30 pointer-events-auto mx-0">
                            <span className="text-xl leading-none shrink-0 mt-1">{visibleInsight.includes('🔴') ? '🔴' : visibleInsight.includes('🟡') ? '🟡' : '💡'}</span>
                            <p className="text-[14px] font-semibold leading-relaxed">{visibleInsight.replace(/[🔴🟡💡\uFFFD]/g, '').trim()}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button onClick={prevStep} className="flex-1 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                      <ArrowLeft size={20} /> Back
                    </button>
                    {(() => { 
                      const hasAnswer = (answers[currentQuizStep.id] || []).length > 0; 
                      return (
                        <button onClick={nextStep} disabled={!hasAnswer} className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${hasAnswer ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-200' : 'bg-white text-slate-300 border border-slate-200 cursor-not-allowed'}`}>
                          Next <ArrowRight size={20} />
                        </button>
                      ); 
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'voice' && (
              <motion.div key="voice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center w-full max-w-xl mx-auto px-4">
                <span className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3 block">Personal Context</span>
                <h2 className="text-4xl font-bold mb-3">In your own words.</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">Any specific breathing discomfort or moments where your airway feels stressed? Type your thoughts below.</p>
                
                <div className="relative mb-8 bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-xl shadow-blue-900/5 p-6 transition-all focus-within:border-blue-300 focus-within:shadow-blue-500/10">
                  <textarea 
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    placeholder="e.g., I feel tightness in my chest when jogging in the morning, or I wake up with a very dry throat..."
                    className="w-full min-h-[200px] bg-transparent outline-none text-slate-800 text-lg leading-relaxed placeholder:text-slate-300 resize-none"
                  />
                  <div className="absolute bottom-6 right-8 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                    AI Context Analysis
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-5 bg-black text-white rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all shadow-lg active:scale-95">
                    Back
                  </button>
                  <motion.button 
                    onClick={nextStep} 
                    animate={{ 
                      backgroundColor: voiceText.trim() ? '#2563eb' : '#ffffff',
                      color: voiceText.trim() ? '#ffffff' : '#000000',
                      border: voiceText.trim() ? '1px solid #2563eb' : '1px solid #e2e8f0'
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="flex-1 py-5 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center active:scale-95 overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={voiceText.trim() ? 'next' : 'skip'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {voiceText.trim() ? 'Next' : 'Skip'}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {phase === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} className="bg-white p-8 md:p-12 rounded-[40px] text-center shadow-2xl">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8"><img src="/images/halersymbol.png" alt="Haler Symbol" className="w-8 h-auto" /></div>
                <h2 className="text-4xl font-medium mb-4 tracking-tight">Report is Ready!</h2>
                <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">Enter your email to save your full diagnostic report and instantly unlock <span className="text-slate-900 font-bold">Risk-Free Trial Kit offer.</span></p>
                <form onSubmit={handleEmailSubmit} className="max-w-sm mx-auto">
                  <div className="relative mb-4">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full py-5 pl-14 pr-6 bg-slate-50 border border-slate-100 rounded-[24px] focus:border-blue-500 outline-none transition-all" />
                  </div>
                  <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-500 shadow-xl shadow-blue-500/25">Get Report & Trial Kit Code</button>
                </form>
                <button onClick={() => nextStep()} className="mt-8 text-slate-400 underline underline-offset-4 hover:text-slate-600 transition-colors">Just show me the report</button>
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
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-3xl pointer-events-none"
              >
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                  <div className="relative mb-12">
                    <svg width="120" height="120" viewBox="0 0 722 669" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                      <defs>
                        <radialGradient id="p0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(360.811 501.215) rotate(90) scale(167.382 360.173)"><stop stopColor="#0080FF" /><stop offset="1" stopColor="#0055FF" /></radialGradient>
                        <radialGradient id="p1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(360.811 170.151) rotate(90) scale(170.274 167.656)"><stop stopColor="#0080FF" /><stop offset="1" stopColor="#0055FF" /></radialGradient>
                        <mask id="drawingMask"><motion.path d="M 340 460 C 240 320 40 380 40 510 C 40 640 240 680 360 500 C 480 320 680 380 680 510 C 680 640 480 680 380 540" fill="none" stroke="white" strokeWidth="85" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} /></mask>
                      </defs>
                      <g mask="url(#drawingMask)"><path d="M161.284 333.461C216.074 330.231 261.74 356.209 299.183 393.574C310.4 404.768 324.073 419.423 335.877 429.523C332.533 433.343 327.693 437.618 324.091 441.389C313.408 452.569 300.595 463.905 290.256 475.22C276.077 460.156 260.07 444.88 244.58 431.133C238.805 426.01 231.332 419.681 224.982 415.412C206.562 403.042 184.626 396.984 162.469 398.146C134.911 399.558 109.059 411.917 90.6551 432.478C73.0122 452.29 63.0769 479.163 64.6246 505.725C65.9637 533.435 78.3874 559.439 99.0999 577.893C114.349 591.523 133.334 600.268 153.603 603C178.085 606.248 202.924 600.674 223.672 587.276C231.226 582.348 239.474 575.312 246.436 569.441C257.864 559.807 270.284 548.39 280.824 537.834C291.688 526.95 302.238 514.138 313.086 503.215C337.05 479.082 361.164 455.065 385.188 430.995L412.343 403.787C429.214 386.894 447.42 368.978 467.948 356.671C490.747 343.002 518.085 335.202 544.555 333.614C588.924 331.281 632.417 346.583 665.552 376.183C699.608 406.481 718.432 448.594 720.984 493.842C723.275 537.301 708.211 579.887 679.111 612.243C654.054 640.277 620.364 659.157 583.374 665.89C574.315 667.521 567.565 667.983 558.408 668.481C557.381 668.548 556.353 668.587 555.326 668.597C522.756 669.003 488.424 658.631 461.216 640.856C445.919 630.862 432.624 617.679 419.718 604.85C408.421 593.525 397.064 582.26 385.647 571.054C390.399 565.805 397.304 559.344 402.43 554.303L431.551 525.569C433.563 527.822 436.232 530.484 438.442 532.57C453.315 546.635 467.373 562.779 482.454 576.516C503.191 595.375 530.519 605.302 558.521 604.151C586.106 602.884 612.008 590.528 630.351 569.889C648.458 549.749 657.813 523.236 656.355 496.194C654.996 468.59 642.615 442.684 621.985 424.291C588.853 394.615 540.421 389.549 501.867 411.72C482.888 422.625 459.776 447.316 443.67 463.16C410.659 495.491 377.88 528.058 345.337 560.862L308.786 597.461C293.683 612.543 276.539 630.007 258.532 641.491C234.686 657.011 207.224 666.08 178.827 667.821C133.717 670.666 89.3503 655.306 55.6549 625.181C22.5544 595.703 2.60901 554.218 0.25738 509.958C-2.22208 465.381 13.2931 421.672 43.3237 388.635C74.0977 354.567 115.635 335.748 161.284 333.461Z" fill="url(#p0)" /></g>
                    <motion.path d="M354.82 0.152555C356.667 0.016676 359.314 -0.0038563 361.178 0.00052838C405.469 0.0471817 447.935 17.6707 479.245 49.0009C511.349 81.1845 529.099 124.969 528.467 170.425C528.542 190.013 524.842 209.433 517.577 227.624C504.656 260.501 491.153 274.804 466.631 299.431L439.921 326.184L364.282 401.447C363.078 402.587 361.884 403.918 360.744 405.139L285.844 330.325L254.234 298.728C245.658 290.151 235.317 280.013 227.85 270.508C207.302 243.878 195.207 211.699 193.129 178.127C190.131 133.587 205.296 89.7318 235.166 56.5583C266.74 21.0758 307.817 2.84796 354.82 0.152555ZM360.691 315.017C361.433 314.164 362.209 313.23 362.979 312.413L410.143 265.465C430.195 245.369 447.331 231.737 457.767 204.561C462.045 193.573 464.234 181.881 464.213 170.09C464.506 111.302 419.28 64.8624 360.278 64.7208C358.7 64.7159 357.122 64.7268 355.548 64.754C327.578 66.2092 301.374 78.8736 282.856 99.8861C250.684 136.107 248.284 189.669 276.543 228.822C284.035 239.203 294.452 248.725 303.546 257.811L340.815 295.036C347.183 301.396 354.69 308.535 360.691 315.017Z" fill="url(#p1)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />
                    </svg>
                  </div>
                  <div className="mb-6"><h3 className="text-xl font-semibold text-slate-800 mb-2">Synthesizing Data...</h3><motion.div className="text-6xl font-bold text-black tabular-nums"><CountUp value={100} duration={0.85} />%</motion.div></div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* RESULT PHASE - Rendered as a separate layer at the top level */}
      <AnimatePresence>
        {phase === 'result' && (
          <motion.div 
            key="result-overlay" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000]"
          >
            <ReportDashboardDesktop 
              score={calcScore(answers)} 
              tier={getTier(calcScore(answers))} 
              answers={answers} 
              profile={profile} 
              voiceText={voiceText} 
              sessionId={sessionId.current} 
              onUpdateProfile={(newProfile: any) => setProfile(newProfile)}
              onClose={onClose || (() => {})} 
            />
          </motion.div>
        )}
      </AnimatePresence>
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
