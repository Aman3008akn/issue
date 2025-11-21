import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LogOut, Users, Wallet, TrendingUp, History, Search, Settings } from 'lucide-react';
import { getTransactionHistory, getUserBalance, updateUserBalance, getUsers, setWhatsAppNumber, getWhatsAppNumber } from '../mock';

const AdminDashboard = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');

  useEffect(() => {
    // Load users
    const usersData = getUsers();
    setUsers(Array.isArray(usersData) ? usersData : []);
    
    // Load transaction history
    const history = getTransactionHistory();
    setTransactionHistory(Array.isArray(history) ? history : []);
    
    // Load current WhatsApp number
    const currentNumber = getWhatsAppNumber();
    setWhatsappNumber(currentNumber);
  }, []);

  const handleAddBalance = (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!selectedUser) {
      setMessage('Please select a user');
      setMessageType('error');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    // Ensure users is an array
    const usersArray = Array.isArray(users) ? users : [];
    
    // Find the user
    const userIndex = usersArray.findIndex(u => u.id === selectedUser);
    if (userIndex === -1) {
      setMessage('User not found');
      setMessageType('error');
      return;
    }

    // Update user balance
    const updatedUsers = [...usersArray];
    updatedUsers[userIndex].balance += amountValue;
    
    // Update in localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update state
    setUsers(updatedUsers);
    setAmount('');
    
    // Add to transaction history with transaction ID
    const newTransaction = {
      type: 'deposit',
      amount: amountValue,
      timestamp: new Date().toISOString(),
      balanceAfter: updatedUsers[userIndex].balance,
      transactionId: transactionId || 'N/A'
    };
    
    // Add to transaction history
    const historyArray = Array.isArray(transactionHistory) ? transactionHistory : [];
    const updatedHistory = [newTransaction, ...historyArray];
    setTransactionHistory(updatedHistory);
    
    // Save to localStorage
    localStorage.setItem('transactionHistory', JSON.stringify(updatedHistory));
    
    setMessage(`Successfully added ₹${amountValue.toFixed(2)} to ${updatedUsers[userIndex].username}'s account. Transaction ID: ${transactionId || 'N/A'}`);
    setMessageType('success');
    
    // Clear transaction ID field
    setTransactionId('');
  };

  const handleUpdateWhatsAppNumber = (e) => {
    e.preventDefault();
    if (!whatsappNumber) {
      setWhatsappMessage('Please enter a WhatsApp number');
      return;
    }
    
    // Validate that it's a number
    if (!/^\d+$/.test(whatsappNumber)) {
      setWhatsappMessage('Please enter a valid WhatsApp number (digits only)');
      return;
    }
    
    // Update WhatsApp number
    setWhatsAppNumber(whatsappNumber);
    setWhatsappMessage('WhatsApp number updated successfully');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setWhatsappMessage('');
    }, 3000);
  };

  const handleLogout = () => {
    onLogout();
  };

  // Ensure users is an array before mapping
  const usersArray = Array.isArray(users) ? users : [];
  const historyArray = Array.isArray(transactionHistory) ? transactionHistory : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                <strong>Admin Dashboard</strong>
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

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage user accounts and transactions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                User Management
              </h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded-lg ${
                  messageType === 'success' 
                    ? 'bg-green-900/50 border border-green-500/30 text-green-300' 
                    : 'bg-red-900/50 border border-red-500/30 text-red-300'
                }`}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleAddBalance} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Select User</label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded"
                  >
                    <option value="">Select a user</option>
                    {usersArray.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email}) - ₹{user.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount (₹)</label>
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
                
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Transaction ID (optional)</label>
                  <Input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter transaction ID"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Add Balance
                </Button>
              </form>
            </Card>

            {/* WhatsApp Number Settings */}
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-400" />
                WhatsApp Settings
              </h2>
              
              {whatsappMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  whatsappMessage.includes('successfully') 
                    ? 'bg-green-900/50 border border-green-500/30 text-green-300' 
                    : 'bg-red-900/50 border border-red-500/30 text-red-300'
                }`}>
                  {whatsappMessage}
                </div>
              )}
              
              <form onSubmit={handleUpdateWhatsAppNumber} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">WhatsApp Number</label>
                  <Input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter WhatsApp number (e.g., 918826817677)"
                  />
                  <p className="text-gray-400 text-xs mt-1">Enter the full number including country code, digits only</p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Update WhatsApp Number
                </Button>
              </form>
            </Card>

            {/* Transaction History */}
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
                  {historyArray.map((transaction, index) => (
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
                          <Wallet className="w-6 h-6 text-green-400" />
                        ) : (
                          <Wallet className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold capitalize">{transaction.type}</span>
                          {transaction.transactionId && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                              ID: {transaction.transactionId}
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
                              <div>Fee: ₹{(typeof transaction.fee === 'number' ? transaction.fee : 0).toFixed(2)}</div>
                              <div className="text-red-400">Net: ₹{(typeof transaction.amountAfterFee === 'number' ? transaction.amountAfterFee : 0).toFixed(2)}</div>
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
            </Card>
          </div>

          {/* User List */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                All Users
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {usersArray.length > 0 ? (
                  usersArray.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold truncate">{user.username}</div>
                        <div className="text-gray-400 text-sm truncate">{user.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">₹{user.balance.toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    No users found.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;