import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SpotlightOverlayProps {
  targetSelector: string;
  isActive: boolean;
}

export function SpotlightOverlay({ targetSelector, isActive }: SpotlightOverlayProps) {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!isActive || !targetSelector) {
      setCoords(null);
      return;
    }

    const updateCoords = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Add a small padding of 6px around the target element
        const padding = 6;
        setCoords({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      } else {
        setCoords(null);
      }
    };

    // Run initially
    updateCoords();

    // Set up listeners for scrolling and resizing to keep spotlight attached
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, { passive: true });

    // Use a MutationObserver to handle layout shifts or content loading
    const observer = new MutationObserver(updateCoords);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Clean up
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
      observer.disconnect();
    };
  }, [targetSelector, isActive]);

  if (!isActive || !coords) return null;

  return (
    <>
      {/* 
        The Backdrop Layer:
        We draw 4 separate dark boxes around the highlighted element to block clicks outside 
        while keeping the spotlight area fully interactive!
      */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        {/* Top block */}
        <div 
          className="fixed left-0 top-0 w-full bg-slate-950/65 backdrop-blur-[1px] pointer-events-auto transition-all"
          style={{ height: `${Math.max(0, coords.top)}px` }}
        />
        {/* Bottom block */}
        <div 
          className="fixed left-0 w-full bg-slate-950/65 backdrop-blur-[1px] pointer-events-auto transition-all"
          style={{ 
            top: `${coords.top + coords.height}px`, 
            height: `calc(100vh - ${coords.top + coords.height}px)` 
          }}
        />
        {/* Left block */}
        <div 
          className="fixed left-0 bg-slate-950/65 backdrop-blur-[1px] pointer-events-auto transition-all"
          style={{ 
            top: `${Math.max(0, coords.top)}px`, 
            height: `${coords.height}px`, 
            width: `${Math.max(0, coords.left)}px` 
          }}
        />
        {/* Right block */}
        <div 
          className="fixed bg-slate-950/65 backdrop-blur-[1px] pointer-events-auto transition-all"
          style={{ 
            top: `${Math.max(0, coords.top)}px`, 
            height: `${coords.height}px`, 
            left: `${coords.left + coords.width}px`, 
            width: `calc(100vw - ${coords.left + coords.width}px)` 
          }}
        />
      </div>

      {/* 
        The Spotlight highlight borders:
        A pulsing border with motion layout to transition smoothly from one element to the next!
      */}
      <motion.div
        initial={false}
        animate={{
          top: coords.top,
          left: coords.left,
          width: coords.width,
          height: coords.height,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="fixed z-40 rounded-2xl border-2 border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.3),_0_0_15px_rgba(16,185,129,0.5)] pointer-events-none"
      />
    </>
  );
}
