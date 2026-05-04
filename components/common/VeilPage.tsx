'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VeilPageProps {
  isVisible: boolean;
  duration?: number;
}

export default function VeilPage({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)", scale: 1 }}
          animate={{ opacity: 1, backdropFilter: "blur(60px)", scale: 1 }}
          exit={{ 
            opacity: 0, 
            backdropFilter: "blur(0px)",
            scale: 1.05,
            transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] bg-white/90 flex items-center justify-center pointer-events-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center"
          >
            {/* Optional: You can add a small logo or spinner here if needed */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
