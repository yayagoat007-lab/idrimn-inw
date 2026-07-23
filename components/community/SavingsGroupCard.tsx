import React, { useState } from 'react';
import { SavingsGroup } from '../../types';
import { 
  Users, 
  TrendingUp, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Sparkles,
  Award
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Language } from '../../lib/i18n';

interface SavingsGroupCardProps {
  group: SavingsGroup;
  contributions: any[];
  isAdmin: boolean;
  language: Language;
  onContribute: (groupId: string, amount: number) => Promise<any>;
}

export function SavingsGroupCard({ group, contributions = [], isAdmin, language, onContribute }: SavingsGroupCardProps) {
  const [amountInput, setAmountInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const progressPercent = Math.min(100, Math.round((group.currentAmount / group.targetAmount) * 100));
  const completed = progressPercent >= 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(group.deadline).getTime() - Date.now()) / (1000 * 3600 * 24)));
  const isDarija = language === 'darija';

  const t = {
    progress: isDarija ? 'Taqadom l-Okhra dyalna :' : 'Progression collective :',
    targetOf: isDarija ? 'mn l-hadaf d' : 'sur un objectif de',
    daysLeft: isDarija ? 'Iyam ba9ya' : 'jours restants',
    contributeBtn: isDarija ? 'Saham' : 'Cotiser',
    placeholder: 'Ex: 100',
    adminBadge: isDarija ? 'Admin l-Group' : 'Admin du Groupe',
    memberBadge: isDarija ? 'Modawen' : 'Membre',
    historyTitle: isDarija ? 'Sijil d l-Cotisat' : 'Historique des Cotisations',
    contribCount: isDarija ? 'Motatabi3in' : 'contributions',
    privacyNote: isDarija ? 'L-Cotisat anonymes l-okhrin' : 'Sécurité Floussi : Cotisations anonymisées pour préserver la vie privée.',
    completedMsg: isDarija ? 'Mabrouk ! Hadaf t-7e9e9 ! 🥳' : 'Félicitations, cagnotte complétée ! 🥳',
    successText: isDarija ? 'Cotis t-sajlat !' : 'Cotisation validée !',
    inputLabel: isDarija ? '9adr l-mosharka (DH) :' : 'Montant de la cotisation (DH) :'
  };

  const handleContribSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg(isDarija ? 'Montant s7i7.' : 'Veuillez saisir un montant valide supérieur à 0.');
      return;
    }

    setSubmitting(true);
    try {
      await onContribute(group.id, amt);
      setSuccessMsg(t.successText);
      setAmountInput('');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-white border rounded-3xl p-5 shadow-3xs transition-all relative overflow-hidden font-sans ${
      completed 
        ? 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50/10' 
        : 'border-slate-100'
    }`} id={`savings-group-${group.id}`}>
      
      {/* Background decoration for completed collective goals */}
      {completed && (
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      )}

      {/* Header details */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div>
          <h4 className="font-black text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
            <span>{group.name}</span>
          </h4>
          <span className="text-[9px] font-bold text-slate-400 font-mono block mt-0.5 flex items-center gap-1">
            <Calendar size={11} />
            <span>{daysLeft} {t.daysLeft} • {group.memberIds.length} membres</span>
          </span>
        </div>

        {/* Creator / Admin Badge */}
        {isAdmin ? (
          <div className="flex items-center gap-1 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full text-[9px] font-black text-purple-700 uppercase tracking-wider">
            <Unlock size={10} />
            <span>{t.adminBadge}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            <Lock size={10} />
            <span>{t.memberBadge}</span>
          </div>
        )}
      </div>

      {/* Collective Progress Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <span>{t.progress}</span>
          <span className="font-mono text-slate-700">
            {formatCurrency(group.currentAmount)} / {formatCurrency(group.targetAmount)}
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-100/40">
          <div 
            className={`h-full transition-all duration-500 ${
              completed ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
          <span>{progressPercent}% complété</span>
          {completed && (
            <span className="text-emerald-600 font-black flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle size={10} />
              <span>{t.completedMsg}</span>
            </span>
          )}
        </div>
      </div>

      {/* Contribution Form (Deducts from real-time wallet) */}
      {!completed && (
        <form onSubmit={handleContribSubmit} className="space-y-2 mb-4 bg-slate-50/50 border border-slate-100/50 p-3.5 rounded-2xl">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            {t.inputLabel}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] font-mono">DH</span>
              <input
                type="number"
                placeholder={t.placeholder}
                value={amountInput}
                disabled={submitting}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-1.5 pl-9 pr-3 text-xs font-black text-slate-800 focus:outline-hidden transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !amountInput}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-xs"
            >
              <Plus size={11} />
              <span>{t.contributeBtn}</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <span className="text-[10px] text-rose-600 font-bold block mt-1">⚠️ {errorMsg}</span>
          )}
          {successMsg && (
            <span className="text-[10px] text-emerald-600 font-black block mt-1 flex items-center gap-1">
              <CheckCircle size={10} />
              <span>{successMsg}</span>
            </span>
          )}
        </form>
      )}

      {/* Privacy disclaimer and ledger list toggle */}
      <div className="space-y-3 pt-2 border-t border-slate-50">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Users size={12} />
            <span>{t.historyTitle} ({contributions.length})</span>
          </button>
        </div>

        {/* Privacy Note */}
        {!isAdmin && (
          <p className="text-[8px] text-slate-400 font-bold italic leading-normal block">
            🔒 {t.privacyNote}
          </p>
        )}

        {/* Contributions Ledger List */}
        {showHistory && (
          <div className="space-y-2 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl max-h-40 overflow-y-auto">
            {contributions.length === 0 ? (
              <p className="text-[9px] text-slate-400 text-center font-bold py-2">Aucune cotisation enregistrée.</p>
            ) : (
              contributions.map((c, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] border-b border-slate-100 last:border-none pb-1.5 last:pb-0 pt-1.5 first:pt-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-700">@{c.authorName}</span>
                    <span className="text-[8px] text-slate-400 font-mono">{new Date(c.date).toLocaleDateString()}</span>
                  </div>
                  <span className="font-mono font-black text-slate-800">+{c.amount.toFixed(0)} DH</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
export default SavingsGroupCard;
