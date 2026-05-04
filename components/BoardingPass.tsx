"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useAnimation, LayoutGroup } from "framer-motion";
import { useBoardingPass } from "@/context/BoardingPassContext";
import { subscriptionService } from "@/lib/subscriptionApi";
import { 
  Box, 
  MapPin, 
  CreditCard, 
  Clock, 
  Sparkles,
  Scan,
  ShieldCheck,
  Check,
  ChevronDown,
  Loader2,
  CheckCircle2,
  RotateCcw
} from "lucide-react";

type InlineView = 'none' | 'modify' | 'skipStop' | 'orderMore';

const FLAVOR_DATA: Record<string, string[]> = {
  "Nectar": ["nectar1", "nectar2", "nectar3"],
  "Innoscent": ["base", "green", "bloom"],
  "Signature": ["clear", "deep"]
};

// --- PREMIUM CUSTOM SELECTOR ---
function FancySelect({ value, options, onChange, variant = "white" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
  };

  const isBlue = variant === "blue";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <motion.button
        layout
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-4 rounded-xl flex items-center justify-between transition-all duration-300 ${
          isBlue 
            ? "bg-[#1C88FF] text-white shadow-[0_4px_15px_rgba(28,136,255,0.3)]" 
            : "bg-white border border-slate-100 text-slate-900 shadow-sm"
        }`}
      >
        <span className="text-xs font-bold truncate">{value}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className={`w-3.5 h-3.5 ${isBlue ? "text-white/80" : "text-slate-400"}`} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] overflow-hidden p-1.5"
          >
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              {options.map((opt: string) => (
                <motion.button
                  key={opt}
                  whileHover={{ backgroundColor: "rgba(28,136,255,0.08)" }}
                  onClick={() => selectOption(opt)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                    value === opt ? "text-[#1C88FF] bg-blue-50/50" : "text-slate-600"
                  }`}
                >
                  {opt}
                  {value === opt && <Check className="w-3 h-3" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FeedbackCheck = () => (
  <motion.div 
    initial={{ scale: 0, opacity: 0, rotate: -20 }}
    animate={{ scale: 1, opacity: 1, rotate: 0 }}
    exit={{ scale: 0, opacity: 0, rotate: 20 }}
    className="w-5 h-5 bg-[#4ADE80] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.5)]"
  >
    <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
  </motion.div>
);

export default function BoardingPass() {
  const { status, openBoardingPass, closeBoardingPass } = useBoardingPass();
  const [inlineView, setInlineView] = useState<InlineView>('none');
  const controls = useAnimation();
  
  const [subscription, setSubscription] = useState({
    plan: "Essential",
    statusText: "Active + 112 days",
    status: "active", // 'active' | 'deactivated'
    name: "KALCROSS",
    class: "Embasship",
    nextDelivery: "Apr 24",
    term: "Monthly",
    address: "123 Haler Avenue, Innovation District\nSeoul, South Korea 06000",
    payment: "VISA •••• 4242",
    price: "$63.00",
    flavors: [
      { name: "nectar1", qty: 2 },
      { name: "base", qty: 1 }
    ]
  });

  const [selectedPlanId, setSelectedPlanId] = useState(subscription.plan);

  useEffect(() => {
    if (status === 'open') {
      controls.start("open");
    } else if (status === 'peek') {
      controls.start("peek");
      setInlineView('none');
    } else {
      controls.start("hidden");
    }
  }, [status, controls]);

  const toggleInlineView = (view: InlineView) => {
    setInlineView(prev => prev === view ? 'none' : view);
  };

  const onDragEnd = (event: any, info: any) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity < -500 || offset < -200) {
      if (status === 'peek') openBoardingPass();
    } else if (velocity > 500 || offset > 200) {
      if (status === 'open') closeBoardingPass();
    }
  };

  const yOffset = useMemo(() => {
    if (status !== 'open') return 0;
    if (inlineView === 'modify') {
        const planToUse = selectedPlanId || subscription.plan;
        switch(planToUse) {
            case 'Light': return -120;
            case 'Essential': return -200;
            case 'Daily': return -380;
            default: return -200;
        }
    }
    if (inlineView === 'skipStop') return -80;
    return 0;
  }, [status, inlineView, subscription.plan, selectedPlanId]);

  if (status === 'hidden') return null;

  return (
    <>
      <AnimatePresence>
        {status === 'open' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBoardingPass}
            className="fixed inset-0 bg-pocari-blue/[0.12] backdrop-blur-[40px] saturate-[200%] contrast-[110%] shadow-[0_40px_100px_rgba(28,136,255,0.2)] z-[10000]"
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-0 z-[10001] pointer-events-none flex justify-center ${status === 'peek' ? 'items-end' : 'items-center'}`}>
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={onDragEnd}
          animate={{
              ...(status === 'open' ? { y: yOffset, opacity: 1 } : {}),
              ...(status === 'peek' ? { y: "calc(100% - 100px)", opacity: 1 } : {}),
              ...((status as string) === 'hidden' ? { y: "100%", opacity: 0 } : {})
          }}
          transition={{ type: "spring", damping: 32, stiffness: 280 }}
          className="w-full max-w-[500px] pointer-events-auto cursor-grab active:cursor-grabbing px-4 md:px-0"
        >
          <div 
            className="flex flex-col items-center relative"
            onClick={status === 'peek' ? openBoardingPass : undefined}
          >
              <LayoutGroup>
                <motion.div 
                    layout
                    transition={{ type: "spring", damping: 28, stiffness: 220 }}
                    className={`w-full h-auto overflow-hidden rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] bg-white ${status === 'peek' ? 'cursor-pointer' : ''}`}
                >
                    <MainTicketView 
                      subscription={subscription} 
                      inlineView={inlineView}
                      toggleInlineView={toggleInlineView}
                      setSubscription={setSubscription}
                      selectedPlanId={selectedPlanId}
                      setSelectedPlanId={setSelectedPlanId}
                    />
                </motion.div>
              </LayoutGroup>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function MainTicketView({ 
  subscription, 
  inlineView, 
  toggleInlineView, 
  setSubscription,
  selectedPlanId,
  setSelectedPlanId
}: any) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [isSkipProcessing, setIsSkipProcessing] = useState(false);
  const [isStopProcessing, setIsStopProcessing] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showSkipCheck, setShowSkipCheck] = useState(false);
  const [showStopCheck, setShowStopCheck] = useState(false);
  const [showRestartCheck, setShowRestartCheck] = useState(false);
  const [showModifyCheck, setShowModifyCheck] = useState(false);

  const plans = useMemo(() => [
    { id: 'Light', count: 2, price: 39 }, 
    { id: 'Essential', count: 3, price: 49 }, 
    { id: 'Daily', count: 6, price: 79 }
  ], []);

  const [isAddressRevealed, setIsAddressRevealed] = useState(false);
  const [authState, setAuthState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [tempSlots, setTempSlots] = useState<any[]>([]);

  useEffect(() => {
    if (inlineView === 'modify') {
      const flatSlots: any[] = [];
      subscription.flavors.forEach((f: any) => {
        const theme = Object.keys(FLAVOR_DATA).find(t => FLAVOR_DATA[t].includes(f.name)) || "Nectar";
        for (let i = 0; i < f.qty; i++) flatSlots.push({ theme, flavor: f.name });
      });
      const planCount = plans.find(p => p.id === selectedPlanId)?.count || 0;
      while (flatSlots.length < planCount) flatSlots.push({ theme: "Nectar", flavor: "nectar1" });
      setTempSlots(flatSlots.slice(0, planCount));
    }
  }, [inlineView, subscription.flavors, selectedPlanId, plans]);

  const updateSlot = (index: number, key: 'theme' | 'flavor', value: string) => {
    setTempSlots(prev => {
        const next = [...prev];
        if (key === 'theme') {
            next[index] = { theme: value, flavor: FLAVOR_DATA[value][0] };
        } else {
            next[index] = { ...next[index], flavor: value };
        }
        return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const aggregated: Record<string, number> = {};
    tempSlots.forEach(s => aggregated[s.flavor] = (aggregated[s.flavor] || 0) + 1);
    const nextFlavors = Object.entries(aggregated).map(([name, qty]) => ({ name, qty }));
    const nextConfig = { planId: selectedPlanId, flavors: nextFlavors };
    const response = await subscriptionService.updateSubscription(nextConfig);

    if (response.success) {
      setIsSaving(false);
      setIsSuccess(true);
      
      setTimeout(() => { 
        setIsSuccess(false); 
        toggleInlineView('none'); 
        
        // Trigger cinematic feedback on the dashboard
        setTimeout(() => {
          setSubscription((prev: any) => ({ ...prev, plan: selectedPlanId, flavors: nextFlavors }));
          setShowModifyCheck(true);
          setTimeout(() => setShowModifyCheck(false), 2500);
        }, 400);
      }, 800);
    }
  };

  const handleSkip = async () => {
    setIsSkipProcessing(true);
    const response = await subscriptionService.skipSubscription("May 24");
    if (response.success) {
        setIsSkipProcessing(false);
        toggleInlineView('none');
        setTimeout(() => {
          setSubscription((prev: any) => ({ ...prev, nextDelivery: "May 24" }));
          setShowSkipCheck(true);
          setTimeout(() => setShowSkipCheck(false), 2500);
        }, 400);
    }
  };

  const handleStop = async () => {
    setIsStopProcessing(true);
    const response = await subscriptionService.cancelSubscription();
    if (response.success) {
        setIsStopProcessing(false);
        toggleInlineView('none');
        setTimeout(() => {
          setSubscription((prev: any) => ({ 
            ...prev, 
            status: "deactivated", 
            statusText: "Deactivated" 
          }));
          setShowStopCheck(true);
          setTimeout(() => setShowStopCheck(false), 2500);
        }, 400);
    }
  };

  const handleRestart = async () => {
    setIsRestarting(true);
    const response = await subscriptionService.restartSubscription();
    if (response.success) {
        setIsRestarting(false);
        setSubscription((prev: any) => ({ 
            ...prev, 
            status: "active", 
            statusText: "Active + 112 days" 
        }));
        setShowRestartCheck(true);
        setTimeout(() => setShowRestartCheck(false), 2500);
    }
  };

  const triggerFaceID = () => {
    setAuthState('scanning');
    setTimeout(() => {
        setAuthState('success');
        setTimeout(() => {
            setIsAddressRevealed(true);
            setAuthState('idle');
        }, 800);
    }, 1800);
  };

  const isDeactivated = subscription.status === 'deactivated';

  const springTransition = { type: "spring", damping: 30, stiffness: 250 };

  return (
    <motion.div 
      layout 
      transition={springTransition}
      animate={{
        filter: isDeactivated ? "grayscale(0.1) opacity(0.9)" : "grayscale(0) opacity(1)",
      }}
      className="flex flex-col"
    >
      {/* ... (Previous code remains the same until Footer Actions) ... */}
      {/* TICKET HEADER */}
      <motion.div layout className="p-10 pb-8 relative overflow-hidden">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4 relative">
              <motion.span 
                layout
                key={subscription.plan}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0, color: isDeactivated ? "#0f172a" : "#1C88FF" }}
                className="text-3xl font-bold tracking-tight"
              >
                {subscription.plan}
              </motion.span>
              <div className="w-5 h-5 relative flex items-center">
                  <AnimatePresence>
                    {showModifyCheck && (
                        <div className="absolute left-0">
                            <FeedbackCheck />
                        </div>
                    )}
                  </AnimatePresence>
              </div>
          </div>
          <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <AnimatePresence>
                    {(showStopCheck || showRestartCheck) && (
                        <div className="absolute right-full mr-3">
                            <FeedbackCheck />
                        </div>
                    )}
                </AnimatePresence>
              </div>
              <motion.div 
                layout
                key={subscription.statusText}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    backgroundColor: subscription.status === 'active' ? '#1C88FF' : '#000000',
                }}
                className="text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
              >
                {subscription.statusText}
              </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div layout className="mx-10 h-[1px] bg-slate-100/60" />

      {/* CURRENT/RECENT CONFIG */}
      <motion.div layout className="p-10 py-7">
        <div className="flex justify-between items-center mb-5">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-[#1C88FF]" />
                {isDeactivated ? "Recent Configuration" : "Current Configuration"}
            </p>
            <div className="relative w-5 h-5 flex items-center justify-center">
                <AnimatePresence>
                    {showModifyCheck && (
                        <div className="absolute right-0">
                            <FeedbackCheck />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
        <div className="space-y-4 mb-2">
          {subscription.flavors.map((f: any, i: number) => (
             <motion.div layout key={`${i}-${f.name}-${f.qty}`} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
               <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-slate-700">{f.name}</span>
               </div>
               <motion.span 
                 key={f.qty}
                 initial={{ opacity: 0, y: 3 }}
                 animate={{ 
                   opacity: 1, 
                   y: 0,
                   color: isDeactivated ? "#0f172a" : "#1C88FF"
                 }}
                 className="text-xs font-bold font-outfit"
               >
                 {f.qty} Box
               </motion.span>
             </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div layout className="mx-10 h-[1px] bg-slate-100/60" />

      {/* DELIVERY GRID */}
      <motion.div layout className="p-10 py-7">
        <div className="grid grid-cols-2 gap-10 mb-8">
            <div className="relative">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
                    {isDeactivated ? "Last Delivery" : "Next Delivery"}
                </p>
                <div className="flex items-center gap-3 h-8">
                    <motion.p 
                      key={subscription.nextDelivery} 
                      initial={{ y: 5, opacity: 0 }} 
                      animate={{ 
                        y: 0, 
                        opacity: 1,
                        color: isDeactivated ? "#0f172a" : "#1C88FF"
                      }} 
                      className="text-2xl font-bold font-outfit"
                    >
                        {subscription.nextDelivery}
                    </motion.p>
                    <div className="relative w-5 h-5 flex items-center">
                        <AnimatePresence>
                            {showSkipCheck && (
                                <div className="absolute left-0">
                                    <FeedbackCheck />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Delivery Term</p>
                <div className="flex items-center h-8">
                    <motion.p 
                        layout
                        key={subscription.term}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0, color: isDeactivated ? "#0f172a" : "#1C88FF" }}
                        className="text-2xl font-bold font-outfit"
                    >
                        {subscription.term}
                    </motion.p>
                </div>
            </div>
        </div>
        
        <div className="pt-2">
            <div className="flex justify-between items-center mb-3 h-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Delivery Address</p>
                <AnimatePresence>
                  {isAddressRevealed && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-[#1C88FF] text-white px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase shadow-sm">Verified</motion.div>
                  )}
                </AnimatePresence>
            </div>
            <div className="relative min-h-[40px] flex items-center">
                <AnimatePresence mode="wait">
                    {!isAddressRevealed ? (
                        <motion.div key="masked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative">
                            <p className="text-sm text-slate-400/40 font-light blur-[8px] select-none pointer-events-none line-clamp-2">{subscription.address}</p>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {authState === 'idle' && (
                                    <button onClick={triggerFaceID} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"><Scan className="w-3.5 h-3.5" />Face ID to see</button>
                                )}
                                {authState === 'scanning' && (
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 flex items-center justify-center">
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-slate-200 border-t-[#1C88FF] rounded-lg" />
                                            <Scan className="w-4 h-4 text-[#1C88FF]" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Authenticating...</span>
                                    </div>
                                )}
                                {authState === 'success' && (
                                    <div className="flex items-center gap-3">
                                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-8 h-8 bg-[#1C88FF] rounded-lg flex items-center justify-center"><Check className="w-4 h-4 text-white" /></motion.div>
                                        <span className="text-[10px] font-bold text-[#1C88FF] uppercase tracking-widest">Verified</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.p key="revealed" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="text-sm text-slate-600 font-light leading-relaxed">{subscription.address}</motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </motion.div>

      <motion.div layout className="mx-10 h-[1px] bg-slate-100/60" />

      {/* ACTIONS FOOTER */}
      <motion.div layout className="p-10 pt-8 rounded-b-[40px] overflow-hidden">
        <motion.div layout className="space-y-4">
          <motion.button 
            layout="position" 
            onClick={isDeactivated ? handleRestart : () => toggleInlineView('modify')} 
            className={`w-full h-14 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 ${
                isDeactivated 
                    ? 'bg-[#1C88FF] text-white hover:bg-blue-600' 
                    : inlineView === 'modify' 
                        ? 'bg-slate-100 text-slate-900 shadow-none' 
                        : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {isRestarting ? (
                <><Loader2 className="w-5 h-5 animate-spin" />Restarting...</>
            ) : isDeactivated ? (
                <><RotateCcw className="w-5 h-5" />Restart your plan</>
            ) : inlineView === 'modify' ? (
                'Close Options'
            ) : (
                'Modify Subscription'
            )}
          </motion.button>
          
          <AnimatePresence mode="popLayout">
            {/* SECONDARY BUTTONS */}
            {!isDeactivated && inlineView !== 'modify' && (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="grid grid-cols-2 gap-3"
                >
                    <motion.button 
                      layout 
                      onClick={() => toggleInlineView('skipStop')} 
                      className={`h-14 rounded-2xl font-semibold text-sm border ${inlineView === 'skipStop' ? 'bg-slate-100 text-slate-900 border-transparent shadow-none' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      Skip or Stop
                    </motion.button>
                    <motion.button 
                      layout 
                      onClick={() => toggleInlineView('orderMore')} 
                      className={`h-14 rounded-2xl font-semibold text-sm shadow-lg ${inlineView === 'orderMore' ? 'bg-slate-900 text-white' : 'bg-[#1C88FF] text-white'}`}
                    >
                      Order more
                    </motion.button>
                </motion.div>
            )}

            {/* MODIFY VIEW */}
            {inlineView === 'modify' && (
              <motion.div 
                key="modify" 
                layout 
                transition={springTransition}
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="pt-4 space-y-8"
              >
                <motion.section layout transition={springTransition}>
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-4">Subscription Plan</label>
                  <div className="grid grid-cols-3 gap-3">
                    {plans.map(p => (
                      <motion.button layout transition={springTransition} key={p.id} onClick={() => setSelectedPlanId(p.id)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedPlanId === p.id ? 'border-[#1C88FF] bg-[#1C88FF] text-white shadow-lg shadow-blue-200' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                        <span className="text-[8px] uppercase tracking-widest mb-1">{p.count} Boxes</span>
                        <span className="text-md font-bold mb-1">{p.id}</span>
                        <span className="text-lg font-bold">${p.price}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.section>

                <motion.section layout transition={springTransition}>
                  <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-4">Flavor Selection Slots</label>
                  <div className="space-y-4">
                    {tempSlots.map((slot, index) => (
                      <motion.div layout transition={springTransition} key={index} className="grid grid-cols-2 gap-3 p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner">
                        <FancySelect 
                          value={slot.theme} 
                          options={Object.keys(FLAVOR_DATA)} 
                          onChange={(val: string) => updateSlot(index, 'theme', val)}
                        />
                        <FancySelect 
                          variant="blue"
                          value={slot.flavor} 
                          options={FLAVOR_DATA[slot.theme]} 
                          onChange={(val: string) => updateSlot(index, 'flavor', val)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                <motion.div layout transition={springTransition} className="mx-0 h-[1px] bg-slate-100/60" />
                <motion.button layout transition={springTransition} onClick={() => subscriptionService.redirectToPortal()} className="w-full h-14 bg-[#4ADE80] text-white rounded-2xl font-bold text-sm shadow-[0_8px_20px_rgba(74,222,128,0.25)] hover:bg-[#3ecb70] flex items-center justify-center gap-2"><CreditCard className="w-4 h-4 text-white/90" />Change shipping & payment</motion.button>
                <motion.button layout transition={springTransition} disabled={isSaving} className={`w-full h-14 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 ${isSaving || isSuccess ? 'bg-[#1C88FF]/90 text-white' : 'bg-[#1C88FF] text-white hover:bg-blue-600'}`} onClick={handleSave}>
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" />Syncing...</> : isSuccess ? <><Check className="w-5 h-5" />Updated</> : "Save Changes"}
                </motion.button>
              </motion.div>
            )}

            {/* SKIP STOP VIEW */}
            {inlineView === 'skipStop' && (
              <motion.div 
                key="skip" 
                layout 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="pt-4 overflow-hidden"
              >
                <motion.div layout className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Clock className="w-6 h-6 text-slate-400" /></div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Slow down is also good.</h2>
                  <p className="text-sm text-slate-500 font-light mb-6 leading-relaxed">If you skip, your next delivery will be <br/> <span className="font-bold text-[#1C88FF]">May 24, 2026</span>.</p>
                  <div className="w-full space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                          <motion.button layout disabled={isSkipProcessing || isStopProcessing} onClick={handleSkip} className="h-12 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2">{isSkipProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Skip'}</motion.button>
                          <motion.button layout disabled={isSkipProcessing || isStopProcessing} onClick={handleStop} className="h-12 bg-[#FF4B4B] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2">{isStopProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Stop Plan'}</motion.button>
                      </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ORDER MORE VIEW */}
            {inlineView === 'orderMore' && (
               <motion.div 
                key="order" 
                layout 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="pt-4 overflow-hidden"
               >
                 <motion.div layout className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4"><Sparkles className="w-6 h-6 text-[#1C88FF]" /></div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Double chance!</h2>
                  <p className="text-sm text-slate-500 font-light mb-6 leading-relaxed">Order more items at the <span className="font-bold text-[#1C88FF]">same fixed price</span>.</p>
                  <motion.button 
                    layout 
                    transition={springTransition} 
                    onClick={() => subscriptionService.redirectToStore()} 
                    className="w-full h-14 bg-[#1C88FF] text-white rounded-xl font-bold text-lg shadow-md"
                  >
                    Order Same Options
                  </motion.button>
                 </motion.div>
               </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
