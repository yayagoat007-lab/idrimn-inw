import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfettiAnimationProps {
  active: boolean;
  onComplete?: () => void;
}

interface Piece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  angle: number;
}

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444'];

export function ConfettiAnimation({ active, onComplete }: ConfettiAnimationProps) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage from left
        y: -10 - Math.random() * 20, // start above viewport
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 10,
        delay: Math.random() * 2,
        angle: Math.random() * 360
      }));

      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        if (onComplete) onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ 
            opacity: 1, 
            x: `${p.x}vw`, 
            y: `${p.y}vh`, 
            rotate: p.angle 
          }}
          animate={{ 
            y: '110vh', 
            rotate: p.angle + 720,
            opacity: [1, 1, 0.8, 0] 
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            delay: p.delay,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}
