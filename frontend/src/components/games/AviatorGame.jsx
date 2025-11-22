import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plane, TrendingUp, Zap, Crown, Gem, Star } from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';
import AviatorLogo from '../AviatorLogo';

const AviatorGame = ({ onBalanceChange }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, flying, crashed
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [autoCashout, setAutoCashout] = useState('');
  const [hasBet, setHasBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [history, setHistory] = useState([]);
  const [particles, setParticles] = useState([]);
  const intervalRef = useRef(null);
  const particleIdRef = useRef(0);
  const { profile, updateUserBalance } = useSupabase();

  useEffect(() => {
    startNewRound();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startNewRound = () => {
    setGameState('waiting');
    setMultiplier(1.0);
    setCrashPoint(0);
    setHasBet(false);
    setHasCashedOut(false);
    setWinAmount(0);
    
    // Generate new crash point for next round
    const newCrashPoint = parseFloat((Math.random() * 10 + 1).toFixed(2));
    setCrashPoint(newCrashPoint);
  };

  const startFlying = () => {
    setGameState('flying');
    let current = 1.0;
    const newCrashPoint = crashPoint || parseFloat((Math.random() * 10 + 1).toFixed(2));
    
    intervalRef.current = setInterval(() => {
      current += 0.01;
      setMultiplier(parseFloat(current.toFixed(2)));

      // Check auto cashout
      if (autoCashout && current >= parseFloat(autoCashout) && hasBet && !hasCashedOut) {
        handleCashout(current);
      }

      // Check crash
      if (current >= newCrashPoint) {
        clearInterval(intervalRef.current);
        setGameState('crashed');
        setMultiplier(newCrashPoint);
        
        // Add to history
        setHistory(prev => [newCrashPoint, ...prev.slice(0, 9)]);

        // Record loss if bet was placed and not cashed out
        if (hasBet && !hasCashedOut) {
          // In a real implementation, you might want to record this in the database
        } else if (hasBet && hasCashedOut) {
          // Add to recent winners if user won
          // In a real implementation, you might want to record this in the database
        }
        
        // Start new round after 2 seconds
        setTimeout(startNewRound, 2000);
      }
    }, 50);
  };

  const handlePlaceBet = async () => {
    if (!profile) {
      alert('Please login to play');
      return;
    }
    
    if (betAmount <= 0 || betAmount > profile.balance) {
      alert('Invalid bet amount');
      return;
    }

    if (gameState === 'waiting' || (gameState === 'flying' && multiplier < 1.5)) {
      // Deduct bet amount with improved balance update
      const newBalance = await updateUserBalance(-betAmount);
      setHasBet(true);
      onBalanceChange();
    }
  };

  const handleCashout = async (currentMultiplier = multiplier) => {
    if (!hasBet || hasCashedOut || gameState !== 'flying') return;

    const payout = betAmount * currentMultiplier;
    // Update balance with winnings
    const newBalance = await updateUserBalance(payout);
    setWinAmount(payout);
    setHasCashedOut(true);
    onBalanceChange();

    // In a real implementation, you would record this in the database
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 border-2 border-purple-500/50 overflow-hidden relative">
            {/* Premium decorative elements */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <AviatorLogo size={32} />
              <span className="text-yellow-400 font-bold text-lg">PREMIUM</span>
            </div>
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Gem className="w-6 h-6 text-pink-400" />
              <span className="text-pink-400 font-bold text-lg">VIP</span>
            </div>
            
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden">
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    opacity: particle.opacity,
                    animationDelay: `${particle.delay}s`
                  }}
                />
              ))}
            </div>
            
            <div className="relative h-96 flex items-center justify-center">
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30" />
              
              {/* Multiplier Display */}
              <div className="relative z-10 text-center">
                {gameState === 'crashed' ? (
                  <div className="space-y-4">
                    <div className="text-6xl font-bold text-red-500 animate-pulse flex items-center justify-center gap-2">
                      <Zap className="w-16 h-16" />
                      CRASHED!
                    </div>
                    <div className="text-4xl text-gray-300 font-mono">
                      {crashPoint.toFixed(2)}x
                    </div>
                    {hasCashedOut && (
                      <div className="text-2xl text-green-400 flex items-center justify-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400" />
                        You won ₹{winAmount.toFixed(2)}!
                      </div>
                    )}
                    {!hasBet && !hasCashedOut && (
                      <div className="text-2xl text-red-400">
                        Better luck next time!
                      </div>
                    )}
                  </div>
                ) : gameState === 'flying' ? (
                  <div className="space-y-4">
                    <Plane className={`w-24 h-24 mx-auto transition-all duration-100 ${
                      multiplier > 5 ? 'text-yellow-400 animate-bounce' : 
                      multiplier > 2 ? 'text-purple-400' : 'text-blue-400'
                    }`} />
                    <div className={`text-8xl font-bold bg-gradient-to-r ${
                      multiplier > 10 ? 'from-yellow-400 via-red-500 to-pink-500' :
                      multiplier > 5 ? 'from-purple-400 to-pink-400' :
                      'from-blue-400 to-purple-400'
                    } bg-clip-text text-transparent transition-all duration-300`}>
                      {multiplier.toFixed(2)}x
                    </div>
                    {hasCashedOut && (
                      <div className="text-2xl text-green-400 animate-pulse flex items-center justify-center gap-2">
                        <Star className="w-6 h-6 text-yellow-400" />
                        Cashed Out! +₹{winAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Plane className="w-24 h-24 text-gray-600 mx-auto" />
                    <div className="text-3xl text-gray-400">
                      Waiting for next round...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* History */}
          <Card className="mt-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-2 border-purple-500/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-bold">Recent Crashes</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {history.map((crash, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    crash >= 5 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-400/50' :
                    crash >= 2 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-400/50' : 
                    'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border-red-400/50'
                  }`}
                >
                  {crash.toFixed(2)}x
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Betting Panel */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-2 border-purple-500/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-yellow-400" />
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
                  disabled={hasBet}
                />
                <div className="flex gap-2 mt-2">
                  {[50, 100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="flex-1 bg-gradient-to-r from-purple-700/80 to-pink-700/80 hover:from-purple-600 hover:to-pink-600 text-xs border border-purple-500/30 transition-all hover:scale-105"
                      disabled={hasBet}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  Auto Cashout (Optional)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(e.target.value)}
                  className="bg-gray-700/50 border-2 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                  disabled={hasBet}
                />
              </div>

              {!hasBet ? (
                <Button
                  onClick={handlePlaceBet}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 border border-green-500/50 shadow-lg hover:shadow-green-500/20 transition-all hover:scale-105"
                  disabled={gameState === 'crashed' || (gameState === 'flying' && multiplier >= 1.5)}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Place Bet
                </Button>
              ) : hasCashedOut ? (
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 border border-green-500/50 shadow-lg"
                  disabled
                >
                  <Star className="w-5 h-5 mr-2 text-yellow-400" />
                  Cashed Out!
                </Button>
              ) : (
                <Button
                  onClick={() => handleCashout()}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 border border-yellow-500/50 shadow-lg hover:shadow-yellow-500/20 transition-all hover:scale-105 animate-pulse"
                  disabled={gameState !== 'flying'}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Cash Out
                </Button>
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 p-4 backdrop-blur-sm">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Premium Game Info
            </h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Watch the multiplier rise
              </p>
              <p className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                Cash out before it crashes
              </p>
              <p className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-pink-400" />
                Set auto cashout to secure wins
              </p>
              <p className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Higher risk = Higher reward
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AviatorGame;