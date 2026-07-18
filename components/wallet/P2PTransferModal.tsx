import React, { useState } from 'react';
import { useP2PTransfer } from '../../hooks/use-p2p-transfer';
import { useWallet } from '../../hooks/use-wallet';
import { X, Send, ArrowLeft, CheckCircle2, QrCode, Clipboard, Smartphone, Lock, Sparkles, FileText } from 'lucide-react';
import { P2PTransfer } from '../../types';
import { useFocusTrap } from '../../hooks/use-focus-trap';

interface P2PTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'darija';
}

export function P2PTransferModal({ isOpen, onClose, lang }: P2PTransferModalProps) {
  const { balance } = useWallet();
  const { sendTransfer, generateQRCodeSvg } = useP2PTransfer();

  const [step, setStep] = useState<'form' | 'pin' | 'receipt'>('form');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  // PIN code entry
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<P2PTransfer | null>(null);

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  // Dictionary for easy translations
  const t = {
    title: lang === 'darija' ? 'Sifet l-flous dghya' : "Transfert d'argent instantané",
    subtitle: lang === 'darija' ? 'Envoi P2P sans frais dghya o s-sahl' : 'Envoi P2P instantané sans frais entre portefeuilles Floussi',
    phoneLabel: lang === 'darija' ? 'Raqm d l-mousstafid' : 'Numéro du destinataire',
    phonePlaceholder: lang === 'darija' ? 'Ex: 0612345678' : 'Ex: 0612345678',
    amountLabel: lang === 'darija' ? 'L-qadr (DH)' : 'Montant (DH)',
    noteLabel: lang === 'darija' ? 'Sbab / Note' : 'Note / Motif (Optionnel)',
    notePlaceholder: lang === 'darija' ? 'Ex: Flous lghda' : 'Ex: Déjeuner, Cadeau, etc.',
    balanceLabel: lang === 'darija' ? 'Solde dyalek :' : 'Votre solde :',
    nextBtn: lang === 'darija' ? 'Zid l-gdam' : 'Suivant',
    pinTitle: lang === 'darija' ? 'Dkhel l-PIN dyalek d l-amane' : 'Code PIN de sécurité',
    pinDesc: lang === 'darija' ? 'Dkhel 4 d l-arqam dial l-koud' : 'Entrez votre code secret de sécurité à 4 chiffres pour valider le virement',
    pinConfirm: lang === 'darija' ? 'Akeked l-mouamala' : 'Confirmer le transfert',
    backBtn: lang === 'darija' ? 'Rje3' : 'Retour',
    successTitle: lang === 'darija' ? 'T-sifet l-flous b l-khir!' : 'Transfert envoyé avec succès !',
    receiptTitle: lang === 'darija' ? 'Reçu d l-intiqal' : 'Reçu de transfert numérique',
    senderLabel: lang === 'darija' ? 'Expéditeur' : 'Expéditeur',
    recipientLabel: lang === 'darija' ? 'Destinataire' : 'Destinataire',
    transId: lang === 'darija' ? 'Raqm d l-mouamala' : 'Numéro de transaction',
    dateLabel: lang === 'darija' ? 'Date' : 'Date',
    closeBtn: lang === 'darija' ? 'Sedd' : 'Fermer',
    insufficient: lang === 'darija' ? 'Ma3ndekch flous kafi' : 'Solde de portefeuille insuffisant'
  };

  const handleNextStep = () => {
    setError('');
    const parsedAmount = parseFloat(amount);
    if (!phone || phone.length < 9) {
      setError(lang === 'darija' ? 'Raqm l-hatif ghalat.' : 'Numéro de téléphone invalide.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(lang === 'darija' ? 'Saisir qadr s7i7.' : 'Veuillez saisir un montant valide supérieur à 0.');
      return;
    }
    if (balance && balance.balance < parsedAmount) {
      setError(t.insufficient);
      return;
    }

    setStep('pin');
  };

  const handleKeyPress = (num: string) => {
    setError('');
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleConfirmTransfer = async () => {
    if (pin.length !== 4) {
      setError(lang === 'darija' ? 'Kamel l-koud (4 d l-arqam)' : 'Le code PIN doit comporter 4 chiffres.');
      return;
    }
    // Simulation logic - accept any pin for play mode, or check default 1234 / 0000
    setLoading(true);
    try {
      const res = await sendTransfer(phone, parseFloat(amount), note);
      setReceipt(res);
      setStep('receipt');
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  const qrCodeSvg = receipt ? generateQRCodeSvg(`p2p-tx:${receipt.id}:${receipt.amount}`) : '';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
      <div ref={modalRef} className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Header (except for final receipt screen) */}
        {step !== 'receipt' && (
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wider">
                <Send size={16} className="text-emerald-600 animate-pulse" />
                <span>{t.title}</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{t.subtitle}</p>
            </div>
            <button 
              onClick={onClose} 
              aria-label="Fermer le transfert / إغلاق التحويل"
              className="p-1.5 hover:bg-slate-150 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Errors banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 font-extrabold animate-bounce">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <div className="p-6 space-y-4">
            
            {/* Balance Indicator */}
            <div className="bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100">
              <span className="text-xs font-bold text-slate-500">{t.balanceLabel}</span>
              <span className="text-sm font-black text-emerald-700 font-mono">
                {balance ? balance.balance.toFixed(2) : '0.00'} DH
              </span>
            </div>

            {/* Destination phone input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                {t.phoneLabel}
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                {t.amountLabel}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs font-mono">DH</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                {t.noteLabel}
              </label>
              <input
                type="text"
                placeholder={t.notePlaceholder}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Simulation Warning */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 font-bold leading-normal">
              🌐 <strong>Mode Simulation :</strong> Aucun argent réel ne sera transféré. Utile pour tester l'UX Floussi.
            </div>

            {/* Next trigger */}
            <button
              onClick={handleNextStep}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md cursor-pointer transition-colors mt-2"
            >
              {t.nextBtn}
            </button>
          </div>
        )}

        {/* STEP 2: PIN PAD */}
        {step === 'pin' && (
          <div className="p-6 space-y-5">
            <button 
              onClick={() => { setStep('form'); setPin(''); }}
              className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowLeft size={12} />
              <span>{t.backBtn}</span>
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-1">
                <Lock className="text-emerald-600" size={20} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">{t.pinTitle}</h4>
              <p className="text-[10px] text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">{t.pinDesc}</p>
            </div>

            {/* Dots representation */}
            <div className="flex justify-center gap-4 py-3">
              {[0, 1, 2, 3].map((idx) => (
                <div 
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    pin.length > idx ? 'bg-emerald-600 border-emerald-600 scale-110' : 'bg-transparent border-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto font-mono">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-lg font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDelete}
                className="w-14 h-14 text-slate-400 hover:text-slate-600 text-xs font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              >
                EFF
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-lg font-black flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              >
                0
              </button>
              <div className="w-14 h-14" />
            </div>

            {/* Submit button */}
            <button
              onClick={handleConfirmTransfer}
              disabled={loading || pin.length < 4}
              className={`w-full py-3 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md transition-all ${
                pin.length === 4 && !loading
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              {loading ? 'Traitement...' : t.pinConfirm}
            </button>
          </div>
        )}

        {/* STEP 3: RECEIPT */}
        {step === 'receipt' && receipt && (
          <div className="p-6 space-y-5 text-center bg-slate-50/20">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="text-emerald-500 animate-pulse" size={32} />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-800 text-sm">{t.successTitle}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles size={11} className="text-amber-500" />
                <span>Simulation terminée</span>
              </p>
            </div>

            {/* Digital Receipt Form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 text-left space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
              
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileText size={11} />
                  <span>{t.receiptTitle}</span>
                </span>
                <span className="text-xs font-black text-slate-800 font-mono">
                  -{receipt.amount.toFixed(2)} DH
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">{t.recipientLabel}</span>
                  <span className="text-slate-800 font-black font-mono">{receipt.toPhone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Motif</span>
                  <span className="text-slate-800 font-bold">{receipt.note || '—'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">{t.transId}</span>
                  <span className="text-slate-600 font-black font-mono text-[10px] select-all cursor-pointer hover:text-emerald-600">
                    {receipt.id}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">{t.dateLabel}</span>
                  <span className="text-slate-600 font-medium">
                    {new Date(receipt.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* SVG QR Code */}
              <div className="pt-3 border-t border-slate-50 flex flex-col items-center gap-2">
                <div className="w-24 h-24 p-1 border border-slate-100 rounded-2xl bg-slate-50">
                  <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} className="w-full h-full" />
                </div>
                <span className="text-[8px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-1">
                  <QrCode size={10} />
                  <span>Scanner pour vérifier</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                // Reset State
                setStep('form');
                setPhone('');
                setAmount('');
                setNote('');
                setPin('');
                setReceipt(null);
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-colors"
            >
              {t.closeBtn}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
