import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';
import { 
  LayoutDashboard, 
  UserCheck, 
  Gauge, 
  Database, 
  BookOpen, 
  Users, 
  LogOut,
  Layers,
  ChevronRight,
  Shield
} from 'lucide-react';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: string[];
  badge?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'approval', label: 'Supplier Approval', icon: UserCheck },
  { id: 'performance', label: 'Supplier Performance', icon: Gauge },
  { id: 'master-data', label: 'Supplier Master Data', icon: Database },
  { id: 'standards', label: 'Standards Library', icon: BookOpen },
  { id: 'users', label: 'User & Role Management', icon: Users }
];

export const SideNavBar: React.FC = () => {
  const { currentRole, activeScreen, setActiveScreen, canAccessScreen, setCurrentRole, cars } = useApp();

  const openCarsCount = cars.filter(c => c.status !== 'Verified Closed').length;

  return (
    <aside className="bg-[#0F172A] text-slate-300 w-[260px] flex-shrink-0 flex flex-col justify-between h-screen fixed left-0 top-0 z-30 shadow-sm border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-base text-white tracking-tight truncate flex items-center gap-1.5">
              Compliance Hub
            </h1>
            <p className="text-[11px] text-slate-400 font-normal truncate">Tier-1 Supplier Mgmt</p>
          </div>
        </div>
      </div>

      {/* Role Context Pill */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            Active Role
          </span>
          <span className="font-medium text-teal-300 bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded-md text-[11px] truncate max-w-[130px]">
            {currentRole}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Main Navigation
        </div>

        {ALL_NAV_ITEMS.map((item) => {
          const isAllowed = canAccessScreen(item.id);
          if (!isAllowed) return null;

          const isActive = activeScreen === item.id;
          const IconComp = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors group cursor-pointer ${
                isActive
                  ? 'bg-slate-800/90 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <IconComp
                  className={`w-4 h-4 transition-colors flex-shrink-0 ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate text-xs">{item.label}</span>
              </div>

              {item.id === 'performance' && openCarsCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {openCarsCount} CARs
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-teal-900 text-teal-200 flex items-center justify-center font-medium text-xs border border-teal-700/50">
              {currentRole ? currentRole[0] : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {currentRole === 'Admin' ? 'Sarah Connor' : currentRole === 'Purchasing Manager' ? 'Rachel Chen' : currentRole === 'Supplier Quality Engineer' ? 'J. Doe' : 'M. Johnson'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{currentRole}</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentRole(null)}
            title="Switch Role / Logout"
            className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
