import { 
  LayoutDashboard, 
  ArrowDownUp, 
  Layers, 
  PieChart, 
  Target, 
  Users, 
  Wallet, 
  Heart, 
  BookOpen, 
  Settings,
  Sparkles,
  HelpCircle,
  PiggyBank
} from 'lucide-react';
import { getTranslation, Language } from '../../lib/i18n';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  language: Language;
  subscriptionTier: string;
}

export function Sidebar({ currentRoute, onNavigate, language, subscriptionTier }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: getTranslation('dashboard', language), icon: LayoutDashboard },
    { id: 'transactions', label: getTranslation('transactions', language), icon: ArrowDownUp },
    { id: 'buckets', label: getTranslation('buckets', language), icon: Layers },
    { id: 'insights', label: getTranslation('insights', language), icon: PieChart },
    { id: 'goals', label: getTranslation('goals', language), icon: Target },
    { id: 'tontine', label: getTranslation('tontine', language), icon: PiggyBank },
    { id: 'net-worth', label: getTranslation('netWorth', language), icon: Wallet },
    { id: 'family', label: getTranslation('family', language), icon: Heart },
    { id: 'reports', label: getTranslation('reports', language), icon: BookOpen },
    { id: 'settings', label: getTranslation('settings', language), icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen hidden lg:flex flex-col border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 text-white p-2 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/10">
            F
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block leading-none">
              Floussi
            </span>
            <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">
              Mon Argent 🇲🇦
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon 
                size={18} 
                className={`transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`} 
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Premium Upgrade prompt or Support */}
      <div className="p-4 border-t border-slate-800">
        {subscriptionTier === 'free' ? (
          <div className="bg-gradient-to-br from-amber-950/40 to-slate-800 border border-amber-900/30 p-4 rounded-2xl text-center relative overflow-hidden">
            <Sparkles size={20} className="text-amber-400 mx-auto mb-2 animate-bounce" />
            <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
              Abonnement Dahabi
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Débloquez l'OCR, la tontine d'équipe et masquez les publicités !
            </p>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs py-2 rounded-xl transition-all shadow-sm"
            >
              Passer à 29 DH/mois
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 p-3 rounded-xl flex items-center gap-2.5">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase">Premium</p>
              <p className="text-[10px] text-slate-400">Assistance prioritaire</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
export default Sidebar;
