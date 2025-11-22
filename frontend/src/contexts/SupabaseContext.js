// src/contexts/SupabaseContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  supabase,
  signUp as apiSignUp,
  signIn as apiSignIn,
  signOut as apiSignOut,
  getCurrentUser as apiGetCurrentUser,
  updateUserBalance as apiUpdateUserBalance,
} from '../services/supabase';

const SupabaseContext = createContext(null);

export const useSupabase = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return ctx;
};

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- helper: current user + profile load ----
  const loadUser = async () => {
    try {
      setLoading(true);
      const result = await apiGetCurrentUser(); // { user, profile } ya null

      if (result && result.user) {
        setUser(result.user);
        setProfile(result.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // ---- on mount + auth change ----
  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setProfile(null);
      } else {
        loadUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---- SIGN UP (AuthPage se call hota) ----
  const signUp = async (email, password, username) => {
    const result = await apiSignUp(email, password, username);
    if (result && result.user) {
      setUser(result.user);
      setProfile(result.profile);
    }
    return result;
  };

  // ---- SIGN IN ----
  const signIn = async (email, password) => {
    const result = await apiSignIn(email, password);
    if (result && result.user) {
      setUser(result.user);
      setProfile(result.profile);
    }
    return result;
  };

  // ---- SIGN OUT ----
  const signOut = async () => {
    await apiSignOut();
    setUser(null);
    setProfile(null);
  };

  // ---- BALANCE UPDATE (Aviator + Wallet use karega) ----
  // Sirf amount do (±), userId yahin se jayega
  const updateUserBalance = async (amount) => {
    if (!profile) throw new Error('User profile not loaded');

    const data = await apiUpdateUserBalance(profile.id, amount);

    // RPC agar updated balance de raha hai to use karo
    setProfile((prev) => {
      if (!prev) return prev;
      if (data && typeof data.balance === 'number') {
        return { ...prev, balance: data.balance };
      }
      return { ...prev, balance: (prev.balance || 0) + amount };
    });

    return data;
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserBalance,
    reloadUser: loadUser,
    supabase,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};