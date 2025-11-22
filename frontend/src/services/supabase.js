import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using your actual Supabase credentials
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://ebbwgkchrcvtavasqbpx.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYndna2NocmN2dGF2YXNxYnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Mjc4NDYsImV4cCI6MjA3OTMwMzg0Nn0.hzYcfLPA_Zv4wCnAmbS9TRJpX8X8PkwvfsQOFub3VsA';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User authentication functions
export const signUp = async (email, password, username) => {
  try {
    // First, sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // If signup is successful, create user profile in the users table
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            username,
            email,
            balance: 5000.0, // Starting balance
          }
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      return { user: data.user, profile };
    }

    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return { user: data.user, profile };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return { user, profile };
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// User balance functions
export const getUserBalance = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data.balance;
  } catch (error) {
    console.error('Error getting user balance:', error);
    throw error;
  }
};

export const updateUserBalance = async (userId, amount) => {
  try {
    // Use Supabase's atomic increment to prevent race conditions
    const balanceResult = await supabase.rpc('update_user_balance', {
      user_id: userId,
      amount: amount
    });

    if (balanceResult.error) throw balanceResult.error;
    return balanceResult.data;
  } catch (error) {
    console.error('Error updating user balance:', error);
    throw error;
  }
};

// Game history functions
export const addGameHistory = async (gameData) => {
  try {
    const { data, error } = await supabase
      .from('game_history')
      .insert([gameData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding game history:', error);
    throw error;
  }
};

export const getGameHistory = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('game_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting game history:', error);
    throw error;
  }
};

// Transaction history functions
export const addTransactionHistory = async (transactionData) => {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .insert([transactionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding transaction history:', error);
    throw error;
  }
};

export const getTransactionHistory = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting transaction history:', error);
    throw error;
  }
};

// Referral functions
export const claimReferralBonus = async (userId, referredUserId) => {
  try {
    // Check if this referral bonus was already claimed
    const { data: existingBonus, error: checkError } = await supabase
      .from('referral_bonuses')
      .select('*')
      .eq('user_id', userId)
      .eq('referred_user_id', referredUserId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingBonus) {
      return { success: false, message: 'Referral bonus already claimed for this user.' };
    }

    // Grant Rs. 500 bonus
    const bonusAmount = 500.0;
    
    // Update user's balance using atomic increment
    const { data: updatedUser, error: updateError } = await supabase.rpc('update_user_balance', {
      user_id: userId,
      amount: bonusAmount
    });

    if (updateError) throw updateError;

    // Record the bonus transaction
    const { data: bonusRecord, error: bonusError } = await supabase
      .from('referral_bonuses')
      .insert([
        {
          user_id: userId,
          referred_user_id: referredUserId,
          bonus_amount: bonusAmount
        }
      ])
      .select()
      .single();

    if (bonusError) throw bonusError;

    // Add transaction to history
    const { data: transaction, error: transactionError } = await supabase
      .from('transaction_history')
      .insert([
        {
          user_id: userId,
          type: 'referral_bonus',
          amount: bonusAmount,
          description: `Referral bonus for user ${referredUserId}`,
          balance_after: updatedUser.balance
        }
      ])
      .select()
      .single();

    if (transactionError) throw transactionError;

    return { 
      success: true, 
      message: `Successfully granted Rs. ${bonusAmount} referral bonus`,
      bonus_amount: bonusAmount
    };
  } catch (error) {
    console.error('Error claiming referral bonus:', error);
    return { success: false, message: 'An error occurred while processing the referral bonus' };
  }
};

// Withdrawal functions
export const createWithdrawalRequest = async (withdrawalData) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .insert([withdrawalData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    throw error;
  }
};

export const getWithdrawalRequests = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting withdrawal requests:', error);
    throw error;
  }
};

export const getPendingWithdrawalRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        user:users(username)
      `)
      .eq('status', 'pending')
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting pending withdrawal requests:', error);
    throw error;
  }
};

export const processWithdrawalRequest = async (requestId) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({ 
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    throw error;
  }
};
