import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Palette, Zap, Crown, Gem, Star, Play, RotateCcw } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

const ColorPredictionGame = ({ onBalanceChange }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');
  const [betAmount, setBetAmount] = useState(100);
  const [gameResult, setGameResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [history, setHistory] = useState([]);
  const { profile, updateUserBalance, loading } = useSupabase();

  useEffect(() => {
    let interval;
    if (isPlaying && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            revealResult();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, countdown]);

  // Start demo round after 3 seconds
  useEffect(() => {
    const demoTimeout = setTimeout(() => {
      if (!isPlaying && !gameResult) {
        setIsPlaying(true);
        setCountdown(10);
      }
    }, 3000);
    return () => clearTimeout(demoTimeout);
  }, []);

  const placeBet = async () => {
    // Check if user is authenticated
    if (!profile) {
      alert('Please login to play');
      return;
    }
    
    if (!selectedColor || !selectedNumber) {
      alert('Please select both color and number');
      return;
    }
    
    if (betAmount <= 0 || betAmount > profile.balance) {
      alert('Invalid bet amount');
      return;
    }

    try {
      // Deduct bet amount
      const newBalance = await updateUserBalance(-betAmount);
      setIsPlaying(true);
      setCountdown(10);
      onBalanceChange();
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Error placing bet. Please try again.');
    }
  };

  const revealResult = async () => {
    // Generate result with balanced probabilities
    const colors = ['green', 'red', 'violet'];
    const numbers = Array.from({length: 10}, (_, i) => i + 1);
    
    // Adjust probabilities to reduce violet frequency
    let resultColor;
    const colorRand = Math.random();
    if (colorRand < 0.45) {
      resultColor = 'green';
    } else if (colorRand < 0.9) {
      resultColor = 'red';
    } else {
      resultColor = 'violet';
    }
    
    const resultNumber = Math.floor(Math.random() * 10) + 1;
    
    const result = {
      color: resultColor,
      number: resultNumber,
      timestamp: new Date().toISOString()
    };
    
    setGameResult(result);
    setHistory(prev => [result, ...prev.slice(0, 9)]);
    
    // Check if user won
    const colorMatch = selectedColor === resultColor;
    const numberMatch = parseInt(selectedNumber) === resultNumber;
    
    if (colorMatch || numberMatch) {
      let multiplier = 1;
      
      if (colorMatch && numberMatch) {
        // Jackpot - both color and number match
        multiplier = 100;
      } else if (colorMatch && resultColor === 'violet') {
        // Violet color match
        multiplier = 50;
      } else if (colorMatch) {
        // Regular color match
        multiplier = resultColor === 'green' || resultColor === 'red' ? 2 : 50;
      } else if (numberMatch) {
        // Number match only
        multiplier = 10;
      }
      
      const winAmount = betAmount * multiplier;
      
      try {
        // Add winnings to user balance
        const newBalance = await updateUserBalance(winAmount);
        onBalanceChange();
      } catch (error) {
        console.error('Error updating balance:', error);
        alert('Error updating balance. Please try again.');
      }
    }
    
    // Reset for next round after 3 seconds
    setTimeout(() => {
      resetGame();
    }, 3000);
  };

  const resetGame = () => {
    setSelectedColor('');
    setSelectedNumber('');
    setGameResult(null);
    setIsPlaying(false);
    setCountdown(10);
  };

  const getColorClass = (color) => {
    switch (color) {
      case 'green': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'red': return 'bg-gradient-to-r from-red-500 to-orange-600';
      case 'violet': return 'bg-gradient-to-r from-purple-500 to-pink-600';
      default: return 'bg-gray-600';
    }
  };

  const getColorName = (color) => {
    switch (color) {
      case 'green': return 'Green';
      case 'red': return 'Red';
      case 'violet': return 'Violet';
      default: return '';
    }
  };

  // Show loading state if profile is not loaded yet
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 border-2 border-purple-500/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Palette className="w-6 h-6 text-purple-400" />
                  Color Prediction
                </h2>
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">PREMIUM</span>
                </div>
              </div>

              {/* Game Status */}
              <div className="mb-6">
                {isPlaying ? (
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-white mb-4">
                      {countdown}s
                    </div>
                    <div className="text-gray-400">
                      Waiting for result...
                    </div>
                  </div>
                ) : gameResult ? (
                  <div className="text-center py-6">
                    <div className="text-2xl font-bold text-white mb-4">
                      Result: 
                      <span className={`ml-2 px-3 py-1 rounded-full text-white ${getColorClass(gameResult.color)}`}>
                        {getColorName(gameResult.color)} {gameResult.number}
                      </span>
                    </div>
                    {selectedColor === gameResult.color || parseInt(selectedNumber) === gameResult.number ? (
                      <div className="text-green-400 text-xl animate-pulse">
                        <Star className="w-6 h-6 inline mr-2" />
                        You Won!
                      </div>
                    ) : (
                      <div className="text-red-400 text-xl">
                        Better luck next time!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg">
                      Select your bet and start playing
                    </div>
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="text-white font-bold mb-3">Select Color</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['green', 'red', 'violet'].map(color => (
                    <Button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`${getColorClass(color)} ${selectedColor === color ? 'ring-4 ring-white/50 scale-105' : ''} h-16 transition-all duration-300 hover:scale-105`}
                      disabled={isPlaying}
                    >
                      <span className="text-white font-bold text-lg">
                        {getColorName(color)}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Number Selection */}
              <div>
                <h3 className="text-white font-bold mb-3">Select Number (1-10)</h3>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({length: 10}, (_, i) => i + 1).map(num => (
                    <Button
                      key={num}
                      onClick={() => setSelectedNumber(num.toString())}
                      className={`h-12 ${
                        selectedNumber === num.toString() 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 ring-4 ring-white/50 scale-105' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      } transition-all duration-300 hover:scale-105`}
                      disabled={isPlaying}
                    >
                      <span className="text-white font-bold">
                        {num}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* History */}
          <Card className="mt-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-2 border-purple-500/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-bold">Recent Results</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {history.map((result, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-bold border ${getColorClass(result.color)} text-white`}
                >
                  {getColorName(result.color).charAt(0)} {result.number}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Betting Panel */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-purple-500/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white font-bold text-xl">Place Your Bet</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block flex items-center gap-2">
                  <Gem className="w-4 h-4 text-purple-400" />
                  Bet Amount (₹)
                </label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  className="bg-gray-700/50 border-2 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                  disabled={isPlaying}
                />
                <div className="flex gap-2 mt-2">
                  {[50, 100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="flex-1 bg-gradient-to-r from-purple-700/80 to-pink-700/80 hover:from-purple-600 hover:to-pink-600 text-xs border border-purple-500/30 transition-all hover:scale-105"
                      disabled={isPlaying}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={placeBet}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 border border-green-500/50 shadow-lg hover:shadow-green-500/20 transition-all hover:scale-105"
                  disabled={isPlaying || !selectedColor || !selectedNumber}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play
                </Button>
                
                <Button
                  onClick={resetGame}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 border border-gray-500/50 transition-all hover:scale-105"
                  disabled={!isPlaying && !gameResult}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 p-4 backdrop-blur-sm">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Game Rules
            </h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                Select a color and number (1-10)
              </p>
              <p className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Wait 10 seconds for the result
              </p>
              <p className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                Match color or number to win
              </p>
              <p className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-pink-400" />
                Match both for jackpot!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ColorPredictionGame;
