import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Est-ce vraiment gratuit de commencer ?",
    answer: "Oui, l'accès de base est 100% gratuit. Vous pouvez créer jusqu'à 3 enveloppes budgétaires (seaux) différentes et y enregistrer vos rentrées et sorties d'argent à volonté, sans aucune publicité gênante."
  },
  {
    question: "Est-ce que ça fonctionne sans compte de banque au Maroc ?",
    answer: "Absolument ! Floussi est idéal pour un usage 'Cash-First'. Nous facilitons la gestion manuelle du cash. Vous pouvez aussi scanner vos tickets Marjane ou BIM, notre OCR lit automatiquement vos dépenses."
  },
  {
    question: "C'est quoi une Jmâa Digitale (Daret) ?",
    answer: "C'est la version moderne de la tontine marocaine traditionnelle. Vous pouvez créer un groupe d'épargne avec vos proches, fixer la mensualité (par exemple 500 DH) et suivre l'ordre de distribution et les contributions en toute transparence."
  },
  {
    question: "Mes données personnelles et financières sont-elles sécurisées ?",
    answer: "Toutes les connexions sont chiffrées de bout en bout (SSL/SOC 2). De plus, l'app respecte les directives strictes de la CNIL et n'est jamais connectée directement à votre compte bancaire sans votre consentement explicite."
  },
  {
    question: "Puis-je l'installer sur mon smartphone (iPhone / Android) ?",
    answer: "Oui ! Floussi est conçu en tant que PWA (Progressive Web App) et peut être ajouté à l'écran d'accueil en un clic. Il est également disponible via Capacitor pour des performances natives et le partage rapide."
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border border-slate-100 rounded-2xl bg-white overflow-hidden transition-all duration-200">
            <button
              onClick={() => toggle(idx)}
              className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <span className="text-xs font-black text-slate-800 leading-snug">{item.question}</span>
              {isOpen ? (
                <ChevronUp size={16} className="text-slate-500 shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-slate-500 shrink-0" />
              )}
            </button>
            
            {isOpen && (
              <div className="p-5 pt-0 border-t border-slate-50 text-xs text-slate-500 font-semibold leading-relaxed bg-slate-50/20">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default FAQAccordion;
