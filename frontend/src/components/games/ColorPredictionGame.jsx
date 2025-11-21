import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Timer, TrendingUp, Crown, Gem, Star } from 'lucide-react';
import { simulateColorRound, getUserBalance, updateUserBalance, addGameHistory, GAME_PAYOUTS, addRecentWinner } from '../../mock';

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
    // Simulate counting animation
    setTimeout(() => {
      // Pass the selected color to influence the result
      const roundResult = simulateColorRound(selectedColor);
      setResult(roundResult);
      setGameState('result');
      // Add to history
      setHistory(prev => [roundResult.color, ...prev.slice(0, 9)]);
      
      // Check if user won
      let winnings = 0;
      let winType = 'loss';
      
      // Check color match
      if (selectedColor === roundResult.color) {
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
        const newBalance = updateUserBalance(winnings);
        onBalanceChange();
        
        // Add to recent winners
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
          addRecentWinner({
            username: user.username,
            game: 'Color Prediction',
            amount: winnings,
            timestamp: Date.now()
          });
        }
      }

      addGameHistory({
        round: roundNumber,
        betAmount,
        selectedColor,
        selectedNumber, // Add selected number to history
        result: roundResult,
        winAmount: winnings,
        winType, // Add win type to history
        timestamp: new Date()
      });
      // Start new round after 3 seconds
      setTimeout(() => {
        setRoundNumber(prev => prev + 1);
        startNewRound();
      }, 3000);
    }, 5000);
  };

  const handlePlaceBet = (color) => {
    if (selectedColor) return;

    const userBalance = getUserBalance();
    if (betAmount > userBalance) {
      alert('Insufficient balance');
      return;
    }

    // Deduct bet amount with improved balance update
    const newBalance = updateUserBalance(-betAmount);
    onBalanceChange();

    setSelectedColor(color);
  };

  // New function to handle number selection
  const handleSelectNumber = (number) => {
    if (selectedColor) return;
    
    const userBalance = getUserBalance();
    if (betAmount > userBalance) {
      alert('Insufficient balance');
      return;
    }

    // Deduct bet amount with improved balance update
    const newBalance = updateUserBalance(-betAmount);
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

  const getColorPremiumStyle = (color) => {
    switch (color) {
      case 'red': return 'bg-gradient-to-br from-red-600 via-red-700 to-red-800 border-2 border-red-500/50 shadow-lg shadow-red-500/20';
      case 'green': return 'bg-gradient-to-br from-green-600 via-green-700 to-green-800 border-2 border-green-500/50 shadow-lg shadow-green-500/20';
      case 'violet': return 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20';
      default: return 'bg-gray-500';
    }
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
                      <p className="text-gray-400 text-sm mt-4">Double profit if exact number matches!</p>
                    </div>
                  </div>
                ) : gameState === 'counting' ? (
                  <div className="text-center space-y-6">
                    <div className="flex gap-6 justify-center">
                      {['red', 'green', 'violet'].map((color) => (
                        <div
                          key={color}
                          className={`w-32 h-32 rounded-full ${getColorBg(color)} animate-ping opacity-70`}
                        />
                      ))}
                    </div>
                    <div className="text-4xl font-bold text-white animate-pulse flex items-center justify-center gap-3">
                      <Crown className="w-10 h-10 text-yellow-400" />
                      Selecting Winner...
                      <Crown className="w-10 h-10 text-yellow-400" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-8">
                    <h2 className="text-3xl font-bold text-white">Round Result</h2>
                    <div className="flex justify-center">
                      <div className={`w-40 h-40 rounded-full ${getColorBg(result?.color)} flex items-center justify-center shadow-2xl`}>
                        <span className="text-3xl font-bold text-white uppercase">
                          {result?.color}
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl text-white">
                      Number: <span className="font-bold text-yellow-400 text-3xl">{result?.number}</span>
                    </div>
                    {winAmount > 0 ? (
                      <div className="text-3xl text-green-400 animate-pulse flex items-center justify-center gap-2">
                        <Star className="w-8 h-8 text-yellow-400" />
                        Congratulations! You won ₹{winAmount}!
                      </div>
                    ) : selectedColor || selectedNumber ? (
                      <div className="text-2xl text-red-400 animate-pulse">
                        Better luck next time!
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </Card>

            {/* History */}
            <Card className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-purple-500/30 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold">Recent Results</h3>
              </div>
              <div className="flex gap-3 flex-wrap">
                {history.map((color, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-full ${getColorBg(color)} flex items-center justify-center text-white font-bold shadow-lg`}
                    title={color}
                  >
                    {color.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Betting Panel - Premium */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-purple-500/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Gem className="w-6 h-6 text-yellow-400" />
                <h3 className="text-white font-bold text-2xl">Bet Amount</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-gray-300 text-sm mb-3 block flex items-center gap-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    Amount (₹)
                  </label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                    className="bg-gray-700/50 border-2 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all text-lg py-3"
                    disabled={selectedColor !== null || selectedNumber !== null}
                  />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[50, 100, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        className="bg-gradient-to-r from-purple-700/80 to-pink-700/80 hover:from-purple-600 hover:to-pink-600 text-white py-3 border border-purple-500/30 transition-all hover:scale-105 text-lg"
                        disabled={selectedColor !== null || selectedNumber !== null}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {(selectedColor || selectedNumber) && (
                  <div className="p-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl border-2 border-purple-500/50 backdrop-blur-sm">
                    <div className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      Your Bet
                    </div>
                    <div className="flex items-center justify-between">
                      {selectedColor && (
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${getColorBg(selectedColor)}`} />
                          <span className="text-white font-bold text-xl uppercase">{selectedColor}</span>
                        </div>
                      )}
                      {selectedNumber && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                            <span className="text-gray-900 text-sm font-bold">{selectedNumber}</span>
                          </div>
                          <span className="text-white font-bold text-xl">Number {selectedNumber}</span>
                        </div>
                      )}
                      <span className="text-yellow-400 font-bold text-xl">₹{betAmount}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 p-5 backdrop-blur-sm">
              <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Premium Payouts
              </h4>
              <div className="space-y-3 text-base">
                <div className="flex items-center justify-between text-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500" />
                    <span>Red</span>
                  </div>
                  <span className="font-bold text-xl">8x</span>
                </div>
                <div className="flex items-center justify-between text-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500" />
                    <span>Green</span>
                  </div>
                  <span className="font-bold text-xl">8x</span>
                </div>
                <div className="flex items-center justify-between text-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500" />
                    <span>Violet</span>
                  </div>
                  <span className="font-bold text-xl text-yellow-400">20x</span>
                </div>
                <div className="flex items-center justify-between text-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-500" />
                    <span>Exact Number</span>
                  </div>
                  <span className="font-bold text-xl text-yellow-400">2x</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPredictionGame;