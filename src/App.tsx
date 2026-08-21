import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleLogin } from './components/RoleLogin';
import { SideNavBar } from './components/layout/SideNavBar';
import { TopAppBar } from './components/layout/TopAppBar';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { SupplierApprovalScreen } from './components/screens/SupplierApprovalScreen';
import { SupplierPerformanceScreen } from './components/screens/SupplierPerformanceScreen';
import { SupplierMasterDataScreen } from './components/screens/SupplierMasterDataScreen';
import { StandardsLibraryScreen } from './components/screens/StandardsLibraryScreen';
import { UserRoleManagementScreen } from './components/screens/UserRoleManagementScreen';
import { AddSupplierModal } from './components/modals/AddSupplierModal';
import { RaiseCarModal } from './components/modals/RaiseCarModal';
import { InviteUserModal } from './components/modals/InviteUserModal';
import { StandardsDetailModal } from './components/modals/StandardsDetailModal';

const AppContent: React.FC = () => {
  const { currentRole, activeScreen, isBootstrapping, dataError } = useApp();

  // Restoring a persisted Supabase session before deciding what to render
  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1320] flex flex-col items-center justify-center gap-3 font-sans">
        <span className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Restoring your session...</p>
      </div>
    );
  }

  // No authenticated session yet — show the sign-in screen
  if (!currentRole) {
    return <RoleLogin />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1320] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Fixed Navigation Sidebar */}
      <SideNavBar />

      {/* Fixed Top Bar */}
      <TopAppBar />

      {/* Main Workspace Area */}
      <main className="ml-[260px] pt-[76px] p-6 min-h-screen flex-1 max-w-7xl">
        {dataError && (
          <div className="mb-4 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-2.5">
            {dataError}
          </div>
        )}
        {activeScreen === 'dashboard' && <DashboardScreen />}
        {activeScreen === 'approval' && <SupplierApprovalScreen />}
        {activeScreen === 'performance' && <SupplierPerformanceScreen />}
        {activeScreen === 'master-data' && <SupplierMasterDataScreen />}
        {activeScreen === 'standards' && <StandardsLibraryScreen />}
        {activeScreen === 'users' && <UserRoleManagementScreen />}
      </main>

      {/* Global Interactive Modals */}
      <AddSupplierModal />
      <RaiseCarModal />
      <InviteUserModal />
      <StandardsDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
