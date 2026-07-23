import React, { useState } from 'react';
import { Tontine, TontineMember, TontinePayment } from '../../types';
import { Check, AlertTriangle, ShieldCheck, Download, Sparkles, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { t, Language } from '../../lib/i18n';

interface TontinePaymentTrackerProps {
  tontine: Tontine;
  members: TontineMember[];
  payments: TontinePayment[];
  onConfirmPayment: (memberId: string, round: number, pin: string) => Promise<boolean>;
  isAdmin: boolean;
  language: Language;
}

export function TontinePaymentTracker({ tontine, members, payments, onConfirmPayment, isAdmin, language }: TontinePaymentTrackerProps) {
  const isDarija = language === 'darija';
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ memberId: string; round: number } | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rounds = Array.from({ length: tontine.total_members }, (_, i) => i + 1);

  const getPaymentStatus = (memberId: string, round: number) => {
    return payments.find(p => p.member_id === memberId && p.round_number === round);
  };

  const handleCellClick = (memberId: string, round: number) => {
    const pay = getPaymentStatus(memberId, round);
    if (pay?.status === 'paid') return; // already paid

    setSelectedCell({ memberId, round });
    setPinCode('');
    setErrorText('');
    setShowPinModal(true);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length !== 4) {
      setErrorText(isDarija ? "Koud PIN khass fih 4 d l-arqaam exact." : "Le code PIN doit comporter 4 chiffres.");
      return;
    }
    if (!selectedCell) return;

    setIsSubmitting(true);
    setErrorText('');
    try {
      const success = await onConfirmPayment(selectedCell.memberId, selectedCell.round, pinCode);
      if (success) {
        setShowPinModal(false);
        setSelectedCell(null);
      } else {
        setErrorText(isDarija ? "PIN ghalat aw khass t-shih khor." : "Code PIN incorrect ou double-signature requise.");
      }
    } catch (err: any) {
      setErrorText(err?.message || (isDarija ? "Ghalat f l-authentification." : "Erreur d'authentification."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    // Basic CSV generator
    let csv = "Membre," + rounds.map(r => `Rond ${r}`).join(",") + "\n";
    members.forEach((m, idx) => {
      const name = m.user_id === 'user-1' ? 'Ahmed El Alami' : m.user_id === 'user-2' ? 'Fatima' : `Membre ${idx + 1}`;
      const row = [name];
      rounds.forEach(r => {
        const pay = getPaymentStatus(m.id, r);
        row.push(pay ? pay.status : "en_attente");
      });
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `tontine-payments-${tontine.id}.csv`);
    a.click();
  };

  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            {isDarija ? "Matrice dyal mousahamat (\"Chkoun Khalass\")" : "Matrice des Cotisations (\"Chkoun Khalass\")"}
          </h4>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
            {isDarija ? "Klike f koula blassa bach t-khless" : "Cliquez sur une case pour valider un paiement"}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 font-black text-[9px] uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isDarija ? "Ssefet CSV" : "Exporter CSV"}</span>
        </button>
      </div>

      {/* Grid Matrix scroll */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-2 text-[9px] font-bold text-slate-400 uppercase text-left pr-4">{isDarija ? "Participant" : "Participant"}</th>
              {rounds.map(r => (
                <th key={r} className="py-2 text-[9px] font-bold text-slate-400 uppercase text-center min-w-[60px]">{isDarija ? `Doora ${r}` : `Rond ${r}`}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, idx) => {
              const name = m.user_id === 'user-1' ? 'Ahmed El Alami' : m.user_id === 'user-2' ? 'Fatima' : `Cousin ${idx + 1}`;

              return (
                <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="py-3 text-[10px] font-black text-slate-800 pr-4">{name}</td>
                  {rounds.map(r => {
                    const pay = getPaymentStatus(m.id, r);
                    const isPaid = pay?.status === 'paid';
                    const isPending = pay?.status === 'pending';
                    const amount = tontine.contribution_amount;

                    let cellStyle = "bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-400";
                    if (isPaid) cellStyle = "bg-emerald-500 border-emerald-500 text-white shadow-xs";
                    if (isPending) cellStyle = "bg-amber-400 border-amber-400 text-white shadow-xs";

                    return (
                      <td key={r} className="py-2.5 text-center">
                        <button
                          onClick={() => handleCellClick(m.id, r)}
                          disabled={isPaid}
                          className={`w-9 h-9 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${cellStyle}`}
                          title={`Rond ${r}: ${formatCurrency(amount)}`}
                        >
                          {isPaid ? (
                            <Check className="w-4 h-4" />
                          ) : isPending ? (
                            <div className="flex flex-col items-center">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="text-[7px] font-bold">1/2</span>
                            </div>
                          ) : (
                            <span className="text-[8px] font-black">{r}</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PIN authentication Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border border-slate-100">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              <span>{isDarija ? "Ta'kid dyal l-khalass" : "Validation de Versement"}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-4">
              {isDarija ? (
                <>Had l-khalass fih <strong className="text-slate-800">{formatCurrency(tontine.contribution_amount)}</strong>. Kteb l-koud PIN dyalek de 4 d l-arqaam bach t-'aked.</>
              ) : (
                <>La transaction s'élève à <strong className="text-slate-800">{formatCurrency(tontine.contribution_amount)}</strong>. Entrez votre PIN 4 chiffres pour approuver.</>
              )}
              {tontine.contribution_amount > 5000 && (
                <span className="block mt-2 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  {isDarija 
                    ? "⚠️ L-flouss ktar men 5 000 DH. Khass l-PIN dyal 2 d l-administrateurs." 
                    : "⚠️ Somme supérieure à 5 000 DH. Requiert la validation PIN de 2 administrateurs différents."}
                </span>
              )}
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                required
                maxLength={4}
                pattern="\d{4}"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder={isDarija ? "Koud PIN dyal 4 d l-arqaam (مثلا: 1234)" : "PIN à 4 chiffres (ex: 1234)"}
                className="w-full border border-slate-200 rounded-xl p-3 text-center tracking-widest text-lg font-black outline-none focus:border-emerald-500"
              />

              {errorText && (
                <p className="text-[9px] text-red-500 font-bold text-center">
                  {errorText}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setSelectedCell(null); }}
                  className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl py-2 text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-2 text-[10px] font-black uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{isDarija ? "Ta'kid" : "Confirmer"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default TontinePaymentTracker;
