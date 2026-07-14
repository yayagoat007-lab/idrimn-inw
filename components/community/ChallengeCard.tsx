import React from 'react';
import { Challenge } from '../../types';
import { 
  CheckCircle, 
  Users, 
  TrendingUp, 
  XCircle, 
  Award, 
  Coins, 
  Camera, 
  Slash 
} from 'lucide-react';

interface EnrichedChallenge extends Challenge {
  joined: boolean;
  currentValue: number;
  progressPercent: number;
  completed: boolean;
}

interface ChallengeCardProps {
  challenge: EnrichedChallenge;
  lang: 'fr' | 'darija';
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
}

export function ChallengeCard({ challenge, lang, onJoin, onLeave }: ChallengeCardProps) {
  
  const t = {
    join: lang === 'darija' ? 'N-sharek (Rejoindre)' : 'Participer',
    leave: lang === 'darija' ? 'Nsse7eb (Quitter)' : 'Abandonner',
    participants: lang === 'darija' ? 'moucharik' : 'participants',
    completed: lang === 'darija' ? 'Kamal (Complété !)' : 'Défi Réussi !',
    progress: lang === 'darija' ? 'Taqadom :' : 'Progression :',
    reward: lang === 'darija' ? 'N9at XP' : 'XP à gagner',
    daysLeft: lang === 'darija' ? 'Iyam ba9ya' : 'jours restants'
  };

  const getChallengeIcon = () => {
    switch (challenge.type) {
      case 'savings':
        return <Coins className="text-emerald-500" size={18} />;
      case 'no_spend':
        return <XCircle className="text-amber-500" size={18} />;
      case 'ocr_scan':
        return <Camera className="text-blue-500" size={18} />;
      default:
        return <TrendingUp className="text-slate-500" size={18} />;
    }
  };

  // Calculate days left
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 3600 * 24)));

  return (
    <div className={`bg-white border rounded-3xl p-5 shadow-3xs transition-all relative overflow-hidden font-sans ${
      challenge.completed 
        ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/10' 
        : challenge.joined 
          ? 'border-slate-200 ring-1 ring-slate-100' 
          : 'border-slate-100'
    }`} id={`challenge-${challenge.id}`}>
      
      {/* Decorative background star for achievements */}
      {challenge.completed && (
        <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
      )}

      {/* Header details */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
            challenge.completed 
              ? 'bg-emerald-50 border-emerald-100' 
              : 'bg-slate-50 border-slate-100'
          }`}>
            {getChallengeIcon()}
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide">
              {challenge.title}
            </h4>
            <span className="text-[9px] font-bold text-slate-400 font-mono block">
              {daysLeft} {t.daysLeft}
            </span>
          </div>
        </div>

        {/* XP Badge */}
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md text-[9px] font-black text-amber-700 font-mono">
          <Award size={11} className="text-amber-500" />
          <span>+{challenge.xpReward || 100} XP</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-600 text-[11px] leading-relaxed font-semibold mb-4">
        {challenge.description}
      </p>

      {/* Progress Block (Visible if joined) */}
      {challenge.joined && (
        <div className="space-y-1.5 mb-4 bg-slate-50 border border-slate-100/40 p-3 rounded-2xl">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{t.progress}</span>
            <span className="font-mono font-black text-slate-700">
              {challenge.currentValue.toFixed(0)} / {challenge.targetValue} {challenge.type === 'savings' ? 'DH' : challenge.type === 'no_spend' ? 'jours' : 'reçus'}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                challenge.completed ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
              style={{ width: `${challenge.progressPercent}%` }}
            />
          </div>

          {challenge.completed ? (
            <span className="text-[9px] font-black uppercase text-emerald-600 flex items-center gap-1 mt-1">
              <CheckCircle size={10} />
              <span>{t.completed}</span>
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase text-slate-400 block mt-1">
              {challenge.progressPercent}% complété
            </span>
          )}
        </div>
      )}

      {/* Participants row & Action Button */}
      <div className="flex justify-between items-center gap-2 pt-1">
        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <Users size={12} className="text-slate-400" />
          <span>{challenge.participantsCount + (challenge.joined && !challenge.completed ? 1 : 0)} {t.participants}</span>
        </div>

        {challenge.completed ? (
          <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-xl border border-emerald-100">
            {lang === 'darija' ? 'Najeh 🎉' : 'Succès !'}
          </div>
        ) : challenge.joined ? (
          <button
            type="button"
            onClick={() => onLeave(challenge.id)}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider rounded-xl border border-rose-100 cursor-pointer transition-all"
          >
            {t.leave}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onJoin(challenge.id)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all shadow-xs active:scale-95"
          >
            {t.join}
          </button>
        )}
      </div>

    </div>
  );
}
export default ChallengeCard;
