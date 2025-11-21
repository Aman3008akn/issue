import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Timer, TrendingUp } from 'lucide-react';
import { simulateColorRound, getUserBalance, updateUserBalance, addGameHistory, GAME_PAYOUTS, addRecentWinner } from '../../mock';

const ColorPredictionGame = ({ onBalanceChange }) => {
  const [gameState, setGameState] = useState('betting'); // betting, counting, result
  const [timeLeft, setTimeLeft] = useState(30);
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
    setTimeLeft(30);
    setSelectedColor(null);
    setSelectedNumber(null); // Reset number selection
    setResult(null);
    setWinAmount(0);
  };

  const startCounting = () => {
    setGameState('counting');
    // Simulate counting animation
    setTimeout(() => {
      const roundResult = simulateColorRound();
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
        updateUserBalance(winnings);
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

    // Deduct bet amount
    updateUserBalance(-betAmount);
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

    // Deduct bet amount
    updateUserBalance(-betAmount);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Color Prediction</h1>
          <p className="text-gray-400">Predict the winning color and multiply your money</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 p-6">
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Timer className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{timeLeft}s</span>
                <span className="text-gray-400">remaining</span>
              </div>

              {/* Game Content */}
              <div className="min-h-96 flex items-center justify-center">
                {gameState === 'betting' ? (
                  <div className="text-center space-y-8 w-full">
                    <div className="text-white">
                      <h2 className="text-2xl font-bold mb-2">Round #{roundNumber}</h2>
                      <p className="text-gray-400">Select a color or number to place your bet</p>
                    </div>

                    {winAmount > 0 ? (
                      <div className="text-2xl text-green-400 animate-pulse">
                        You won ₹{winAmount}!
                      </div>
                    ) : selectedColor || selectedNumber ? (
                      <div className="text-2xl text-red-400">
                        Better luck next time!
                      </div>
                    ) : null}

                    {/* Color Selection */}
                    <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mx-auto">
                      {[
                        { color: 'red', payout: '2x' },
                        { color: 'green', payout: '2x' },
                        { color: 'violet', payout: '4.5x' }
                      ].map((item) => (
                        <button
                          key={item.color}
                          onClick={() => handlePlaceBet(item.color)}
                          disabled={selectedColor !== null || selectedNumber !== null}
                          className={`group relative p-8 rounded-2xl ${getColorStyle(item.color)} ${
                            selectedColor === item.color ? 'ring-4 ring-yellow-400 scale-110' : ''
                          } transition-all duration-300 disabled:opacity-50`}
                        >
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white uppercase mb-2">
                              {item.color}
                            </div>
                            <div className="text-sm text-white/80">{item.payout} Payout</div>
                          </div>
                          {selectedColor === item.color && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                              SELECTED
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Number Selection */}
                    <div className="mt-8">
                      <h3 className="text-white font-bold mb-4">Select a Number (1-10)</h3>
                      <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                          <button
                            key={number}
                            onClick={() => handleSelectNumber(number)}
                            disabled={selectedColor !== null || selectedNumber !== null}
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                              selectedNumber === number 
                                ? 'bg-yellow-400 text-gray-900 scale-110 ring-4 ring-yellow-300' 
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                            } disabled:opacity-50`}
                          >
                            {number}
                          </button>
                        ))}
                      </div>
                      <p className="text-gray-400 text-sm mt-2">Double profit if exact number matches!</p>
                    </div>
                  </div>
                ) : gameState === 'counting' ? (
                  <div className="text-center space-y-4">
                    <div className="flex gap-4 justify-center">
                      {['red', 'green', 'violet'].map((color) => (
                        <div
                          key={color}
                          className={`w-24 h-24 rounded-full ${getColorBg(color)} animate-ping`}
                        />
                      ))}
                    </div>
                    <div className="text-3xl font-bold text-white animate-pulse">
                      Selecting Winner...
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold text-white">Round Result</h2>
                    <div className="flex justify-center">
                      <div className={`w-32 h-32 rounded-full ${getColorBg(result?.color)} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white uppercase">
                          {result?.color}
                        </span>
                      </div>
                    </div>
                    <div className="text-xl text-white">
                      Number: <span className="font-bold">{result?.number}</span>
                    </div>
                    {winAmount > 0 ? (
                      <div className="text-2xl text-green-400 animate-pulse">
                        You won ₹{winAmount}!
                      </div>
                    ) : selectedColor || selectedNumber ? (
                      <div className="text-2xl text-red-400">
                        Better luck next time!
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </Card>

            {/* History */}
            <Card className="mt-4 bg-gray-800/50 border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-bold">Recent Results</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {history.map((color, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 rounded-full ${getColorBg(color)}`}
                    title={color}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Betting Panel */}
          <div className="space-y-4">
            <Card className="bg-gray-800/80 border-gray-700 p-6">
              <h3 className="text-white font-bold text-xl mb-4">Bet Amount</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount (₹)</label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600 text-white"
                    disabled={selectedColor !== null || selectedNumber !== null}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[50, 100, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        className="bg-gray-700 hover:bg-gray-600 text-xs"
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
                      {selectedColor && (
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${getColorBg(selectedColor)}`} />
                          <span className="text-white font-bold uppercase">{selectedColor}</span>
                        </div>
                      )}
                      {selectedNumber && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                            <span className="text-gray-900 text-xs font-bold">{selectedNumber}</span>
                          </div>
                          <span className="text-white font-bold">Number {selectedNumber}</span>
                        </div>
                      )}
                      <span className="text-yellow-400 font-bold">₹{betAmount}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4">
              <h4 className="text-white font-bold mb-2">Payouts</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span>Red</span>
                  </div>
                  <span className="font-bold">2x</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span>Green</span>
                  </div>
                  <span className="font-bold">2x</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500" />
                    <span>Violet</span>
                  </div>
                  <span className="font-bold text-yellow-400">4.5x</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <span>Exact Number</span>
                  </div>
                  <span className="font-bold text-yellow-400">2x</span>
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