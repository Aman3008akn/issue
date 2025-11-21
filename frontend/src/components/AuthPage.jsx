import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Rocket } from 'lucide-react';
import { MOCK_USERS, setCurrentUser } from '../mock';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login logic
      const user = MOCK_USERS.find(
        u => (u.username === formData.username || u.email === formData.username) && u.password === formData.password
      );
      
      if (user) {
        setCurrentUser(user);
        onLogin(user);
      } else {
        setError('Invalid credentials. Try demo/demo123');
      }
    } else {
      // Register logic (mock)
      if (formData.username && formData.email && formData.password) {
        const newUser = {
          id: Date.now().toString(),
          username: formData.username,
          email: formData.email,
          password: formData.password,
          balance: 5000 // Starting balance
        };
        MOCK_USERS.push(newUser);
        setCurrentUser(newUser);
        onLogin(newUser);
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
              1WIN
            </h1>
          </div>
          <p className="text-gray-400">Your Gaming Paradise</p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder={isLogin ? 'Username or Email' : 'Username'}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
          )}

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isLogin ? 'Login' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-300 text-center">
            Demo Account: <span className="font-mono text-purple-400">demo / demo123</span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
