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

// Aviator game logic
export const simulateAviatorRound = () => {
  // Random crash point between 1.00x and 50.00x
  const randomCrash = Math.random();
  let crashPoint;
  
  if (randomCrash < 0.5) {
    crashPoint = 1.0 + Math.random() * 1.5; // 1.0x - 2.5x (50% chance)
  } else if (randomCrash < 0.8) {
    crashPoint = 2.5 + Math.random() * 2.5; // 2.5x - 5.0x (30% chance)
  } else if (randomCrash < 0.95) {
    crashPoint = 5.0 + Math.random() * 10; // 5.0x - 15.0x (15% chance)
  } else {
    crashPoint = 15.0 + Math.random() * 35; // 15.0x - 50.0x (5% chance)
  }
  
  return parseFloat(crashPoint.toFixed(2));
};

// Color prediction game logic
export const simulateColorRound = () => {
  const colors = ['red', 'green', 'violet'];
  const random = Math.random();
  
  // Red: 45%, Green: 45%, Violet: 10% (higher payout)
  if (random < 0.45) return 'red';
  if (random < 0.90) return 'green';
  return 'violet';
};

// Car game logic
export const simulateCarRace = () => {
  const cars = [
    { id: 1, name: 'Red Racer', color: '#ef4444' },
    { id: 2, name: 'Blue Thunder', color: '#3b82f6' },
    { id: 3, name: 'Green Machine', color: '#10b981' },
    { id: 4, name: 'Yellow Flash', color: '#f59e0b' }
  ];
  
  // Shuffle and assign positions
  const shuffled = [...cars].sort(() => Math.random() - 0.5);
  return shuffled.map((car, index) => ({
    ...car,
    position: index + 1,
    time: (8.5 + Math.random() * 2).toFixed(2) // Random finish time
  }));
};

// Calculate payouts
export const GAME_PAYOUTS = {
  aviator: (multiplier) => multiplier,
  color: {
    red: 2,
    green: 2,
    violet: 4.5
  },
  car: {
    1: 3.5,
    2: 2.5,
    3: 1.8,
    4: 1.2
  }
};
