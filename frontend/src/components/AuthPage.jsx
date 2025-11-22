import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Rocket, Mail, Lock, User, Gift, Eye, EyeOff } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';

const AuthPage = ({ onLogin, onAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralId, setReferralId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      // Registration specific validations
      if (!formData.username) {
        setError('Username is required');
        setIsLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Check for admin credentials first
        if (formData.email === 'admin@gmail.com' && formData.password === 'Admin123') {
          setSuccess('Welcome Admin!');
          setTimeout(() => {
            onAdminLogin();
          }, 1000);
          return;
        }
        
        // Regular user login logic with Supabase
        const result = await signIn(formData.email, formData.password);
        if (result && result.user) {
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            onLogin({ ...result.profile, email: result.user.email });
          }, 1000);
        } else {
          setError('Invalid credentials. Please try again.');
        }
      } else {
        // Register logic with Supabase
        const result = await signUp(formData.email, formData.password, formData.username);
        if (result && result.user) {
          setSuccess('Registration successful! Welcome to WinShow.');
          // If user was referred, show a welcome bonus message
          if (referralId) {
            setTimeout(() => {
              alert('Welcome! You were referred by another user. Your referrer will receive a bonus.');
            }, 1500);
          }
          
          setTimeout(() => {
            onLogin({ ...result.profile, email: result.user.email });
          }, 2000);
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.message) {
        if (err.message.includes('already exists')) {
          setError('User with this email already exists. Please login instead.');
        } else if (err.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError('Authentication failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Rocket className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            WinShow
          </h1>
          <p className="text-gray-400">Your Premium Gaming Experience</p>
        </div>

        {referralId && (
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-300 text-sm">
                Referred by another user. Welcome bonus will be applied!
              </span>
            </div>
          </div>
        )}

        <Card className="p-8 bg-gray-800/90 backdrop-blur-sm border-purple-500/30 shadow-2xl">
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 transition-all duration-300 ${
                isLogin 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Login
            </Button>
            <Button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 transition-all duration-300 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Register
            </Button>
          </div>

          {(error || success) && (
            <div className={`mb-6 p-4 rounded-xl ${
              error 
                ? 'bg-red-900/50 border border-red-500/30 text-red-300' 
                : 'bg-green-900/50 border border-green-500/30 text-green-300'
            }`}>
              {error || success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white rounded-xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your username"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white rounded-xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white rounded-xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-gray-700/50 border-gray-600 text-white rounded-xl h-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Logging in...' : 'Registering...'}</span>
                </div>
              ) : (
                isLogin ? 'Login to Account' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/90 text-gray-500">For Admin Access</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-gray-400 text-sm">
                Email: <span className="text-purple-400 font-mono">admin@gmail.com</span>
              </p>
              <p className="text-gray-400 text-sm">
                Password: <span className="text-pink-400 font-mono">Admin123</span>
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>© 2025 WinShow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;