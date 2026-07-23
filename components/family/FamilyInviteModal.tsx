import React, { useState } from 'react';
import { Mail, Phone, Share2, Sparkles, X, QrCode } from 'lucide-react';
import { QRCodeGenerator } from '../shared/QRCodeGenerator';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { t, Language } from '../../lib/i18n';

interface FamilyInviteModalProps {
  onClose: () => void;
  onInvite: (emailOrPhone: string, role: 'member' | 'viewer' | 'child', sharedBuckets: string[], budgetLimit?: number) => void;
  availableBuckets: string[];
  language: Language;
}

export function FamilyInviteModal({ onClose, onInvite, availableBuckets, language }: FamilyInviteModalProps) {
  const isDarija = language === 'darija';
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [role, setRole] = useState<'member' | 'viewer' | 'child'>('member');
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([]);
  const [budgetLimit, setBudgetLimit] = useState('');
  const [showQR, setShowQR] = useState(false);

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen: true, onClose });

  const handleToggleBucket = (bucketName: string) => {
    setSelectedBuckets(prev => 
      prev.includes(bucketName) ? prev.filter(b => b !== bucketName) : [...prev, bucketName]
    );
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) return;

    onInvite(
      emailOrPhone,
      role,
      selectedBuckets,
      budgetLimit ? Number(budgetLimit) : undefined
    );
    onClose();
  };

  const handleShareWhatsApp = () => {
    const text = isDarija 
      ? `فلوصي عائلتي: دخل معايا لكروب العائلة باش نسيرو ميزانيتنا عائلتنا كاملين! ID: fg-${Math.floor(Math.random()*10000)}`
      : `Floussi Famille : Rejoins mon sandoq familial pour gérer ensemble notre budget ! ID Groupe: fg-${Math.floor(Math.random()*10000)}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          aria-label="Fermer l'invitation de la famille / إغلاق دعوة العائلة"
          className="absolute right-4 top-4 p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{t('inviteMemberTitle', language)}</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-4">
          {t('inviteMemberDesc', language)}
        </p>

        {!showQR ? (
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            {/* Input WhatsApp or Email */}
            <div className="text-[10px] font-bold text-slate-500">
              <label className="block mb-1">{t('emailOrPhoneLabel', language)}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={isDarija ? "مثلا: fatima@gmail.com أو +2126..." : "Ex: fatima@gmail.com ou +212 6..."}
                  className="w-full border border-slate-200 rounded-xl py-2 px-3 pl-8 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Role Select */}
            <div className="text-[10px] font-bold text-slate-500">
              <label className="block mb-1">{t('roleLabel', language)}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700 bg-white cursor-pointer"
              >
                <option value="member">{isDarija ? "عضو عائلتي (يقدر يخلص)" : "Co-gestionnaire (Modifier ses charges)"}</option>
                <option value="viewer">{isDarija ? "ملاحظ فقط (يشوف بلا ما يقيس)" : "Observateur (Lecture seule)"}</option>
                <option value="child">{isDarija ? "دري صغير (مصروف محدد)" : "Enfant (Plafond argent de poche)"}</option>
              </select>
            </div>

            {/* Budget limit for child */}
            {role === 'child' && (
              <div className="text-[10px] font-bold text-slate-500">
                <label className="block mb-1">{t('budgetLimitLabel', language)}</label>
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="Ex: 500 DH"
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:border-emerald-500"
                />
              </div>
            )}

            {/* Shared sandoqs checklists */}
            <div className="text-[10px] font-bold text-slate-500">
              <label className="block mb-1.5">{t('sharedEnvelopesLabel', language)}</label>
              <p className="text-[9px] text-slate-400 font-medium mb-2">{t('sharedEnvelopesDesc', language)}</p>
              <div className="space-y-1.5">
                {availableBuckets.map((bucket) => (
                  <label key={bucket} className="flex items-center gap-2 p-1.5 border border-slate-50 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedBuckets.includes(bucket)}
                      onChange={() => handleToggleBucket(bucket)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-600">{bucket}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex-1 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 py-2 text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQR(true)}
                className="px-3 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-500 transition-all flex items-center justify-center cursor-pointer"
                title={isDarija ? "كود QR" : "Générer Code QR"}
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                type="submit"
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-2 text-[10px] font-black uppercase tracking-wide transition-all cursor-pointer"
              >
                {t('inviteButton', language)}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <QRCodeGenerator value={`invite-family-group-fg-12903`} size={160} />
            <button
              onClick={() => setShowQR(false)}
              className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 cursor-pointer block mx-auto"
            >
              {isDarija ? "رجوع للفورم" : "Retour au formulaire"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default FamilyInviteModal;
