import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LogOut, Users, Wallet, TrendingUp, History, Search, Settings } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

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
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'transactions', 'withdrawals'
  const { signOut } = useSupabase();

  useEffect(() => {
    // Load data
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;
      setUsers(usersData);
      
      // Fetch transaction history
      const { data: historyData, error: historyError } = await supabase
        .from('transaction_history')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (historyError) throw historyError;
      setTransactionHistory(historyData);
      
      // Fetch withdrawal requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          user:users(username)
        `)
        .order('timestamp', { ascending: true });
      
      if (requestsError) throw requestsError;
      setWithdrawalRequests(requestsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddBalance = async (e) => {
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

    try {
      // Update user balance via Supabase
      const { data: updatedUser, error } = await supabase.rpc('update_user_balance', {
        user_id: selectedUser,
        amount: amountValue
      });

      if (error) throw error;
      
      // Add to transaction history
      const newTransaction = {
        user_id: selectedUser,
        type: 'deposit',
        amount: amountValue,
        timestamp: new Date().toISOString(),
        balance_after: updatedUser.balance,
        transaction_id: transactionId || 'N/A'
      };
      
      const { data: transactionData, error: transactionError } = await supabase
        .from('transaction_history')
        .insert([newTransaction])
        .select()
        .single();
      
      if (transactionError) throw transactionError;
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser 
            ? { ...user, balance: updatedUser.balance } 
            : user
        )
      );
      
      const user = users.find(u => u.id === selectedUser);
      setTransactionHistory(prev => [transactionData, ...prev]);
      
      setMessage(`Successfully added ₹${amountValue.toFixed(2)} to ${user?.username || 'user'}'s account. Transaction ID: ${transactionId || 'N/A'}`);
      setMessageType('success');
      
      // Clear form fields
      setAmount('');
      setTransactionId('');
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error updating user balance:', error);
      setMessage('Failed to update user balance');
      setMessageType('error');
    }
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
    
    // Update WhatsApp number in localStorage
    localStorage.setItem('whatsappNumber', whatsappNumber);
    setWhatsappMessage('WhatsApp number updated successfully');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setWhatsappMessage('');
    }, 3000);
  };

  const handleProcessWithdrawal = async (requestId) => {
    try {
      // Update withdrawal request status
      const { data: updatedRequest, error } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setWithdrawalRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? updatedRequest 
            : request
        )
      );
      
      // Add to transaction history
      const request = withdrawalRequests.find(r => r.id === requestId);
      if (request) {
        const newTransaction = {
          user_id: request.user_id,
          type: 'withdrawal',
          amount: request.amount,
          method: request.method,
          status: 'processed',
          timestamp: new Date().toISOString()
        };
        
        const { data: transactionData, error: transactionError } = await supabase
          .from('transaction_history')
          .insert([newTransaction])
          .select()
          .single();
        
        if (!transactionError) {
          setTransactionHistory(prev => [transactionData, ...prev]);
        }
      }
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  // Ensure users is an array before mapping
  const usersArray = Array.isArray(users) ? users : [];
  const historyArray = Array.isArray(transactionHistory) ? transactionHistory : [];

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

      {/* Tab Navigation */}
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
              Withdrawal Requests
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Management Tab */}
            {activeTab === 'users' && (
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
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Transaction ID (Optional)</label>
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
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
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
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'deposit' || transaction.type === 'referral_bonus' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'referral_bonus' ? (
                              <Wallet className="w-4 h-4" />
                            ) : (
                              <Wallet className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="text-white font-medium capitalize">
                              {transaction.type.replace('_', ' ')}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {transaction.user_id ? `User ID: ${transaction.user_id.substring(0, 8)}...` : 'System'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold ${
                            transaction.type === 'deposit' || transaction.type === 'referral_bonus' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'referral_bonus' ? '+' : '-'}₹{transaction.amount?.toFixed(2) || '0.00'}
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
            )}

            {/* Withdrawal Requests Tab */}
            {activeTab === 'withdrawals' && (
              <Card className="bg-gray-800/50 border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-purple-400" />
                  Withdrawal Requests
                </h2>
                
                {withdrawalRequests.filter(req => req.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No pending withdrawal requests.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawalRequests
                      .filter(req => req.status === 'pending')
                      .map((request) => (
                        <Card key={request.id} className="bg-gray-700/50 border-gray-600 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-purple-500/20 p-2 rounded-lg">
                                <Wallet className="w-6 h-6 text-purple-400" />
                              </div>
                              <div>
                                <div className="text-white font-bold">₹{request.amount.toFixed(2)}</div>
                                <div className="text-gray-400 text-sm">
                                  {request.user?.username || 'Unknown User'} • {getMethodName(request.method)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="text-right mr-4">
                                <div className="text-gray-400 text-sm">
                                  {new Date(request.timestamp).toLocaleString()}
                                </div>
                                {request.method === 'upi' && request.upi_id && (
                                  <div className="text-gray-500 text-xs">UPI: {request.upi_id}</div>
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
                              >
                                Process
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
                
                {/* Processed Requests */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-400 mb-4">Processed Requests</h3>
                  
                  {withdrawalRequests.filter(req => req.status === 'processed').length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p>No processed requests yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {withdrawalRequests
                        .filter(req => req.status === 'processed')
                        .map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-500/20 p-2 rounded-full">
                                <Wallet className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <div className="text-white font-medium">₹{request.amount.toFixed(2)}</div>
                                <div className="text-gray-400 text-sm">
                                  {request.user?.username || 'Unknown User'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-green-400 text-sm font-bold">Processed</div>
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Settings
              </h3>
              
              <form onSubmit={handleUpdateWhatsAppNumber} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">WhatsApp Support Number</label>
                  <Input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter WhatsApp number"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Update Number
                </Button>
                
                {whatsappMessage && (
                  <div className="text-sm text-green-400 text-center">
                    {whatsappMessage}
                  </div>
                )}
              </form>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-2">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Users</span>
                  <span className="text-white font-bold">{usersArray.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pending Withdrawals</span>
                  <span className="text-white font-bold">
                    {withdrawalRequests.filter(req => req.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Transactions</span>
                  <span className="text-white font-bold">{historyArray.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;