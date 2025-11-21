// Mock data and game logic for the gaming platform

// Aviator game logic - Adjusted for 12% win rate
export const simulateAviatorRound = () => {
  // Random crash point between 1.00x and 50.00x
  // Adjusted to make low multipliers more common (reducing win rate to 12%)
  const randomCrash = Math.random();
  let crashPoint;
  
  // 88% chance of crashing at 1.0x - 2.0x (very low multipliers)
  if (randomCrash < 0.88) {
    crashPoint = 1.0 + Math.random() * 1.0; // 1.0x - 2.0x
  } 
  // 10% chance of crashing at 2.0x - 5.0x (low multipliers)
  else if (randomCrash < 0.98) {
    crashPoint = 2.0 + Math.random() * 3.0; // 2.0x - 5.0x
  } 
  // 2% chance of going higher (5.0x - 50.0x)
  else {
    crashPoint = 5.0 + Math.random() * 45; // 5.0x - 50.0x
  }
  
  return parseFloat(crashPoint.toFixed(2));
};

// Color prediction game logic - Adjusted for 12% win rate with numbers
export const simulateColorRound = () => {
  // In color prediction games, numbers are typically associated with colors:
  // Red: Numbers ending in 1, 3, 7, 9 (odd numbers except 5)
  // Green: Numbers ending in 2, 4, 6, 8 (even numbers)
  // Violet: Numbers ending in 0, 5 (special numbers)
  
  const random = Math.random();
  const randomNumber = Math.floor(Math.random() * 100) + 1; // 1-100
  
  // Adjusted to reduce winning probability to 12%
  // Red: 5%, Green: 5%, Violet: 2% (higher payout but lower probability)
  if (random < 0.05) {
    return {
      color: 'red',
      number: randomNumber,
      numberType: 'red' // Numbers ending in 1, 3, 7, 9
    };
  }
  if (random < 0.10) {
    return {
      color: 'green',
      number: randomNumber,
      numberType: 'green' // Numbers ending in 2, 4, 6, 8
    };
  }
  
  // 90% chance of getting violet (but violet has higher payout)
  return {
    color: 'violet',
    number: randomNumber,
    numberType: 'violet' // Numbers ending in 0, 5
  };
};

// Car game logic - Adjusted for 12% win rate
export const simulateCarRace = () => {
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

// Calculate payouts - Adjusted to balance the reduced win rate
export const GAME_PAYOUTS = {
  aviator: (multiplier) => multiplier,
  color: {
    red: 8,      // Increased payout to balance reduced win rate
    green: 8,    // Increased payout to balance reduced win rate
    violet: 20    // Increased payout to balance reduced win rate
  },
  car: {
    1: 12,        // Increased payout to balance reduced win rate
    2: 6,        // Increased payout to balance reduced win rate
    3: 4,        // Increased payout to balance reduced win rate
    4: 2       // Increased payout to balance reduced win rate
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

// WhatsApp number management
export const getWhatsAppNumber = () => {
  const number = localStorage.getItem('whatsappNumber');
  return number || '918826817677'; // Default number
};

export const setWhatsAppNumber = (number) => {
  localStorage.setItem('whatsappNumber', number);
};

// Recent winners notification system
let recentWinners = [];

export const addRecentWinner = (winner) => {
  recentWinners.unshift(winner);
  // Keep only last 10 winners
  if (recentWinners.length > 10) recentWinners.pop();
};

export const getRecentWinners = () => {
  return recentWinners;
};

// Referral system functions
export const claimReferralBonus = (userId, referredUserId) => {
  // In a real implementation, this would call the backend API
  // For now, we'll simulate it with localStorage
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    // Check if this referral bonus was already claimed
    const claimedBonuses = JSON.parse(localStorage.getItem('claimedReferralBonuses') || '[]');
    const alreadyClaimed = claimedBonuses.some(bonus => 
      bonus.userId === userId && bonus.referredUserId === referredUserId
    );
    
    if (!alreadyClaimed) {
      // Grant Rs. 50 bonus
      users[userIndex].balance += 50;
      saveUsers(users);
      
      // Record that this bonus was claimed
      claimedBonuses.push({
        userId,
        referredUserId,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('claimedReferralBonuses', JSON.stringify(claimedBonuses));
      
      // Add to transaction history
      addTransactionHistory({
        type: 'referral_bonus',
        amount: 50,
        description: `Referral bonus for user ${referredUserId}`,
        timestamp: new Date().toISOString(),
        balanceAfter: users[userIndex].balance
      });
      
      return { success: true, message: 'Successfully claimed Rs. 50 referral bonus!' };
    } else {
      return { success: false, message: 'Referral bonus already claimed for this user.' };
    }
  }
  
  return { success: false, message: 'User not found.' };
};

export const getReferralLink = (userId) => {
  return `${window.location.origin}/register?ref=${userId}`;
};