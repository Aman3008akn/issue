import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plane, Palette, Car, Wallet, LogOut, User } from 'lucide-react';
import { getCurrentUser, getUserBalance } from '../mock';
import AviatorGame from './games/AviatorGame';
import ColorPredictionGame from './games/ColorPredictionGame';
import CarGame from './games/CarGame';
import GameHistory from './GameHistory';
import WalletComponent from './Wallet';

const Dashboard = ({ onLogout }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    refreshBalance();
  }, []);

  const refreshBalance = () => {
    const userBalance = getUserBalance();
    setBalance(userBalance);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    onLogout();
  };

  const games = [
    {
      id: 'aviator',
      name: 'Aviator',
      icon: Plane,
      description: 'Fly high and cash out before crash!',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'color',
      name: 'Color Prediction',
      description: 'Predict the winning color!',
      icon: Palette,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'car',
      name: 'Car Racing',
      icon: Car,
      description: 'Bet on the fastest car!',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'aviator':
        return <AviatorGame onBalanceChange={refreshBalance} />;
      case 'color':
        return <ColorPredictionGame onBalanceChange={refreshBalance} />;
      case 'car':
        return <CarGame onBalanceChange={refreshBalance} />;
      case 'history':
        return <GameHistory />;
      case 'wallet':
        return <WalletComponent onBalanceChange={refreshBalance} />;
      case 'home':
      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Welcome to <strong>WinShow</strong> Casino
              </h1>
              <p className="text-gray-400 text-lg">Choose your game and start winning!</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {games.map((game) => (
                <Card 
                  key={game.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                  onClick={() => setCurrentView(game.id)}
                >
                  <div className="p-6">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${game.gradient} w-12 h-12 mb-4 flex items-center justify-center`}>
                      <game.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                    <p className="text-gray-400 mb-4">{game.description}</p>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      Play Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 p-8">
              <h3 className="text-2xl font-bold text-white mb-4">How to Play?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-gray-300">
                <div>
                  <h4 className="font-bold text-purple-400 mb-2">Aviator</h4>
                  <p className="text-sm">Watch the multiplier rise and cash out before it crashes. The higher you wait, the more you win!</p>
                </div>
                <div>
                  <h4 className="font-bold text-pink-400 mb-2">Color Prediction</h4>
                  <p className="text-sm">Choose Red, Green, or Violet. Wait for the round to complete and win based on the result!</p>
                </div>
                <div>
                  <h4 className="font-bold text-cyan-400 mb-2">Car Racing</h4>
                  <p className="text-sm">Bet on which car will finish in 1st place. Higher risk positions give better payouts!</p>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('home')}>
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                <strong>WinShow</strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Card className="bg-gray-700/50 border-gray-600 px-4 py-2 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-xs text-gray-400">Balance</div>
                  <div className="text-white font-bold">₹{(typeof balance === 'number' ? balance : 0).toFixed(2)}</div>
                </div>
              </Card>
              
              <Button
                onClick={() => setCurrentView('wallet')}
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                <Wallet className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => setCurrentView('history')}
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                <User className="w-5 h-5" />
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {currentView !== 'home' && currentView !== 'history' && currentView !== 'wallet' && (
        <div className="bg-gray-800/60 backdrop-blur-sm border-b border-gray-700">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setCurrentView('home')}
                variant="ghost"
                className="text-gray-300 hover:text-white"
              >
                ← Back to Games
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;