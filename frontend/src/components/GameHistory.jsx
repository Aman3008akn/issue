import React from 'react';
import { Card } from './ui/card';
import { History, TrendingUp, TrendingDown } from 'lucide-react';
import { getGameHistory } from '../mock';

const GameHistory = () => {
  const history = getGameHistory();

  const stats = {
    totalGames: history.length,
    wins: history.filter(h => h.result === 'win').length,
    losses: history.filter(h => h.result === 'loss').length,
    totalBet: history.reduce((sum, h) => sum + h.bet, 0),
    totalWon: history.filter(h => h.result === 'win').reduce((sum, h) => sum + (h.payout || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-8 h-8 text-purple-400" />
        <h2 className="text-3xl font-bold text-white">Game History</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-500/30 p-4">
          <div className="text-gray-400 text-sm mb-1">Total Games</div>
          <div className="text-3xl font-bold text-white">{stats.totalGames}</div>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30 p-4">
          <div className="text-gray-400 text-sm mb-1">Wins</div>
          <div className="text-3xl font-bold text-green-400">{stats.wins}</div>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-500/30 p-4">
          <div className="text-gray-400 text-sm mb-1">Losses</div>
          <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-500/30 p-4">
          <div className="text-gray-400 text-sm mb-1">Net Profit</div>
          <div className={`text-3xl font-bold ${stats.totalWon - stats.totalBet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ₹{(stats.totalWon - stats.totalBet).toFixed(2)}
          </div>
        </Card>
      </div>

      {/* History List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Games</h3>
          
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No game history yet. Start playing to see your results!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((game, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    game.result === 'win' ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {game.result === 'win' ? (
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{game.game}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        game.result === 'win' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {typeof game.result === 'string' ? game.result.toUpperCase() : game.result}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {game.game === 'Aviator' && (
                        <span>Multiplier: {game.multiplier}x</span>
                      )}
                      {game.game === 'Color Prediction' && (
                        <span>Choice: {game.choice} | Result: {game.outcome}</span>
                      )}
                      {game.game === 'Car Racing' && (
                        <span>Car: {game.choice} | Position: {game.position}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Bet: ₹{game.bet}</div>
                    {game.result === 'win' && (
                      <div className="text-green-400 font-bold">+₹{game.payout.toFixed(2)}</div>
                    )}
                    {game.result === 'loss' && (
                      <div className="text-red-400 font-bold">-₹{game.bet.toFixed(2)}</div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {new Date(game.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GameHistory;
