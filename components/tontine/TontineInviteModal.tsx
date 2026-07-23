import React, { useState } from 'react';
import { Share2, Sparkles, X, QrCode, Phone } from 'lucide-react';
import { QRCodeGenerator } from '../shared/QRCodeGenerator';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { t, Language } from '../../lib/i18n';

interface TontineInviteModalProps {
  tontineId: string;
  tontineName: string;
  onClose: () => void;
  language: Language;
}

export function TontineInviteModal({ tontineId, tontineName, onClose, language }: TontineInviteModalProps) {
  const isDarija = language === 'darija';
  const [phone, setPhone] = useState('');
  const [showQR, setShowQR] = useState(false);

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen: true, onClose });

  const inviteLink = `https://floussi.ma/join-jmâa?id=${tontineId}`;

  const handleShareWhatsApp = () => {
    const text = isDarija 
      ? `Rejoins ma Jmâa/Daret "${tontineName}" sur l'application Floussi pour cotiser ensemble en toute sécurité ! Lien d'invitation : ${inviteLink}`
      : `Rejoins ma Jmâa/Daret "${tontineName}" sur l'application Floussi pour cotiser ensemble en toute sécurité ! Lien d'invitation : ${inviteLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareSMS = () => {
    const text = isDarija 
      ? `Dkhoul l'Jmâa "${tontineName}" f Floussi: ${inviteLink}`
      : `Rejoins ma Jmâa "${tontineName}" sur Floussi : ${inviteLink}`;
    const url = `sms:${phone}?body=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border border-slate-100">
        <button 
          onClick={onClose}
          aria-label="Fermer l'invitation / إغلاق الدعوة"
          className="absolute right-4 top-4 p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{isDarija ? "3red 3la l-A3da' l'Jmâa" : "Inviter à la Jmâa"}</span>
        </h3>
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-4">
          {isDarija 
            ? `3red 3la chi had l'daret ${tontineName}. Ghaywsslo koud safe bach i'aked l-mousahama dyalo.` 
            : `Invitez un membre à rejoindre ${tontineName}. Ils recevront un lien sécurisé pour confirmer leur participation.`}
        </p>

        {!showQR ? (
          <div className="space-y-4">
            {/* Phone/WhatsApp Input */}
            <div className="text-[10px] font-bold text-slate-500">
              <label className="block mb-1">{isDarija ? "Nemra d'tilifoun (SMS)" : "Numéro de téléphone (SMS)"}</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +212 6..."
                  className="w-full border border-slate-200 rounded-xl py-2 px-3 pl-8 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Quick Share buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex-1 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 py-2 text-[10px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareSMS}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-2 text-[10px] font-black uppercase tracking-wide transition-all text-center cursor-pointer"
              >
                {isDarija ? "Ssefet SMS" : "Envoyer SMS"}
              </button>
            </div>

            {/* QR display option button */}
            <button
              onClick={() => setShowQR(true)}
              className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-[9px] font-black uppercase text-slate-600 tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isDarija ? "Choof koud QR" : "Afficher le Code QR"}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <QRCodeGenerator value={inviteLink} size={150} />
            <button
              onClick={() => setShowQR(false)}
              className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800 cursor-pointer block mx-auto"
            >
              {isDarija ? "Rje3 l'foq" : "Retour au partage"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
export default TontineInviteModal;
