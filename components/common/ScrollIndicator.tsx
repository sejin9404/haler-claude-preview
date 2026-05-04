'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollIndicatorProps {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  color?: string;
  bgColor?: string; // Same as background to create a solid fade
  threshold?: number;
  bottom?: string;
}

/**
 * Haler Pure Gradient Scroll Indicator
 * Switched from blur to a clean opacity gradient of the background color.
 */
export const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ 
  scrollRef, 
  color = '#1C88FF',
  bgColor = '#000000',
  threshold = 20,
  bottom = '-10px'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef?.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      
      if (scrollHeight <= clientHeight + 5) {
        setIsVisible(false);
        return;
      }

      const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - threshold - 5;
      setIsVisible(!isAtBottom);
    };

    const currentRef = scrollRef?.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => currentRef.removeEventListener('scroll', handleScroll);
    }
  }, [scrollRef, threshold]);

  // Convert hex to rgba for the gradient
  const getGradientColor = (color: string) => {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, 1)`; // Solid base
    }
    return color;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ 
            position: 'absolute',
            bottom: bottom, 
            left: '0px', 
            right: '0px', 
            height: '120px', // Fixed height for a consistent fade
            pointerEvents: 'none',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: `linear-gradient(to top, ${getGradientColor(bgColor)} 0%, ${getGradientColor(bgColor).replace('1)', '0)')} 100%)`
          }}
        >
          {/* CHEVRON MARK (Positioned at 30% from the bottom of the veil) */}
          <div 
            style={{ 
              position: 'absolute',
              bottom: '25%', // 25% height of the 25% veil
              color: color,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <motion.div
              animate={{ y: [0, 10, 10], opacity: [0, 0.4, 0, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", times: [0, 0.3, 0.8, 1] }}
              style={{ position: 'absolute' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.65, 0.95, 0.65, 0.65] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.8, 1] }}
              style={{ position: 'absolute' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
