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

// Color prediction game logic - Fixed to ensure numbers are between 1-10 and improve win rate
export const simulateColorRound = (selectedColor = null) => {
  // In color prediction games, numbers are typically associated with colors:
  // Red: Numbers ending in 1, 3, 7, 9 (odd numbers except 5)
  // Green: Numbers ending in 2, 4, 6, 8 (even numbers)
  // Violet: Numbers ending in 0, 5 (special numbers)
  
  // Generate a number between 1-10
  const randomNumber = Math.floor(Math.random() * 10) + 1; // 1-10
  
  // If user selected red, favor green (and vice versa) to make it more challenging
  // Only allow user to win 2-3 times out of 10
  const winChance = Math.random();
  const shouldUserWin = winChance < 0.25; // 25% chance to win (about 2-3 times out of 10)
  
  // Determine color based on number and user selection
  let color;
  if (selectedColor) {
    // If user selected a color, make it harder to win
    if (shouldUserWin) {
      // User wins - match their selection
      color = selectedColor;
    } else {
      // User loses - give opposite color or violet
      if (selectedColor === 'red') {
        color = 'green'; // If user selected red, give green
      } else if (selectedColor === 'green') {
        color = 'red'; // If user selected green, give red
      } else {
        // If user selected violet, give red or green (reduce violet frequency)
        color = Math.random() < 0.5 ? 'red' : 'green';
      }
    }
  } else {
    // No selection - balanced random color distribution
    // Reduce violet frequency significantly
    const random = Math.random();
    if (random < 0.35) {
      color = 'red'; // 35% chance
    } else if (random < 0.7) {
      color = 'green'; // 35% chance
    } else {
      color = 'violet'; // 30% chance (reduced from 80%)
    }
  }
  
  // Assign number type based on color
  let numberType;
  if (color === 'red') {
    numberType = 'red'; // Numbers ending in 1, 3, 7, 9
  } else if (color === 'green') {
    numberType = 'green'; // Numbers ending in 2, 4, 6, 8
  } else {
    numberType = 'violet'; // Numbers ending in 0, 5
  }
  
  return {
    color: color,
    number: randomNumber,
    numberType: numberType
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

// Improved updateUserBalance function to prevent balance glitches
export const updateUserBalance = (amount) => {
  const user = getCurrentUser();
  if (user) {
    try {
      // Get fresh user data to prevent race conditions
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        // Calculate new balance
        const currentBalance = users[userIndex].balance || 0;
        const newBalance = typeof amount === 'number' ? currentBalance + amount : amount;
        
        // Ensure balance doesn't go negative
        const safeBalance = Math.max(0, newBalance);
        
        // Update both current user and users list
        user.balance = safeBalance;
        users[userIndex].balance = safeBalance;
        
        // Save changes
        setCurrentUser(user);
        saveUsers(users);
        
        return safeBalance;
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
      // Return current balance if update fails
      return user.balance || 0;
    }
  }
  return 0;
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

// Referral system functions - Updated to Rs. 500 bonus
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
      // Grant Rs. 500 bonus (updated from Rs. 50)
      users[userIndex].balance += 500;
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
        amount: 500,
        description: `Referral bonus for user ${referredUserId}`,
        timestamp: new Date().toISOString(),
        balanceAfter: users[userIndex].balance
      });
      
      return { success: true, message: 'Successfully claimed Rs. 500 referral bonus!' };
    } else {
      return { success: false, message: 'Referral bonus already claimed for this user.' };
    }
  }
  
  return { success: false, message: 'User not found.' };
};

export const getReferralLink = (userId) => {
  return `${window.location.origin}/register?ref=${userId}`;
};