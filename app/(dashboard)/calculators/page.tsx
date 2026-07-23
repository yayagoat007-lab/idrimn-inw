import React, { useState } from 'react';
import { CalculatorCard } from '../../../components/calculators/CalculatorCard';
import { ZakatCalculator } from '../../../components/calculators/ZakatCalculator';
import { TaxCalculator } from '../../../components/calculators/TaxCalculator';
import { MortgageCalculator } from '../../../components/calculators/MortgageCalculator';
import { AutoLoanCalculator } from '../../../components/calculators/AutoLoanCalculator';
import { SavingsCalculator } from '../../../components/calculators/SavingsCalculator';
import { TransportComparator } from '../../../components/calculators/TransportComparator';
import { useTranslation } from '../../../hooks/use-translation';
import { 
  Calculator, 
  ArrowLeft, 
  Moon, 
  Percent, 
  Home, 
  Car, 
  PiggyBank, 
  Sparkles,
  Compass
} from 'lucide-react';

interface CalculatorsPageProps {
  language?: 'fr' | 'darija';
}

type ActiveCalculator = 'grid' | 'zakat' | 'tax' | 'mortgage' | 'autoloan' | 'savings' | 'transport';

export default function CalculatorsPage({ language: propLanguage }: CalculatorsPageProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const [activeCalc, setActiveCalc] = useState<ActiveCalculator>('grid');

  const t = {
    title: language === 'darija' ? 'Hisabat Floussi (Calculateurs)' : 'Calculateurs Financiers',
    subtitle: language === 'darija' ? 'Alat dyal l-hsab bach t-fhem masrouf dyalk' : 'Simulez vos impôts, votre crédit immobilier, vos projets d\'épargne ou vos trajets quotidiens.',
    backBtn: language === 'darija' ? 'Rje3 l l-Majmou3' : 'Retour aux calculateurs',
    zakatTitle: language === 'darija' ? 'Zakat d-Maal' : 'Zakat Al-Maal',
    zakatDesc: language === 'darija' ? 'Hsab l-Zakat dyalk' : 'Simulez le Nisab et le montant de votre Zakat annuelle.',
    taxTitle: language === 'darija' ? 'Driba 3la d-Dakh (IGR)' : 'Impôt sur le Revenu (IGR)',
    taxDesc: language === 'darija' ? 'Hsab driba dyalk' : 'Simulez votre salaire net après déduction d\'impôt (barème marocain).',
    mortgageTitle: language === 'darija' ? 'Crédit d-Sakan' : 'Crédit Immobilier',
    mortgageDesc: language === 'darija' ? 'Hsab kraya d-Dar' : 'Simulez vos mensualités, l\'assurance et les frais de notaire.',
    autoloanTitle: language === 'darija' ? 'Crédit d-Tomobil' : 'Crédit Auto',
    autoloanDesc: language === 'darija' ? 'Hsab kraya d-Tomobil' : 'Simulez le financement d\'un véhicule neuf ou d\'occasion.',
    savingsTitle: language === 'darija' ? 'Taqdir d-Iddikhar' : 'Simulateur d\'Épargne',
    savingsDesc: language === 'darija' ? 'Hsab l-massa7a dyal sandoq' : 'Calculez le temps nécessaire pour atteindre un objectif de capital.',
    transportTitle: language === 'darija' ? 'Mofadalat Triq' : 'Comparateur de Transports',
    transportDesc: language === 'darija' ? 'Hsab masrouf d-Rkoub' : 'Optimisez vos trajets (Taxi, Tram, Voiture) pour économiser.',
  };

  const renderActiveCalculator = () => {
    switch (activeCalc) {
      case 'zakat':
        return <ZakatCalculator onBack={() => setActiveCalc('grid')} />;
      case 'tax':
        return <TaxCalculator onBack={() => setActiveCalc('grid')} />;
      case 'mortgage':
        return <MortgageCalculator onBack={() => setActiveCalc('grid')} />;
      case 'autoloan':
        return <AutoLoanCalculator onBack={() => setActiveCalc('grid')} />;
      case 'savings':
        return <SavingsCalculator onBack={() => setActiveCalc('grid')} />;
      case 'transport':
        return (
          <div className="space-y-4">
            <button
              onClick={() => setActiveCalc('grid')}
              className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-500 hover:text-slate-800 tracking-wider transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{t.backBtn}</span>
            </button>
            <TransportComparator lang={language} />
          </div>
        );
      default:
        return null;
    }
  };

  if (activeCalc !== 'grid') {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24 font-sans">
        <div className="max-w-4xl mx-auto">
          {renderActiveCalculator()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24 font-sans" id="calculators-page">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-3xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute right-0 bottom-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-1">
              <Calculator size={13} />
              <span>Simulations & Estimations</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase">
              {t.title}
            </h1>
            <p className="text-xs text-slate-500 font-bold max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-2.5 rounded-2xl flex items-center gap-2 max-w-xs shrink-0">
            <Sparkles size={16} className="text-emerald-600 animate-pulse" />
            <span className="text-[10px] uppercase font-black leading-snug">
              {language === 'darija' ? "7isabat 100% m7alliya 3la 7sab l-qawanin d l-maghrib" : "Calculs 100% locaux basés sur les barèmes marocains"}
            </span>
          </div>
        </div>

        {/* Grid of calculators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="calculators-grid">
          
          <CalculatorCard 
            title={t.zakatTitle} 
            description={t.zakatDesc} 
            icon={Moon} 
            colorClass="bg-emerald-50 text-emerald-600" 
            onClick={() => setActiveCalc('zakat')} 
          />

          <CalculatorCard 
            title={t.taxTitle} 
            description={t.taxDesc} 
            icon={Percent} 
            colorClass="bg-blue-50 text-blue-600" 
            onClick={() => setActiveCalc('tax')} 
          />

          <CalculatorCard 
            title={t.mortgageTitle} 
            description={t.mortgageDesc} 
            icon={Home} 
            colorClass="bg-indigo-50 text-indigo-600" 
            onClick={() => setActiveCalc('mortgage')} 
          />

          <CalculatorCard 
            title={t.autoloanTitle} 
            description={t.autoloanDesc} 
            icon={Car} 
            colorClass="bg-amber-50 text-amber-600" 
            onClick={() => setActiveCalc('autoloan')} 
          />

          <CalculatorCard 
            title={t.savingsTitle} 
            description={t.savingsDesc} 
            icon={PiggyBank} 
            colorClass="bg-pink-50 text-pink-600" 
            onClick={() => setActiveCalc('savings')} 
          />

          <CalculatorCard 
            title={t.transportTitle} 
            description={t.transportDesc} 
            icon={Compass} 
            colorClass="bg-teal-50 text-teal-600" 
            onClick={() => setActiveCalc('transport')} 
          />

        </div>

      </div>
    </div>
  );
}
export { CalculatorsPage };
