// Mock data and game logic for the gaming platform

// Aviator game logic - Adjusted for 2% win rate
export const simulateAviatorRound = () => {
  // Random crash point between 1.00x and 100.00x
  // Adjusted to make low multipliers much more common (reducing win rate to 2%)
  const randomCrash = Math.random();
  let crashPoint;
  
  // 98% chance of crashing at 1.0x - 1.5x (very low multipliers)
  if (randomCrash < 0.98) {
    crashPoint = 1.0 + Math.random() * 0.5; // 1.0x - 1.5x
  } 
  // 1.5% chance of crashing at 1.5x - 3.0x (low multipliers)
  else if (randomCrash < 0.995) {
    crashPoint = 1.5 + Math.random() * 1.5; // 1.5x - 3.0x
  } 
  // 0.5% chance of going higher (3.0x - 100.0x)
  else {
    crashPoint = 3.0 + Math.random() * 97; // 3.0x - 100.0x
  }
  
  return parseFloat(crashPoint.toFixed(2));
};

// Color prediction game logic - Adjusted for 2% win rate with numbers
export const simulateColorRound = () => {
  // In color prediction games, numbers are typically associated with colors:
  // Red: Numbers ending in 1, 3, 7, 9 (odd numbers except 5)
  // Green: Numbers ending in 2, 4, 6, 8 (even numbers)
  // Violet: Numbers ending in 0, 5 (special numbers)
  
  const random = Math.random();
  const randomNumber = Math.floor(Math.random() * 100) + 1; // 1-100
  
  // Adjusted to reduce winning probability to 2%
  // Red: 1%, Green: 1%, Violet: 0.5% (higher payout but much lower probability)
  if (random < 0.01) {
    return {
      color: 'red',
      number: randomNumber,
      numberType: 'red' // Numbers ending in 1, 3, 7, 9
    };
  }
  if (random < 0.02) {
    return {
      color: 'green',
      number: randomNumber,
      numberType: 'green' // Numbers ending in 2, 4, 6, 8
    };
  }
  
  // 98% chance of getting violet (but violet has higher payout)
  return {
    color: 'violet',
    number: randomNumber,
    numberType: 'violet' // Numbers ending in 0, 5
  };
};

// Car game logic - Adjusted for 2% win rate
export const simulateCarRace = () => {
  const cars = [
    { id: 1, name: 'Red Racer', color: '#ef4444' },
    { id: 2, name: 'Blue Thunder', color: '#3b82f6' },
    { id: 3, name: 'Green Machine', color: '#10b981' },
    { id: 4, name: 'Yellow Flash', color: '#f59e0b' }
  ];
  
  // Shuffle and assign positions
  const shuffled = [...cars].sort(() => Math.random() - 0.5);
  
  // Adjusted to make winning positions much less likely (2% win rate)
  // Increase times to make winning much harder
  return shuffled.map((car, index) => ({
    ...car,
    position: index + 1,
    time: (20.0 + Math.random() * 30).toFixed(2) // Much slower times to reduce winning chances
  }));
};

// Calculate payouts - Adjusted to balance the reduced win rate
export const GAME_PAYOUTS = {
  aviator: (multiplier) => multiplier,
  color: {
    red: 15,      // Increased payout to balance reduced win rate
    green: 15,    // Increased payout to balance reduced win rate
    violet: 40    // Increased payout to balance reduced win rate
  },
  car: {
    1: 25,        // Increased payout to balance reduced win rate
    2: 15,        // Increased payout to balance reduced win rate
    3: 10,        // Increased payout to balance reduced win rate
    4: 5          // Increased payout to balance reduced win rate
  }
};

// User management functions
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

// Get users from localStorage or use default demo user
export const getUsers = () => {
  const usersStr = localStorage.getItem('users');
  return usersStr ? JSON.parse(usersStr) : [
    { id: '1', username: 'demo', email: 'demo@example.com', password: 'demo123', balance: 10000 }
  ];
};

// Save users to localStorage
export const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Updated login function to check against users in localStorage
export const login = (username, password) => {
  const users = getUsers();
  const user = users.find(
    u => (u.username === username || u.email === username) && u.password === password
  );
  return user || null;
};

// Updated register function to save users to localStorage
export const register = (newUser) => {
  const users = getUsers();
  
  // Check if user with same email already exists
  const existingUser = users.find(u => u.email === newUser.email);
  if (existingUser) {
    return null; // User already exists
  }
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const getUserBalance = () => {
  const user = getCurrentUser();
  return user ? user.balance : 0;
};

export const updateUserBalance = (amount) => {
  const user = getCurrentUser();
  if (user) {
    // If amount is negative, it's a deduction
    // If amount is positive, it's an addition
    user.balance = typeof amount === 'number' ? user.balance + amount : amount;
    setCurrentUser(user);
    
    // Also update in the users list
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = user;
      saveUsers(users);
    }
  }
};

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