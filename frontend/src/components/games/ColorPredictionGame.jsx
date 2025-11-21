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
  const [selectedNumber, setSelectedNumber] = useState(null);
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
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'betting') {
      setGameState('counting');
      // Countdown for 5 seconds before revealing result
      setTimeout(() => {
        revealResult();
      }, 5000);
    }
  }, [timeLeft, gameState]);

  const startNewRound = () => {
    setGameState('betting');
    setTimeLeft(30);
    setSelectedColor(null);
    setSelectedNumber(null);
    setResult(null);
    setWinAmount(0);
    setRoundNumber(prev => prev + 1);
  };

  const placeBet = () => {
    if (!selectedColor) {
      alert('Please select a color');
      return;
    }
    
    if (selectedNumber !== null && (selectedNumber < 1 || selectedNumber > 10)) {
      alert('Please select a number between 1 and 10');
      return;
    }

    const userBalance = getUserBalance();
    if (betAmount > userBalance) {
      alert('Insufficient balance');
      return;
    }

    // Deduct bet amount
    updateUserBalance(-betAmount);
    onBalanceChange();

    setGameState('counting');
    setTimeLeft(5); // Show countdown for 5 seconds
  };

  const revealResult = () => {
    const roundResult = simulateColorRound();
    setResult(roundResult);
    
    let won = false;
    let payoutMultiplier = 0;
    
    // Check color match
    if (selectedColor === roundResult.color) {
      payoutMultiplier = GAME_PAYOUTS[selectedColor];
      won = true;
    }
    
    // Check number match (double payout if both color and number match)
    if (selectedNumber !== null && selectedNumber === roundResult.number) {
      if (won) {
        // Both color and number match - double the payout
        payoutMultiplier *= 2;
      } else if (selectedColor === roundResult.color) {
        // Only number matches but color didn't - still double payout
        payoutMultiplier = GAME_PAYOUTS[selectedColor] * 2;
        won = true;
      } else {
        // Only number matches - give base payout for green (most common)
        payoutMultiplier = GAME_PAYOUTS.green * 2;
        won = true;
      }
    }
    
    if (won) {
      const winnings = Math.floor(betAmount * payoutMultiplier);
      setWinAmount(winnings);
      updateUserBalance(winnings);
      onBalanceChange();
    }
    
    // Add to history
    const historyEntry = {
      round: roundNumber,
      betAmount,
      selectedColor,
      selectedNumber,
      result: roundResult,
      winAmount: won ? Math.floor(betAmount * payoutMultiplier) : 0,
      timestamp: new Date()
    };
    
    setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    addGameHistory(historyEntry);
    
    setGameState('result');
    
    // Start new round after 3 seconds
    setTimeout(() => {
      startNewRound();
    }, 3000);
  };

  const handleNumberSelect = (number) => {
    setSelectedNumber(number);
  };

  const renderColorOptions = () => (
    <div className="flex justify-center gap-4 mb-6">
      <button
        onClick={() => setSelectedColor('green')}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all ${
          selectedColor === 'green' 
            ? 'ring-4 ring-green-300 scale-110' 
            : 'bg-green-600 hover:bg-green-500'
        }`}
      >
        Green
        <br />
        2x
      </button>
      <button
        onClick={() => setSelectedColor('violet')}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all ${
          selectedColor === 'violet' 
            ? 'ring-4 ring-purple-300 scale-110' 
            : 'bg-purple-600 hover:bg-purple-500'
        }`}
      >
        Violet
        <br />
        4.5x
      </button>
      <button
        onClick={() => setSelectedColor('red')}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl transition-all ${
          selectedColor === 'red' 
            ? 'ring-4 ring-red-300 scale-110' 
            : 'bg-red-600 hover:bg-red-500'
        }`}
      >
        Red
        <br />
        2x
      </button>
    </div>
  );

  const renderNumberOptions = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-center">Select Number (1-10)</h3>
      <div className="flex justify-center gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberSelect(num)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              selectedNumber === num
                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setSelectedNumber(null)}
          className="w-10 h-10 rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-600"
        >
          Clear
        </button>
      </div>
    </div>
  );

  const renderBettingPhase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Timer className="inline-block mr-2" />
        <span className="text-2xl font-bold">{timeLeft}s</span>
      </div>
      
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Round #{roundNumber}</h2>
        
        {renderColorOptions()}
        {renderNumberOptions()}
        
        <div className="max-w-xs mx-auto">
          <label className="block text-sm font-medium mb-2">Bet Amount</label>
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            min="10"
            className="text-center"
          />
        </div>
        
        <Button 
          onClick={placeBet}
          disabled={!selectedColor}
          className="mt-6 w-full max-w-xs"
        >
          Place Bet
        </Button>
      </div>
    </div>
  );

  const renderCountingPhase = () => (
    <div className="text-center py-10">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h2 className="text-2xl font-bold">Calculating Result...</h2>
      <p className="text-gray-600 mt-2">Round #{roundNumber}</p>
    </div>
  );

  const renderResultPhase = () => (
    <div className="text-center py-6">
      <h2 className="text-2xl font-bold mb-6">Result</h2>
      
      <div className="flex justify-center items-center gap-4 mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg ${
          result.color === 'green' ? 'bg-green-600' :
          result.color === 'red' ? 'bg-red-600' : 'bg-purple-600'
        }`}>
          {result.color.charAt(0).toUpperCase() + result.color.slice(1)}
        </div>
        <span className="text-2xl font-bold">+</span>
        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
          {result.number}
        </div>
      </div>
      
      {winAmount > 0 ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Congratulations!</p>
          <p>You won ₹{winAmount}</p>
          {selectedNumber === result.number && (
            <p className="text-sm mt-1">(Number match - Double payout!)</p>
          )}
        </div>
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Better luck next time!</p>
          <p>You lost ₹{betAmount}</p>
        </div>
      )}
      
      <p>Next round starting soon...</p>
    </div>
  );

  const renderHistory = () => (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-3 flex items-center">
        <TrendingUp className="mr-2" />
        Recent Results
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {history.map((entry, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              entry.result.color === 'green' ? 'bg-green-600' :
              entry.result.color === 'red' ? 'bg-red-600' : 'bg-purple-600'
            }`}>
              {entry.result.number}
            </div>
            <span className="text-xs mt-1">
              {entry.winAmount > 0 ? '+' : ''}{entry.winAmount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      {gameState === 'betting' && renderBettingPhase()}
      {gameState === 'counting' && renderCountingPhase()}
      {gameState === 'result' && renderResultPhase()}
      
      {renderHistory()}
    </Card>
  );
};

export default ColorPredictionGame;