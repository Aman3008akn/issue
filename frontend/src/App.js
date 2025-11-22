import React, { useState, useEffect } from 'react';
import './App.css';
import { useSupabase } from './contexts/SupabaseContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, profile, loading } = useSupabase();

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // Check if user is admin
  const isAdminUser = user?.email === 'admin@gmail.com';

  return (
    <div className="App">
      {user || isAdmin ? (
        isAdminUser || isAdmin ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <Dashboard user={user} profile={profile} onLogout={handleLogout} />
        )
      ) : (
        <AuthPage onLogin={() => {}} onAdminLogin={handleAdminLogin} />
      )}
    </div>
  );
}

export default App;