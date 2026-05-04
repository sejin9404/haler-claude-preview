"use client";

import React, { createContext, useContext, useState } from "react";

export type BoardingPassStatus = 'hidden' | 'peek' | 'open';

interface BoardingPassContextType {
  status: BoardingPassStatus;
  isLoggedIn: boolean;
  setStatus: (status: BoardingPassStatus) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  openBoardingPass: () => void;
  closeBoardingPass: () => void;
  hideBoardingPass: () => void;
}

const BoardingPassContext = createContext<BoardingPassContextType | undefined>(undefined);

export function BoardingPassProvider({ children }: { children: React.ReactNode }) {
  // Start hidden and logged out by default
  const [status, setStatus] = useState<BoardingPassStatus>('hidden');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const openBoardingPass = () => setStatus('open');
  const closeBoardingPass = () => setStatus('peek');
  const hideBoardingPass = () => setStatus('hidden');

  return (
    <BoardingPassContext.Provider value={{ 
      status, 
      isLoggedIn,
      setStatus, 
      setIsLoggedIn,
      openBoardingPass, 
      closeBoardingPass,
      hideBoardingPass
    }}>
      {children}
    </BoardingPassContext.Provider>
  );
}

export function useBoardingPass() {
  const context = useContext(BoardingPassContext);
  if (context === undefined) {
    throw new Error("useBoardingPass must be used within a BoardingPassProvider");
  }
  return context;
}
