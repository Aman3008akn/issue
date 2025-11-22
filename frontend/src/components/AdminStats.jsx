import React from 'react';
import { Card } from './ui/card';

const AdminStats = ({ users, withdrawalRequests, depositRequests, transactionHistory }) => {
  const usersArray = Array.isArray(users) ? users : [];
  const historyArray = Array.isArray(transactionHistory) ? transactionHistory : [];
  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === 'pending');
  const pendingDeposits = depositRequests.filter((d) => d.status === 'pending');

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 p-6">
      <h3 className="text-xl font-bold text-white mb-2">
        Quick Stats
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-300">Total Users</span>
          <span className="text-white font-bold">
            {usersArray.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Pending Withdrawals</span>
          <span className="text-white font-bold">
            {pendingWithdrawals.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Pending Deposits</span>
          <span className="text-white font-bold">
            {pendingDeposits.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Total Transactions</span>
          <span className="text-white font-bold">
            {historyArray.length}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default AdminStats;
