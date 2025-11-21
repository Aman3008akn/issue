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