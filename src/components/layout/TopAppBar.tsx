import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Moon, 
  Sun, 
  ChevronDown, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  User as UserIcon, 
  LogOut,
  X,
  Shield
} from 'lucide-react';

const ALL_ROLES: Role[] = [
  'Admin',
  'Purchasing Manager',
  'Supplier Quality Engineer',
  'Executive Viewer'
];

export const TopAppBar: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    isDarkMode, 
    toggleDarkMode, 
    globalSearch, 
    setGlobalSearch,
    notifications,
    dismissNotification,
    markAllNotificationsRead,
    setActiveScreen,
    setSelectedStandardsDoc
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const getUserName = () => {
    switch (currentRole) {
      case 'Admin': return 'Sarah Connor';
      case 'Purchasing Manager': return 'Rachel Chen';
      case 'Supplier Quality Engineer': return 'J. Doe (SQE)';
      case 'Executive Viewer': return 'Michael Johnson';
      default: return 'User';
    }
  };

  const getRoleBadgeStyle = () => {
    switch (currentRole) {
      case 'Admin':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'Purchasing Manager':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'Supplier Quality Engineer':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
      case 'Executive Viewer':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <header className="h-[64px] bg-white dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800 fixed top-0 right-0 w-[calc(100%-260px)] z-20 flex items-center justify-between px-6 transition-colors">
      {/* Left side: Product name & Search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight hidden sm:block">
          Supplier CoP Hub
        </h2>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search suppliers, commodities, audits, CARs..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          />
          {globalSearch && (
            <button 
              onClick={() => setGlobalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right side: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative cursor-pointer"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Compliance Alerts
                  </h4>
                  {unreadNotifs > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      {unreadNotifs} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start justify-between gap-3 ${
                        !notif.read ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 flex-shrink-0">
                          {notif.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {notif.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                          {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {notif.title}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed mt-0.5">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                            {notif.linkScreen && (
                              <button
                                onClick={() => {
                                  setActiveScreen(notif.linkScreen!);
                                  setIsNotificationsOpen(false);
                                }}
                                className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                              >
                                View Details →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => dismissNotification(notif.id)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Help Modal Trigger */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          title="Standards & Quick Reference"
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {/* Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${getRoleBadgeStyle()}`}
          >
            <Shield className="w-3 h-3" />
            <span className="hidden md:inline">Role:</span>
            <span>{currentRole}</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Switch Active Role
              </div>
              {ALL_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    currentRole === role ? 'font-bold text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="truncate">{role}</span>
                  {currentRole === role && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                </button>
              ))}

              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <button
                  onClick={() => {
                    setCurrentRole(null);
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout to Role Picker</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-teal-700 dark:bg-teal-800 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-teal-600">
            {getUserName().split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {getUserName()}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Tier-1 Quality Division
            </p>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Supplier CoP Compliance System Guide
                </h3>
              </div>
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Conformity of Production (CoP)</strong> ensures manufactured automotive parts consistently meet type-approval quality and statutory standards.
              </p>
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 rounded-lg space-y-1">
                <div className="font-semibold text-teal-900 dark:text-teal-300">Composite Score Calculation Formula:</div>
                <div className="font-mono text-[11px] text-teal-800 dark:text-teal-200">
                  (PPM × 30%) + (OTD% × 25%) + (Audit Score × 25%) + (SCAR Closure% × 20%)
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400">
                  Normalized to 0.0 - 5.0 scale with automatic Tier categorization.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">≥ 4.0:</span> Tier 1 - Preferred
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">3.0 - 3.9:</span> Tier 1 - Approved
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">2.0 - 2.9:</span> Tier 2 - Conditional
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">&lt; 2.0:</span> Development / At Risk
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setIsHelpModalOpen(false);
                  setActiveScreen('standards');
                }}
                className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                Go to Standards Library →
              </button>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-1.5 bg-[#00685f] text-white rounded-lg text-xs font-semibold hover:bg-[#005049]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
