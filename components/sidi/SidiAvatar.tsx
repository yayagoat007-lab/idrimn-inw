import React from 'react';

interface SidiAvatarProps {
  mood?: 'neutral' | 'happy' | 'worried';
  className?: string;
  size?: number;
}

export function SidiAvatar({ mood = 'neutral', className = '', size = 48 }: SidiAvatarProps) {
  // Color palette: 
  // - Fez (Tarbouche): Rich Crimson/Red (#DC2626)
  // - Fez Tassel: Charcoal/Black (#1F2937)
  // - Skin: Warm Sand (#FCD34D or #FBBF24)
  // - Djellaba: Off-White / Gold trim (#FEF3C7)
  // - Mustache: Jet Black (#111827)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      id={`sidi-avatar-${mood}`}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2" />

      {/* Djellaba Body */}
      <path
        d="M20 90C20 78 30 70 50 70C70 70 80 78 80 90"
        fill="#F8FAFC"
        stroke="#CBD5E1"
        strokeWidth="2"
      />
      {/* Djellaba Golden Trim V-neck */}
      <path d="M42 70L50 82L58 70" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
      <line x1="50" y1="82" x2="50" y2="90" stroke="#EAB308" strokeWidth="2" />

      {/* Head & Neck */}
      <rect x="45" y="58" width="10" height="15" rx="3" fill="#FCD34D" />
      <circle cx="50" cy="45" r="22" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />

      {/* Traditional Moroccan Red Fez (Tarbouche) */}
      {/* Fez Base */}
      <path
        d="M32 28C34 16 40 14 50 14C60 14 66 16 68 28L64 29H36L32 28Z"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="1.5"
      />
      {/* Black Tassel on Top */}
      <circle cx="50" cy="14" r="2" fill="#1F2937" />
      <path
        d="M50 14C53 14 58 18 58 22"
        stroke="#1F2937"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="56" y="21" width="3" height="6" rx="1" fill="#1F2937" />

      {/* Eyebrows */}
      {mood === 'worried' ? (
        <>
          {/* Slanted worried eyebrows */}
          <path d="M35 34C38 34 41 37 43 38" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M65 34C62 34 59 37 57 38" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Friendly arched eyebrows */}
          <path d="M33 34C37 31 42 32 44 34" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M67 34C63 31 58 32 56 34" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {/* Eyes */}
      {mood === 'happy' ? (
        <>
          {/* Closed laughing arches */}
          <path d="M34 41C36 38 40 38 42 41" stroke="#111827" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M58 41C60 38 64 38 66 41" stroke="#111827" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'worried' ? (
        <>
          {/* Circular wide-awake worried eyes */}
          <circle cx="38" cy="41" r="3" fill="#111827" />
          <circle cx="62" cy="41" r="3" fill="#111827" />
        </>
      ) : (
        <>
          {/* Normal calm eyes */}
          <ellipse cx="38" cy="41" rx="2.5" ry="3.5" fill="#111827" />
          <ellipse cx="62" cy="41" rx="2.5" ry="3.5" fill="#111827" />
          {/* Subtle reflection dots */}
          <circle cx="37" cy="40" r="0.8" fill="#FFFFFF" />
          <circle cx="61" cy="40" r="0.8" fill="#FFFFFF" />
        </>
      )}

      {/* Friendly Rosy Cheeks */}
      <circle cx="28" cy="47" r="3" fill="#F87171" fillOpacity="0.4" />
      <circle cx="72" cy="47" r="3" fill="#F87171" fillOpacity="0.4" />

      {/* Sidi's Famous Moroccan Mustache */}
      <path
        d="M33 50C37 49 43 50 50 54C57 50 63 49 67 50C71 51 68 56 62 55C56 54 52 52 50 54C48 52 44 54 38 55C32 56 29 51 33 50Z"
        fill="#111827"
        stroke="#111827"
        strokeWidth="1"
      />

      {/* Mouth under mustache */}
      {mood === 'happy' ? (
        // Wide happy open smile
        <path d="M44 55C44 58 46 60 50 60C54 60 56 58 56 55" stroke="#991B1B" strokeWidth="2.5" fill="#DC2626" strokeLinecap="round" />
      ) : mood === 'worried' ? (
        // Small worried loop
        <path d="M46 56C48 55 52 55 54 56" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
      ) : (
        // Mild pleasant smile line
        <path d="M45 55C47 57 53 57 55 55" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />
      )}

      {/* Sidi's wise little white-grey goatee beard */}
      <path d="M46 61L50 68L54 61H46Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
    </svg>
  );
}
export default SidiAvatar;
