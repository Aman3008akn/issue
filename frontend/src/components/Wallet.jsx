import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Wallet, ArrowDownCircle, ArrowUpCircle, IndianRupee, History } from 'lucide-react';
import { getCurrentUser, updateUserBalance, addTransactionHistory, getTransactionHistory } from '../mock';

const Wallet = ({ onBalanceChange }) => {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('deposit'); // 'deposit' or 'withdraw'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showHistory, setShowHistory] = useState(false);

  const user = getCurrentUser();
  const balance = user ? user.balance : 0;
  const transactionHistory = getTransactionHistory();

  const handleTransaction = (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const amountValue = parseFloat(amount);

    if (isNaN(amountValue) || amountValue <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    if (transactionType === 'deposit') {
      // Handle deposit
      // Check minimum deposit amount
      if (amountValue < 100) {
        setMessage('Minimum deposit amount is ₹100');
        setMessageType('error');
        return;
      }
      
      const newBalance = balance + amountValue;
      updateUserBalance(newBalance);
      
      // Add to transaction history
      addTransactionHistory({
        type: 'deposit',
        amount: amountValue,
        timestamp: new Date().toISOString(),
        balanceAfter: newBalance
      });
      
      setMessage(`Successfully deposited ₹${amountValue.toFixed(2)}`);
      setMessageType('success');
    } else {
      // Handle withdrawal
      // Check minimum withdrawal amount
      if (amountValue < 200) {
        setMessage('Minimum withdrawal amount is ₹200');
        setMessageType('error');
        return;
      }
      
      // Apply 2% withdrawal fee
      const fee = amountValue * 0.02;
      const amountAfterFee = amountValue - fee;
      
      if (amountValue > balance) {
        setMessage('Insufficient balance for withdrawal');
        setMessageType('error');
        return;
      }
      
      const newBalance = balance - amountValue;
      updateUserBalance(newBalance);
      
      // Add to transaction history
      addTransactionHistory({
        type: 'withdrawal',
        amount: amountValue,
        fee: fee,
        amountAfterFee: amountAfterFee,
        timestamp: new Date().toISOString(),
        balanceAfter: newBalance
      });
      
      setMessage(`Successfully withdrew ₹${amountValue.toFixed(2)} (Fee: ₹${fee.toFixed(2)})`);
      setMessageType('success');
    }

    // Clear form
    setAmount('');
    
    // Notify parent component of balance change
    if (onBalanceChange) {
      onBalanceChange();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl font-bold text-white">Wallet</h2>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">Current Balance</div>
            <div className="text-4xl font-bold text-white">₹{balance.toFixed(2)}</div>
          </div>
          <IndianRupee className="w-12 h-12 text-purple-400" />
        </div>
      </Card>

      {/* Transaction Form */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Manage Funds</h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-900/50 border border-green-500/30 text-green-300' 
              : 'bg-red-900/50 border border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleTransaction} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setTransactionType('deposit')}
              className={`flex-1 ${
                transactionType === 'deposit'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button
              type="button"
              onClick={() => setTransactionType('withdraw')}
              className={`flex-1 ${
                transactionType === 'withdraw'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
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
              min="1"
              step="0.01"
            />
          </div>

          <Button
            type="submit"
            className={`w-full ${
              transactionType === 'deposit'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {transactionType === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
          </Button>
        </form>
      </Card>

      {/* Transaction History Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Transaction History</h3>
        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="ghost"
          className="text-gray-300 hover:text-white"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Hide' : 'Show'} History
        </Button>
      </div>

      {/* Transaction History */}
      {showHistory && (
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-6">
            {transactionHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transaction history yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactionHistory.map((transaction, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      transaction.type === 'deposit' 
                        ? 'bg-green-900/20 border border-green-500/30' 
                        : 'bg-red-900/20 border border-red-500/30'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {transaction.type === 'deposit' ? (
                        <ArrowDownCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <ArrowUpCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold capitalize">{transaction.type}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {transaction.type === 'deposit' ? (
                          <span>Amount: ₹{transaction.amount.toFixed(2)}</span>
                        ) : (
                          <div>
                            <div>Amount: ₹{transaction.amount.toFixed(2)}</div>
                            <div>Fee: ₹{transaction.fee.toFixed(2)}</div>
                            <div className="text-red-400">Net: ₹{transaction.amountAfterFee.toFixed(2)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Balance After</div>
                      <div className={`font-bold ${
                        transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ₹{transaction.balanceAfter.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30 p-4">
          <h4 className="font-bold text-green-400 mb-2">Deposit Information</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Minimum deposit: ₹100</li>
            <li>• No deposit fees</li>
            <li>• Instant processing</li>
          </ul>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-500/30 p-4">
          <h4 className="font-bold text-red-400 mb-2">Withdrawal Information</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Minimum withdrawal: ₹200</li>
            <li>• 2% withdrawal fee</li>
            <li>• Processing within 24 hours</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;