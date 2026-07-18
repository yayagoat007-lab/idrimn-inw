import React from 'react';
import { BackupPreview } from '../../lib/full-backup';
import { ShieldCheck, Calendar, Receipt, Target, Award, Wallet, Layers } from 'lucide-react';

interface BackupPreviewCardProps {
  preview: BackupPreview;
  language: 'fr' | 'darija';
}

export default function BackupPreviewCard({ preview, language }: BackupPreviewCardProps) {
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(preview.createdAt);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return preview.createdAt;
    }
  }, [preview.createdAt]);

  const t = {
    title: language === 'darija' ? 'Nacha2 l-Mola7ada dyal l-Bakap 🔍' : 'Aperçu de la Sauvegarde 🔍',
    subtitle: language === 'darija' ? "Had l-bakap s-s7i7a fih l-m3loumat l-talya :" : "Cette archive contient vos données sécurisées suivantes :",
    date: language === 'darija' ? "Khlaq f :" : "Créée le :",
    wallet: language === 'darija' ? "Rassid l-Wallet" : "Solde Portefeuille",
    transactions: language === 'darija' ? "L-Mu3amalat" : "Transactions",
    buckets: language === 'darija' ? "D-Drouf dyal t-Tawfir" : "Enveloppes / Buckets",
    goals: language === 'darija' ? "L-Ahdaf dyal l-Iddikhar" : "Objectifs d'Épargne",
    level: language === 'darija' ? "L-Moustawa dyal l-Xp" : "Niveau Atteint",
    badgeLabel: language === 'darija' ? "Mot de passe validé avec succès !" : "Archive déchiffrée avec succès !",
  };

  return (
    <div className="bg-slate-50 border border-emerald-100 rounded-2xl p-5 space-y-4 animate-fadeIn">
      {/* Header validation badge */}
      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100/60 px-3.5 py-2 rounded-xl text-xs font-semibold">
        <ShieldCheck className="text-emerald-600 flex-shrink-0 animate-bounce" size={16} />
        <span>{t.badgeLabel}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
          <Calendar size={13} className="text-slate-400" />
          <span>{t.date} <strong className="text-slate-800 font-extrabold">{formattedDate}</strong></span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Wallet balance */}
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={15} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">{t.wallet}</p>
              <p className="text-xs font-black text-slate-900 mt-1 font-mono">{preview.walletBalance.toLocaleString('fr-FR')} DH</p>
            </div>
          </div>

          {/* Level */}
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={15} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">{t.level}</p>
              <p className="text-xs font-black text-slate-900 mt-1">Niveau {preview.currentLevel}</p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt size={15} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">{t.transactions}</p>
              <p className="text-xs font-black text-slate-900 mt-1 font-mono">{preview.transactionsCount}</p>
            </div>
          </div>

          {/* Buckets */}
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Layers size={15} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">{t.buckets}</p>
              <p className="text-xs font-black text-slate-900 mt-1 font-mono">{preview.bucketsCount}</p>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white border border-slate-100 rounded-xl p-3 flex items-center gap-3 shadow-xs col-span-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Target size={15} />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">{t.goals}</p>
              <p className="text-xs font-black text-slate-900 mt-1 font-mono">{preview.goalsCount} objectifs d'épargne planifiés</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
