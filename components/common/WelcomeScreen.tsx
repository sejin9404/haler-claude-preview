'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onFinished?: () => void;
}

export default function WelcomeScreen({ onFinished }: WelcomeScreenProps) {
  const [stage, setStage] = useState<'checking' | 'blurIn' | 'drawing' | 'visible' | 'bleeding' | 'hidden'>('checking');
  // onFinished가 무한 호출되는 것을 방지하기 위해 useRef로 한 번만 실행되도록 관리
  const hasnotifiedRef = useRef(false);

  const notifyFinished = () => {
    if (!hasnotifiedRef.current && onFinished) {
      onFinished();
      hasnotifiedRef.current = true;
    }
  };

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('haler_intro_seen');
    if (hasSeenIntro) {
      setStage('hidden');
      notifyFinished();
    } else {
      setStage('blurIn');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시에만 한 번 실행

  useEffect(() => {
    if (stage === 'blurIn') {
      const timer = setTimeout(() => {
        setStage('drawing');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (stage === 'drawing') {
      const timer = setTimeout(() => {
        setStage('visible');
      }, 1700);
      return () => clearTimeout(timer);
    }

    if (stage === 'visible') {
      const timer = setTimeout(() => {
        setStage('bleeding');
      }, 500);
      return () => clearTimeout(timer);
    }

    if (stage === 'bleeding') {
      const timer = setTimeout(() => {
        setStage('hidden');
        sessionStorage.setItem('haler_intro_seen', 'true');
        notifyFinished();
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (stage === 'hidden') return null;

  return (
    <motion.div 
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none bg-white"
      animate={{ 
        backgroundColor: stage === 'bleeding' ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 1)"
      }}
      transition={{ duration: 1.5 }}
    >
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ filter: "blur(40px)", scale: 1.15, opacity: 1 }}
        animate={{ 
          filter: stage === 'bleeding' ? "blur(60px)" : "blur(0px)",
          scale: (stage === 'blurIn' || stage === 'checking') ? 1.15 : (stage === 'bleeding' ? 1.1 : 1.0),
          opacity: stage === 'bleeding' ? 0 : 1 
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: 'filter, transform, opacity' }}
      >
        <video 
          autoPlay 
          muted 
          playsInline 
          loop 
          className="w-full h-full object-cover"
          style={{ opacity: stage === 'checking' ? 0 : 1 }}
        >
          <source src="/videos/waterball.webm" type="video/webm" />
        </video>
      </motion.div>

      <div className="relative z-10">
        <motion.div
          animate={{ 
            opacity: stage === 'bleeding' ? 0 : 1,
            scale: stage === 'bleeding' ? 1.5 : 1,
            filter: stage === 'bleeding' ? "blur(80px) brightness(1.3)" : "blur(0px) brightness(1)",
          }}
          transition={{ 
            duration: 1.5, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          style={{ willChange: 'filter, transform, opacity' }}
        >
          <svg
            width="84"
            height="84"
            viewBox="0 0 722 669"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient id="p0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(360 500) rotate(90) scale(167 360)">
                <stop offset="0.4" stopColor="#00B7FF" />
                <stop offset="1" stopColor="#0080FF" />
              </radialGradient>
              <radialGradient id="p1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(360 202) rotate(90) scale(202 167)">
                <stop offset="0.4" stopColor="#00B7FF" />
                <stop offset="1" stopColor="#0080FF" />
              </radialGradient>

              <mask id="drawingMask">
                <motion.path
                  d="M 340 460
                     C 240 320 40 380 40 510 
                     C 40 640 240 680 360 500 
                     C 480 320 680 380 680 510 
                     C 680 640 480 680 380 540"
                  fill="none"
                  stroke="white"
                  strokeWidth="110" 
                  strokeLinecap="butt"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: (stage !== 'blurIn' && stage !== 'checking') ? [0, 0.02, 0.98, 1] : 0 }} 
                  transition={{ 
                    times: [0, 0.15, 0.85, 1],
                    duration: 1.2, 
                    ease: "easeInOut"
                  }}
                />
              </mask>
            </defs>

            <g mask="url(#drawingMask)">
              <path
                d="M161.284 333.461C216.074 330.231 261.74 356.209 299.183 393.574C310.4 404.768 324.073 419.423 335.877 429.523C332.533 433.343 327.693 437.618 324.091 441.389C313.408 452.569 300.595 463.905 290.256 475.22C276.077 460.156 260.07 444.88 244.58 431.133C238.805 426.01 231.332 419.681 224.982 415.412C206.562 403.042 184.626 396.984 162.469 398.146C134.911 399.558 109.059 411.917 90.6551 432.478C73.0122 452.29 63.0769 479.163 64.6246 505.725C65.9637 533.435 78.3874 559.439 99.0999 577.893C114.349 591.523 133.334 600.268 153.603 603C178.085 606.248 202.924 600.674 223.672 587.276C231.226 582.348 239.474 575.312 246.436 569.441C257.864 559.807 270.284 548.39 280.824 537.834C291.688 526.95 302.238 514.138 313.086 503.215C337.05 479.082 361.164 455.065 385.188 430.995L412.343 403.787C429.214 386.894 447.42 368.978 467.948 356.671C490.747 343.002 518.085 335.202 544.555 333.614C588.924 331.281 632.417 346.583 665.552 376.183C699.608 406.481 718.432 448.594 720.984 493.842C723.275 537.301 708.211 579.887 679.111 612.243C654.054 640.277 620.364 659.157 583.374 665.89C574.315 667.521 567.565 667.983 558.408 668.481C557.381 668.548 556.353 668.587 555.326 668.597C522.756 669.003 488.424 658.631 461.216 640.856C445.919 630.862 432.624 617.679 419.718 604.85C408.421 593.525 397.064 582.26 385.647 571.054C390.399 565.805 397.304 559.344 402.43 554.303L431.551 525.569C433.563 527.822 436.232 530.484 438.442 532.57C453.315 546.635 467.373 562.779 482.454 576.516C503.191 595.375 530.519 605.302 558.521 604.151C586.106 602.884 612.008 590.528 630.351 569.889C648.458 549.749 657.813 523.236 656.355 496.194C654.996 468.59 642.615 442.684 621.985 424.291C588.853 394.615 540.421 389.549 501.867 411.72C482.888 422.625 459.776 447.316 443.67 463.16C410.659 495.491 377.88 528.058 345.337 560.862L308.786 597.461C293.683 612.543 276.539 630.007 258.532 641.491C234.686 657.011 207.224 666.08 178.827 667.821C133.717 670.666 89.3503 655.306 55.6549 625.181C22.5544 595.703 2.60901 554.218 0.25738 509.958C-2.22208 465.381 13.2931 421.672 43.3237 388.635C74.0977 354.567 115.635 335.748 161.284 333.461Z"
                fill="url(#p0)"
              />
            </g>

            <motion.path
              d="M354.82 0.152555C356.667 0.016676 359.314 -0.0038563 361.178 0.00052838C405.469 0.0471817 447.935 17.6707 479.245 49.0009C511.349 81.1845 529.099 124.969 528.467 170.425C528.542 190.013 524.842 209.433 517.577 227.624C504.656 260.501 491.153 274.804 466.631 299.431L439.921 326.184L364.282 401.447C363.078 402.587 361.884 403.918 360.744 405.139L285.844 330.325L254.234 298.728C245.658 290.151 235.317 280.013 227.85 270.508C207.302 243.878 195.207 211.699 193.129 178.127C190.131 133.587 205.296 89.7318 235.166 56.5583C266.74 21.0758 307.817 2.84796 354.82 0.152555ZM360.691 315.017C361.433 314.164 362.209 313.23 362.979 312.413L410.143 265.465C430.195 245.369 447.331 231.737 457.767 204.561C462.045 193.573 464.234 181.881 464.213 170.09C464.506 111.302 419.28 64.8624 360.278 64.7208C358.7 64.7159 357.122 64.7268 355.548 64.754C327.578 66.2092 301.374 78.8736 282.856 99.8861C250.684 136.107 248.284 189.669 276.543 228.822C284.035 239.203 294.452 248.725 303.546 257.811L340.815 295.036C347.183 301.396 354.69 308.535 360.691 315.017Z"
              fill="url(#p1)"
              initial={{ opacity: 0, y: 40 }}
              animate={{ 
                opacity: (stage !== 'blurIn' && stage !== 'checking') ? 1 : 0, 
                y: (stage !== 'blurIn' && stage !== 'checking') ? 0 : 40 
              }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
