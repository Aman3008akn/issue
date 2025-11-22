import React, { useState } from 'react';
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
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, IndianRupee, History, CreditCard, Smartphone, Globe } from 'lucide-react';
import { getCurrentUser, updateUserBalance, addTransactionHistory, getTransactionHistory, getWhatsAppNumber } from '../mock';

const WalletComponent = ({ onBalanceChange }) => {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('deposit'); // 'deposit' or 'withdraw'
  const [withdrawalMethod, setWithdrawalMethod] = useState('upi'); // 'upi', 'imps', 'crypto'
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
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
      
      // Generate unique ID for the deposit
      const uniqueId = 'DEP' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
      
      // Get WhatsApp number from settings
      const whatsappNumber = getWhatsAppNumber();
      
      // For deposit, redirect to WhatsApp with unique ID
      const whatsappMessage = `I want to deposit ₹${amountValue.toFixed(2)} into my WinShow account. Transaction ID: ${uniqueId}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      setMessage(`Please complete your deposit of ₹${amountValue.toFixed(2)} via WhatsApp. Transaction ID: ${uniqueId}. If you have already sent the message, please wait for confirmation.`);
      setMessageType('success');
    } else {
      // Handle withdrawal request
      // Check minimum withdrawal amount
      if (amountValue < 200) {
        setMessage('Minimum withdrawal amount is ₹200');
        setMessageType('error');
        return;
      }
      
      // Validate withdrawal method fields
      if (withdrawalMethod === 'upi' && !upiId) {
        setMessage('Please enter your UPI ID');
        setMessageType('error');
        return;
      }
      
      if (withdrawalMethod === 'imps' && (!bankAccount || !ifscCode)) {
        setMessage('Please enter your bank account number and IFSC code');
        setMessageType('error');
        return;
      }
      
      if (withdrawalMethod === 'crypto' && !cryptoWallet) {
        setMessage('Please enter your crypto wallet address');
        setMessageType('error');
        return;
      }
      
      // Check if user has sufficient balance
      if (amountValue > balance) {
        setMessage('Insufficient balance for withdrawal');
        setMessageType('error');
        return;
      }
      
      // Create withdrawal request instead of processing immediately
      const withdrawalRequest = {
        id: 'WDR' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase(),
        userId: user.id,
        username: user.username,
        amount: amountValue,
        method: withdrawalMethod,
        upiId: withdrawalMethod === 'upi' ? upiId : null,
        bankAccount: withdrawalMethod === 'imps' ? bankAccount : null,
        ifscCode: withdrawalMethod === 'imps' ? ifscCode : null,
        cryptoWallet: withdrawalMethod === 'crypto' ? cryptoWallet : null,
        status: 'pending',
        timestamp: new Date().toISOString(),
        processedAt: null
      };
      
      // Save withdrawal request to localStorage
      const existingRequests = JSON.parse(localStorage.getItem('withdrawalRequests') || '[]');
      existingRequests.push(withdrawalRequest);
      localStorage.setItem('withdrawalRequests', JSON.stringify(existingRequests));
      
      // Deduct balance immediately (in a real app, this would be done after admin approval)
      const amountToDeduct = -amountValue; // Negative amount to deduct
      updateUserBalance(amountToDeduct);
      
      // Add to transaction history as pending withdrawal
      addTransactionHistory({
        type: 'withdrawal',
        amount: amountValue,
        status: 'pending',
        method: withdrawalMethod,
        timestamp: new Date().toISOString(),
        balanceAfter: balance - amountValue
      });
      
      setMessage(`Withdrawal request for ₹${amountValue.toFixed(2)} via ${getMethodName(withdrawalMethod)} has been submitted. You will receive the funds within 24 hours.`);
      setMessageType('success');
      
      // Clear withdrawal fields
      setUpiId('');
      setBankAccount('');
      setIfscCode('');
      setCryptoWallet('');
    }

    // Clear form
    setAmount('');
    
    // Notify parent component of balance change
    if (onBalanceChange) {
      onBalanceChange();
    }
  };

  // Get method name for display
  const getMethodName = (method) => {
    switch (method) {
      case 'upi':
        return 'UPI';
      case 'imps':
        return 'IMPS/Bank Transfer';
      case 'crypto':
        return 'Cryptocurrency';
      default:
        return method.toUpperCase();
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
            <div className="text-4xl font-bold text-white">₹{(typeof balance === 'number' ? balance : 0).toFixed(2)}</div>
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
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
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
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
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

          {/* Withdrawal Method Selection - Only shown when withdrawing */}
          {transactionType === 'withdraw' && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Withdrawal Method
                </label>
                <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select withdrawal method" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="upi" className="flex items-center">
                      <div className="flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" />
                        UPI
                      </div>
                    </SelectItem>
                    <SelectItem value="imps">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        IMPS/Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="crypto">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Cryptocurrency
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* UPI ID Input */}
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
                    placeholder="Enter your UPI ID (e.g., mobile@upi)"
                  />
                </div>
              )}

              {/* Bank Account and IFSC Input */}
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
                      placeholder="Enter your bank account number"
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

              {/* Crypto Wallet Input */}
              {withdrawalMethod === 'crypto' && (
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Crypto Wallet Address
                  </label>
                  <Input
                    type="text"
                    value={cryptoWallet}
                    onChange={(e) => setCryptoWallet(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your crypto wallet address"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Supported: Bitcoin, Ethereum, USDT (ERC-20, TRC-20)
                  </p>
                </div>
              )}
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
            {transactionType === 'deposit' ? 'Deposit Funds' : 'Request Withdrawal'}
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
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30' 
                        : 'bg-gradient-to-r from-red-900/30 to-rose-900/30 border border-red-500/30'
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
                        {transaction.method && (
                          <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                            {getMethodName(transaction.method)}
                          </span>
                        )}
                        {transaction.status === 'pending' && (
                          <span className="text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">
                            Pending
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {transaction.type === 'deposit' ? (
                          <span>Amount: ₹{(typeof transaction.amount === 'number' ? transaction.amount : 0).toFixed(2)}</span>
                        ) : (
                          <div>
                            <div>Amount: ₹{(typeof transaction.amount === 'number' ? transaction.amount : 0).toFixed(2)}</div>
                            {transaction.fee && (
                              <div>Fee: ₹{(typeof transaction.fee === 'number' ? transaction.fee : 0).toFixed(2)}</div>
                            )}
                            {transaction.amountAfterFee && (
                              <div className="text-red-400">Net: ₹{(typeof transaction.amountAfterFee === 'number' ? transaction.amountAfterFee : 0).toFixed(2)}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Balance After</div>
                      <div className={`font-bold ${
                        transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ₹{(typeof transaction.balanceAfter === 'number' ? transaction.balanceAfter : 0).toFixed(2)}
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
        <Card className="bg-gradient-to-br from-green-900/50 to-emerald-800/50 border-green-500/30 p-4">
          <h4 className="font-bold text-green-400 mb-2">Deposit Information</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Minimum deposit: ₹100</li>
            <li>• No deposit fees</li>
            <li>• Instant processing</li>
          </ul>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/50 to-rose-800/50 border-red-500/30 p-4">
          <h4 className="font-bold text-red-400 mb-2">Withdrawal Information</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Minimum withdrawal: ₹200</li>
            <li>• 2% withdrawal fee</li>
            <li>• Processing within 24 hours</li>
            <li>• Multiple withdrawal methods available</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default WalletComponent;