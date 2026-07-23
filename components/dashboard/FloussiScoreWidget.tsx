import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, TrendingUp, TrendingDown, RefreshCw, 
  ChevronRight, Trophy, HelpCircle, Activity,
  ChevronDown, Target, Info, Calendar, Compass
} from 'lucide-react';
import { useFloussiScore } from '../../hooks/use-floussi-score';
import { PROFILE_DETAILS_MAP } from '../../lib/behavior-clustering';

interface FloussiScoreWidgetProps {
  userId?: string;
  language: 'fr' | 'darija';
}

export function FloussiScoreWidget({ userId = "mock-user-id-9999", language }: FloussiScoreWidgetProps) {
  const isDarija = language === 'darija';
  const { score, history, nextTierTip, isLoading } = useFloussiScore(userId, language);
  const [showHistory, setShowHistory] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; score: number; date: string } | null>(null);

  if (isLoading) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-3xl p-6 shadow-xs animate-pulse space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-slate-100 rounded-lg" />
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-slate-100 rounded-full" />
            <div className="space-y-2">
              <div className="h-6 w-24 bg-slate-100 rounded-md" />
              <div className="h-4 w-16 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-100 rounded-md" />
            <div className="h-3 w-full bg-slate-100 rounded-md" />
            <div className="h-3 w-full bg-slate-100 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  // Define accent colors based on current Floussi Score Tier
  const getTierTheme = (tier: string) => {
    switch (tier) {
      case 'Légende':
        return {
          bg: 'bg-amber-50 border-amber-200/60',
          text: 'text-amber-700',
          badge: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white',
          glow: 'shadow-amber-100',
          accent: 'amber'
        };
      case 'Maître':
        return {
          bg: 'bg-emerald-50 border-emerald-200/60',
          text: 'text-emerald-700',
          badge: 'bg-emerald-600 text-white',
          glow: 'shadow-emerald-100',
          accent: 'emerald'
        };
      case 'Stratège':
        return {
          bg: 'bg-violet-50 border-violet-200/60',
          text: 'text-violet-700',
          badge: 'bg-violet-600 text-white',
          glow: 'shadow-violet-100',
          accent: 'violet'
        };
      case 'Discipliné':
        return {
          bg: 'bg-blue-50 border-blue-200/60',
          text: 'text-blue-700',
          badge: 'bg-blue-600 text-white',
          glow: 'shadow-blue-100',
          accent: 'blue'
        };
      case 'Débutant':
      default:
        return {
          bg: 'bg-slate-50 border-slate-200/60',
          text: 'text-slate-700',
          badge: 'bg-slate-500 text-white',
          glow: 'shadow-slate-100',
          accent: 'slate'
        };
    }
  };

  const theme = getTierTheme(score.tier);

  // Behavior profile details translation
  const profileDetails = score.behaviorProfile ? PROFILE_DETAILS_MAP[score.behaviorProfile] : null;
  const profileName = profileDetails 
    ? (isDarija ? profileDetails.nameDarija : profileDetails.nameFr)
    : (isDarija ? "مستخدم جديد" : "Nouvel Utilisateur");
  const profileDesc = profileDetails
    ? (isDarija ? profileDetails.descriptionDarija : profileDetails.descriptionFr)
    : "";

  // Prepare custom SVG chart parameters
  const chartWidth = 500;
  const chartHeight = 130;
  const chartPadding = 15;

  let dPath = '';
  let dArea = '';
  let points: { x: number; y: number; score: number; date: string }[] = [];

  if (history && history.length > 1) {
    const minScoreVal = Math.min(...history.map(h => h.score), 100) - 20;
    const maxScoreVal = Math.max(...history.map(h => h.score), 900) + 20;
    const scoreRange = Math.max(1, maxScoreVal - minScoreVal);

    points = history.map((entry, idx) => {
      const x = chartPadding + (idx / (history.length - 1)) * (chartWidth - chartPadding * 2);
      const y = chartHeight - chartPadding - ((entry.score - minScoreVal) / scoreRange) * (chartHeight - chartPadding * 2);
      return { x, y, score: entry.score, date: entry.date };
    });

    dPath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    dArea = `${dPath} L ${points[points.length - 1].x} ${chartHeight - chartPadding} L ${points[0].x} ${chartHeight - chartPadding} Z`;
  }

  return (
    <div id="floussi-score-card" className="w-full bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
      
      {/* 1. Header Section */}
      <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
            <Trophy size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">
              {isDarija ? "Score Floussi d l-Progression" : "Score Floussi Unifié"}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {isDarija ? "L-mizan dyal n-najah dyalk f sandoq" : "Indicateur consolidé de votre maturité financière"}
            </p>
          </div>
        </div>

        {/* Current Tier Badge */}
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.badge}`}>
          {score.tier}
        </span>
      </div>

      {/* 2. Main Analytics Body */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main big score display */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1">
              <Sparkles size={12} className="text-amber-400 animate-pulse" />
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isDarija ? "L-majmou3 d l-points" : "Score Actuel"}
            </span>

            <div className="flex items-baseline gap-1 mt-1.5 mb-1">
              <span className="text-4xl font-black text-slate-800 tracking-tight leading-none">
                {score.totalScore}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ 1000</span>
            </div>

            {/* Trend badge */}
            <div className="flex items-center gap-1 mt-1">
              {score.trend === 'up' && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold tracking-tight">
                  <TrendingUp size={10} />
                  <span>{isDarija ? "Tla3 (+30j)" : "En hausse (+30j)"}</span>
                </span>
              )}
              {score.trend === 'down' && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-extrabold tracking-tight">
                  <TrendingDown size={10} />
                  <span>{isDarija ? "Hbat (+30j)" : "En baisse (+30j)"}</span>
                </span>
              )}
              {score.trend === 'stable' && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-extrabold tracking-tight">
                  <span>{isDarija ? "Mzyan / Table" : "Stable"}</span>
                </span>
              )}
            </div>
          </div>

          {/* Core score pillars progress bars */}
          <div className="md:col-span-7 space-y-3.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-500" />
              <span>{isDarija ? "Arkan l-Mizaniya" : "Piliers de Performance"}</span>
            </h4>

            <div className="space-y-3">
              {/* Pillar 1: Financial Health (40%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">{isDarija ? "1. Sante dyal sandoq (40%)" : "1. Santé Financière (40%)"}</span>
                  <span className="text-emerald-600 font-extrabold">{score.components.financialHealth} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${score.components.financialHealth}%` }}
                  />
                </div>
              </div>

              {/* Pillar 2: Gamification / Level (25%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">{isDarija ? "2. Progression f sandoq (25%)" : "2. Niveaux & Badges (25%)"}</span>
                  <span className="text-amber-600 font-extrabold">{score.components.gamificationProgress} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-700 delay-75" 
                    style={{ width: `${score.components.gamificationProgress}%` }}
                  />
                </div>
              </div>

              {/* Pillar 3: Consistency / Streak (20%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">{isDarija ? "3. L-Moudawama (20%)" : "3. Régularité de saisie (20%)"}</span>
                  <span className="text-blue-600 font-extrabold">{score.components.consistency} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-700 delay-100" 
                    style={{ width: `${score.components.consistency}%` }}
                  />
                </div>
              </div>

              {/* Pillar 4: Engagement (15%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600">{isDarija ? "4. L'moucharaka (15%)" : "4. Activité & Académie (15%)"}</span>
                  <span className="text-violet-600 font-extrabold">{score.components.engagement} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-violet-500 h-full rounded-full transition-all duration-700 delay-150" 
                    style={{ width: `${score.components.engagement}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Behavioral Profile Segment */}
        {score.behaviorProfile && (
          <div className="p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-2xl flex flex-col sm:flex-row gap-3.5 items-start sm:items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit">
                <Compass size={11} />
                <span>{isDarija ? "L-Profil dyal l-behavior" : "Profil Comportemental"}</span>
              </span>
              <h4 className="text-xs font-black text-slate-800">{profileName}</h4>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed max-w-xl">
                {profileDesc}
              </p>
            </div>
            {profileDetails?.adviceFr && profileDetails.adviceFr.length > 0 && (
              <div className="text-[10px] font-bold text-emerald-700 border-t sm:border-t-0 sm:border-l border-emerald-200/50 pt-2 sm:pt-0 sm:pl-4 max-w-xs space-y-1 shrink-0">
                <p className="uppercase tracking-widest text-[9px] text-emerald-800 font-black flex items-center gap-1 mb-1">
                  <Target size={10} />
                  <span>{isDarija ? "Nasiha" : "Conseil Actif"}</span>
                </p>
                <p className="italic leading-relaxed">
                  "{isDarija ? profileDetails.adviceDarija[0] : profileDetails.adviceFr[0]}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. Actionable tip Box (Prochaine étape) */}
        {nextTierTip && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3 relative">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl mt-0.5">
              <Target size={15} />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                {isDarija 
                  ? `Khassak +${nextTierTip.pointsNeeded} pts l tier l-jay` 
                  : `Étape Suivante : +${nextTierTip.pointsNeeded} points`}
              </span>
              <p className="text-[11px] text-slate-600 font-bold leading-relaxed mt-1">
                {nextTierTip.tip}
              </p>
            </div>
          </div>
        )}

        {/* 5. Historical Trend Toggle */}
        {history && history.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider cursor-pointer mx-auto"
            >
              <span>{showHistory ? (isDarija ? "Khbi l-Biayane" : "Masquer l'évolution") : (isDarija ? "Shouf l-Biayane dyal t-trend" : "Voir la courbe d'évolution")}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 pb-2 space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{isDarija ? "30 jours l-faytine" : "Historique (30 derniers jours)"}</span>
                      </span>
                      <span>
                        {hoveredPoint 
                          ? `${hoveredPoint.date} : ` 
                          : (isDarija ? "T-9ribi l-points" : "Survolez la courbe")}
                        {hoveredPoint && <strong className="text-slate-700 ml-1">{hoveredPoint.score} pts</strong>}
                      </span>
                    </div>

                    {/* Responsive custom SVG Line Chart */}
                    <div className="relative w-full overflow-hidden bg-slate-50/50 border border-slate-100/50 rounded-2xl p-2.5">
                      <svg 
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                        className="w-full h-auto overflow-visible select-none"
                      >
                        <defs>
                          <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1={chartPadding} y1={chartHeight / 2} x2={chartWidth - chartPadding} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1={chartPadding} y1={chartHeight - chartPadding} x2={chartWidth - chartPadding} y2={chartHeight - chartPadding} stroke="#e2e8f0" strokeWidth="1" />

                        {/* Area shading */}
                        {dArea && <path d={dArea} fill="url(#scoreAreaGrad)" />}

                        {/* Main curve path */}
                        {dPath && (
                          <path 
                            d={dPath} 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="2.5" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Interactive dots and hit targets */}
                        {points.map((p, idx) => {
                          const isHovered = hoveredPoint?.date === p.date;
                          // Show only every 5th dot to avoid clutter, or if hovered
                          const shouldShowDot = idx === 0 || idx === points.length - 1 || idx % 5 === 0 || isHovered;

                          return (
                            <g key={idx}>
                              {shouldShowDot && (
                                <circle 
                                  cx={p.x} 
                                  cy={p.y} 
                                  r={isHovered ? 4.5 : 2.5} 
                                  fill={isHovered ? '#047857' : '#10b981'} 
                                  stroke="#ffffff"
                                  strokeWidth={isHovered ? 2 : 1}
                                />
                              )}
                              {/* Invisible larger hover trigger */}
                              <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="10" 
                                fill="transparent" 
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredPoint(p)}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>

    </div>
  );
}

export default FloussiScoreWidget;
