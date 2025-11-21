// Mock data and game logic for the gaming platform

export const MOCK_USERS = [
  { id: '1', username: 'demo', email: 'demo@example.com', password: 'demo123', balance: 10000 }
];

// Store current user in localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

// Add the missing login function
export const login = (username, password) => {
  const user = MOCK_USERS.find(
    u => (u.username === username || u.email === username) && u.password === password
  );
  return user || null;
};

// Add the missing register function
export const register = (newUser) => {
  MOCK_USERS.push(newUser);
  return newUser;
};

export const getUserBalance = () => {
  const user = getCurrentUser();
  return user ? user.balance : 0;
};

export const updateUserBalance = (newBalance) => {
  const user = getCurrentUser();
  if (user) {
    user.balance = newBalance;
    setCurrentUser(user);
  }
};

// Mock game history
export const getGameHistory = () => {
  const historyStr = localStorage.getItem('gameHistory');
  return historyStr ? JSON.parse(historyStr) : [];
};

export const addGameHistory = (game) => {
  const history = getGameHistory();
  history.unshift(game);
  // Keep only last 50 games
  if (history.length > 50) history.pop();
  localStorage.setItem('gameHistory', JSON.stringify(history));
};

// Mock transaction history
export const getTransactionHistory = () => {
  const historyStr = localStorage.getItem('transactionHistory');
  return historyStr ? JSON.parse(historyStr) : [];
};

export const addTransactionHistory = (transaction) => {
  const history = getTransactionHistory();
  history.unshift(transaction);
  // Keep only last 50 transactions
  if (history.length > 50) history.pop();
  localStorage.setItem('transactionHistory', JSON.stringify(history));
};

// Aviator game logic - Adjusted for 10-20% win rate
export const simulateAviatorRound = () => {
  // Random crash point between 1.00x and 50.00x
  // Adjusted to make low multipliers more common (reducing win rate)
  const randomCrash = Math.random();
  let crashPoint;
  
  // 80% chance of crashing at 1.0x - 2.0x (very low multipliers)
  if (randomCrash < 0.8) {
    crashPoint = 1.0 + Math.random() * 1.0; // 1.0x - 2.0x
  } 
  // 15% chance of crashing at 2.0x - 5.0x (low multipliers)
  else if (randomCrash < 0.95) {
    crashPoint = 2.0 + Math.random() * 3.0; // 2.0x - 5.0x
  } 
  // 5% chance of going higher (5.0x - 50.0x)
  else {
    crashPoint = 5.0 + Math.random() * 45; // 5.0x - 50.0x
  }
  
  return parseFloat(crashPoint.toFixed(2));
};

// Color prediction game logic - Adjusted for 10-20% win rate
export const simulateColorRound = () => {
  const colors = ['red', 'green', 'violet'];
  const random = Math.random();
  
  // Adjusted to reduce winning probability to 10-20%
  // Red: 15%, Green: 15%, Violet: 5% (higher payout but lower probability)
  if (random < 0.15) return 'red';
  if (random < 0.30) return 'green';
  return 'violet'; // 70% chance of getting violet (but violet has higher payout)
};

// Car game logic - Adjusted for 10-20% win rate
export const simulateCarRace = () => {
  const cars = [
    { id: 1, name: 'Red Racer', color: '#ef4444' },
    { id: 2, name: 'Blue Thunder', color: '#3b82f6' },
    { id: 3, name: 'Green Machine', color: '#10b981' },
    { id: 4, name: 'Yellow Flash', color: '#f59e0b' }
  ];
  
  // Shuffle and assign positions
  const shuffled = [...cars].sort(() => Math.random() - 0.5);
  
  // Adjusted to make winning positions less likely
  return shuffled.map((car, index) => ({
    ...car,
    position: index + 1,
    time: (10.0 + Math.random() * 5).toFixed(2) // Slower times to reduce winning chances
  }));
};

// Calculate payouts - Adjusted to balance the reduced win rate
export const GAME_PAYOUTS = {
  aviator: (multiplier) => multiplier,
  color: {
    red: 3,      // Increased payout to balance reduced win rate
    green: 3,    // Increased payout to balance reduced win rate
    violet: 8    // Increased payout to balance reduced win rate
  },
  car: {
    1: 5,        // Increased payout to balance reduced win rate
    2: 3,        // Increased payout to balance reduced win rate
    3: 2,        // Increased payout to balance reduced win rate
    4: 1.5       // Increased payout to balance reduced win rate
  }
};