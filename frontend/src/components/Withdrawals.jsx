import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Wallet } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

const Withdrawals = ({ withdrawalRequests, onUpdateWithdrawals, onUpdateTransactions }) => {
  const [processingId, setProcessingId] = useState(null);
  const { supabase } = useSupabase();

  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === 'pending');
  const processedWithdrawals = withdrawalRequests.filter((r) => r.status === 'processed');

  const getMethodName = (method) => {
    switch (method) {
      case 'upi':
        return 'UPI';
      case 'imps':
        return 'IMPS/Bank Transfer';
      case 'crypto':
        return 'Cryptocurrency';
      default:
        return method ? method.toUpperCase() : 'Unknown';
    }
  };

  const handleProcessWithdrawal = async (requestId) => {
    setProcessingId(requestId);
    try {
      const { data: updatedRequest, error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();
      if (error) throw error;

      onUpdateWithdrawals((prev) =>
        prev.map((req) => (req.id === requestId ? updatedRequest : req))
      );

      const request = withdrawalRequests.find((r) => r.id === requestId);
      if (request) {
        const newTransaction = {
          user_id: request.user_id,
          type: 'withdrawal',
          amount: request.amount,
          method: request.method,
          status: 'processed',
          timestamp: new Date().toISOString(),
          description: `Withdrawal processed`,
        };

        const { data: txData, error: txErr } = await supabase
          .from('transaction_history')
          .insert([newTransaction])
          .select()
          .single();

        if (!txErr) {
          onUpdateTransactions((prev) => [txData, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Wallet className="w-6 h-6 text-purple-400" />
        Withdrawal Requests
      </h2>

      {pendingWithdrawals.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No pending withdrawal requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingWithdrawals.map((request) => (
            <Card
              key={request.id}
              className="bg-gray-700/50 border-gray-600 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <Wallet className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold">
                      ₹{request.amount.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {request.user?.username || 'Unknown User'} •{' '}
                      {getMethodName(request.method)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-4">
                    <div className="text-gray-400 text-sm">
                      {new Date(request.timestamp).toLocaleString()}
                    </div>
                    {request.method === 'upi' && request.upi_id && (
                      <div className="text-gray-500 text-xs">
                        UPI: {request.upi_id}
                      </div>
                    )}
                    {request.method === 'imps' && request.bank_account && (
                      <div className="text-gray-500 text-xs">
                        Acc: {request.bank_account} • IFSC: {request.ifsc_code}
                      </div>
                    )}
                    {request.method === 'crypto' && request.crypto_wallet && (
                      <div className="text-gray-500 text-xs">
                        Wallet: {request.crypto_wallet.substring(0, 10)}...
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleProcessWithdrawal(request.id)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={processingId === request.id}
                  >
                    {processingId === request.id ? 'Processing...' : 'Process'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Processed */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-400 mb-4">
          Processed Requests
        </h3>
        {processedWithdrawals.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No processed requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {processedWithdrawals.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-full">
                    <Wallet className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      ₹{request.amount.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {request.user?.username || 'Unknown User'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-green-400 text-sm font-bold">
                    Processed
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(request.processed_at).toLocaleString()}
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

export default Withdrawals;
