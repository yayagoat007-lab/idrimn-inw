import React, { useState } from 'react';
import { useWallet } from '../../hooks/use-wallet';
import { WalletBalanceCard } from './WalletBalanceCard';
import { RoundUpSettingsComponent } from './RoundUpSettings';
import { MicroSavingsChallenges } from './MicroSavingsChallenges';
import { P2PTransferModal } from './P2PTransferModal';
import { BillPaymentForm } from './BillPaymentForm';
import { RechargeForm } from './RechargeForm';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  X, 
  CreditCard, 
  Smartphone, 
  FileText, 
  Coins, 
  Sparkles, 
  AlertTriangle, 
  Search, 
  SlidersHorizontal,
  Calendar
} from 'lucide-react';

interface WalletPageProps {
  lang: 'fr' | 'darija';
}

export function WalletPage({ lang }: WalletPageProps) {
  const { balance, movements, dailySpent, toggleKyc, addFunds } = useWallet();
  
  // Navigation & Sub-form tabs
  const [activeTab, setActiveTab] = useState<'none' | 'add' | 'bill' | 'recharge'>('none');
  const [showP2P, setShowP2P] = useState(false);
  
  // Alimentation form state
  const [addAmount, setAddAmount] = useState('');
  const [addMethod, setAddMethod] = useState('Carte Bancaire');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  // Filters for ledger
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dictionary i18n
  const t = {
    title: lang === 'darija' ? 'Mihfadati (Portefeuille)' : 'Mon Portefeuille',
    subtitle: lang === 'darija' ? 'Mouvements d l-flous, l-khlassat o l-micro-saving f blassa wehda' : 'Gérez votre solde virtuel, vos paiements in-app et vos défis de micro-épargne',
    simulationBanner: lang === 'darija' ? 'Hada ghir bac à sable simulation Floussi. L-flous real ma ghay-mchiwch kma kan.' : 'Mode Simulation Actif — Aucun argent réel n\'est déplacé ni débité.',
    ledgerTitle: lang === 'darija' ? 'Sijil d l-Mouvements' : 'Historique des Mouvements',
    filterAll: lang === 'darija' ? 'Kolchi' : 'Tout',
    filterIn: lang === 'darija' ? 'Dkhoul' : 'Entrées',
    filterOut: lang === 'darija' ? 'Kherdja' : 'Sorties',
    searchPlaceholder: lang === 'darija' ? 'Sme7 r-recherche...' : 'Rechercher un mouvement...',
    noMovements: lang === 'darija' ? 'Makayan ta mouamala f had l-weqt' : 'Aucun mouvement enregistré pour l\'instant.',
    addFundsTitle: lang === 'darija' ? 'Alimenter mon Wallet' : 'Alimenter le Portefeuille',
    addAmountLabel: lang === 'darija' ? 'L-qadr d l-flous (DH) :' : 'Montant à ajouter (DH) :',
    addMethodLabel: lang === 'darija' ? 'Tariqat l-khlass :' : 'Moyen de paiement :',
    addSuccessMsg: lang === 'darija' ? 'Wallet t-alimenta b l-khir!' : 'Portefeuille alimenté avec succès !',
    addBtn: lang === 'darija' ? 'Zid l-flous' : 'Ajouter les fonds',
    billTitle: lang === 'darija' ? 'Khless Fatoura' : 'Régler une Facture',
    rechargeTitle: lang === 'darija' ? 'Recharge Mobile' : 'Recharge Express'
  };

  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess(false);

    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) {
      setAddError(lang === 'darija' ? 'Saisir qadr s7i7.' : 'Veuillez saisir un montant supérieur à 0.');
      return;
    }

    try {
      await addFunds(amt, addMethod);
      setAddSuccess(true);
      setAddAmount('');
      setTimeout(() => {
        setAddSuccess(false);
        setActiveTab('none');
      }, 1500);
    } catch (err: any) {
      setAddError(err.message || 'Une erreur est survenue.');
    }
  };

  // Filter & Search ledger logic
  const filteredMovements = movements.filter((m) => {
    // 1. Filter Type
    if (filterType === 'in' && !['add_funds', 'transfer_in'].includes(m.type)) return false;
    if (filterType === 'out' && !['transfer_out', 'bill_payment', 'recharge', 'round_up'].includes(m.type)) return false;
    
    // 2. Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        m.description.toLowerCase().includes(q) || 
        m.type.toLowerCase().includes(q) ||
        m.amount.toString().includes(q)
      );
    }

    return true;
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'add_funds':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Plus size={14} />
          </div>
        );
      case 'transfer_in':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <ArrowDownLeft size={14} />
          </div>
        );
      case 'transfer_out':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <ArrowUpRight size={14} />
          </div>
        );
      case 'bill_payment':
        return (
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <FileText size={14} />
          </div>
        );
      case 'recharge':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <Smartphone size={14} />
          </div>
        );
      case 'round_up':
        return (
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 animate-pulse">
            <Coins size={14} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center border border-slate-100">
            <Coins size={14} />
          </div>
        );
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'add_funds': return lang === 'darija' ? 'Alimentation' : 'Alimentation';
      case 'transfer_in': return lang === 'darija' ? 'Transfert reçu' : 'Transfert Reçu';
      case 'transfer_out': return lang === 'darija' ? 'Transfert envoyé' : 'Transfert Envoyé';
      case 'bill_payment': return lang === 'darija' ? 'Facture' : 'Paiement Facture';
      case 'recharge': return lang === 'darija' ? 'Recharge' : 'Recharge Express';
      case 'round_up': return lang === 'darija' ? 'Épargne automatique' : 'Épargne Arrondi';
      default: return 'Mouvement';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto font-sans pb-24" id="wallet-page-container">
      
      {/* Simulation Info Bar (Subtle, professional) */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-slate-600 shadow-2xs relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
        <AlertTriangle size={15} className="text-emerald-600 shrink-0" />
        <span className="font-bold leading-normal">{t.simulationBanner}</span>
      </div>

      {/* Main Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
            <CreditCard className="text-emerald-600" size={24} />
            <span>{t.title}</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-bold tracking-wide mt-0.5">{t.subtitle}</p>
        </div>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Wallet & Actions) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Wallet Balance Card */}
          <WalletBalanceCard
            balance={balance}
            dailySpent={dailySpent}
            lang={lang}
            onAddFunds={() => setActiveTab(activeTab === 'add' ? 'none' : 'add')}
            onSendP2P={() => setShowP2P(true)}
            onPayBill={() => setActiveTab(activeTab === 'bill' ? 'none' : 'bill')}
            onRecharge={() => setActiveTab(activeTab === 'recharge' ? 'none' : 'recharge')}
            onToggleKyc={toggleKyc}
          />

          {/* 2. Sliding form drawers (Active tab panel) */}
          {activeTab !== 'none' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm animate-fadeIn relative">
              <button 
                onClick={() => setActiveTab('none')}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* TAB A: ADD FUNDS */}
              {activeTab === 'add' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-50">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Plus size={16} className="text-emerald-600" />
                      <span>{t.addFundsTitle}</span>
                    </h3>
                  </div>

                  {addSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
                      <Sparkles className="text-emerald-600 animate-spin" size={16} />
                      <span>{t.addSuccessMsg}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleAddFundsSubmit} className="space-y-4">
                      {addError && (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-[11px] text-rose-600 font-bold rounded-xl">
                          ⚠️ {addError}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                          {t.addAmountLabel}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs font-mono">DH</span>
                          <input
                            type="number"
                            placeholder="Ex: 500"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                          {t.addMethodLabel}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Carte Bancaire', 'Virement (Simulation)'].map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setAddMethod(method)}
                              className={`p-2.5 border text-xs font-bold rounded-xl text-center transition-all cursor-pointer ${
                                addMethod === method
                                  ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800 font-black ring-1 ring-emerald-500'
                                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer shadow-md"
                      >
                        {t.addBtn}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB B: BILL PAYMENT */}
              {activeTab === 'bill' && (
                <div className="space-y-3">
                  <div className="pb-2 border-b border-slate-50 mb-3">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={16} className="text-emerald-600" />
                      <span>{t.billTitle}</span>
                    </h3>
                  </div>
                  <BillPaymentForm lang={lang} onSuccess={() => {}} />
                </div>
              )}

              {/* TAB C: RECHARGE */}
              {activeTab === 'recharge' && (
                <div className="space-y-3">
                  <div className="pb-2 border-b border-slate-50 mb-3">
                    <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Smartphone size={16} className="text-emerald-600" />
                      <span>{t.rechargeTitle}</span>
                    </h3>
                  </div>
                  <RechargeForm lang={lang} onSuccess={() => {}} />
                </div>
              )}

            </div>
          )}

          {/* 3. Consolidated Wallet Movements Ledger */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                {t.ledgerTitle}
              </h3>

              {/* Chips filter */}
              <div className="flex gap-1">
                {[
                  { value: 'all', label: t.filterAll },
                  { value: 'in', label: t.filterIn },
                  { value: 'out', label: t.filterOut }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFilterType(item.value)}
                    className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      filterType === item.value
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-1.5 pl-9 pr-4 text-[11px] font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* List */}
            {filteredMovements.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-bold text-center py-6">{t.noMovements}</p>
            ) : (
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredMovements.map((mov) => {
                  const isIn = ['add_funds', 'transfer_in'].includes(mov.type);
                  return (
                    <div key={mov.id} className="flex justify-between items-center text-xs group py-1 border-b border-slate-50/50 pb-2.5">
                      <div className="flex gap-3 items-center">
                        {getMovementIcon(mov.type)}
                        <div>
                          <span className="font-black text-slate-800 block text-[11px] leading-tight">
                            {mov.description}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar size={10} />
                            <span>{new Date(mov.createdAt).toLocaleDateString()} — {getMovementLabel(mov.type)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-black text-xs ${isIn ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {isIn ? '+' : '-'}{mov.amount.toFixed(2)} DH
                        </span>
                        <span className="text-[8px] block font-black uppercase text-emerald-600 mt-0.5 tracking-wider bg-emerald-50 px-1 py-0.2 rounded-md font-mono text-center max-w-[65px] ml-auto">
                          {mov.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

        {/* Right Column (Micro Savings Engines) */}
        <div className="lg:col-span-5 space-y-6">
          {/* A. Round up settings */}
          <RoundUpSettingsComponent lang={lang} />

          {/* B. Micro-saving gamified challenges */}
          <MicroSavingsChallenges lang={lang} />
        </div>

      </div>

      {/* P2P Transfer modal component (Floating overlay) */}
      <P2PTransferModal
        isOpen={showP2P}
        onClose={() => setShowP2P(false)}
        lang={lang}
      />

    </div>
  );
}
export default WalletPage;
