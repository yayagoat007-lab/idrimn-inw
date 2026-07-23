import React, { useState } from 'react';
import { User, Smartphone, MapPin, ArrowLeft, ArrowRight, ShieldAlert } from 'lucide-react';
import { getTranslation, Language } from '../../lib/i18n';

interface Step2AccountProps {
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  language: Language;
  onNext: () => void;
  onPrev: () => void;
}

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Tétouan", "Oujda", 
  "Kenitra", "Safi", "El Jadida", "Beni Mellal", "Nador", "Khemisset", "Settat", 
  "Khouribga", "Larache", "Ksar El Kebir", "Guelmim", "Ouarzazate"
];

export function Step2Account({
  fullName,
  setFullName,
  phone,
  setPhone,
  city,
  setCity,
  language,
  onNext,
  onPrev
}: Step2AccountProps) {
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');

    if (!fullName.trim()) {
      setError(getTranslation('fullNameLabel', language) + (language === 'darija' ? ' darouri.' : ' est requis.'));
      return;
    }

    // Phone regex
    const phoneRegex = /^(?:\+212|0)[5-7]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      setError(language === 'darija' 
        ? "Had n-nimro d t-tilifoun machi s7i7. Khass i-bda b +212 wla 0, m-tbou3 b 9 d l-ar9am (Ex: 0612345678)."
        : "Le numéro de téléphone est invalide. Il doit commencer par +212 ou 0, suivi de 9 chiffres (ex: 0612345678).");
      return;
    }

    if (!city) {
      setError(getTranslation('cityLabel', language) + (language === 'darija' ? ' darouri.' : ' est requis.'));
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">
          {language === 'darija' ? 'المعلومات الشخصية' : 'Créons votre profil'}
        </h3>
        <p className="text-xs font-semibold text-slate-400">
          {language === 'darija' ? "Had l-ma3loumat ghadi i-3awnouna n-qado l-devise (MAD) o l-indarat dyalk." : "Ces détails nous aident à personnaliser votre devise (MAD) et vos alertes."}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2 text-xs font-bold leading-relaxed">
          <ShieldAlert size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {getTranslation('fullNameLabel', language)} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User size={16} />
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Karim Alaoui"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {getTranslation('phoneLabel', language)} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Smartphone size={16} />
            </span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +212 612345678 ou 0612345678"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* City Select */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {getTranslation('cityLabel', language)} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin size={16} />
            </span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-hidden focus:border-emerald-500 transition-all"
            >
              <option value="" disabled>{getTranslation('cityPlaceholder', language)}</option>
              {MOROCCAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onPrev}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{language === 'darija' ? "Rje3" : "Retour"}</span>
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{language === 'darija' ? "Kamal" : "Continuer"}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
export default Step2Account;
