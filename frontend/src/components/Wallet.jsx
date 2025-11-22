// src/components/Wallet.jsx
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Wallet as WalletIcon, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  IndianRupee, 
  History, 
  CreditCard, 
  Smartphone, 
  Globe, 
  Phone 
} from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

const WalletComponent = ({ onBalanceChange }) => {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('deposit'); // 'deposit' | 'withdraw'
  const [withdrawalMethod, setWithdrawalMethod] = useState('upi');   // 'upi' | 'imps' | 'crypto'
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { profile, updateUserBalance, supabase } = useSupabase();

  // 🔁 Real transaction history from Supabase
  useEffect(() => {
    const fetchHistory = async () => {
      if (!profile) return;
      setLoadingHistory(true);
      try {
        const { data, error } = await supabase
          .from('transaction_history')
          .select('*')
          .eq('user_id', profile.id)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) throw error;
        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [profile, supabase]);

  const handleTransaction = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    if (!profile) {
      setMessage('Please login again, profile not loaded.');
      setMessageType('error');
      return;
    }

    if (transactionType === 'deposit') {
      // 🔹 Deposit: create transaction_id + save in deposit_requests table + open WhatsApp
      const transactionId =
        'DEP' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
      const whatsappNumber =
        localStorage.getItem('whatsappNumber') || '918826817677';
      const messageText = `I want to deposit rupees ${amountValue.toFixed(
        2
      )} into my WinShow account. Transaction ID: ${transactionId}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        messageText
      )}`;

      try {
        // 1) Save deposit request in DB as "pending"
        const depositResult = await supabase.from('deposit_requests').insert([
          {
            user_id: profile.id,
            amount: amountValue,
            transaction_id: transactionId,
            status: 'pending',
            timestamp: new Date().toISOString(),
          },
        ]);

        if (depositResult.error) throw depositResult.error;

        // 2) Open WhatsApp with same transaction ID
        window.open(whatsappUrl, '_blank');

        setMessage(
          `Deposit request created! Transaction ID: ${transactionId}. Now share this ID with support on WhatsApp.`
        );
        setMessageType('success');
      } catch (err) {
        console.error('Error creating deposit request:', err);
        setMessage('Failed to create deposit request. Please try again.');
        setMessageType('error');
      }
    } else {
      // 🔹 Withdrawal flow
      if (amountValue > (profile.balance || 0)) {
        setMessage('Insufficient balance for withdrawal');
        setMessageType('error');
        return;
      }

      if (amountValue < 200) {
        setMessage('Minimum withdrawal amount is ₹200');
        setMessageType('error');
        return;
      }

      const withdrawalRequest = {
        user_id: profile.id,
        amount: amountValue,
        method: withdrawalMethod,
        upi_id: withdrawalMethod === 'upi' ? upiId : null,
        bank_account: withdrawalMethod === 'imps' ? bankAccount : null,
        ifsc_code: withdrawalMethod === 'imps' ? ifscCode : null,
        crypto_wallet: withdrawalMethod === 'crypto' ? cryptoWallet : null,
        status: 'pending',
        timestamp: new Date().toISOString(),
        processed_at: null,
      };

      try {
        const withdrawalResult = await supabase
          .from('withdrawal_requests')
          .insert([withdrawalRequest]);

        if (withdrawalResult.error) throw withdrawalResult.error;

        // Deduct balance immediately
        await updateUserBalance(-amountValue);

        setMessage(
          `Withdrawal request for ₹${amountValue.toFixed(
            2
          )} via ${getMethodName(
            withdrawalMethod
          )} has been submitted. You will receive the funds within 24 hours.`
        );
        setMessageType('success');

        setUpiId('');
        setBankAccount('');
        setIfscCode('');
        setCryptoWallet('');
      } catch (err) {
        console.error('Error creating withdrawal request:', err);
        setMessage('Error creating withdrawal request. Please try again.');
        setMessageType('error');
      }
    }

    setAmount('');

    if (onBalanceChange) onBalanceChange();
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <WalletIcon className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl font-bold text-white">Wallet</h2>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">Current Balance</div>
            <div className="text-4xl font-bold text-white">
              ₹{(profile?.balance ? profile.balance : 0).toFixed(2)}
            </div>
          </div>
          <IndianRupee className="w-12 h-12 text-purple-400" />
        </div>
      </Card>

      {/* Transaction Form */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Manage Funds</h3>

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

          {transactionType === 'deposit' ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-bold mb-2">
                  Deposit Information
                </h4>
                <p className="text-gray-300 text-sm">
                  After deposit, please contact support with your transaction ID
                  for instant credit.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp Support
                </h4>
                <p className="text-gray-300 text-sm mb-2">
                  Contact our support team for deposit assistance:
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono">
                    {localStorage.getItem('whatsappNumber') ||
                      '918826817677'}
                  </span>
                  {/* Optional quick open, but main flow is submit button */}
                  <Button
                    type="button"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const whatsappNumber =
                        localStorage.getItem('whatsappNumber') ||
                        '918826817677';
                      const whatsappUrl = `https://wa.me/${whatsappNumber}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    Open WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Withdrawal Method
                </label>
                <Select
                  value={withdrawalMethod}
                  onValueChange={setWithdrawalMethod}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        UPI
                      </div>
                    </SelectItem>
                    <SelectItem value="imps">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        IMPS/Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="crypto">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Cryptocurrency
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {withdrawalMethod === 'upi' && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    UPI ID
                  </label>
                  <Input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="yourname@upi"
                  />
                </div>
              )}

              {withdrawalMethod === 'imps' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      Bank Account Number
                    </label>
                    <Input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      IFSC Code
                    </label>
                    <Input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>
              )}

              {withdrawalMethod === 'crypto' && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Wallet Address
                  </label>
                  <Input
                    type="text"
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter wallet address"
                  />
                </div>
              )}

              <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-bold mb-2">
                  Withdrawal Information
                </h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Minimum withdrawal: ₹200</li>
                  <li>• Processing time: 24 hours</li>
                  <li>• Withdrawal requests are reviewed by our team</li>
                </ul>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className={`w-full ${
              transactionType === 'deposit'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
            }`}
          >
            {transactionType === 'deposit'
              ? 'Create Deposit Request'
              : 'Request Withdrawal'}
          </Button>
        </form>
      </Card>

      {/* Transaction History */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </h3>
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            {showHistory ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showHistory && (
          <>
            {loadingHistory ? (
              <div className="text-center py-8 text-gray-500">
                Loading history...
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((transaction) => (
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
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {transaction.type === 'deposit' ||
                        transaction.type === 'referral_bonus' ? (
                          <ArrowDownCircle className="w-4 h-4" />
                        ) : (
                          <ArrowUpCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium capitalize">
                          {transaction.type.replace('_', ' ')}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {new Date(
                            transaction.timestamp
                          ).toLocaleString()}
                        </div>
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
                          transaction.type === 'referral_bonus'
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {transaction.type === 'deposit' ||
                        transaction.type === 'referral_bonus'
                          ? '+'
                          : '-'}
                        ₹{transaction.amount?.toFixed(2) || '0.00'}
                      </div>
                      {typeof transaction.balance_after === 'number' && (
                        <div className="text-gray-400 text-sm">
                          Balance: ₹
                          {transaction.balance_after.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default WalletComponent;
