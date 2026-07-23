import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQAccordion() {
  const { lang } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = lang === 'darija' ? [
    {
      question: "Wach f l-fabor de n-bda ?",
      answer: "Iyeh, l-bdaya 100% fabor. Qedder tsowweb tal 3 d l-enveloppes differentes o tbe3 flouss lli dakhla o kharja kima bghiti, bla pub."
    },
    {
      question: "Wach khddam bla hssab banki f l-Maghrib ?",
      answer: "Ma fihch l-choubouhate! Floussi mzyan bzzaf l l-cash. Kanssehlo tbe3 d l-cash b l-yed. Qedder tscanni ticket d Marjane aw BIM o scan kay-jib kolchi bouhdo."
    },
    {
      question: "Chnou hiya Jmâa Digitale (Daret) ?",
      answer: "Hadik hiya daret dyal l-mgharba l-asila me-qadda f t-tilifoun. Qedder tsowweb daret m3a hbabek, t-qad l-qitma (masalan 500 DH l l-chhar) o tbe3 chkoun khless o chkoun f noubto."
    },
    {
      question: "Wach m3loumat dyali securisees ?",
      answer: "Koulchi m-chiffré de bout en bout (SSL/SOC 2). Floussi respecte l-qanoun o makan-kounouch m-connectiyne m3a l-banka dyalk bla l-idhn dyalk."
    },
    {
      question: "Wach n-qedder n-dirha f t-tilifoun (iPhone / Android) ?",
      answer: "Iyeh! Floussi mswb k PWA o tqedder t-zido f l-ecran d l-accueil b clic wahed. Khddam mzyan f ay tilifoun."
    }
  ] : [
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

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {faqItems.map((item, idx) => {
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
