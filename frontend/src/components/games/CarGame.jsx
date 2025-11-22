import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Car, Trophy, Timer } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

const CarGame = ({ onBalanceChange }) => {
  const [gameState, setGameState] = useState('betting'); // betting, racing, result
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedCar, setSelectedCar] = useState(null);
  const [betAmount, setBetAmount] = useState(100);
  const [raceResults, setRaceResults] = useState([]);
  const [winAmount, setWinAmount] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [raceProgress, setRaceProgress] = useState({});
  const { profile, updateUserBalance } = useSupabase();

  const cars = [
    { id: 1, name: 'Red Racer', color: '#ef4444' },
    { id: 2, name: 'Blue Thunder', color: '#3b82f6' },
    { id: 3, name: 'Green Machine', color: '#10b981' },
    { id: 4, name: 'Yellow Flash', color: '#f59e0b' }
  ];

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
      startRace();
    }
  }, [timeLeft, gameState]);

  const startNewRound = () => {
    setGameState('betting');
    setTimeLeft(20);
    setSelectedCar(null);
    setRaceResults([]);
    setWinAmount(0);
    setRaceProgress({});
  };

  const startRace = () => {
    setGameState('racing');
    
    // Animate race progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 1;
      const newProgress = {};
      cars.forEach(car => {
        newProgress[car.id] = Math.min(100, progress + Math.random() * 20);
      });
      setRaceProgress(newProgress);

      if (progress >= 100) {
        clearInterval(interval);
        finishRace();
      }
    }, 50);
  };

  const finishRace = async () => {
    // Car game logic - Adjusted for 12% win rate
    const results = simulateCarRace();
    setRaceResults(results);
    setGameState('result');

    // Calculate win/loss
    if (selectedCar) {
      const selectedResult = results.find(r => r.id === selectedCar);
      if (selectedResult.position === 1) {
        const GAME_PAYOUTS = {
          1: 12,
          2: 6,
          3: 4,
          4: 2
        };
        const payout = betAmount * GAME_PAYOUTS[1];
        // Update balance with winnings
        const newBalance = await updateUserBalance(payout);
        setWinAmount(payout);
        onBalanceChange();
      }
    }

    // Start new round after 5 seconds
    setTimeout(() => {
      setRoundNumber(prev => prev + 1);
      startNewRound();
    }, 5000);
  };

  const handlePlaceBet = async (carId) => {
    if (!profile) {
      alert('Please login to play');
      return;
    }
    
    if (betAmount <= 0 || betAmount > profile.balance) {
      alert('Invalid bet amount');
      return;
    }

    if (gameState === 'betting') {
      // Deduct bet amount with improved balance update
      const newBalance = await updateUserBalance(-betAmount);
      setSelectedCar(carId);
      onBalanceChange();
    }
  };

  // Car game logic - Adjusted for 12% win rate
  const simulateCarRace = () => {
    const cars = [
      { id: 1, name: 'Red Racer', color: '#ef4444' },
      { id: 2, name: 'Blue Thunder', color: '#3b82f6' },
      { id: 3, name: 'Green Machine', color: '#10b981' },
      { id: 4, name: 'Yellow Flash', color: '#f59e0b' }
    ];
    
    // Shuffle and assign positions
    const shuffled = [...cars].sort(() => Math.random() - 0.5);
    
    // Adjusted to make winning positions less likely (12% win rate)
    return shuffled.map((car, index) => ({
      ...car,
      position: index + 1,
      time: (8.0 + Math.random() * 12).toFixed(2) // Slower times to reduce winning chances
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/30 overflow-hidden">
            <div className="p-6">
              {/* Timer and Round Info */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Timer className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="text-sm text-gray-400">Race #{roundNumber}</div>
                    <div className="text-2xl font-bold text-white">
                      {gameState === 'betting' ? `${timeLeft}s` : gameState === 'racing' ? 'Racing!' : 'Results'}
                    </div>
                  </div>
                </div>
                {gameState === 'betting' && (
                  <div className="text-yellow-400 animate-pulse font-bold">
                    Choose your car!
                  </div>
                )}
              </div>

              {/* Race Track */}
              <div className="bg-gray-900/50 rounded-lg p-6 min-h-96">
                {gameState === 'result' ? (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
                      <h3 className="text-3xl font-bold text-white mb-2">Race Results</h3>
                      {selectedCar && raceResults.find(r => r.id === selectedCar)?.position === 1 && (
                        <div className="text-2xl text-green-400 font-bold animate-bounce">
                          YOU WON ₹{winAmount.toFixed(2)}!
                        </div>
                      )}
                    </div>
                    {raceResults.map((car) => (
                      <div
                        key={car.id}
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          car.position === 1 ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-gray-800/50'
                        } ${selectedCar === car.id ? 'ring-2 ring-purple-500' : ''}`}
                      >
                        <div className="text-2xl font-bold text-white w-8">
                          {car.position === 1 ? '🥇' : car.position === 2 ? '🥈' : car.position === 3 ? '🥉' : car.position}
                        </div>
                        <Car className="w-8 h-8" style={{ color: car.color }} />
                        <div className="flex-1">
                          <div className="text-white font-bold">{car.name}</div>
                          <div className="text-gray-400 text-sm">Time: {car.time}s</div>
                        </div>
                        {selectedCar === car.id && (
                          <div className="text-purple-400 text-sm font-bold">YOUR BET</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : gameState === 'racing' ? (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-white animate-pulse">Racing in Progress!</div>
                    </div>
                    {cars.map((car) => (
                      <div key={car.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Car className="w-6 h-6" style={{ color: car.color }} />
                          <div className="text-white font-bold flex-1">{car.name}</div>
                          <div className="text-gray-400 text-sm">{Math.round(raceProgress[car.id] || 0)}%</div>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-100"
                            style={{
                              width: `${raceProgress[car.id] || 0}%`,
                              backgroundColor: car.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {cars.map((car) => (
                      <button
                        key={car.id}
                        onClick={() => handlePlaceBet(car.id)}
                        disabled={selectedCar !== null}
                        className={`group p-6 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 ${
                          selectedCar === car.id ? 'border-purple-500 scale-105' : 'border-gray-700'
                        } transition-all duration-300 disabled:opacity-50`}
                      >
                        <Car className="w-16 h-16 mx-auto mb-3" style={{ color: car.color }} />
                        <div className="text-white font-bold text-lg mb-1">{car.name}</div>
                        <div className="text-gray-400 text-sm">Win: 3.5x</div>
                        {selectedCar === car.id && (
                          <div className="mt-2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            SELECTED
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  disabled={selectedCar !== null}
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[50, 100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="bg-gray-700 hover:bg-gray-600 text-xs"
                      disabled={selectedCar !== null}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedCar && (
                <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <div className="text-sm text-gray-400 mb-1">Your Bet</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-6 h-6" style={{ color: cars.find(c => c.id === selectedCar).color }} />
                      <span className="text-white font-bold">{cars.find(c => c.id === selectedCar).name}</span>
                    </div>
                    <span className="text-yellow-400 font-bold">₹{betAmount}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4">
            <h4 className="text-white font-bold mb-2">Race Info</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Choose your favorite car</p>
              <p>• Bet on 1st position</p>
              <p>• Win 3.5x your bet!</p>
              <p>• New race every 25 seconds</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarGame;