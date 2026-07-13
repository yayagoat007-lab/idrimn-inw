"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useNetWorth } from '../../../hooks/use-net-worth';
import { useNetWorthStats } from '../../../hooks/use-net-worth-stats';
import { PlanGate } from '../../../components/shared/PlanGate';
import { NetWorthSummaryCard } from '../../../components/net-worth/NetWorthSummaryCard';
import { NetWorthItemCard } from '../../../components/net-worth/NetWorthItemCard';
import { NetWorthChart } from '../../../components/net-worth/NetWorthChart';
import { AssetDebtForm } from '../../../components/net-worth/AssetDebtForm';
import { RepaymentSimulator } from '../../../components/net-worth/RepaymentSimulator';
import { Wallet, Plus, Sparkles } from 'lucide-react';
import { Language, getTranslation } from '../../../lib/i18n';

interface NetWorthPageProps {
  language: Language;
}

export default function NetWorthPage({ language }: NetWorthPageProps) {
  const { user, profile } = useAuth();
  const userId = user?.id || "mock-user-id-9999";

  // State hooks
  const { 
    items, 
    loading, 
    addItem, 
    updateItem, 
    deleteItem, 
    getHistoricalData, 
    getProjections,
    totalAssets,
    totalLiabilities,
    netWorth,
    debtToAssetRatio
  } = useNetWorth(userId);

  // UI States
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [selectedAssetForSimulator, setSelectedAssetForSimulator] = useState<any>(null);

  // Handle addition
  const handleSaveItem = async (data: any) => {
    if (editItem) {
      await updateItem(editItem.id, data);
    } else {
      await addItem(data);
    }
    setShowForm(false);
    setEditItem(null);
  };

  const assets = items.filter(i => i.type === 'asset');
  const liabilities = items.filter(i => i.type === 'liability');

  return (
    <PlanGate requiredTier="premium">
      <div className="space-y-6 font-sans">
        
        {/* Header Title Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Wallet className="text-emerald-600 w-5 h-5" />
              <span>{getTranslation('netWorth', language)} (Dakira du Patrimoine)</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              Consolidez vos biens réels (immobilier, or, voiture) et vos crédits bancaires pour mesurer votre richesse nette.
            </p>
          </div>

          <button
            onClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter au patrimoine</span>
          </button>
        </div>

        {/* 1. Net Worth KPI Summary Card widgets */}
        <NetWorthSummaryCard 
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          netWorth={netWorth}
          debtToAssetRatio={debtToAssetRatio}
        />

        {/* Form Modal overlay if active */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-xl">
              <AssetDebtForm
                item={editItem}
                onSave={handleSaveItem}
                onCancel={() => {
                  setShowForm(false);
                  setEditItem(null);
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Chart & Asset Listing (Colspan 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Net Worth Chart trend over time */}
            <NetWorthChart 
              historicalData={getHistoricalData()} 
              projectionData={getProjections()} 
            />

            {/* Patrimoine details section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Assets Section */}
              <div className="space-y-3">
                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Vos Actifs (Amwal)
                </span>
                
                {assets.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-100 p-4 rounded-2xl italic text-center">
                    Aucun actif enregistré. Cliquez sur le bouton d'ajout en haut.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {assets.map(item => (
                      <NetWorthItemCard
                        key={item.id}
                        item={item}
                        onEdit={(it) => {
                          setEditItem(it);
                          setShowForm(true);
                        }}
                        onDelete={deleteItem}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Liabilities Section */}
              <div className="space-y-3">
                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Vos Emprunts & Dettes (Douyoune)
                </span>
                
                {liabilities.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-100 p-4 rounded-2xl italic text-center">
                    Génial ! Vous n'avez aucun emprunt enregistré.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {liabilities.map(item => (
                      <NetWorthItemCard
                        key={item.id}
                        item={item}
                        onEdit={(it) => {
                          setSelectedAssetForSimulator(it);
                        }}
                        onDelete={deleteItem}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right: Repayment simulator and quick guides */}
          <div className="space-y-6">
            
            {/* Loan Payoff and Repayment simulator */}
            <RepaymentSimulator selectedLiability={selectedAssetForSimulator} />

            {/* Advisory Tips banner */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 p-5 rounded-2xl space-y-2">
              <Sparkles className="w-5 h-5 text-amber-600 animate-bounce" />
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                Règle de sécurité (Maroc)
              </h4>
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Le ratio d'endettement idéal des ménages selon Bank Al-Maghrib ne devrait pas excéder 35% à 40% du revenu mensuel net. Gardez un matelas de sécurité d'au moins 3 mois de dépenses fixes (loyer, alimentation) sur un compte d'épargne liquide.
              </p>
            </div>

          </div>

        </div>

      </div>
    </PlanGate>
  );
}
