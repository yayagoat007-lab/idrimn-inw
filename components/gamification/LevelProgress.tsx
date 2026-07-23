import React from 'react';
import { getLevelForXp } from '../../lib/gamification';
import { Award, Zap } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

export function LevelProgress({ xp }: { xp: number }) {
  const { lang } = useTranslation();
  const { level, levelName, nextLevelThreshold, percent } = getLevelForXp(xp);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {lang === 'darija' ? "Ziyadat d l-iddikhar dyalk" : "Votre progression financière"}
          </span>
          <h3 className="text-base font-black tracking-tight mt-1 flex items-center gap-1.5">
            <Award className="text-amber-400" size={18} />
            <span>{lang === 'darija' ? "Niveau d l-Yom : " : "Niveau Actuel : "}{levelName}</span>
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            {lang === 'darija' ? "Points lli jma3ti" : "Points accumulés"}
          </p>
          <p className="text-xl font-black text-emerald-400 flex items-center gap-0.5 justify-end mt-1">
            <Zap size={16} fill="currentColor" />
            <span>{xp} XP</span>
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>{xp} / {nextLevelThreshold} {lang === 'darija' ? " bch t-zid l n-niveau l-ajil" : " XP pour le prochain niveau"}</span>
          <span>{percent}%</span>
        </div>
        
        {/* Progress Bar container */}
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700/50">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-800 text-slate-300 rounded-2xl p-3.5 text-[10px] font-semibold flex items-start gap-2.5">
        <span className="text-lg">💡</span>
        <p className="leading-relaxed">
          {lang === 'darija'
            ? "Jme3 l-XP mli kat-khdem f l-app koul nhar, kat-sajjel masrouf, kat-kmel s-sandoqs dyalk o kat-sowweb Daret m3a s-shab !"
            : "Gagnez du XP en maintenant votre streak quotidien, en saisissant de nouvelles d'épargne, en complétant vos sandoqs et en validant des Daret en équipe !"}
        </p>
      </div>
    </div>
  );
}
export default LevelProgress;

