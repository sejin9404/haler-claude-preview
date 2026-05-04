"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoardingPassProvider, useBoardingPass } from "@/context/BoardingPassContext";
import BoardingPass from "@/components/BoardingPass";
import Navbar from "@/components/Navbar";
import PremiumCTA from "@/components/PremiumCTA";
import { UIProvider } from "@/context/UIContext";
import { VeilProvider, useVeil } from "@/context/VeilContext";
import VeilPage from "@/components/common/VeilPage";
import WelcomeScreen from "@/components/common/WelcomeScreen";
import { usePathname } from "next/navigation";

// Sub-component to handle the actual rendering logic within the provider
function BoardingPassManager({ children }: { children: React.ReactNode }) {
  const { status, closeBoardingPass } = useBoardingPass();
  const { isVeilVisible } = useVeil();
  const pathname = usePathname();
  const [isWelcomeActive, setIsWelcomeActive] = React.useState(true);

  const isTapPage = pathname?.startsWith('/tap');
  const isProductPage = pathname?.startsWith('/product');
  const isPassPage = pathname?.startsWith('/pass');

  return (
    <>
      <WelcomeScreen onFinished={() => setIsWelcomeActive(false)} />
      <VeilPage isVisible={isVeilVisible} />
      <AnimatePresence>
        {!isWelcomeActive && !isTapPage && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2 // 인트로 종료 후 아주 살짝 뒤에 시작해서 여운을 줌
            }}
            className="fixed top-0 left-0 right-0 z-[50]"
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>
      {children}
      {/* PremiumCTA removed in favor of MobileNavbar integration */}
      <BoardingPass />
    </>
  );
}

export default function GlobalClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <VeilProvider>
      <BoardingPassProvider>
        <UIProvider>
          <BoardingPassManager>
            {children}
          </BoardingPassManager>
        </UIProvider>
      </BoardingPassProvider>
    </VeilProvider>
  );
}
