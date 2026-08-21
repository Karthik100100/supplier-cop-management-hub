import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, User } from '../../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Wrench, 
  ShoppingBag, 
  Eye, 
  Download, 
  Search, 
  Check, 
  X,
  Lock
} from 'lucide-react';

const ROLES: Role[] = [
  'Admin',
  'Purchasing Manager',
  'Supplier Quality Engineer',
  'Executive Viewer'
];

export const UserRoleManagementScreen: React.FC = () => {
  const { 
    users, 
    updateUserRole, 
    toggleUserStatus, 
    setIsInviteUserModalOpen, 
    currentRole,
    exportDataToCSV,
    globalSearch
  } = useApp();

  const [roleFilter, setRoleFilter] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');

  // Combined search
  const activeSearch = searchFilter || globalSearch;

  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch = !activeSearch || 
      u.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(activeSearch.toLowerCase()) ||
      u.department.toLowerCase().includes(activeSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const sqeCount = users.filter(u => u.role === 'Supplier Quality Engineer').length;
  const pmCount = users.filter(u => u.role === 'Purchasing Manager').length;
  const activeCount = users.filter(u => u.status === 'Active').length;

  const handleExportUsers = () => {
    const rows = filteredUsers.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Department: u.department,
      Role: u.role,
      Status: u.status,
      Last_Active: u.lastActive
    }));
    exportDataToCSV('System_Users_And_Roles', rows);
  };

  if (currentRole !== 'Admin') {
    return (
      <div className="p-12 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Admin Access Required</h2>
        <p className="text-sm text-slate-500 mt-1">
          User & Role Management is restricted to System Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            User & Role Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Administer enterprise Role-Based Access Control (RBAC) and user account provisioning.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Users
          </button>

          <button
            onClick={() => setIsInviteUserModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite User
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Users</span>
          <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            {users.length} <span className="text-xs font-normal text-slate-400">({activeCount} Active)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quality Engineers (SQE)</span>
          <div className="text-2xl font-semibold text-teal-700 dark:text-teal-400 mt-1">
            {sqeCount}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Purchasing Managers</span>
          <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
            {pmCount}
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">System Administrators</span>
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {adminCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Purchasing Manager">Purchasing Manager</option>
            <option value="Supplier Quality Engineer">Supplier Quality Engineer</option>
            <option value="Executive Viewer">Executive Viewer</option>
          </select>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Role (RBAC)</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-medium text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-600">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {user.department}
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                      className="text-xs font-medium px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {user.lastActive}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        user.status === 'Active'
                          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                      }`}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
