import React, { useState, useMemo } from 'react';
import { DailyCheckin } from '../../types';
import { useDailyCheckin } from '../../hooks/use-daily-checkin';
import { Sparkles, Calendar, TrendingUp, Info } from 'lucide-react';

interface MoodHistoryChartProps {
  userId: string;
  language: 'fr' | 'darija';
}

export function MoodHistoryChart({ userId, language }: MoodHistoryChartProps) {
  const { moodHistory, loading } = useDailyCheckin(userId);
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);

  // Generate an array of dates for the last N days (including today)
  const lastDays = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      list.push(d.toISOString().split('T')[0]);
    }
    return list;
  }, [rangeDays]);

  // Map of date string to checkin
  const checkinMap = useMemo(() => {
    const map: Record<string, DailyCheckin> = {};
    moodHistory.forEach(item => {
      map[item.date] = item;
    });
    return map;
  }, [moodHistory]);

  // Compute stats
  const stats = useMemo(() => {
    let great = 0;
    let okay = 0;
    let stressed = 0;
    let worried = 0;
    let total = 0;

    lastDays.forEach(date => {
      const checkin = checkinMap[date];
      if (checkin) {
        total++;
        if (checkin.mood === 'great') great++;
        if (checkin.mood === 'okay') okay++;
        if (checkin.mood === 'stressed') stressed++;
        if (checkin.mood === 'worried') worried++;
      }
    });

    return { great, okay, stressed, worried, total };
  }, [lastDays, checkinMap]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl border border-slate-100 p-6 animate-pulse" id="mood-chart-loading">
        <div className="h-4 bg-slate-100 rounded-md w-1/4 mb-4" />
        <div className="h-20 bg-slate-100 rounded-md" />
      </div>
    );
  }

  const getMoodVisuals = (mood?: 'great' | 'okay' | 'stressed' | 'worried') => {
    if (!mood) {
      return { emoji: '⚪', color: 'bg-slate-100 border-slate-200 text-slate-300', text: language === 'fr' ? 'Pas de check-in' : 'Ma kaynach' };
    }
    switch (mood) {
      case 'great':
        return { emoji: '😄', color: 'bg-emerald-500 border-emerald-600 text-white', text: language === 'fr' ? 'Excellent' : 'Mzyan bzaf' };
      case 'okay':
        return { emoji: '🙂', color: 'bg-sky-500 border-sky-600 text-white', text: language === 'fr' ? 'Serein' : 'Labass' };
      case 'stressed':
        return { emoji: '😰', color: 'bg-amber-500 border-amber-600 text-white', text: language === 'fr' ? 'Tendu' : 'Mghyoub' };
      case 'worried':
        return { emoji: '😟', color: 'bg-rose-500 border-rose-600 text-white', text: language === 'fr' ? 'Inquiet' : '7ayer' };
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-MA', options);
  };

  return (
    <div 
      className="w-full bg-white rounded-3xl border border-slate-150 p-5 md:p-6 shadow-xs relative"
      id="mood-barometer-section"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-600 animate-pulse" />
            <span>{language === 'fr' ? 'Baromètre d’Humeur Financière' : 'Baromet d L-Mizaj l-Mali'}</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-bold mt-1 leading-normal">
            {language === 'fr' 
              ? 'Visualisation de ta sérénité face à ton budget et à tes sandoqs.' 
              : 'Nchoufo kifach kat7ess b l-mizaniya dyal l-flouss dima.'}
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setRangeDays(7)}
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              rangeDays === 7 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'fr' ? '7 Jours' : '7 yam'}
          </button>
          <button
            onClick={() => setRangeDays(30)}
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              rangeDays === 30 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'fr' ? '30 Jours' : '30 yom'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Daily Timeline Dot Grid */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
            <Calendar size={12} />
            <span>{language === 'fr' ? 'Séquence Chronologique' : 'Moutsalsal l-yam'}</span>
          </h4>

          {/* Timeline dots / emojis container */}
          <div className="flex flex-wrap gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-4 min-h-[90px] items-center justify-start">
            {lastDays.map((dateStr) => {
              const checkin = checkinMap[dateStr];
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const visuals = getMoodVisuals(checkin?.mood);

              return (
                <div 
                  key={dateStr}
                  title={`${formatDateLabel(dateStr)}${isToday ? ' (Aujourd’hui)' : ''} : ${visuals.text}`}
                  className="flex flex-col items-center gap-1.5 p-1.5 hover:bg-white rounded-lg transition-all cursor-pointer group hover:shadow-xs hover:scale-110 duration-200"
                >
                  <div className="text-[10px] text-slate-400 font-bold tracking-tight">
                    {dateStr.split('-')[2]}
                  </div>
                  
                  {/* Emoji / Colored dot representation */}
                  {checkin ? (
                    <span className="text-xl leading-none select-none drop-shadow-xs group-hover:scale-125 duration-150">
                      {visuals.emoji}
                    </span>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-[8px] text-slate-300 font-bold group-hover:bg-slate-200/50">
                      •
                    </div>
                  )}

                  {isToday && (
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 text-[10px] font-bold text-slate-400 flex-wrap">
            <div className="flex items-center gap-1"><span className="text-sm">😄</span> <span>{language === 'fr' ? 'Super' : 'Mzyan'}</span></div>
            <div className="flex items-center gap-1"><span className="text-sm">🙂</span> <span>{language === 'fr' ? 'Serein' : 'Labass'}</span></div>
            <div className="flex items-center gap-1"><span className="text-sm">😰</span> <span>{language === 'fr' ? 'Tendu' : 'Mghyoub'}</span></div>
            <div className="flex items-center gap-1"><span className="text-sm">😟</span> <span>{language === 'fr' ? 'Inquiet' : '7ayer'}</span></div>
          </div>
        </div>

        {/* Right Side: Mood frequencies */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-100/60 rounded-2xl p-4 space-y-4">
          <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
            <TrendingUp size={12} />
            <span>{language === 'fr' ? 'Répartition de l’état d’esprit' : 'Taqsim dyal l-mizaj'}</span>
          </h4>

          {stats.total === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-1">
              <Info size={16} />
              <p className="text-[11px] font-bold">{language === 'fr' ? 'Aucune donnée sur cette période' : 'Hatta data f had l-weqt'}</p>
              <p className="text-[9px]">{language === 'fr' ? 'Faites votre check-in quotidien pour alimenter Sidi.' : 'Kammel l-check-in dyal l-youm bach tban hna.'}</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Stat Great */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">😄 {language === 'fr' ? 'Super' : 'Mzyan'}</span>
                  <span>{stats.great} {stats.great > 1 ? (language === 'fr' ? 'fois' : 'marrat') : (language === 'fr' ? 'fois' : 'marra')} ({Math.round((stats.great/stats.total)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(stats.great/stats.total)*100}%` }} />
                </div>
              </div>

              {/* Stat Okay */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">🙂 {language === 'fr' ? 'Serein / Ça va' : 'Labass'}</span>
                  <span>{stats.okay} {stats.okay > 1 ? (language === 'fr' ? 'fois' : 'marrat') : (language === 'fr' ? 'fois' : 'marra')} ({Math.round((stats.okay/stats.total)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${(stats.okay/stats.total)*100}%` }} />
                </div>
              </div>

              {/* Stat Stressed */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">😰 {language === 'fr' ? 'Tendu / Stressé' : 'Mghyoub'}</span>
                  <span>{stats.stressed} {stats.stressed > 1 ? (language === 'fr' ? 'fois' : 'marrat') : (language === 'fr' ? 'fois' : 'marra')} ({Math.round((stats.stressed/stats.total)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(stats.stressed/stats.total)*100}%` }} />
                </div>
              </div>

              {/* Stat Worried */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">😟 {language === 'fr' ? 'Inquiet / Soucieux' : '7ayer'}</span>
                  <span>{stats.worried} {stats.worried > 1 ? (language === 'fr' ? 'fois' : 'marrat') : (language === 'fr' ? 'fois' : 'marra')} ({Math.round((stats.worried/stats.total)*100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(stats.worried/stats.total)*100}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-150 text-[9px] text-slate-400 font-extrabold text-center uppercase tracking-wider">
                {language === 'fr' ? `Total Check-ins : ${stats.total} jours` : `Majmou3 Check-ins : ${stats.total} yom`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default MoodHistoryChart;
