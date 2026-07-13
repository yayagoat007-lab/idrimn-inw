import React from 'react';
import { TontineMember } from '../../types';
import { ArrowUp, ArrowDown, Shield, CheckCircle, Clock } from 'lucide-react';

interface TontineMemberListProps {
  members: TontineMember[];
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isAdmin: boolean;
}

export function TontineMemberList({ members, onMoveUp, onMoveDown, isAdmin }: TontineMemberListProps) {
  // Sort members by position (position_in_queue)
  const sortedMembers = [...members].sort((a, b) => a.position_in_queue - b.position_in_queue);

  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs">
      <h4 className="text-xs font-black text-slate-800 mb-3 uppercase tracking-wider">
        Membres & Ordre de Répartition (Queue)
      </h4>

      <div className="space-y-2">
        {sortedMembers.map((m, idx) => {
          const isNext = idx === 0;

          return (
            <div 
              key={m.id}
              className={`flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50/50 transition-colors ${
                isNext ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Ordre Badge */}
                <div className={`w-6 h-6 rounded-lg font-black text-[10px] flex items-center justify-center ${
                  isNext ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {m.position_in_queue}
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black text-slate-800">
                      {m.user_id === 'user-1' ? 'Ahmed El Alami' : m.user_id === 'user-2' ? 'Fatima' : `Cousin ${idx}`}
                    </span>
                    {idx === 0 && (
                      <Shield className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wide">
                    {isNext ? "Prochain bénéficiaire" : "En attente"}
                  </span>
                </div>
              </div>


              {/* Move priorities buttons */}
              {isAdmin && (
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => onMoveUp(m.id)}
                    className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40"
                    title="Monter la priorité"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button
                    disabled={idx === sortedMembers.length - 1}
                    onClick={() => onMoveDown(m.id)}
                    className="p-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40"
                    title="Baisser la priorité"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default TontineMemberList;
