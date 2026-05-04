"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  Truck,
  Tag,
  Star,
  RefreshCw,
  Coins,
  Crown,
} from "lucide-react";
import { benefitPills, plans, themes, getPlanLimit } from "@/app/pass/passData";
import { useRouter } from "next/navigation";
import { useVeil } from "@/context/VeilContext";
import { useUI } from "@/context/UIContext";

export default function PassMobile() {
  const router = useRouter();
  const { startTransition } = useVeil();
  const [selectedPlanId, setSelectedPlanId] = useState("essential");
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];
  const flavorScrollRef = React.useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const resetColor = useTransform(dragX, [-5, 0], ["#1C88FF", "#9CA3AF"]);
  const checkoutColor = useTransform(dragX, [0, 5], ["#9CA3AF", "#1C88FF"]);

  // Haptic Feedback Helper
  const triggerHaptic = (intensity = 10) => {
    if (
      typeof window !== "undefined" &&
      window.navigator &&
      window.navigator.vibrate
    ) {
      window.navigator.vibrate(intensity);
    }
  };

  // Step 2 States
  const [isStep2Open, setIsStep2Open] = useState(false);
  const [activeTheme, setActiveTheme] = useState(0);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [scale, setScale] = useState(1);

  // Handle Dynamic Scaling for small screens
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < 740) {
        setScale(window.innerHeight / 780);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset scroll when theme changes
  React.useEffect(() => {
    if (flavorScrollRef.current) {
      flavorScrollRef.current.scrollLeft = 0;
    }
  }, [activeTheme]);

  React.useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  const [selectedBenefit, setSelectedBenefit] = React.useState<
    (typeof benefitPills)[0] | null
  >(null);

  const benefitDetails: Record<string, string> = {
    "Pause anytime":
      "Your routine, your rules. Pause or resume your plan anytime.",
    "Free shipping":
      "Haler covers all costs. Free delivery to your doorstep, every time.",
    "Save up to 34%":
      "Choose a plan and save up to 34% compared to one-time purchases.",
    "Exclusive Gift":
      "Special perks for members. Exclusive seasonal gifts and welcome kits.",
  };

  const handleAddToCart = (flavorId: string) => {
    const total = Object.values(cart).reduce((sum, q) => sum + q, 0);
    const limit = getPlanLimit(selectedPlanId);
    if (total >= limit) return;
    triggerHaptic(10);
    setCart((prev) => ({ ...prev, [flavorId]: (prev[flavorId] || 0) + 1 }));
  };

  const handleRemoveFromCart = (flavorId: string) => {
    triggerHaptic(10);
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[flavorId] > 1) newCart[flavorId]--;
      else delete newCart[flavorId];
      return newCart;
    });
  };

  const { setNavHidden, setNavLocked } = useUI();
  
  // Force hide and LOCK Navbar when Step 2 is open
  useEffect(() => {
    if (isStep2Open) {
      setNavLocked(true);
      setNavHidden(true);
    } else {
      setNavLocked(false);
      // Note: We NO LONGER force setNavHidden(false) here. 
      // The Navbar will stay hidden until the user performs a real scroll gesture.
    }
  }, [isStep2Open, setNavHidden, setNavLocked]);

  return (
    <div
      data-theme="light"
      className="md:hidden relative bg-[#F8FAFF] overflow-hidden flex flex-col"
      style={{ height: "100dvh" }}
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-20%] w-[120%] h-[60%] bg-[radial-gradient(circle,rgba(28,136,255,0.08)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[120%] h-[60%] bg-[radial-gradient(circle,rgba(0,212,255,0.06)_0%,transparent_70%)] blur-[80px]" />
      </div>

      <div 
        className="relative z-10 flex flex-col flex-1 justify-center px-6"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* --- HEADER --- */}
        <header className="text-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-[42px] tracking-[-0.05em] text-gray-900 leading-none font-outfit whitespace-nowrap"
          >
            <span className="font-normal">Make your </span>
            <span className="font-extrabold text-[#1C88FF]">routine</span>
          </motion.h1>
        </header>

        {/* --- CONSOLIDATED BENEFIT PILL --- */}
        <div className="mb-6">
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedBenefit(benefitPills[0])} // Using the first one for logic
            initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-between px-5 py-3.5 bg-white border border-gray-100/60 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] cursor-pointer active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-[15px] font-light text-gray-700 tracking-tight">
                Pause anytime & Get exclusive benefits!
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#1C88FF]/10 flex items-center justify-center text-[#1C88FF]">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>

        {/* --- PLAN SWITCHER (ROUNDED SQUARE TOGGLE) --- */}
        <div className="relative mb-4 px-0.5">
          <div className="bg-white/60 backdrop-blur-2xl p-1.5 rounded-[28px] border border-white/80 flex items-center relative shadow-[0_8px_32px_rgba(0,0,0,0.03)] h-24">
            {/* Sliding Background Indicator */}
            <div className="flex-1 grid grid-cols-3 relative z-10 h-full">
              {plans.map((plan) => {
                const isActive = selectedPlanId === plan.id;
                const xemsCount = plan.features[0].text.split(" ")[0];
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className="h-full flex flex-col items-center justify-center transition-colors duration-300 text-center"
                  >
                    <motion.span
                      className={`text-[24px] font-extrabold leading-none tracking-tighter ${isActive ? "text-white" : "text-gray-500"}`}
                    >
                      {xemsCount}
                    </motion.span>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? "text-white/70" : "text-gray-400"}`}
                    >
                      xems
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selection Indicator Overlay */}
            <div className="absolute inset-1.5 grid grid-cols-3 pointer-events-none">
              {plans.map((plan, idx) => (
                <div key={plan.id} className="relative h-full w-full">
                  {selectedPlanId === plan.id && (
                    <motion.div
                      layoutId="activePlan"
                      className="absolute inset-0 bg-[#1C88FF] rounded-[22px] shadow-[0_8px_20px_rgba(28,136,255,0.25)]"
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- PLAN CONTENT CARD --- */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={selectedPlanId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              className="bg-white/80 backdrop-blur-3xl rounded-[40px] px-10 pt-7 pb-5 border border-white shadow-[0_32px_80px_rgba(28,136,255,0.18)] relative flex flex-col touch-none w-full h-[330px]"
            >
              <div className="flex flex-col h-full">
                {/* Header: Fixed Height (60px) */}
                <div className="flex justify-between items-start h-[60px] pt-1 px-1">
                  <h2 className="text-[34px] font-bold text-gray-900 tracking-tighter leading-none">
                    {selectedPlan.title}
                  </h2>
                  <div className="flex items-start gap-1">
                    <span className="text-sm font-bold text-[#1C88FF]">$</span>
                    <span className="text-[34px] font-bold tracking-tighter text-[#1C88FF] leading-none">
                      {selectedPlan.price}
                    </span>
                  </div>
                </div>

                {/* Features Area: Fixed Height (170px) */}
                <div className="h-[170px] flex flex-col justify-center pr-1 relative -top-2">
                  {/* First Feature */}
                  <div className="mb-3 flex items-center gap-2.5 h-[24px]">
                    <div className="w-5 h-5 rounded-full bg-[#1C88FF]/10 flex items-center justify-center text-[#1C88FF]">
                      {React.cloneElement(
                        selectedPlan.features[0].icon as React.ReactElement,
                        { className: "w-2.5 h-2.5" },
                      )}
                    </div>
                    <span className="text-[14px] font-light text-gray-900 tracking-tight leading-none">
                      {selectedPlan.features[0].text}
                    </span>
                  </div>

                  {/* Remaining Features */}
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-3 content-start pointer-events-none">
                    {selectedPlan.features.slice(1).map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className="flex items-center gap-2.5 text-gray-500 h-[20px]"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#1C88FF]/10 flex items-center justify-center text-[#1C88FF] flex-shrink-0">
                          {React.cloneElement(
                            feature.icon as React.ReactElement,
                            { className: "w-2.5 h-2.5" },
                          )}
                        </div>
                        <span className="text-[14px] font-light text-gray-700 tracking-tight leading-tight">
                          {feature.text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Footer Area: Fixed Height (100px) */}
                <div className="h-[100px] flex flex-col items-center justify-end pb-2">
                  <span className="text-[13px] text-[#1C88FF] font-semibold mb-4 leading-none">
                    Billed monthly, but pause anytime!
                  </span>
                  <div className="w-[calc(100%+2rem)] mx-[-1rem] h-[52px]">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsStep2Open(true);
                      }}
                      className="w-full bg-[#1C88FF] text-white h-full rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(28,136,255,0.25)]"
                    >
                      <span className="text-[18px] font-bold tracking-tight">
                        {selectedPlan.id === "essential"
                          ? "It's most popular!"
                          : selectedPlan.id === "daily"
                            ? "It's best value!"
                            : "Get started now!"}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- CURATION STUDIO MODAL (STEP 2) --- */}
        <AnimatePresence>
          {isStep2Open && (
            <motion.div
              key="studio-modal"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                const swipeY = info.offset.y + info.velocity.y * 0.2;
                if (swipeY > 60) {
                  triggerHaptic(15);
                  setIsStep2Open(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-x-0 bottom-0 top-0 z-[500] flex flex-col rounded-t-[40px] ${activeTheme === 5 ? "bg-white" : "bg-[#F8FAFC]"}`}
              data-nav-visible="false"
            >
                {/* --- DYNAMIC SCALING WRAPPER --- */}
                <div className="relative flex-1 flex flex-col h-full rounded-t-[40px]">
                  <div
                    className="flex-1 flex flex-col h-full origin-top transition-transform duration-300"
                    style={{
                      transform: scale < 1 ? `scale(${scale})` : "none",
                      height: scale < 1 ? `${(1 / scale) * 100}%` : "100%",
                      width: "100%",
                    }}
                  >
                    {/* --- MODAL CONTENT --- */}
                    {(() => {
                      const total = Object.values(cart).reduce(
                        (a, b) => a + b,
                        0,
                      );
                      const limit = getPlanLimit(selectedPlanId) || 3;
                      const isFull = total >= limit;

                      return (
                        <div className="relative flex flex-col h-full">
                          {/* Header */}
                          <div 
                            className="absolute top-0 inset-x-0 z-[999] flex items-start justify-between px-6 pb-10 pointer-events-none"
                            style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)' }}
                          >
                            <motion.div
                              animate={{ opacity: activeTheme === 5 ? 0 : 1 }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                              className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent z-[-1]"
                            />
                            <div className="pointer-events-auto">
                              <motion.h3
                                animate={{
                                  color:
                                    activeTheme === 5 ? "#000000" : "#FFFFFF",
                                }}
                                transition={{
                                  duration: 0.5,
                                  ease: "easeInOut",
                                }}
                                className="text-2xl font-bold tracking-tight font-outfit"
                              >
                                Curation Studio
                              </motion.h3>
                              <motion.p
                                animate={{
                                  color:
                                    activeTheme === 5
                                      ? "rgba(0,0,0,0.6)"
                                      : "rgba(255,255,255,0.6)",
                                }}
                                transition={{
                                  duration: 0.5,
                                  ease: "easeInOut",
                                }}
                                className="text-[11px] font-light"
                              >
                                Customizing your {selectedPlan.title} plan
                              </motion.p>
                            </div>
                            <motion.button
                              onClick={() => setIsStep2Open(false)}
                              animate={{
                                backgroundColor:
                                  activeTheme === 5
                                    ? "rgba(0,0,0,0.05)"
                                    : "rgba(255,255,255,0.1)",
                                borderColor:
                                  activeTheme === 5
                                    ? "rgba(0,0,0,0.1)"
                                    : "rgba(255,255,255,0.1)",
                                color:
                                  activeTheme === 5
                                    ? "rgba(0,0,0,0.8)"
                                    : "rgba(255,255,255,0.8)",
                              }}
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                              className="pointer-events-auto w-10 h-10 rounded-full backdrop-blur-xl border flex items-center justify-center active:scale-90 transition-transform"
                            >
                              <ChevronDown className="w-5 h-5" />
                            </motion.button>
                          </div>

                          {/* Cinematic Stage */}
                          <motion.div
                            animate={{
                              height: activeTheme === 5 ? "0px" : "50vh",
                            }}
                            transition={{
                              duration: 0.8,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="relative w-full flex-shrink-0 overflow-hidden bg-black rounded-t-[40px]"
                          >
                            <div className="absolute inset-0">
                              {themes.map((theme, idx) => {
                                // Only render theme videos (exclude index 5 if it's special, but here we cover all valid themes)
                                if (idx === 5) return null;
                                const isActive =
                                  activeTheme === idx ||
                                  (activeTheme === 5 && idx === 0);

                                return (
                                  <motion.div
                                    key={idx}
                                    initial={false}
                                    animate={{
                                      opacity: isActive ? 1 : 0,
                                      scale: isActive ? 1.1 : 1.15,
                                    }}
                                    transition={{
                                      duration: 0.8,
                                      ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 w-full h-full"
                                  >
                                    {theme.video && (
                                      <video
                                        loop
                                        muted
                                        playsInline
                                        preload="auto"
                                        className="w-full h-full object-cover"
                                        ref={(el) => {
                                          if (el) {
                                            if (isActive) {
                                              el.play().catch(() => {});
                                            } else {
                                              el.pause();
                                            }
                                          }
                                        }}
                                      >
                                        <source
                                          src={theme.video}
                                          type="video/mp4"
                                        />
                                      </video>
                                    )}
                                    <div className="absolute inset-0 bg-black/30" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Formula & Parameters Overlay */}
                            <div className="absolute inset-x-6 bottom-10 z-10 pointer-events-none">
                              <motion.div
                                animate={{
                                  opacity: activeTheme === 5 ? 0 : 1,
                                  y: activeTheme === 5 ? -20 : 0,
                                }}
                                transition={{ duration: 0.3 }}
                                className="space-y-7"
                              >
                                {activeTheme !== 5 && (
                                  <>
                                    <AnimatePresence mode="wait">
                                      <motion.div
                                        key={activeTheme}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col gap-1"
                                      >
                                        <h2 className="text-[38px] font-bold text-white lowercase leading-none font-outfit tracking-tighter">
                                          {themes[activeTheme].name}
                                        </h2>
                                        <p className="text-white/50 text-[12px] font-light max-w-[90%] leading-relaxed">
                                          {
                                            themes[
                                              activeTheme
                                            ].description.split("\n")[0]
                                          }
                                        </p>
                                      </motion.div>
                                    </AnimatePresence>

                                    <div className="grid grid-cols-2 gap-x-10">
                                      <div className="space-y-4">
                                        <span className="text-[8px] text-white/40 uppercase tracking-[0.25em] font-bold">
                                          Formula Composition
                                        </span>
                                        <div className="space-y-3">
                                          {themes[activeTheme].formula.map(
                                            (f, i) => (
                                              <div
                                                key={i}
                                                className="flex flex-col gap-1.5"
                                              >
                                                <div className="flex justify-between items-end text-[10px] text-white/70">
                                                  <span className="font-light">
                                                    {f.name}
                                                  </span>
                                                  <span className="font-mono text-[9px] opacity-80">
                                                    {f.value}
                                                  </span>
                                                </div>
                                                <div className="h-[1px] w-full bg-white/10 rounded-full overflow-hidden">
                                                  <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: f.p }}
                                                    transition={{
                                                      type: "spring",
                                                      stiffness: 120,
                                                      damping: 20,
                                                    }}
                                                    className="h-full bg-white/40"
                                                  />
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <span className="text-[8px] text-white/40 uppercase tracking-[0.25em] font-bold">
                                          Flavor Parameters
                                        </span>
                                        <div className="space-y-3">
                                          {themes[activeTheme].parameters.map(
                                            (p, i) => (
                                              <div
                                                key={i}
                                                className="flex flex-col gap-1.5"
                                              >
                                                <div className="flex justify-between items-end text-[9px] text-white/40 font-medium">
                                                  <span>{p.minLabel}</span>
                                                  <span className="text-white/80">
                                                    {p.maxLabel}
                                                  </span>
                                                </div>
                                                <div className="h-[1px] w-full bg-white/10 rounded-full overflow-hidden relative">
                                                  <motion.div
                                                    initial={{
                                                      left: "50%",
                                                      width: 0,
                                                    }}
                                                    animate={{
                                                      left:
                                                        p.value > 50
                                                          ? "50%"
                                                          : `${p.value}%`,
                                                      width: `${Math.abs(p.value - 50)}%`,
                                                    }}
                                                    transition={{
                                                      type: "spring",
                                                      stiffness: 120,
                                                      damping: 20,
                                                    }}
                                                    className="absolute h-full bg-[#1C88FF]/60"
                                                  />
                                                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20" />
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </motion.div>
                            </div>
                          </motion.div>

                          {/* Theme & Flavor Selection Section */}
                          <div className="relative z-20 flex-1 flex flex-col min-h-0 bg-[#F8FAFC] shadow-[0_-20px_50px_rgba(0,0,0,0.25)]">
                            {/* Dynamic Spacer for Show All Header Safe Area */}
                            <motion.div
                              initial={false}
                              animate={{
                                height: activeTheme === 5 ? "128px" : "0px",
                                opacity: activeTheme === 5 ? 1 : 0,
                              }}
                              transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className="flex-none w-full pointer-events-none"
                            />
                            {/* Theme Selector */}
                            <div className="flex-none pt-4 pb-2 px-6 overflow-x-auto scrollbar-hide">
                              <div className="flex gap-2 min-w-max">
                                {themes.map((theme, i) => (
                                  <button
                                    key={theme.id}
                                    onClick={() => {
                                      triggerHaptic(10);
                                      setActiveTheme(i);
                                    }}
                                    className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-500 ease-in-out ${activeTheme === i ? "bg-gray-900 text-white shadow-lg" : "bg-white border border-gray-100 text-gray-400"}`}
                                  >
                                    {theme.name}
                                  </button>
                                ))}
                                <button
                                  onClick={() => {
                                    triggerHaptic(10);
                                    setActiveTheme(5);
                                  }}
                                  className={`px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-500 ease-in-out ${activeTheme === 5 ? "bg-[#1C88FF] text-white shadow-lg" : "bg-white border border-gray-100 text-gray-400"}`}
                                >
                                  Show All
                                </button>
                              </div>
                            </div>

                            {/* Flavor Selection Grid/List */}
                            <div
                              ref={flavorScrollRef}
                              onPointerDown={(e) => {
                                if (activeTheme === 5) e.stopPropagation();
                              }}
                              className={`flex-1 ${activeTheme === 5 ? "overflow-y-auto px-6 pb-[165px]" : "overflow-x-auto px-6 pb-[165px] pt-2 scrollbar-hide snap-x snap-mandatory"}`}
                            >
                              <AnimatePresence mode="wait">
                                {activeTheme === 5 ? (
                                    <motion.div
                                      key="grid-view"
                                      initial={{ opacity: 0, filter: "blur(12px)" }}
                                      animate={{ opacity: 1, filter: "blur(0px)" }}
                                      exit={{ 
                                        opacity: 0, 
                                        filter: "blur(12px)",
                                        transition: { duration: 0.3 }
                                      }}
                                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className="grid grid-cols-2 gap-4 pb-[165px] w-full will-change-[filter,opacity]"
                                  >
                                    {themes.flatMap((t) => t.flavors).map((flavor, i) => {
                                      const count = cart[flavor.id] || 0;
                                      return (
                                        <motion.div
                                          key={`${flavor.id}-${i}`}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() =>
                                            handleAddToCart(flavor.id)
                                          }
                                          className={`relative w-full aspect-square rounded-[24px] overflow-hidden border-4 transition-all will-change-transform ${count > 0 ? "border-[#1C88FF] shadow-lg shadow-blue-100" : "border-transparent shadow-md"}`}
                                        >
                                          <img
                                            src={flavor.image}
                                            decoding="async"
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover"
                                            alt={flavor.name}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/80" />
                                          <div className="absolute bottom-3 left-4 right-4">
                                            <h4 className="text-sm font-bold text-white mb-0.5">{flavor.name}</h4>
                                            <span className="text-[10px] text-white/50 uppercase tracking-wider font-light">{flavor.tag}</span>
                                          </div>
                                          {count > 0 && (
                                            <motion.div
                                              initial={{ scale: 0.5, opacity: 0 }}
                                              animate={{ scale: 1, opacity: 1 }}
                                              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#1C88FF] text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white/20"
                                            >
                                              {count}
                                            </motion.div>
                                          )}
                                        </motion.div>
                                      );
                                    })}
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key={activeTheme}
                                    initial={{ opacity: 0, filter: "blur(12px)" }}
                                    animate={{ opacity: 1, filter: "blur(0px)" }}
                                    exit={{ 
                                      opacity: 0, 
                                      filter: "blur(12px)",
                                      transition: { duration: 0.3 }
                                    }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ containerType: "size" }}
                                    className="flex gap-4 min-w-max pr-6 will-change-[filter,opacity] h-full items-center"
                                  >
                                    {(themes[activeTheme].flavors || []).map((flavor, i) => {
                                      const count = cart[flavor.id] || 0;
                                      return (
                                        <motion.div
                                          key={`${flavor.id}-${i}`}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() =>
                                            handleAddToCart(flavor.id)
                                          }
                                          style={{ width: "min(160px, 100cqh)" }}
                                          className={`relative h-full flex-shrink-0 snap-center rounded-[24px] overflow-hidden border-4 transition-all will-change-transform ${count > 0 ? "border-[#1C88FF] shadow-lg shadow-blue-100" : "border-transparent shadow-md"}`}
                                        >
                                          <img
                                            src={flavor.image}
                                            decoding="async"
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover"
                                            alt={flavor.name}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/80" />
                                          <div className="absolute bottom-3 left-4 right-4">
                                            <h4 className="text-sm font-bold text-white mb-0.5">{flavor.name}</h4>
                                            <span className="text-[10px] text-white/50 uppercase tracking-wider font-light">{flavor.tag}</span>
                                          </div>
                                          {count > 0 && (
                                            <motion.div
                                              initial={{ scale: 0.5, opacity: 0 }}
                                              animate={{ scale: 1, opacity: 1 }}
                                              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#1C88FF] text-white text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white/20"
                                            >
                                              {count}
                                            </motion.div>
                                          )}
                                        </motion.div>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* --- UNIFIED STICKY FOOTER AREA --- */}
                          <div className="absolute bottom-0 inset-x-0 z-[600] pointer-events-none">
                            {/* Background Gradient Fog Layer */}
                            <motion.div 
                              animate={{ height: activeTheme === 5 ? 280 : 192 }}
                              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-white from-[60px] via-white/90 to-transparent pointer-events-none" 
                            />

                            <div className="relative px-6 notch-safe-bottom">
                              {/* Guide Text Area */}
                              <div className="mb-4 flex justify-center pointer-events-none">
                                <AnimatePresence mode="wait">
                                  {!isFull ? (
                                    <motion.p
                                      key="guide"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="text-center text-[#1D1D1F] text-[14.5px] font-medium tracking-tight"
                                    >
                                      Curate your day with{" "}
                                      <span className="font-bold text-[#1C88FF]">
                                        {limit - total}
                                      </span>{" "}
                                      flavors
                                    </motion.p>
                                  ) : (
                                    <motion.div
                                      key="actions"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="flex items-center justify-between w-full px-4 pointer-events-auto"
                                    >
                                      <motion.span
                                        style={{ color: resetColor }}
                                        className="text-[14.5px] font-medium tracking-tight"
                                      >
                                        Reset all
                                      </motion.span>
                                      <div className="flex flex-col items-center">
                                        <span className="text-[#1D1D1F] text-[14.5px] font-bold font-outfit">
                                          Swipe to
                                        </span>
                                      </div>
                                      <motion.span
                                        style={{ color: checkoutColor }}
                                        className="text-[14.5px] font-bold tracking-tight"
                                      >
                                        Check out
                                      </motion.span>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Swipe Basket Bar */}
                              <div className="relative w-full">
                                <AnimatePresence>
                                  {isFull && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute -inset-1.5 rounded-[40px] bg-white/80 blur-lg animate-pulse pointer-events-none"
                                    />
                                  )}
                                </AnimatePresence>
                                <motion.div
                                  initial={false}
                                  drag={isFull ? "x" : false}
                                  dragConstraints={{ left: 0, right: 0 }}
                                  dragElastic={0.4}
                                  style={{ x: dragX }}
                                  onDragEnd={(_, info) => {
                                    if (!isFull) return;
                                    const swipeX =
                                      info.offset.x + info.velocity.x * 0.2;
                                    if (swipeX > 70) {
                                      triggerHaptic(30);
                                      startTransition("/success");
                                    } else if (swipeX < -70) {
                                      triggerHaptic(20);
                                      setCart({});
                                    }
                                  }}
                                  className={`w-full h-[72px] relative z-10 backdrop-blur-[40px] border rounded-[36px] overflow-hidden flex items-center pointer-events-auto cursor-grab active:cursor-grabbing ${isFull ? "border-white/50 shadow-[0_20px_60px_rgba(28,136,255,0.25),0_0_30px_rgba(28,136,255,0.1)_inset]" : "border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.15)]"}`}
                                >
                                  {/* Smooth Background Transition Layers */}
                                  <div
                                    className="absolute inset-0 bg-gradient-to-br from-black/70 to-gray-800/40 transition-opacity duration-700 ease-in-out rounded-[36px]"
                                    style={{ opacity: isFull ? 0 : 1 }}
                                  />
                                  <div
                                    className="absolute inset-0 bg-gradient-to-br from-[#1C88FF]/40 to-[#00D4FF]/20 transition-opacity duration-700 ease-in-out rounded-[36px]"
                                    style={{ opacity: isFull ? 1 : 0 }}
                                  />

                                  <div
                                    className={`flex-1 relative z-20 flex ${limit > 6 ? "gap-1.5" : "gap-3"} justify-center px-4 scrollbar-hide py-2 ${isFull ? "overflow-hidden" : "overflow-x-auto"}`}
                                  >
                                    {Array.from({ length: limit }).map(
                                      (_, i) => {
                                        const items = Object.entries(
                                          cart,
                                        ).flatMap(([fid, q]) =>
                                          Array(q).fill(fid),
                                        );
                                        const fid = items[i];
                                        const flavor = themes
                                          .flatMap((t) => t.flavors)
                                          .find((f) => f.id === fid);
                                        return (
                                          <motion.div
                                            key={i}
                                            layout
                                            onClick={(e) => {
                                              if (fid) {
                                                e.stopPropagation();
                                                handleRemoveFromCart(fid);
                                              }
                                            }}
                                            className={`relative ${limit > 6 ? "w-[34px] h-[34px]" : limit > 3 ? "w-10 h-10" : "w-11 h-11"} rounded-full flex items-center justify-center border transition-all shrink-0 z-[610] ${fid ? "border-white/30 shadow-lg cursor-pointer overflow-hidden" : "bg-white/5 border-solid border-white/10"}`}
                                          >
                                            <AnimatePresence>
                                              {fid ? (
                                                <motion.div
                                                  key="image"
                                                  initial={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                  }}
                                                  animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                  }}
                                                  exit={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                  }}
                                                  className="absolute inset-0 w-full h-full rounded-full overflow-hidden"
                                                >
                                                  <img
                                                    src={flavor?.image}
                                                    className="w-full h-full object-cover scale-125 rounded-full"
                                                    alt={flavor?.name}
                                                  />
                                                  <div className="absolute inset-0 bg-black/10 rounded-full" />
                                                </motion.div>
                                              ) : (
                                                <motion.div
                                                  key="dot"
                                                  initial={{ opacity: 0 }}
                                                  animate={{ opacity: 1 }}
                                                  exit={{ opacity: 0 }}
                                                  className="w-1.5 h-1.5 bg-white/20 rounded-full"
                                                />
                                              )}
                                            </AnimatePresence>
                                          </motion.div>
                                        );
                                      },
                                    )}
                                  </div>
                                  {isFull && (
                                    <motion.div
                                      animate={{ opacity: [0, 0.25, 0, 0] }}
                                      transition={{
                                        duration: 5,
                                        times: [0, 0.4, 0.8, 1],
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                      }}
                                      className="absolute inset-0 pointer-events-none bg-white mix-blend-overlay rounded-[36px]"
                                    />
                                  )}
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- BENEFIT BOTTOM SHEET --- */}
      <AnimatePresence>
        {selectedBenefit && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBenefit(null)}
              className="absolute inset-0 backdrop-blur-md z-[100]"
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 z-[101] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[85vh] overflow-y-auto notch-safe-bottom"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="mb-6">
                <h3 className="text-[28px] font-bold text-gray-900 font-outfit leading-tight mb-1">
                  Benefits for Haley
                </h3>
                <p className="text-gray-400 font-light text-sm">
                  Experience the premium plan perks.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {benefitPills.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    className="flex items-center gap-5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#1C88FF]/10 flex flex-shrink-0 items-center justify-center text-[#1C88FF]">
                      {React.cloneElement(benefit.icon as React.ReactElement, {
                        className: "w-6 h-6",
                      })}
                    </div>
                    <div>
                      <h4 className="text-[18px] font-bold text-gray-900 mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-[14.5px] text-gray-500 font-light leading-snug">
                        {benefitDetails[benefit.title]}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setSelectedBenefit(null)}
                className="w-full bg-[#1C88FF] text-white h-[60px] rounded-full font-bold text-lg shadow-[0_10px_20px_rgba(28,136,255,0.2)] flex items-center justify-center mt-2"
              >
                Got it
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
