import React from 'react';
import { RemittanceRecord } from '../../types';
import { Trash2, TrendingUp, CreditCard, Calendar, Send } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RemittanceHistoryProps {
  language: 'fr' | 'darija';
  remittances: RemittanceRecord[];
  onDelete: (id: string) => void;
  trendData: { month: string; amount: number; count: number }[];
  stats: { totalSent: number; averageMonthly: number; count: number };
}

export function RemittanceHistory({
  language,
  remittances,
  onDelete,
  trendData,
  stats
}: RemittanceHistoryProps) {
  const isDarija = language === 'darija';

  return (
    <div className="space-y-4 font-sans">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div id="stats-total-envoye" className="bg-white p-4 border border-slate-100 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            {isDarija ? 'مجموع التحويلات' : 'Total Envoyé'}
          </span>
          <span className="text-base font-black text-slate-900 block">
            {stats.totalSent.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500 font-bold">DH</span>
          </span>
        </div>

        <div id="stats-moyenne-mensuelle" className="bg-white p-4 border border-slate-100 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            {isDarija ? 'المعدل الشهري' : 'Moyenne Mensuelle'}
          </span>
          <span className="text-base font-black text-slate-900 block">
            {stats.averageMonthly.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500 font-bold">DH/mois</span>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div id="mre-chart-box" className="bg-white p-5 border border-slate-100 rounded-3xl space-y-3 shadow-sm">
        <h4 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
          <TrendingUp size={14} className="text-emerald-600" />
          {isDarija ? 'تطور التحويلات في الزمن' : 'Tendance des envois (6 mois)'}
        </h4>
        
        <div className="h-44 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRemit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#94A3B8" fontSize={10} fontWeight={600} />
              <YAxis tickLine={false} axisLine={false} stroke="#94A3B8" fontSize={10} fontWeight={600} />
              <Tooltip 
                contentStyle={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', fontWeight: 'bold' }}
                labelClassName="text-slate-500 text-[10px]"
                formatter={(val: number) => [`${val.toLocaleString()} DH`, 'Montant']}
              />
              <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRemit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History List */}
      <div id="mre-remittances-list-box" className="bg-white p-5 border border-slate-100 rounded-3xl space-y-3 shadow-sm">
        <h4 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
          <Send size={14} className="text-emerald-600" />
          {isDarija ? 'أرشيف التحويلات' : 'Historique des envois'}
        </h4>

        {remittances.length === 0 ? (
          <div className="py-8 text-center space-y-1.5">
            <span className="text-lg block">📦</span>
            <p className="text-xs font-bold text-slate-400">
              {isDarija ? 'لا توجد تحويلات مسجلة بعد.' : 'Aucun envoi enregistré pour le moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {remittances.map((r) => {
              const formattedDate = new Date(r.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short'
              });

              return (
                <div key={r.id} className="p-3 bg-slate-50 border border-slate-100/50 rounded-2xl flex justify-between items-center transition-all hover:bg-slate-100/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-xs">
                      {r.foreignCurrency}
                    </div>
                    
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-xs text-slate-800 truncate flex items-center gap-1.5">
                        {r.recipientName}
                        {r.isRecurring && (
                          <span className="text-[8px] px-1 bg-indigo-50 text-indigo-600 border border-indigo-100/60 rounded font-bold uppercase">
                            {isDarija ? 'متكرر' : 'Auto'}
                          </span>
                        )}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Calendar size={10} />
                          {formattedDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <CreditCard size={10} />
                          {r.method === 'virement' ? 'Virement' : r.method.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-black text-xs text-slate-900 block">
                        {r.amountForeign.toLocaleString()} {r.foreignCurrency}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        ≈ {r.amountMAD.toLocaleString()} DH
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RemittanceHistory;
