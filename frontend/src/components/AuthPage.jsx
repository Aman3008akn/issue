import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Rocket, Mail, Lock, User, Gift } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

const AuthPage = ({ onLogin, onAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [referralId, setReferralId] = useState('');
  const { signUp, signIn } = useSupabase();

  useEffect(() => {
    // Check for referral ID in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');
    if (refId) {
      setReferralId(refId);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Check for admin credentials first
      if (formData.email === 'admin@gmail.com' && formData.password === 'Admin123') {
        // Admin login
        onAdminLogin();
        return;
      }
      
      // Regular user login logic with Supabase
      try {
        const result = await signIn(formData.email, formData.password);
        if (result && result.user) {
          onLogin({ ...result.profile, email: result.user.email });
        } else {
          setError('Invalid credentials. Please try again.');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Invalid credentials. Please try again.');
      }
    } else {
      // Register logic with Supabase
      if (formData.username && formData.email && formData.password) {
        try {
          const result = await signUp(formData.email, formData.password, formData.username);
          if (result && result.user) {
            // If user was referred, show a welcome bonus message
            if (referralId) {
              alert('Welcome! You were referred by another user. Your referrer will receive a bonus.');
            }
            
            onLogin({ ...result.profile, email: result.user.email });
          } else {
            setError('Registration failed. Please try again.');
          }
        } catch (err) {
          console.error('Registration error:', err);
          if (err.message && err.message.includes('already exists')) {
            setError('User with this email already exists. Please use a different email or login instead.');
          } else {
            setError('Registration failed. Please try again.');
          }
        }
      } else {
        setError('Please fill all fields');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gray-800/90 backdrop-blur-sm border-purple-500/30">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Rocket className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              <strong>WinShow</strong>
            </h1>
          </div>
          <p className="text-gray-400">Your Gaming Paradise</p>
        </div>

        {referralId && (
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-300 text-sm">
                You were referred by another user. Welcome bonus will be applied!
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setIsLogin(true)}
            className={`flex-1 ${isLogin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Login
          </Button>
          <Button
            onClick={() => setIsLogin(false)}
            className={`flex-1 ${!isLogin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            Register
          </Button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter username"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
                placeholder="Enter email"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
                placeholder="Enter password"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mt-6">
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Use admin@gmail.com with Admin123 for admin access</p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;