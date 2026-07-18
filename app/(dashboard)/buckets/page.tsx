"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, SlidersHorizontal, ArrowUpDown, ChevronDown, 
  Sparkles, RefreshCw, AlertCircle, ArrowRightLeft, Settings, Info
} from 'lucide-react';
import { useBuckets } from '../../../hooks/use-buckets';
import { useBucketStats } from '../../../hooks/use-bucket-stats';
import { useAuth } from '../../../hooks/use-auth';
import { BucketCard } from '../../../components/buckets/BucketCard';
import { TransferModal } from '../../../components/buckets/TransferModal';
import { QuickAddExpense } from '../../../components/buckets/QuickAddExpense';
import { PlanLimitBanner } from '../../../components/shared/PlanLimitBanner';
import { SkeletonCard } from '../../../components/shared/SkeletonCard';
import { formatCurrency } from '../../../lib/utils';
import { Language, getTranslation } from '../../../lib/i18n';
import { motion, AnimatePresence } from 'motion/react';

interface BucketsPageProps {
  buckets?: any[];
  onCreate?: (data: any) => void;
  onDelete?: (id: string) => void;
  onAutoAllocate?: (income: number) => void;
  onQuickAddBucket?: () => void;
  language: Language;
  onNavigate?: (screen: string) => void;
}

export default function BucketsPage({
  buckets: passedBuckets,
  onCreate,
  onDelete: passedOnDelete,
  onAutoAllocate,
  onQuickAddBucket,
  language = 'fr',
  onNavigate
}: BucketsPageProps) {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { 
    buckets: hookBuckets, 
    loading, 
    createBucket, 
    updateBucket, 
    deleteBucket: hookDeleteBucket, 
    reorderBuckets, 
    transferBetweenBuckets, 
    quickAddExpense, 
    autoAllocate: hookAutoAllocate 
  } = useBuckets(userId);

  const { stats, loading: statsLoading, refreshStats } = useBucketStats(userId);

  // Support props fallbacks
  const activeBuckets = passedBuckets || hookBuckets;
  const handleDeleteBucket = passedOnDelete || hookDeleteBucket;
  const handleAutoAllocate = onAutoAllocate || hookAutoAllocate;

  // Local state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, essential, optional
  
  const [activeTransferBucket, setActiveTransferBucket] = useState<any | null>(null);
  const [activeQuickAddBucket, setActiveQuickAddBucket] = useState<any | null>(null);
  const [allocationSalary, setAllocationSalary] = useState<string>('8000');
  const [showAllocateNotice, setShowAllocateNotice] = useState(false);

  // Filter & Search Logic
  const filteredBuckets = activeBuckets.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          b.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || 
                            (priorityFilter === 'essential' && b.is_essential) ||
                            (priorityFilter === 'optional' && !b.is_essential);
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Separate parent and child buckets for hierarchical view
  const rootBuckets = filteredBuckets.filter(b => !b.parent_id);
  const subBuckets = filteredBuckets.filter(b => b.parent_id);

  // Totals calculations
  const totalAllocated = activeBuckets.reduce((sum, b) => sum + (b.allocated_amount || 0), 0);
  const totalSpent = activeBuckets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);

  const handleAllocateSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(allocationSalary);
    if (isNaN(amount) || amount <= 0) return;
    
    await handleAutoAllocate(amount);
    setShowAllocateNotice(true);
    setTimeout(() => setShowAllocateNotice(false), 4000);
    refreshStats();
  };

  // Drag and drop / index reordering simulation
  const moveBucket = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= rootBuckets.length) return;

    const list = [...rootBuckets];
    const temp = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = temp;

    await reorderBuckets([...list, ...subBuckets]);
    refreshStats();
  };

  const isFreeTier = activeBuckets.length >= 3; // soft check limit

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>{getTranslation('buckets', language)}</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-black uppercase rounded-full">
              Enveloppes Actives ({activeBuckets.length})
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold">
            Divisez virtuellement votre argent (méthode des enveloppes d'épargne)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings routing */}
          <button
            onClick={() => onNavigate && onNavigate('settings')}
            className="p-3 bg-white hover:bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
          >
            <Settings size={14} />
            <span>Règles de Répartition</span>
          </button>
        </div>
      </div>

      {/* Plan limit warning upsell */}
      {isFreeTier && (
        <PlanLimitBanner 
          currentTier="free" 
          limitMessage="Vous avez atteint la limite de 3 compartiments de budget."
          onUpgrade={() => onNavigate && onNavigate('settings')}
        />
      )}

      {/* Summary Financial metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-slate-50 text-slate-700 rounded-2xl">
            <ChevronDown size={18} className="transform rotate-180" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400">Total Alloué</span>
            <p className="text-base font-black text-slate-800">{formatCurrency(totalAllocated)}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl">
            <ChevronDown size={18} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400">Total Consommé</span>
            <p className="text-base font-black text-slate-800">{formatCurrency(totalSpent)}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <ChevronDown size={18} className="transform -rotate-90" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400">Reste Disponible</span>
            <p className="text-base font-black text-emerald-700">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>
      </div>

      {/* Interactive Payday Auto-allocation banner widget */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-24 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
          <div className="md:col-span-2 space-y-2">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-black tracking-wider uppercase text-emerald-400">
              SIMULATEUR DE PAYE (RÉPARTITION AUTOMATIQUE)
            </span>
            <h3 className="text-base font-black tracking-tight uppercase">
              Répartir automatiquement mon salaire du mois
            </h3>
            <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
              Chaque enveloppe détient un pourcentage d'auto-allocation (ex: 30% Alimentation, 50% Logement). Entrez votre salaire reçu pour distribuer les fonds instantanément selon vos pourcentages paramétrés.
            </p>
          </div>

          <form onSubmit={handleAllocateSimulation} className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-3">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Salaire à répartir (DH)
              </label>
              <input
                type="number"
                value={allocationSalary}
                onChange={e => setAllocationSalary(e.target.value)}
                placeholder="Ex: 8000 DH"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white placeholder-slate-400 focus:outline-hidden focus:bg-white/20"
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <RefreshCw size={12} />
              Répartir les fonds
            </button>
          </form>
        </div>

        {showAllocateNotice && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-100 flex items-center gap-2 font-bold animate-pulse">
            <Sparkles size={14} className="text-amber-400" />
            <span>Fonds distribués avec succès sur tous vos Sandoq marocains !</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-3xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un sandoq..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Category & Priority Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Toutes catégories</option>
            <option value="food">Alimentation</option>
            <option value="housing">Logement & Factures</option>
            <option value="transport">Transport</option>
            <option value="leisure">Loisirs & Café</option>
            <option value="tontine">Tontine (Daret)</option>
            <option value="savings">Épargne</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="all">Toutes priorités</option>
            <option value="essential">Essentiel (Daroni)</option>
            <option value="optional">Optionnel</option>
          </select>
        </div>
      </div>

      {/* List / Hierarchical Display Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : rootBuckets.length === 0 ? (
        <div className="p-8 bg-white border border-slate-100 rounded-3xl text-center space-y-2">
          <AlertCircle size={28} className="text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Aucun sandoq trouvé</h4>
          <p className="text-[10px] text-slate-400 font-semibold max-w-sm mx-auto">
            Nous n'avons trouvé aucun compartiment correspondant à vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rootBuckets.map((bucket, index) => {
            const bucketStats = stats[bucket.id];
            const children = subBuckets.filter(child => child.parent_id === bucket.id);

            return (
              <div key={bucket.id} className="space-y-4">
                {/* Reordering Controls Wrapper */}
                <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase text-slate-400">
                  <span>Sandoq Principal {index + 1}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => moveBucket(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-100 text-slate-500 rounded-md disabled:opacity-20 cursor-pointer"
                    >
                      ▲
                    </button>
                    <button 
                      onClick={() => moveBucket(index, 'down')}
                      disabled={index === rootBuckets.length - 1}
                      className="p-1 hover:bg-slate-100 text-slate-500 rounded-md disabled:opacity-20 cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* Main Root Bucket Card */}
                <BucketCard
                  bucket={{
                    ...bucket,
                    remaining: bucket.remaining,
                    percent: bucket.percent,
                    statusColor: bucket.statusColor
                  }}
                  language={language}
                  variant="detailed"
                  onEdit={(b) => onNavigate && onNavigate('settings')}
                  onDelete={(id) => handleDeleteBucket(id)}
                  onTransfer={(b) => setActiveTransferBucket(b)}
                  onQuickAdd={(id) => {
                    const match = activeBuckets.find(x => x.id === id);
                    if (match) setActiveQuickAddBucket(match);
                  }}
                />

                {/* Sub-Buckets / Children Hierarchy Display */}
                {children.length > 0 && (
                  <div className="pl-6 border-l-2 border-slate-100/80 space-y-3 pt-1">
                    {children.map(child => (
                      <div key={child.id} className="relative">
                        {/* L-shaped line indicator */}
                        <div className="absolute -left-6 top-5 w-6 h-[2px] bg-slate-100" />
                        
                        <BucketCard
                          bucket={{
                            ...child,
                            remaining: child.remaining,
                            percent: child.percent,
                            statusColor: child.statusColor
                          }}
                          language={language}
                          variant="compact"
                          onEdit={(b) => onNavigate && onNavigate('settings')}
                          onDelete={(id) => handleDeleteBucket(id)}
                          onTransfer={(b) => setActiveTransferBucket(b)}
                          onQuickAdd={(id) => {
                            const match = activeBuckets.find(x => x.id === id);
                            if (match) setActiveQuickAddBucket(match);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK ADD MODAL POPUP */}
      {activeQuickAddBucket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <QuickAddExpense
              bucketId={activeQuickAddBucket.id}
              bucketName={activeQuickAddBucket.name}
              onCancel={() => setActiveQuickAddBucket(null)}
              onAddExpense={async (bId, amt, desc, merch) => {
                await quickAddExpense(bId, amt, desc, merch);
                setActiveQuickAddBucket(null);
                refreshStats();
              }}
            />
          </div>
        </div>
      )}

      {/* TRANSFER MODAL POPUP */}
      <TransferModal
        isOpen={!!activeTransferBucket}
        onClose={() => setActiveTransferBucket(null)}
        buckets={activeBuckets}
        sourceBucket={activeTransferBucket}
        onTransfer={async (fromId, toId, amount, note) => {
          await transferBetweenBuckets(fromId, toId, amount, note);
          setActiveTransferBucket(null);
          refreshStats();
        }}
      />

    </div>
  );
}
