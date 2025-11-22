import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

export const useAdminData = () => {
  const [users, setUsers] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { supabase } = useSupabase();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data with individual error handling to isolate issues
      let usersData = [];
      let historyData = [];
      let withdrawalsData = [];
      let depositsData = [];

      try {
        const usersResult = await supabase.from('users').select('*');
        if (usersResult.error) {
          console.error('Users fetch error:', usersResult.error);
        } else {
          usersData = usersResult.data || [];
        }
      } catch (err) {
        console.error('Users query failed:', err);
      }

      try {
        const historyResult = await supabase
          .from('transaction_history')
          .select('*')
          .order('timestamp', { ascending: false });
        if (historyResult.error) {
          console.error('History fetch error:', historyResult.error);
        } else {
          historyData = historyResult.data || [];
        }
      } catch (err) {
        console.error('History query failed:', err);
      }

      try {
        const withdrawalsResult = await supabase
          .from('withdrawal_requests')
          .select(`
            *,
            user:users(username)
          `)
          .order('timestamp', { ascending: true });
        if (withdrawalsResult.error) {
          console.error('Withdrawals fetch error:', withdrawalsResult.error);
        } else {
          withdrawalsData = withdrawalsResult.data || [];
        }
      } catch (err) {
        console.error('Withdrawals query failed:', err);
      }

      try {
        const depositsResult = await supabase
          .from('deposit_requests')
          .select(`
            *,
            user:users(username)
          `)
          .order('timestamp', { ascending: true });
        if (depositsResult.error) {
          console.error('Deposits fetch error:', depositsResult.error);
        } else {
          depositsData = depositsResult.data || [];
        }
      } catch (err) {
        console.error('Deposits query failed:', err);
      }

      setUsers(usersData);
      setTransactionHistory(historyData);
      setWithdrawalRequests(withdrawalsData);
      setDepositRequests(depositsData);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load admin data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateUsers = useCallback((updater) => {
    setUsers(updater);
  }, []);

  const updateTransactions = useCallback((updater) => {
    setTransactionHistory(updater);
  }, []);

  const updateWithdrawals = useCallback((updater) => {
    setWithdrawalRequests(updater);
  }, []);

  const updateDeposits = useCallback((updater) => {
    setDepositRequests(updater);
  }, []);

  return {
    users,
    transactionHistory,
    withdrawalRequests,
    depositRequests,
    isLoading,
    error,
    refetch: fetchData,
    updateUsers,
    updateTransactions,
    updateWithdrawals,
    updateDeposits,
  };
};
