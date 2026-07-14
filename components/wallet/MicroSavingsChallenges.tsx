import React, { useState } from 'react';
import { useMicroSavings } from '../../hooks/use-micro-savings';
import { useAuth } from '../../hooks/use-auth';
import { Coffee, Car, ShieldCheck, Flame, Trophy, Play, Check, HelpCircle, Sparkles } from 'lucide-react';

interface MicroSavingsChallengesProps {
  lang: 'fr' | 'darija';
}

export function MicroSavingsChallenges({ lang }: MicroSavingsChallengesProps) {
  const { user } = useAuth();
  const { challenges, toggleChallenge, simulateChallengesAudit } = useMicroSavings(user?.id || '');
  const [animatingChallenge, setAnimatingChallenge] = useState<string | null>(null);

  const t = {
    title: lang === 'darija' ? 'Tahadiyat d L-Micro-Épargne' : 'Défis de Micro-Épargne',
    desc: lang === 'darija' ? 'Tahadiyat l-yowmya bach t-jme3 chwiya d l-flous bla ma t-7ess' : 'Épargnez sans effort en relevant des défis simples au quotidien.',
    streak: lang === 'darija' ? 'Silsila (Jours) :' : 'Série :',
    saved: lang === 'darija' ? 'Jme3ti fih :' : 'Épargné :',
    activate: lang === 'darija' ? 'Khedem' : 'Activer',
    deactivate: lang === 'darija' ? 'Tfi' : 'Désactiver',
    simulateBtn: lang === 'darija' ? 'Simuler une journée de réussite !' : 'Simuler une journée de réussite !',
    simulateDesc: lang === 'darija' ? 'Tesser d l-yowm o d-khoul l-flous f sandoq' : 'Simule un passage au lendemain : si les défis sont actifs, Floussi transfère l\'argent économisé de votre Wallet vers l\'épargne.',
    noCoffeeTitle: lang === 'darija' ? 'Défi sans Café' : 'Défi sans Café ☕',
    noCoffeeDesc: lang === 'darija' ? 'Chaque jour sans acheter de café au salon = +10 DH épargnés' : 'Chaque jour sans dépense de café en salon = +10 DH mis de côté.',
    noTaxiTitle: lang === 'darija' ? 'Défi sans Taxi' : 'Défi sans Taxi 🚖',
    noTaxiDesc: lang === 'darija' ? 'Prendre le bus/tram au lieu d\'un taxi = +5 DH épargnés' : 'Prendre le bus/tram ou marcher au lieu d\'un taxi = +5 DH mis de côté.'
  };

  const getChallengeDetails = (type: string) => {
    switch (type) {
      case 'no_coffee':
        return {
          title: t.noCoffeeTitle,
          desc: t.noCoffeeDesc,
          icon: <Coffee className="text-amber-700" size={18} />,
          bg: 'bg-amber-50/50 border-amber-100',
          amount: '10 DH / jour'
        };
      case 'no_taxi':
        return {
          title: t.noTaxiTitle,
          desc: t.noTaxiDesc,
          icon: <Car className="text-blue-600" size={18} />,
          bg: 'bg-blue-50/40 border-blue-100',
          amount: '5 DH / trajet'
        };
      default:
        return {
          title: 'Défi Personnalisé',
          desc: 'Épargner automatiquement selon vos règles.',
          icon: <Trophy className="text-emerald-600" size={18} />,
          bg: 'bg-emerald-50/40 border-emerald-100',
          amount: '5 DH / jour'
        };
    }
  };

  const handleSimulate = async () => {
    setAnimatingChallenge('all');
    await simulateChallengesAudit();
    setTimeout(() => {
      setAnimatingChallenge(null);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4 font-sans">
      
      {/* Title block */}
      <div className="space-y-1">
        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Trophy size={16} className="text-amber-500 animate-bounce" />
          <span>{t.title}</span>
        </h4>
        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{t.desc}</p>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        {challenges.map((c) => {
          const details = getChallengeDetails(c.type);
          return (
            <div 
              key={c.id} 
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                c.active ? `${details.bg} ring-1 ring-emerald-500/20` : 'border-slate-100 bg-slate-50/30 opacity-70'
              }`}
            >
              
              {/* Challenge Information */}
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-2xs">
                  {details.icon}
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                    {details.title}
                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-lg font-mono">
                      {details.amount}
                    </span>
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-xs">{details.desc}</p>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-dashed border-slate-150">
                {c.active && (
                  <div className="flex gap-3 text-[10px] font-bold text-slate-600 font-mono">
                    <span className="flex items-center gap-1">
                      <Flame className="text-orange-500 animate-pulse" size={12} />
                      <span>{c.streakDays}j</span>
                    </span>
                    <span className="text-emerald-700 font-black">
                      {c.savedAmount.toFixed(0)} DH
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleChallenge(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    c.active
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  {c.active ? t.deactivate : t.activate}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Simulation Audit Button */}
      {challenges.some((c) => c.active) && (
        <div className="pt-3 border-t border-slate-50 space-y-2.5 animate-fadeIn">
          <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" />
              <span>Outil de Test Floussi (Bac à sable)</span>
            </span>
            <p className="text-[10px] text-slate-500 font-medium leading-normal">{t.simulateDesc}</p>
          </div>

          <button
            type="button"
            onClick={handleSimulate}
            disabled={!!animatingChallenge}
            className="w-full py-2.5 border border-emerald-600/30 text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {animatingChallenge === 'all' ? (
              <>
                <Check className="text-emerald-600 animate-bounce" size={13} />
                <span>Succès de la simulation !</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>{t.simulateBtn}</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
