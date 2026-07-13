import React from 'react';
import { Share2, MessageCircle, Send, Mail } from 'lucide-react';

interface ReferralShareProps {
  code: string;
}

export function ReferralShare({ code }: ReferralShareProps) {
  const shareText = `Rejoignez-moi sur Floussi pour piloter votre budget et sandoqs d'épargne ! Utilisez mon code parrainage ${code} pour obtenir 1 mois d'abonnement Premium gratuit.`;
  const encodedText = encodeURIComponent(shareText);

  const shareOptions = [
    { name: 'WhatsApp', icon: MessageCircle, url: `https://api.whatsapp.com/send?text=${encodedText}`, color: 'bg-emerald-550 text-white hover:bg-emerald-600' },
    { name: 'Facebook', icon: Share2, url: `https://www.facebook.com/sharer/sharer.php?u=https://floussi.ma`, color: 'bg-blue-600 text-white hover:bg-blue-700' },
    { name: 'Telegram', icon: Send, url: `https://t.me/share/url?url=https://floussi.ma&text=${encodedText}`, color: 'bg-sky-500 text-white hover:bg-sky-600' },
    { name: 'Email', icon: Mail, url: `mailto:?subject=Inscris-toi%20sur%20Floussi&body=${encodedText}`, color: 'bg-slate-800 text-white hover:bg-slate-900' }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
      <div>
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Partagez votre lien de parrainage</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Multipliez vos chances de gagner des abonnements Dahabi</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {shareOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <a
              key={opt.name}
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${opt.color}`}
            >
              <Icon size={14} />
              <span>{opt.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
export default ReferralShare;
