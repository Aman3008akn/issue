import React from 'react';
import { Card } from './ui/card';
import { History, Wallet } from 'lucide-react';

const Transactions = ({ transactionHistory }) => {
  const historyArray = Array.isArray(transactionHistory) ? transactionHistory : [];

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <History className="w-6 h-6 text-purple-400" />
        Recent Transactions
      </h2>

      {historyArray.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {historyArray.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    transaction.type === 'deposit' ||
                    transaction.type === 'referral_bonus'
                      ? 'bg-green-500/20 text-green-400'
                      : transaction.type === 'admin_adjustment'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-medium capitalize">
                    {transaction.type.replace('_', ' ')}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {transaction.user_id
                      ? `User ID: ${transaction.user_id.substring(0, 8)}...`
                      : 'System'}
                  </div>
                  {transaction.transaction_id && (
                    <div className="text-gray-500 text-xs">
                      Txn: {transaction.transaction_id}
                    </div>
                  )}
                  {transaction.description && (
                    <div className="text-gray-500 text-xs">
                      {transaction.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-bold ${
                    transaction.type === 'deposit' ||
                    transaction.type === 'referral_bonus' ||
                    transaction.type === 'admin_adjustment'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {transaction.type === 'deposit' ||
                  transaction.type === 'referral_bonus' ||
                  transaction.type === 'admin_adjustment'
                    ? '+'
                    : '-'}
                  ₹{transaction.amount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-gray-400 text-sm">
                  {new Date(transaction.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default Transactions;
