'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AdminContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  lang: 'en' | 'ko';
  setLang: (l: 'en' | 'ko') => void;
  toast: (msg: string) => void;
}

const AdminContext = createContext<AdminContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  lang: 'en',
  setLang: () => {},
  toast: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<'en' | 'ko'>('en');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  return (
    <AdminContext.Provider value={{ darkMode, toggleDarkMode, lang, setLang, toast }}>
      <div className={darkMode ? 'dark-mode' : ''} style={{ display: 'contents' }}>
        {children}
        <div className={`admin-toast ${toastVisible ? 'show' : ''}`}>
          {toastMsg}
        </div>
      </div>
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
