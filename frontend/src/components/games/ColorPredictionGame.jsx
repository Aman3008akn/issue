import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Timer, TrendingUp } from 'lucide-react';
import { simulateColorRound, getUserBalance, updateUserBalance, addGameHistory, GAME_PAYOUTS } from '../../mock';

const ColorPredictionGame = ({ onBalanceChange }) => {
  const [gameState, setGameState] = useState('betting'); // betting, counting, result
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedColor, setSelectedColor] = useState(null);
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
      addGameHistory({
        round: roundNumber,
        betAmount,
        selectedColor,
        result: roundResult.color,
        winAmount: winAmount,
        timestamp: new Date()
      });

      // Check if user won
      if (selectedColor === roundResult.color) {
        const winnings = Math.floor(betAmount * GAME_PAYOUTS[selectedColor]);
        setWinAmount(winnings);
        updateUserBalance(winnings);
        onBalanceChange();
      }

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
                      <p className="text-gray-400">Select a color to place your bet</p>
                    </div>

                    {winAmount > 0 ? (
                      <div className="text-2xl text-green-400 animate-pulse">
                        You won ₹{winAmount}!
                      </div>
                    ) : selectedColor ? (
                      <div className="text-2xl text-red-400">
                        Better luck next time!
                      </div>
                    ) : null}

                    <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mx-auto">
                      {[
                        { color: 'red', payout: '2x' },
                        { color: 'green', payout: '2x' },
                        { color: 'violet', payout: '4.5x' }
                      ].map((item) => (
                        <button
                          key={item.color}
                          onClick={() => handlePlaceBet(item.color)}
                          disabled={selectedColor !== null}
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
                    {winAmount > 0 ? (
                      <div className="text-2xl text-green-400 animate-pulse">
                        You won ₹{winAmount}!
                      </div>
                    ) : selectedColor ? (
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
                    className={`w-10 h-10 rounded-full ${getColorBg(typeof color === 'object' && color !== null ? color.color : color)}`}
                    title={typeof color === 'object' && color !== null ? color.color : color}
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
                    disabled={selectedColor !== null}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[50, 100, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        className="bg-gray-700 hover:bg-gray-600 text-xs"
                        disabled={selectedColor !== null}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedColor && (
                  <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                    <div className="text-sm text-gray-400 mb-1">Your Bet</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${getColorBg(selectedColor)}`} />
                        <span className="text-white font-bold uppercase">{selectedColor}</span>
                      </div>
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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPredictionGame;