// src/components/AdminDashboard.jsx
import React, { useState } from 'react';
import { Button } from './ui/button';
import { LogOut, Users, Wallet, TrendingUp, Settings } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAdminData } from '../hooks/useAdminData';
import UserManagement from './UserManagement';
import Transactions from './Transactions';
import Withdrawals from './Withdrawals';
import Deposits from './Deposits';
import AdminSettings from './AdminSettings';
import AdminStats from './AdminStats';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('users');
  const { signOut } = useSupabase();
  const {
    users,
    transactionHistory,
    withdrawalRequests,
    depositRequests,
    isLoading,
    error,
    updateUsers,
    updateTransactions,
    updateWithdrawals,
    updateDeposits,
  } = useAdminData();

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-gray-300 hover:text-white flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-gray-800/60 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'withdrawals'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Withdrawals
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'deposits'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Deposits
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: main tab content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'users' && (
              <UserManagement
                users={users}
                onUpdateUsers={updateUsers}
                onUpdateTransactions={updateTransactions}
              />
            )}

            {activeTab === 'transactions' && (
              <Transactions transactionHistory={transactionHistory} />
            )}

            {activeTab === 'withdrawals' && (
              <Withdrawals
                withdrawalRequests={withdrawalRequests}
                onUpdateWithdrawals={updateWithdrawals}
                onUpdateTransactions={updateTransactions}
              />
            )}

            {activeTab === 'deposits' && (
              <Deposits
                depositRequests={depositRequests}
                onUpdateDeposits={updateDeposits}
                onUpdateUsers={updateUsers}
                onUpdateTransactions={updateTransactions}
              />
            )}
          </div>

          {/* Right: Settings + Stats */}
          <div className="space-y-6">
            <AdminSettings />
            <AdminStats
              users={users}
              withdrawalRequests={withdrawalRequests}
              depositRequests={depositRequests}
              transactionHistory={transactionHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
