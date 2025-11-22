import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

const Deposits = ({ depositRequests, onUpdateDeposits, onUpdateUsers, onUpdateTransactions }) => {
  const [approvingId, setApprovingId] = useState(null);
  const { supabase } = useSupabase();

  const pendingDeposits = depositRequests.filter((d) => d.status === 'pending');
  const processedDeposits = depositRequests.filter((d) => d.status === 'approved');

  const handleApproveDeposit = async (request) => {
    setApprovingId(request.id);
    try {
      // 1) Add balance using RPC
      const balanceResult = await supabase.rpc(
        'update_user_balance',
        {
          user_id: request.user_id,
          amount: request.amount,
        }
      );
      if (balanceResult.error) throw balanceResult.error;

      // 2) Mark deposit as approved
      const depositResult = await supabase
        .from('deposit_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
        })
        .eq('id', request.id)
        .select()
        .single();
      if (depositResult.error) throw depositResult.error;

      // 3) Add transaction history entry
      const newTransaction = {
        user_id: request.user_id,
        type: 'deposit',
        amount: request.amount,
        timestamp: new Date().toISOString(),
        balance_after: balanceResult.data.balance,
        transaction_id: request.transaction_id,
        description: `Deposit approved (Txn: ${request.transaction_id})`,
      };

      const transactionResult = await supabase
        .from('transaction_history')
        .insert([newTransaction])
        .select()
        .single();
      if (transactionResult.error) throw transactionResult.error;

      // Update local states
      onUpdateUsers((prev) =>
        prev.map((u) =>
          u.id === request.user_id
            ? { ...u, balance: balanceResult.data.balance }
            : u
        )
      );
      onUpdateDeposits((prev) =>
        prev.map((r) => (r.id === request.id ? updatedReq : r))
      );
      onUpdateTransactions((prev) => [txData, ...prev]);

      alert(
        `Approved deposit of ₹${request.amount.toFixed(2)} for ${
          request.user?.username || 'user'
        }`
      );
    } catch (err) {
      console.error('Error approving deposit:', err);
      alert('Failed to approve deposit');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Wallet className="w-6 h-6 text-purple-400" />
        Deposit Requests
      </h2>

      {pendingDeposits.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No pending deposit requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingDeposits.map((request) => (
            <Card
              key={request.id}
              className="bg-gray-700/50 border-gray-600 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold">
                    ₹{request.amount.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {request.user?.username || 'Unknown User'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    Txn: {request.transaction_id}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(request.timestamp).toLocaleString()}
                  </div>
                </div>

                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveDeposit(request)}
                  disabled={approvingId === request.id}
                >
                  {approvingId === request.id ? 'Approving...' : 'Approve'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-400 mb-4">
          Approved Deposits
        </h3>
        {processedDeposits.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No approved deposits yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {processedDeposits.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">
                    ₹{request.amount.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {request.user?.username || 'Unknown User'}
                  </div>
                  <div className="text-gray-500 text-xs">
                    Txn: {request.transaction_id}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-sm font-bold">
                    Approved
                  </div>
                  <div className="text-gray-400 text-sm">
                    {request.processed_at &&
                      new Date(request.processed_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Deposits;
