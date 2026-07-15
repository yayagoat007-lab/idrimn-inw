import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, Heart, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import { useDailyCheckin } from '../../hooks/use-daily-checkin';
import { CheckinStreakBadge } from './CheckinStreakBadge';
import { SidiAvatar } from '../sidi/SidiAvatar';

interface DailyCheckinCardProps {
  userId: string;
  language: 'fr' | 'darija';
}

export function DailyCheckinCard({ userId, language }: DailyCheckinCardProps) {
  const { 
    todayPrompt, 
    hasCheckedInToday, 
    submitCheckin, 
    checkinStreak, 
    loading 
  } = useDailyCheckin(userId);

  const [selectedMood, setSelectedMood] = useState<'great' | 'okay' | 'stressed' | 'worried' | null>(null);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl border border-slate-100 p-6 animate-pulse" id="checkin-card-loading">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded-md w-1/3" />
            <div className="h-3 bg-slate-100 rounded-md w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Handle click on emoji moods
  const handleMoodSelect = (mood: 'great' | 'okay' | 'stressed' | 'worried') => {
    setSelectedMood(mood);
    setShowNoteInput(true);
  };

  // Submit the check-in
  const handleSubmit = () => {
    if (!selectedMood) return;
    submitCheckin(selectedMood, note.trim() || undefined);
    setIsSubmitted(true);
  };

  // Skip note and submit immediately
  const handleQuickSubmit = (mood: 'great' | 'okay' | 'stressed' | 'worried') => {
    submitCheckin(mood);
    setSelectedMood(mood);
    setIsSubmitted(true);
  };

  // Open Sidi chat with empathetic starting message
  const handleTalkToSidi = () => {
    const text = language === 'fr' 
      ? `Sidi, je me sens un peu ${selectedMood === 'stressed' ? 'stressé' : 'inquiet'} par rapport à mon budget aujourd'hui. On peut en discuter ? 🪙`
      : `Sidi, rani 7as b chwiya d l-${selectedMood === 'stressed' ? 'qala9' : '7ira'} 3la l-budget dyali l-youm. Na9do nhdro ? 🪙`;
    
    localStorage.setItem('sidi_prefilled_message', text);
    window.dispatchEvent(new CustomEvent('open-sidi-chat'));
  };

  const getMoodConfig = (mood: 'great' | 'okay' | 'stressed' | 'worried') => {
    switch (mood) {
      case 'great':
        return { emoji: '😄', label: language === 'fr' ? 'Super' : 'Mzyan bzaf', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'okay':
        return { emoji: '🙂', label: language === 'fr' ? 'Ça va' : 'Labass', color: 'bg-sky-50 text-sky-700 border-sky-100' };
      case 'stressed':
        return { emoji: '😰', label: language === 'fr' ? 'Stressant' : 'Mghyoub', color: 'bg-amber-50 text-amber-700 border-amber-100' };
      case 'worried':
        return { emoji: '😟', label: language === 'fr' ? 'Inquiet' : '7ayer', color: 'bg-rose-50 text-rose-700 border-rose-100' };
    }
  };

  // If already checked in earlier today, show a subtle checkmark line at top of dashboard
  if (hasCheckedInToday && !isSubmitted) {
    return (
      <div 
        className="w-full bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/10 rounded-2xl border border-emerald-100 p-4 flex items-center justify-between shadow-xs transition-all hover:shadow-md"
        id="checkin-card-completed"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 leading-tight">
              {language === 'fr' ? 'Check-in quotidien complété !' : 'Check-in d l-youm tsjjel !'}
            </p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
              {language === 'fr' ? 'Ton humeur et ton état d’esprit ont été archivés pour Sidi.' : 'L-mizaj dyalek tsjjel and Sidi.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CheckinStreakBadge streak={checkinStreak} language={language} />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full bg-white rounded-3xl border border-slate-150 p-5 md:p-6 shadow-md relative overflow-hidden"
          id="daily-checkin-card-active"
        >
          {/* Subtle warm Moroccan accent pattern or background highlight */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <SidiAvatar size={42} mood={selectedMood === 'great' ? 'happy' : (selectedMood === 'stressed' || selectedMood === 'worried') ? 'worried' : 'neutral'} className="rounded-full shadow-md bg-emerald-50 border border-emerald-100" />
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full p-0.5 border border-white text-[8px] text-white">
                  ✍️
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {language === 'fr' ? 'Le Rituel de Sidi' : 'Rituel d Sidi'}
                  </h3>
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    10s max
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {language === 'fr' ? 'Prends un instant pour faire le point sur ton humeur financière.' : 'Khoud wa7d l-lahda bach nchoufo sandoq l-mizaj dyalk.'}
                </p>
              </div>
            </div>

            {checkinStreak > 0 && (
              <div className="self-start sm:self-center shrink-0">
                <CheckinStreakBadge streak={checkinStreak} language={language} />
              </div>
            )}
          </div>

          {/* Central Question */}
          <div className="space-y-4">
            <blockquote className="bg-slate-50 border-l-4 border-emerald-600 p-3.5 rounded-r-2xl text-xs font-extrabold text-slate-800 leading-relaxed italic">
              " {language === 'fr' ? todayPrompt.questionFr : todayPrompt.questionDarija} "
            </blockquote>

            {/* Step 1: Mood Choice buttons */}
            {!showNoteInput ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {(['great', 'okay', 'stressed', 'worried'] as const).map((mood) => {
                  const cfg = getMoodConfig(mood);
                  return (
                    <button
                      key={mood}
                      id={`checkin-mood-btn-${mood}`}
                      onClick={() => handleQuickSubmit(mood)}
                      className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group hover:scale-[1.03] duration-200"
                    >
                      <span className="text-2xl group-hover:animate-bounce duration-300">{cfg.emoji}</span>
                      <span className="text-xs font-black text-slate-700 mt-1.5">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Step 2: Optional note & confirmation */
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{language === 'fr' ? 'Humeur :' : 'L-mizaj :'}</span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getMoodConfig(selectedMood!).color}`}>
                      {getMoodConfig(selectedMood!).emoji} {getMoodConfig(selectedMood!).label}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedMood(null);
                      setShowNoteInput(false);
                      setNote('');
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-extrabold uppercase tracking-wider"
                  >
                    {language === 'fr' ? 'Modifier' : 'Baddel'}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                    {language === 'fr' ? 'Une petite note rapide (optionnel) :' : 'Kelma sghira (ikhtiyari) :'}
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={language === 'fr' ? "Ex: Achat imprévu d'un cadeau, resto, ou tout va bien !" : "Ex: Chrit hdiya, khrejti m3a l-7bab..."}
                    className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    onClick={() => handleQuickSubmit(selectedMood!)}
                    className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {language === 'fr' ? 'Passer & Enregistrer' : 'N9ez w Sejjel'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'fr' ? 'Valider le Check-in' : 'Kammel l-check-in'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        /* Success Screen */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-emerald-950 text-white rounded-3xl border border-emerald-900 p-5 md:p-6 shadow-xl relative overflow-hidden"
          id="daily-checkin-success-view"
        >
          {/* Decorative glowing backdrops */}
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="w-14 h-14 rounded-full bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-amber-400"
            >
              <Award size={28} className="animate-pulse" />
            </motion.div>

            <div className="space-y-1.5">
              <h3 className="font-black text-sm uppercase tracking-widest text-emerald-300">
                {language === 'fr' ? 'Check-in réussi !' : 'Check-in d l-youm tsjjel !'}
              </h3>
              <p className="text-xs font-bold text-emerald-100 max-w-sm leading-relaxed">
                {language === 'fr' 
                  ? 'Félicitations, rituel quotidien complété. Tu as gagné +10 XP pour ton assiduité budgétaire ! 🧘' 
                  : 'Safi tsjjel! Rbakti +10 XP f l-gamification dyal Floussi ! 🧘'}
              </p>
            </div>

            {/* Special empathetic CTA if feeling stressed or worried */}
            {(selectedMood === 'stressed' || selectedMood === 'worried') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 mt-2 space-y-3"
              >
                <div className="flex gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <Heart size={16} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-300 leading-snug">
                      {language === 'fr' ? "Sidi Floussi est là pour toi..." : "Sidi hna m3ak..."}
                    </h4>
                    <p className="text-[11px] text-emerald-100 font-semibold leading-relaxed mt-0.5">
                      {language === 'fr' 
                        ? "J'ai cru comprendre que tu ressens de la tension aujourd'hui. Ne garde pas ça pour toi, discutons-en en toute sérénité et sans jugement."
                        : "Ban liya l-budget dyalek fiha chwiya d l-qala9 l-youma. Aji nhdro b l-ati9ad w nchoufo kifach nsehlou l-masrouf."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTalkToSidi}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-black rounded-xl text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle size={13} className="fill-current" />
                  <span>{language === 'fr' ? "Envie d'en parler avec Sidi ?" : "Bghiti thdar m3a Sidi ?"}</span>
                </button>
              </motion.div>
            )}

            <button
              onClick={() => setIsSubmitted(false)}
              className="text-[10px] uppercase font-black text-emerald-300 hover:text-white tracking-widest pt-2 block"
            >
              {language === 'fr' ? 'Fermer' : 'Sedd'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default DailyCheckinCard;
