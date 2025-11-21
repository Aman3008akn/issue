import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plane, TrendingUp } from 'lucide-react';
import { simulateAviatorRound, getUserBalance, updateUserBalance, addGameHistory } from '../../mock';

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
  const intervalRef = useRef(null);

  useEffect(() => {
    // Start first round after 2 seconds
    setTimeout(() => {
      startNewRound();
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startNewRound = () => {
    const newCrashPoint = simulateAviatorRound();
    setCrashPoint(newCrashPoint);
    setGameState('flying');
    setMultiplier(1.0);
    setHasCashedOut(false);
    setWinAmount(0);

    // Animate multiplier
    let current = 1.0;
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
          addGameHistory({
            game: 'Aviator',
            bet: betAmount,
            result: 'loss',
            multiplier: newCrashPoint,
            timestamp: new Date().toISOString()
          });
        }

        setHasBet(false);

        // Start new round after 3 seconds
        setTimeout(() => {
          startNewRound();
        }, 3000);
      }
    }, 50);
  };

  const handlePlaceBet = () => {
    const balance = getUserBalance();
    if (betAmount <= 0 || betAmount > balance) {
      alert('Invalid bet amount');
      return;
    }

    if (gameState === 'waiting' || (gameState === 'flying' && multiplier < 1.5)) {
      updateUserBalance(balance - betAmount);
      setHasBet(true);
      onBalanceChange();
    }
  };

  const handleCashout = (currentMultiplier = multiplier) => {
    if (!hasBet || hasCashedOut) return;

    const balance = getUserBalance();
    const payout = betAmount * currentMultiplier;
    updateUserBalance(balance + payout);
    setWinAmount(payout);
    setHasCashedOut(true);
    onBalanceChange();

    // Record win
    addGameHistory({
      game: 'Aviator',
      bet: betAmount,
      result: 'win',
      payout: payout,
      multiplier: currentMultiplier,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/30 overflow-hidden">
            <div className="relative h-96 flex items-center justify-center">
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20" />
              
              {/* Multiplier Display */}
              <div className="relative z-10 text-center">
                {gameState === 'crashed' ? (
                  <div className="space-y-4">
                    <div className="text-6xl font-bold text-red-500 animate-pulse">
                      CRASHED!
                    </div>
                    <div className="text-4xl text-gray-400">
                      {crashPoint.toFixed(2)}x
                    </div>
                    {hasCashedOut && (
                      <div className="text-2xl text-green-400">
                        You won ₹{winAmount.toFixed(2)}!
                      </div>
                    )}
                  </div>
                ) : gameState === 'flying' ? (
                  <div className="space-y-4">
                    <Plane className="w-24 h-24 text-purple-400 mx-auto animate-bounce" />
                    <div className="text-8xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {multiplier.toFixed(2)}x
                    </div>
                    {hasCashedOut && (
                      <div className="text-2xl text-green-400 animate-pulse">
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
          <Card className="mt-4 bg-gray-800/50 border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-bold">Recent Crashes</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {history.map((crash, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    crash >= 2 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
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
          <Card className="bg-gray-800/80 border-gray-700 p-6">
            <h3 className="text-white font-bold text-xl mb-4">Place Your Bet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Bet Amount (₹)</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={hasBet}
                />
                <div className="flex gap-2 mt-2">
                  {[50, 100, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-xs"
                      disabled={hasBet}
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Auto Cashout (Optional)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={hasBet}
                />
              </div>

              {!hasBet ? (
                <Button
                  onClick={handlePlaceBet}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  disabled={gameState === 'crashed' || (gameState === 'flying' && multiplier >= 1.5)}
                >
                  Place Bet
                </Button>
              ) : (
                <Button
                  onClick={() => handleCashout()}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 animate-pulse"
                  disabled={hasCashedOut || gameState !== 'flying'}
                >
                  {hasCashedOut ? 'Cashed Out!' : 'Cash Out'}
                </Button>
              )}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4">
            <h4 className="text-white font-bold mb-2">Game Info</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Watch the multiplier rise</p>
              <p>• Cash out before it crashes</p>
              <p>• Set auto cashout to secure wins</p>
              <p>• Higher risk = Higher reward</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AviatorGame;
