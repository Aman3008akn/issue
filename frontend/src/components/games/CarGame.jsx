import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Car, Zap, Crown, Gem, Star, Play, RotateCcw, Flag } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';

const CarGame = ({ onBalanceChange }) => {
  const [selectedCar, setSelectedCar] = useState('');
  const [betAmount, setBetAmount] = useState(100);
  const [raceState, setRaceState] = useState('waiting'); // waiting, racing, finished
  const [carPositions, setCarPositions] = useState([0, 0, 0, 0]);
  const [winner, setWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const { profile, updateUserBalance, loading } = useSupabase();

  useEffect(() => {
    if (raceState === 'racing') {
      const interval = setInterval(() => {
        setCarPositions(prev => {
          const newPositions = prev.map(pos => {
            // Random movement with some cars moving faster
            const speed = Math.random() * 3 + 1;
            return Math.min(pos + speed, 100);
          });

          // Check if any car has finished
          const finishedCarIndex = newPositions.findIndex(pos => pos >= 100);
          if (finishedCarIndex !== -1) {
            clearInterval(interval);
            finishRace(finishedCarIndex);
          }

          return newPositions;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [raceState]);

  // Start demo race after 4 seconds
  useEffect(() => {
    const demoTimeout = setTimeout(() => {
      if (raceState === 'waiting') {
        setRaceState('racing');
      }
    }, 4000);
    return () => clearTimeout(demoTimeout);
  }, []);

  const startRace = async () => {
    // Check if user is authenticated
    if (!profile) {
      alert('Please login to play');
      return;
    }

    if (!selectedCar) {
      alert('Please select a car');
      return;
    }

    if (betAmount <= 0 || betAmount > profile.balance) {
      alert('Invalid bet amount');
      return;
    }

    try {
      // Deduct bet amount
      const newBalance = await updateUserBalance(-betAmount);
      setRaceState('racing');
      setCarPositions([0, 0, 0, 0]);
      setWinner(null);
      onBalanceChange();
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Error placing bet. Please try again.');
    }
  };

  const finishRace = async (winningCarIndex) => {
    setRaceState('finished');
    setWinner(winningCarIndex);

    const result = {
      car: winningCarIndex,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => [result, ...prev.slice(0, 9)]);

    // Check if user won
    if (selectedCar === `car${winningCarIndex}`) {
      // Higher payout for riskier positions
      const multiplier = winningCarIndex === 0 ? 2 : winningCarIndex === 1 ? 3 : winningCarIndex === 2 ? 5 : 10;
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
  };

  const resetRace = () => {
    setRaceState('waiting');
    setSelectedCar('');
    setCarPositions([0, 0, 0, 0]);
    setWinner(null);
  };

  const getCarColor = (index) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
    return colors[index];
  };

  const getCarName = (index) => {
    const names = ['Red Racer', 'Blue Bullet', 'Green Machine', 'Yellow Flash'];
    return names[index];
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
                  <Car className="w-6 h-6 text-purple-400" />
                  Car Racing
                </h2>
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">PREMIUM</span>
                </div>
              </div>

              {/* Race Track */}
              <div className="mb-8">
                <div className="relative h-64 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-gray-700 overflow-hidden">
                  {/* Finish Line */}
                  <div className="absolute right-4 top-0 bottom-0 w-1 bg-gradient-to-b from-white to-gray-300 flex flex-col">
                    {Array.from({length: 20}).map((_, i) => (
                      <div key={i} className={`h-4 w-full ${i % 2 === 0 ? 'bg-white' : 'bg-gray-300'}`} />
                    ))}
                  </div>

                  {/* Cars */}
                  {carPositions.map((position, index) => (
                    <div
                      key={index}
                      className={`absolute top-${index * 16 + 8} h-12 w-12 ${getCarColor(index)} rounded-lg flex items-center justify-center transition-all duration-100`}
                      style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                    >
                      <Car className="w-8 h-8 text-white" />
                    </div>
                  ))}

                  {/* Winner Banner */}
                  {raceState === 'finished' && winner !== null && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">
                          {selectedCar === `car${winner}` ? (
                            <span className="text-green-400">You Won!</span>
                          ) : (
                            <span className="text-red-400">Race Finished</span>
                          )}
                        </div>
                        <div className="text-2xl text-white">
                          Winner: <span className={getCarColor(winner)}>{getCarName(winner)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Car Selection */}
              <div>
                <h3 className="text-white font-bold mb-3">Select Your Car</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({length: 4}).map((_, index) => (
                    <Button
                      key={index}
                      onClick={() => setSelectedCar(`car${index}`)}
                      className={`${getCarColor(index)} ${selectedCar === `car${index}` ? 'ring-4 ring-white/50 scale-105' : ''} h-16 transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center`}
                      disabled={raceState === 'racing' || raceState === 'finished'}
                    >
                      <Car className="w-6 h-6 text-white" />
                      <span className="text-white font-bold text-sm mt-1">
                        {getCarName(index)}
                      </span>
                      <span className="text-white text-xs">
                        x{index === 0 ? 2 : index === 1 ? 3 : index === 2 ? 5 : 10}
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
              <Flag className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-bold">Recent Races</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {history.map((result, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-bold border ${getCarColor(result.car)} text-white`}
                >
                  {getCarName(result.car)}
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
                  disabled={raceState === 'racing' || raceState === 'finished'}
                />
                <div className="flex gap-2 mt-2">
                  {[50, 100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="flex-1 bg-gradient-to-r from-purple-700/80 to-pink-700/80 hover:from-purple-600 hover:to-pink-600 text-xs border border-purple-500/30 transition-all hover:scale-105"
                      disabled={raceState === 'racing' || raceState === 'finished'}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={startRace}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 border border-green-500/50 shadow-lg hover:shadow-green-500/20 transition-all hover:scale-105"
                  disabled={raceState === 'racing' || raceState === 'finished' || !selectedCar}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Race
                </Button>

                <Button
                  onClick={resetRace}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 border border-gray-500/50 transition-all hover:scale-105"
                  disabled={raceState === 'waiting'}
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
                <Car className="w-4 h-4 text-purple-400" />
                Select a car to bet on
              </p>
              <p className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Higher risk cars = Higher rewards
              </p>
              <p className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                Red Racer (x2) - Most likely to win
              </p>
              <p className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-pink-400" />
                Yellow Flash (x10) - Highest payout
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CarGame;
