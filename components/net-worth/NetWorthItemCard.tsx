import React, { useState } from 'react';
import { NetWorthItemExtended } from '../../hooks/use-net-worth';
import { formatCurrency } from '../../lib/utils';
import { 
  Building2, Car, Trophy, Landmark, Landmark as BankIcon, 
  Trash2, Edit3, ChevronDown, ChevronUp, FileText, Calendar, Percent, Plus
} from 'lucide-react';

interface NetWorthItemCardProps {
  key?: React.Key;
  item: NetWorthItemExtended;
  onEdit: (item: NetWorthItemExtended) => void;
  onDelete: (id: string) => void;
}

export function NetWorthItemCard({ item, onEdit, onDelete }: NetWorthItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(item.documents || []);

  const formatMAD = (val: number) => formatCurrency(val, 'fr').replace('MAD', 'DH');

  // Icon switcher based on category
  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('immob')) return <Building2 className="w-5 h-5 text-emerald-600" />;
    if (c.includes('véhic') || c.includes('auto')) return <Car className="w-5 h-5 text-blue-600" />;
    if (c.includes('or') || c.includes('bijou')) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (c.includes('crédit') || c.includes('emprunt') || c.includes('prêt')) return <Landmark className="w-5 h-5 text-rose-500" />;
    return <BankIcon className="w-5 h-5 text-slate-500" />;
  };

  const getVariation = () => {
    if (item.original_value === 0) return 0;
    const diff = item.current_value - item.original_value;
    return (diff / item.original_value) * 100;
  };

  const variation = getVariation();
  const isLiability = item.type === 'liability';
  const displayVariation = variation !== 0;

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setUploadedFiles(prev => [...prev, fileName]);
    }
  };

  return (
    <div className={`bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all ${isLiability ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'}`}>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isLiability ? 'bg-rose-50' : 'bg-emerald-50'}`}>
            {getCategoryIcon(item.category)}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 tracking-tight">{item.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                {item.category}
              </span>
              {item.institution && (
                <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                  <BankIcon className="w-3 h-3" />
                  {item.institution}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-black text-slate-800 font-mono">
              {formatMAD(item.current_value)}
            </p>
            {displayVariation && (
              <p className={`text-[9px] font-bold mt-0.5 ${variation >= 0 ? (isLiability ? 'text-rose-500' : 'text-emerald-500') : (isLiability ? 'text-emerald-500' : 'text-rose-500')}`}>
                {variation >= 0 ? '+' : ''}{variation.toFixed(1)}% vs achat
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-all"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded detailed details */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 rounded-b-2xl space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {item.acquisition_date && (
              <div className="bg-white p-2 border border-slate-100 rounded-xl">
                <span className="block text-[9px] uppercase font-bold text-slate-400">Date d'acquisition</span>
                <span className="font-extrabold text-slate-700 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(item.acquisition_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            <div className="bg-white p-2 border border-slate-100 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Valeur d'origine</span>
              <span className="font-extrabold text-slate-700 font-mono mt-0.5 block">
                {formatMAD(item.original_value)}
              </span>
            </div>

            {item.interest_rate !== null && item.interest_rate !== undefined && (
              <div className="bg-white p-2 border border-slate-100 rounded-xl">
                <span className="block text-[9px] uppercase font-bold text-slate-400">Taux d'intérêt</span>
                <span className="font-extrabold text-slate-700 flex items-center gap-0.5 mt-0.5 font-mono">
                  <Percent className="w-3.5 h-3.5 text-slate-400" />
                  {item.interest_rate}%
                </span>
              </div>
            )}

            {isLiability && item.monthly_payment && (
              <div className="bg-white p-2 border border-slate-100 rounded-xl">
                <span className="block text-[9px] uppercase font-bold text-slate-400">Mensualité liée</span>
                <span className="font-extrabold text-rose-600 font-mono mt-0.5 block">
                  -{formatMAD(item.monthly_payment)}
                </span>
              </div>
            )}
          </div>

          {item.notes && (
            <div className="bg-white p-3 border border-slate-100 rounded-xl">
              <span className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Notes / Description</span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.notes}</p>
            </div>
          )}

          {/* Document upload simulator */}
          <div className="bg-white p-3 border border-slate-100 rounded-xl">
            <span className="block text-[9px] uppercase font-bold text-slate-400 mb-2">Documents (Contrats, Actes, Titres)</span>
            
            <div className="space-y-1.5 mb-3">
              {uploadedFiles.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-semibold italic">Aucun document joint pour le moment.</p>
              ) : (
                uploadedFiles.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{f}</span>
                  </div>
                ))
              )}
            </div>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-[10px] font-black text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un document (Contrat, Titre)</span>
              <input type="file" onChange={handleSimulatedUpload} className="hidden" />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1.5 text-[10px] font-black text-slate-600 hover:bg-slate-200/60 px-3 py-1.5 rounded-lg transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modifier</span>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
