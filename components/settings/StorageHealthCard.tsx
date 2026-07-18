import React, { useState } from 'react';
import { useStorageHealth } from '../../hooks/use-storage-health';
import { Database, HardDrive, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import StorageCleanupModal from './StorageCleanupModal';

interface StorageHealthCardProps {
  userId: string;
  language: 'fr' | 'darija';
}

export default function StorageHealthCard({ userId, language }: StorageHealthCardProps) {
  const {
    healthStatus,
    breakdown,
    cleanupCandidates,
    executeCleanup,
    isCleaning
  } = useStorageHealth(userId, language);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHealthColor = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          text: 'text-rose-700',
          bar: 'bg-rose-600',
          accent: 'text-rose-600'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-700',
          bar: 'bg-amber-500',
          accent: 'text-amber-600'
        };
      case 'watch':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          text: 'text-blue-700',
          bar: 'bg-blue-500',
          accent: 'text-blue-600'
        };
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          text: 'text-emerald-700',
          bar: 'bg-emerald-600',
          accent: 'text-emerald-600'
        };
    }
  };

  const color = getHealthColor(healthStatus.healthLevel);

  const t = {
    title: language === 'darija' ? "Khozzen dial n-Nafidha" : "Espace de stockage local",
    subtitle: language === 'darija' ? "Moutaba3at l-blassa f l-browser" : "Surveillance et nettoyage de l'espace",
    totalUsed: language === 'darija' ? "Moustakhdam" : "Utilisé",
    limit: language === 'darija' ? "L-Hadd l-A9sa l-Mo9addar" : "Limite estimée",
    candidatesTitle: language === 'darija' ? "Khafif l-Ouzn (Nassa2ih)" : "Recommandations de nettoyage",
    cleanButton: language === 'darija' ? "Nettoyer l'espace ⚡" : "Libérer de l'espace ⚡",
    noCandidates: language === 'darija' ? "L-khazna dyalk n9iya bzzaf ! ✨" : "Votre stockage est impeccable ! ✨",
    breakdownTitle: language === 'darija' ? "Taqssim l-m3loumat" : "Répartition par catégorie"
  };

  return (
    <div id="storage-health-card" className="bg-white border border-slate-100/80 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <HardDrive size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 leading-none">{t.title}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-1">{t.subtitle}</p>
          </div>
        </div>

        {/* Health status badge */}
        <div className={`px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider ${color.bg} ${color.border} ${color.text}`}>
          {healthStatus.healthLevel}
        </div>
      </div>

      {/* Main Gauge and Numbers */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.totalUsed}</p>
            <p className="text-2xl font-black text-slate-800 leading-none">
              {formatBytes(healthStatus.usedBytes)}{' '}
              <span className="text-xs font-bold text-slate-400">/ {formatBytes(healthStatus.estimatedLimitBytes)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-800 leading-none">{healthStatus.percentUsed}%</p>
            <p className="text-[9px] font-medium text-slate-400 mt-1">{t.limit} (5 MB)</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${color.bar}`}
            style={{ width: `${healthStatus.percentUsed}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown (Stacked colored bar or bar lists) */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.breakdownTitle}</h4>
        
        {/* Visual stack indicator */}
        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden flex">
          {breakdown.map((item, index) => {
            const colors = [
              'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 
              'bg-sky-500', 'bg-rose-500', 'bg-violet-500', 'bg-slate-400'
            ];
            const itemColor = colors[index % colors.length];
            return (
              <div
                key={item.category}
                className={`h-full ${itemColor}`}
                style={{ width: `${item.percent}%` }}
                title={`${item.label}: ${item.percent}%`}
              />
            );
          })}
        </div>

        {/* Legend / list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {breakdown.map((item, index) => {
            const colors = [
              'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 
              'bg-sky-500', 'bg-rose-500', 'bg-violet-500', 'bg-slate-400'
            ];
            const itemColor = colors[index % colors.length];
            return (
              <div key={item.category} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${itemColor}`} />
                  <span className="text-[11px] font-bold text-slate-600 truncate">{item.label}</span>
                </div>
                <span className="text-[10px] font-black text-slate-500 shrink-0 ml-2">
                  {formatBytes(item.bytes)} ({item.percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended action summary or CTA */}
      <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {cleanupCandidates.length > 0 ? (
            <div className="flex items-center gap-2 text-amber-600">
              <ShieldAlert size={16} className="shrink-0" />
              <p className="text-[11px] font-extrabold truncate">
                {language === 'darija'
                  ? `${cleanupCandidates.length} t-nasa2ih bach t-khwi l-blassa`
                  : `${cleanupCandidates.length} suggestions pour libérer du stockage`}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600">
              <Sparkles size={16} className="shrink-0" />
              <p className="text-[11px] font-extrabold truncate">{t.noCandidates}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 size={13} />
          <span>{t.cleanButton}</span>
        </button>
      </div>

      {/* Storage Cleanup Modal */}
      {isModalOpen && (
        <StorageCleanupModal
          userId={userId}
          language={language}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
