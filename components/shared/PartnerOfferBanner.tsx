import React, { useState } from 'react';
import { PartnerOffer } from '../../types';
import { useAuth } from '../../hooks/use-auth';
import { getTranslation } from '../../lib/i18n';
import { 
  Gift, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Tag, 
  Volume2, 
  X, 
  ShieldCheck 
} from 'lucide-react';

const DEMO_OFFERS: PartnerOffer[] = [
  {
    id: 'opt-inwi',
    partnerName: 'Inwi',
    title: 'Offre Spéciale Recharge *6',
    description: 'Bénéficiez de +50% de volume internet supplémentaire sur vos recharges avec Floussi.',
    promoCode: 'FLOUSSI50',
    discountValue: '+50% Internet',
    category: 'telecom',
    linkUrl: 'https://www.inwi.ma',
    isFeatured: true
  },
  {
    id: 'opt-jumia',
    partnerName: 'Jumia Maroc',
    title: 'Réduction Électroménager',
    description: 'Profitez de 10% de réduction immédiate sur tous les articles de cuisine et maison.',
    promoCode: 'FLOUSSIJUM',
    discountValue: '-10% Réduction',
    category: 'shopping',
    linkUrl: 'https://www.jumia.ma',
    isFeatured: true
  },
  {
    id: 'opt-marjane',
    partnerName: 'Marjane',
    title: 'Premier Panier Offert',
    description: 'Économisez 50 DH sur votre première commande en ligne Marjane (minimum d\'achat 300 DH).',
    promoCode: 'FLOUSSIMAR',
    discountValue: '50 DH Offerts',
    category: 'alimentation',
    linkUrl: 'https://www.marjane.ma',
    isFeatured: false
  },
  {
    id: 'opt-careem',
    partnerName: 'Careem Maroc',
    title: 'Courses à prix réduit',
    description: 'Profitez de -20% de réduction sur vos 3 prochaines courses à Casablanca ou Rabat.',
    promoCode: 'FLOUSSICAR',
    discountValue: '-20% sur 3 courses',
    category: 'transport',
    linkUrl: 'https://www.careem.com',
    isFeatured: false
  },
  {
    id: 'opt-glovo',
    partnerName: 'Glovo Maroc',
    title: 'Livraison Gratuite Resto',
    description: 'La livraison est totalement offerte sur vos 2 premières commandes de restaurants locaux.',
    promoCode: 'FLOUSSIGLOV',
    discountValue: 'Livraison Gratuite',
    category: 'alimentation',
    linkUrl: 'https://www.glovoapp.com',
    isFeatured: false
  }
];

export function PartnerOfferBanner() {
  const { profile, upgradeSubscription } = useAuth();
  const lang = profile?.preferred_language || 'fr';
  const tier = profile?.subscription_tier || 'free';

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Offers are only visible for FREE tier users as a monetization mechanism
  if (tier !== 'free' || dismissed) {
    return null;
  }

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const nextOffer = () => {
    setCurrentIndex((prev) => (prev + 1) % DEMO_OFFERS.length);
  };

  const prevOffer = () => {
    setCurrentIndex((prev) => (prev - 1 + DEMO_OFFERS.length) % DEMO_OFFERS.length);
  };

  const offer = DEMO_OFFERS[currentIndex];

  const t = {
    sponsor: lang === 'darija' ? 'Choraka dyalna' : 'Partenaire Sponsorisé',
    copy: lang === 'darija' ? 'Nsek' : 'Copier',
    copied: lang === 'darija' ? 'T-nsekh !' : 'Copié !',
    cta: lang === 'darija' ? 'Ikhdem b l-Offre' : 'Profiter de l\'offre',
    premiumTitle: lang === 'darija' ? 'T-hanna mn l-Ich\'harat' : 'Supprimer les bannières',
    premiumDesc: lang === 'darija' ? 'Dowez l-Premium o thanna mn l-bannières o l-Ich\'harat choraka.' : 'Passez au Premium pour désactiver les bannières de nos partenaires et naviguer sans interruption.',
    upgradeBtn: lang === 'darija' ? 'Upgrade l-Premium' : 'Passer au Premium',
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-3xl p-5 shadow-xs relative overflow-hidden font-sans" id="partner-offer-banner">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
      
      {/* Dismiss Button */}
      <button 
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        aria-label="Fermer"
      >
        <X size={15} />
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Offer Details */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={10} className="animate-pulse" />
              <span>{t.sponsor} • {offer.partnerName}</span>
            </span>
            <span className="text-[9px] uppercase font-bold text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded-full">
              {offer.discountValue}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Gift size={16} className="text-amber-600 shrink-0" />
              <span>{offer.title}</span>
            </h3>
            <p className="text-xs text-slate-600 font-bold leading-relaxed max-w-2xl">
              {offer.description}
            </p>
          </div>

          {/* Interactive Promo code field */}
          <div className="flex items-center gap-2 pt-1">
            <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-3 font-mono font-bold text-xs text-slate-700 shadow-3xs">
              <Tag size={12} className="text-slate-400" />
              <span className="tracking-wider">{offer.promoCode}</span>
              <button
                type="button"
                onClick={() => handleCopy(offer.id, offer.promoCode)}
                className="text-amber-600 hover:text-amber-700 transition-colors cursor-pointer flex items-center gap-1 border-l border-slate-100 pl-3 active:scale-95"
              >
                {copiedId === offer.id ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-sans font-black text-emerald-600">{t.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="text-[10px] font-sans font-black">{t.copy}</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={offer.linkUrl}
              target="_blank"
              referrerPolicy="no-referrer"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-3xs"
            >
              <span>{t.cta}</span>
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Carousel controls & Premium upsell */}
        <div className="lg:border-l lg:border-amber-200/60 lg:pl-6 shrink-0 flex flex-col justify-center gap-3 min-w-56">
          {/* Navigation Dots */}
          <div className="flex items-center gap-2 justify-between">
            <span className="text-[9px] font-bold text-amber-700 uppercase">Offres ({currentIndex + 1}/{DEMO_OFFERS.length})</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={prevOffer} 
                className="w-5 h-5 bg-white border border-slate-200 hover:bg-slate-50 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer text-[10px] font-mono font-bold active:scale-90 shadow-3xs"
              >
                &lt;
              </button>
              <button 
                onClick={nextOffer} 
                className="w-5 h-5 bg-white border border-slate-200 hover:bg-slate-50 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer text-[10px] font-mono font-bold active:scale-90 shadow-3xs"
              >
                &gt;
              </button>
            </div>
          </div>

          {/* Mini premium promo */}
          <div className="bg-amber-100/50 rounded-2xl p-3 border border-amber-200/40 space-y-2">
            <div className="flex items-start gap-1.5">
              <ShieldCheck size={13} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wide leading-none">{t.premiumTitle}</h4>
                <p className="text-[9px] text-slate-500 font-bold leading-normal">{t.premiumDesc}</p>
              </div>
            </div>
            <button
              onClick={() => upgradeSubscription('premium')}
              className="w-full py-1 bg-slate-800 hover:bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-all active:scale-95 text-center block shadow-3xs"
            >
              {t.upgradeBtn}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
