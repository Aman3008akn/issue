import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Timer, TrendingUp, Crown, Gem, Star } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

const ColorPredictionGame = ({ onBalanceChange }) => {
  const [gameState, setGameState] = useState('betting'); // betting, counting, result
  const [timeLeft, setTimeLeft] = useState(10); // Changed from 30 to 10 seconds
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null); // New state for number selection
  const [betAmount, setBetAmount] = useState(100);
  const [result, setResult] = useState(null);
  const [winAmount, setWinAmount] = useState(0);
  const [history, setHistory] = useState([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const { profile, updateUserBalance } = useSupabase();

  useEffect(() => {
    startNewRound();
  }, []);

  useEffect(() => {
    if (gameState === 'betting' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'betting' && timeLeft === 0) {
      startCounting();
    }
  }, [timeLeft, gameState]);

  const startNewRound = () => {
    setGameState('betting');
    setTimeLeft(10); // Changed from 30 to 10 seconds
    setSelectedColor(null);
    setSelectedNumber(null); // Reset number selection
    setResult(null);
    setWinAmount(0);
  };

  const startCounting = () => {
    setGameState('counting');
    
    // Generate result after 5 seconds
    setTimeout(() => {
      // Generate result
      const roundResult = simulateColorRound(selectedColor);
      setResult(roundResult);
      setGameState('result');
      
      // Check win/loss
      let winnings = 0;
      let winType = null;
      
      // Check color match
      if (selectedColor && selectedColor === roundResult.color) {
        // Calculate winnings based on color
        const GAME_PAYOUTS = {
          red: 8,
          green: 8,
          violet: 20
        };
        winnings = Math.floor(betAmount * GAME_PAYOUTS[selectedColor]);
        winType = 'color';
      }
      
      // Check number match (double profit)
      if (selectedNumber && selectedNumber === roundResult.number) {
        const numberWinnings = Math.floor(betAmount * 2); // Double profit for exact number match
        winnings = winType === 'color' ? winnings + numberWinnings : numberWinnings;
        winType = winType === 'color' ? 'both' : 'number';
      }
      
      if (winnings > 0) {
        setWinAmount(winnings);
        // Update balance with winnings
        updateUserBalance(winnings);
        onBalanceChange();
      }

      // Add to history
      setHistory(prev => [roundResult, ...prev.slice(0, 9)]);
      
      // Start new round after 3 seconds
      setTimeout(() => {
        setRoundNumber(prev => prev + 1);
        startNewRound();
      }, 3000);
    }, 5000);
  };

  const handlePlaceBet = async (color) => {
    if (!profile) {
      alert('Please login to play');
      return;
    }
    
    if (selectedColor) return;

    if (betAmount > profile.balance) {
      alert('Insufficient balance');
      return;
    }

    // Deduct bet amount
    await updateUserBalance(-betAmount);
    onBalanceChange();

    setSelectedColor(color);
  };

  // New function to handle number selection
  const handleSelectNumber = async (number) => {
    if (!profile) {
      alert('Please login to play');
      return;
    }
    
    if (selectedColor) return;
    
    if (betAmount > profile.balance) {
      alert('Insufficient balance');
      return;
    }

    // Deduct bet amount
    await updateUserBalance(-betAmount);
    onBalanceChange();

    setSelectedNumber(number);
  };

  const getColorStyle = (color) => {
    switch (color) {
      case 'red': return 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700';
      case 'green': return 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
      case 'violet': return 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700';
      default: return 'bg-gray-500';
    }
  };

  const getColorBg = (color) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'green': return 'bg-green-500';
      case 'violet': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Color prediction game logic - Fixed to ensure numbers are between 1-10 and improve win rate
  const simulateColorRound = (selectedColor = null) => {
    // In color prediction games, numbers are typically associated with colors:
    // Red: Numbers ending in 1, 3, 7, 9 (odd numbers except 5)
    // Green: Numbers ending in 2, 4, 6, 8 (even numbers)
    // Violet: Numbers ending in 0, 5 (special numbers)
    
    // Generate a number between 1-10
    const randomNumber = Math.floor(Math.random() * 10) + 1; // 1-10
    
    // If user selected red, favor green (and vice versa) to make it more challenging
    // Only allow user to win 2-3 times out of 10
    const winChance = Math.random();
    const shouldUserWin = winChance < 0.25; // 25% chance to win (about 2-3 times out of 10)
    
    // Determine color based on number and user selection
    let color;
    if (selectedColor) {
      // If user selected a color, make it harder to win
      if (shouldUserWin) {
        // User wins - match their selection
        color = selectedColor;
      } else {
        // User loses - give opposite color or violet
        if (selectedColor === 'red') {
          color = 'green'; // If user selected red, give green
        } else if (selectedColor === 'green') {
          color = 'red'; // If user selected green, give red
        } else {
          // If user selected violet, give red or green (reduce violet frequency)
          color = Math.random() < 0.5 ? 'red' : 'green';
        }
      }
    } else {
      // No selection - balanced random color distribution
      // Reduce violet frequency significantly
      const random = Math.random();
      if (random < 0.35) {
        color = 'red'; // 35% chance
      } else if (random < 0.7) {
        color = 'green'; // 35% chance
      } else {
        color = 'violet'; // 30% chance (reduced from 80%)
      }
    }
    
    // Assign number type based on color
    let numberType;
    if (color === 'red') {
      numberType = 'red'; // Numbers ending in 1, 3, 7, 9
    } else if (color === 'green') {
      numberType = 'green'; // Numbers ending in 2, 4, 6, 8
    } else {
      numberType = 'violet'; // Numbers ending in 0, 5
    }
    
    return {
      color: color,
      number: randomNumber,
      numberType: numberType
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            <strong>WinShow</strong> Color Prediction
          </h1>
          <p className="text-gray-400 text-lg">Predict the winning color and multiply your money</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-purple-500/50 p-6 backdrop-blur-sm">
              {/* Premium Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Round #{roundNumber}</div>
                    <div className="text-2xl font-bold text-white">
                      {gameState === 'betting' ? `${timeLeft}s` : gameState === 'counting' ? 'Selecting...' : 'Results'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">PREMIUM</span>
                </div>
              </div>

              {/* Game Content */}
              <div className="min-h-96 flex items-center justify-center">
                {gameState === 'betting' ? (
                  <div className="text-center space-y-8 w-full">
                    <div className="text-white">
                      <h2 className="text-3xl font-bold mb-2">Place Your Bet</h2>
                      <p className="text-gray-400">Select a color or number to place your bet</p>
                    </div>

                    {winAmount > 0 ? (
                      <div className="text-3xl text-green-400 animate-pulse flex items-center justify-center gap-2">
                        <Star className="w-8 h-8 text-yellow-400" />
                        You won ₹{winAmount}!
                      </div>
                    ) : selectedColor || selectedNumber ? (
                      <div className="text-2xl text-red-400 animate-pulse">
                        Better luck next time!
                      </div>
                    ) : null}

                    {/* Color Selection - Premium */}
                    <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mx-auto">
                      {[
                        { color: 'red', payout: '8x' },
                        { color: 'green', payout: '8x' },
                        { color: 'violet', payout: '20x' }
                      ].map((item) => (
                        <button
                          key={item.color}
                          onClick={() => handlePlaceBet(item.color)}
                          disabled={selectedColor !== null || selectedNumber !== null}
                          className={`group relative p-8 rounded-2xl ${getColorPremiumStyle(item.color)} ${
                            selectedColor === item.color ? 'ring-4 ring-yellow-400 scale-105' : ''
                          } transition-all duration-300 disabled:opacity-50 transform hover:scale-105`}
                        >
                          <div className="text-center">
                            <div className="text-3xl font-bold text-white uppercase mb-2">
                              {item.color}
                            </div>
                            <div className="text-lg text-white/90">{item.payout} Payout</div>
                          </div>
                          {selectedColor === item.color && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                              SELECTED
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Number Selection - Premium */}
                    <div className="mt-8">
                      <h3 className="text-white font-bold text-2xl mb-4 flex items-center justify-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400" />
                        Select a Number (1-10)
                      </h3>
                      <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                          <button
                            key={number}
                            onClick={() => handleSelectNumber(number)}
                            disabled={selectedColor !== null || selectedNumber !== null}
                            className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 transform hover:scale-110 ${
                              selectedNumber === number 
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 scale-110 ring-4 ring-yellow-300 shadow-lg shadow-yellow-500/30' 
                                : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white border-2 border-gray-600 hover:from-gray-600 hover:to-gray-700'
                            } disabled:opacity-50`}
                          >
                            {number}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : gameState === 'counting' ? (
                  <div className="text-center">
                    <div className="text-4xl text-white font-bold mb-4 animate-pulse">
                      Selecting Result...
                    </div>
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 w-full">
                    <div className="text-white">
                      <h2 className="text-3xl font-bold mb-4">Round Result</h2>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold mb-4 ${
                        result?.color === 'red' ? 'bg-red-500' : 
                        result?.color === 'green' ? 'bg-green-500' : 'bg-purple-500'
                      }`}>
                        {result?.number}
                      </div>
                      <div className="text-2xl font-bold text-white capitalize">
                        {result?.color}
                      </div>
                    </div>
                    
                    {winAmount > 0 ? (
                      <div className="text-3xl text-green-400 animate-pulse flex items-center justify-center gap-2">
                        <Star className="w-8 h-8 text-yellow-400" />
                        You won ₹{winAmount}!
                      </div>
                    ) : (
                      <div className="text-2xl text-red-400">
                        Better luck next time!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bet Amount */}
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-purple-500/30 p-6 backdrop-blur-sm">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <Gem className="w-5 h-5 text-purple-400" />
                Bet Amount
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount (₹)</label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                    className="bg-gray-700/50 border-2 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                    disabled={selectedColor !== null || selectedNumber !== null}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[50, 100, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        className="bg-gradient-to-r from-purple-700/80 to-pink-700/80 hover:from-purple-600 hover:to-pink-600 text-xs border border-purple-500/30 transition-all hover:scale-105"
                        disabled={selectedColor !== null || selectedNumber !== null}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {(selectedColor || selectedNumber) && (
                  <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                    <div className="text-sm text-gray-400 mb-1">Your Bet</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${
                          selectedColor === 'red' ? 'bg-red-500' : 
                          selectedColor === 'green' ? 'bg-green-500' : 
                          selectedColor === 'violet' ? 'bg-purple-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-white font-bold">
                          {selectedColor ? selectedColor.toUpperCase() : 'NUMBER'} {selectedNumber}
                        </span>
                      </div>
                      <span className="text-yellow-400 font-bold">₹{betAmount}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Game History */}
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-purple-500/30 p-6 backdrop-blur-sm">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Recent Results
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.length > 0 ? (
                  history.map((color, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        color === 'red' ? 'bg-red-500/20 border border-red-500/30' :
                        color === 'green' ? 'bg-green-500/20 border border-green-500/30' :
                        'bg-purple-500/20 border border-purple-500/30'
                      }`}
                    >
                      <span className="text-white font-bold capitalize">{color}</span>
                      <span className="text-sm text-gray-400">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    No results yet
                  </div>
                )}
              </div>
            </Card>

            {/* Game Info */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4">
              <h4 className="text-white font-bold mb-2">How to Play</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Choose a color or number (1-10)</li>
                <li>• Place your bet amount</li>
                <li>• Wait for the result</li>
                <li>• Win up to 20x your bet!</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPredictionGame;