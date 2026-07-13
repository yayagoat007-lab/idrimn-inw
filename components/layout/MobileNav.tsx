import { 
  LayoutDashboard, 
  ArrowDownUp, 
  Plus, 
  Layers, 
  Settings,
  PiggyBank
} from 'lucide-react';

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onQuickAdd: () => void;
}

export function MobileNav({ currentRoute, onNavigate, onQuickAdd }: MobileNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Tawjih', icon: LayoutDashboard },
    { id: 'transactions', label: 'Mu\'amalat', icon: ArrowDownUp },
    { id: 'buckets', label: 'Sanadiq', icon: Layers },
    { id: 'tontine', label: 'Daret', icon: PiggyBank },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center justify-around px-4 py-2 pb-safe shadow-lg">
      {navItems.slice(0, 2).map(item => {
        const Icon = item.icon;
        const isActive = currentRoute === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all"
          >
            <Icon 
              size={20} 
              className={isActive ? 'text-emerald-600' : 'text-gray-400'} 
            />
            <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Floating Center Quick Add Button */}
      <button
        onClick={onQuickAdd}
        className="relative -top-5 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
        aria-label="Ajout rapide"
      >
        <Plus size={28} />
      </button>

      {navItems.slice(2, 4).map(item => {
        const Icon = item.icon;
        const isActive = currentRoute === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all"
          >
            <Icon 
              size={20} 
              className={isActive ? 'text-emerald-600' : 'text-gray-400'} 
            />
            <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
export default MobileNav;
