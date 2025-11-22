import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Users, Wallet } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

const UserManagement = ({ users, onUpdateUsers, onUpdateTransactions }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState('add');
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();

  const usersArray = Array.isArray(users) ? users : [];

  const handleAddBalance = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsLoading(true);

    if (!selectedUser) {
      setMessage('Please select a user');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const finalAmount = balanceAction === 'add' ? amountValue : -amountValue;
    const txType = balanceAction === 'add' ? 'deposit' : 'admin_adjustment';

    try {
      // Update user balance
      const balanceResult = await supabase.rpc(
        'update_user_balance',
        {
          user_id: selectedUser,
          amount: finalAmount,
        }
      );
      if (balanceResult.error) throw balanceResult.error;

      const newTransaction = {
        user_id: selectedUser,
        type: txType,
        amount: amountValue,
        timestamp: new Date().toISOString(),
        balance_after: balanceResult.data.balance,
        transaction_id: transactionId || 'N/A',
        description:
          txType === 'deposit'
            ? `Manual deposit (Admin) Txn: ${transactionId || 'N/A'}`
            : `Admin adjustment Txn: ${transactionId || 'N/A'}`,
      };

      // Add transaction record
      const transactionResult = await supabase
        .from('transaction_history')
        .insert([newTransaction])
        .select()
        .single();

      if (transactionResult.error) throw transactionResult.error;

      onUpdateUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser ? { ...u, balance: balanceResult.data.balance } : u
        )
      );
      onUpdateTransactions((prev) => [transactionData, ...prev]);

      const userObj = users.find((u) => u.id === selectedUser);
      const actionText = balanceAction === 'add' ? 'added to' : 'deducted from';

      setMessage(
        `Successfully ${actionText} ₹${amountValue.toFixed(2)} ${
          userObj?.username || 'user'
        }'s account. Transaction ID: ${transactionId || 'N/A'}`
      );
      setMessageType('success');

      setAmount('');
      setTransactionId('');
    } catch (error) {
      console.error('Error updating user balance:', error);
      setMessage('Failed to update user balance');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Users className="w-6 h-6 text-purple-400" />
        User Management
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-900/50 border border-green-500/30 text-green-300'
              : 'bg-red-900/50 border border-red-500/30 text-red-300'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleAddBalance} className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
            disabled={isLoading}
          >
            <option value="">Select a user</option>
            {usersArray.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email}) - ₹
                {user.balance != null ? Number(user.balance).toFixed(2) : '0.00'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            Amount (₹)
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter amount"
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setBalanceAction('add')}
            className={`flex-1 ${
              balanceAction === 'add'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            disabled={isLoading}
          >
            Add Balance
          </Button>
          <Button
            type="button"
            onClick={() => setBalanceAction('deduct')}
            className={`flex-1 ${
              balanceAction === 'deduct'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            disabled={isLoading}
          >
            Deduct Balance
          </Button>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            Transaction ID (Optional)
          </label>
          <Input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter transaction ID"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          disabled={isLoading}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isLoading ? 'Processing...' : balanceAction === 'add' ? 'Add Balance' : 'Deduct Balance'}
        </Button>
      </form>
    </Card>
  );
};

export default UserManagement;
