import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

const SupabaseContext = createContext();

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check active session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // If user profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          // Profile not found, create one
          await createUserProfile(userId);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const createUserProfile = async (userId) => {
    try {
      // Get user from auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              username: user.email.split('@')[0], // Default username from email
              email: user.email,
              balance: 5000.0,
            }
          ])
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
        return data;
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const signUp = async (email, password, username) => {
    try {
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Handle specific Supabase auth errors
        if (error.message.includes('already exists')) {
          throw new Error('A user with this email already exists. Please login instead.');
        }
        throw error;
      }

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

        if (profileError) {
          // If profile already exists, fetch it
          if (profileError.code === '23505') { // Unique violation
            const { data: existingProfile, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (fetchError) throw fetchError;
            return { user: data.user, profile: existingProfile };
          }
          throw profileError;
        }

        return { user: data.user, profile };
      }

      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific Supabase auth errors
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw error;
      }

      if (data.user) {
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // If profile doesn't exist, create one
        if (profileError) {
          if (profileError.code === 'PGRST116') { // Not found
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert([
                {
                  id: data.user.id,
                  username: data.user.email.split('@')[0],
                  email: data.user.email,
                  balance: 5000.0,
                }
              ])
              .select()
              .single();
            
            if (createError) throw createError;
            return { user: data.user, profile: newProfile };
          }
          throw profileError;
        }

        return { user: data.user, profile };
      }

      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserBalance = async (amount) => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase.rpc('update_user_balance', {
        user_id: user.id,
        amount: amount
      });

      if (error) {
        console.error('Error updating user balance:', error);
        throw error;
      }
      
      // Update local profile
      setProfile(prev => ({
        ...prev,
        balance: data.balance
      }));
      
      return data.balance;
    } catch (error) {
      console.error('Error updating user balance:', error);
      return profile ? profile.balance : 0;
    }
  };

  const value = {
    user,
    profile,
    loading,
    supabase, // Add the supabase instance to the context value
    signUp,
    signIn,
    signOut,
    updateUserBalance,
    fetchUserProfile
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};