import React from 'react';
import { Layers, Camera, Users, Heart, Calendar, Sparkles } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

export function FeatureBento() {
  const { lang } = useTranslation();

  const features = [
    {
      icon: Layers,
      title: lang === 'darija' ? 'Enveloppes s-Snhirates' : 'Seaux Intelligents',
      description: lang === 'darija' 
        ? 'Farraq d-dkhel dyalk f snhirates dyal l-masrouf bach t-bqa dima f l-mizan dyalk.'
        : 'Répartissez vos revenus en sous-enveloppes virtuelles de dépenses pour ne plus jamais dépasser votre budget mensuel.',
      color: 'text-emerald-600 bg-emerald-50',
      span: 'md:col-span-2'
    },
    {
      icon: Camera,
      title: lang === 'darija' ? 'Scanner d l-Woraq' : 'Numériseur OCR Reçus',
      description: lang === 'darija'
        ? 'Sewwer ticket d Marjane, BIM aw Carrefour. L-IA kat-jib l-mablagh f l-blast.'
        : 'Prenez en photo vos reçus Marjane, BIM ou Carrefour. Notre intelligence artificielle détecte le montant en une seconde.',
      color: 'text-blue-600 bg-blue-50',
      span: 'md:col-span-1'
    },
    {
      icon: Users,
      title: lang === 'darija' ? 'Daret f t-tilifoun' : 'Jmâa Digitale (Daret)',
      description: lang === 'darija'
        ? 'Sowweb daret secure m3a hbabek o lailyak. Tbe3 chkoun khless o chkoun f noubto deghya.'
        : 'Créez ou rejoignez une tontine en ligne sécurisée avec vos proches. Suivez les ordres de tirage et relancez les retards en un clic.',
      color: 'text-amber-600 bg-amber-50',
      span: 'md:col-span-1'
    },
    {
      icon: Heart,
      title: lang === 'darija' ? 'Mizaniyatt l-Aila' : 'Supervision Famille',
      description: lang === 'darija'
        ? 'Khlli wlad b masrouf d-jib dyalhom, charqi snhirates dyal l-dar, o tbe3 l-mizan d l-khayma.'
        : 'Attribuez des budgets de poche à vos enfants, partagez des seaux d\'épense communs et suivez l\'éducation financière de votre foyer.',
      color: 'text-rose-600 bg-rose-50',
      span: 'md:col-span-2'
    },
    {
      icon: Calendar,
      title: lang === 'darija' ? 'Yowmiat Ramadan o l-Hijri' : 'Calendrier Ramadan & Hijri',
      description: lang === 'darija'
        ? 'Gadd l-masrouf d Ramadan, l-Aid, o l-madrassa b l-calendrier l-mali dyalna.'
        : 'Planifiez vos pics saisonniers (Ramadan, Aïd Al Adha, rentrée scolaire) grâce à notre calendrier financier adapté.',
      color: 'text-purple-600 bg-purple-50',
      span: 'md:col-span-1'
    },
    {
      icon: Sparkles,
      title: lang === 'darija' ? 'Nasayih dyal l-IA b l-hedra' : 'Conseils IA Predictifs',
      description: lang === 'darija'
        ? 'Asma3 nasayih b l-darija men 3nd l-IA o alertes b sout d l-kheff.'
        : 'Recevez des alertes vocales en Darija et des conseils sur-mesure pour lisser vos d\'après vos habitudes réelles.',
      color: 'text-teal-600 bg-teal-50',
      span: 'md:col-span-2'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {features.map((feat, idx) => {
        const Icon = feat.icon;
        return (
          <div
            key={idx}
            className={`bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${feat.span}`}
          >
            <div className={`w-10 h-10 rounded-xl ${feat.color} flex items-center justify-center`}>
              <Icon size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{feat.title}</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">{feat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default FeatureBento;
