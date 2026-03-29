import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const DUCK_SIZE = 60;
export const BOSS_DUCK_SIZE = 90;
export const DOG_SIZE = 80;

export const COLORS = {
  sky: '#87CEEB',
  skyDark: '#4A90D9',
  grass: '#4CAF50',
  grassDark: '#388E3C',
  ground: '#8B4513',
  white: '#FFFFFF',
  black: '#000000',
  red: '#FF0000',
  orange: '#FF9800',
  yellow: '#FFD700',
  brown: '#8B4513',
  darkBrown: '#5D3A1A',
  scoreText: '#FFD700',
  comboText: '#FF4500',
  bossRed: '#DC143C',
  healthGreen: '#00FF00',
  healthRed: '#FF0000',
};

// Duck types with different behaviors
export const DUCK_TYPES = {
  normal: {
    emoji: '🦆',
    points: 100,
    speedMultiplier: 1,
    size: DUCK_SIZE,
    hitsRequired: 1,
    color: '#4CAF50',
  },
  fast: {
    emoji: '🐦',
    points: 250,
    speedMultiplier: 1.8,
    size: DUCK_SIZE - 10,
    hitsRequired: 1,
    color: '#2196F3',
  },
  golden: {
    emoji: '⭐',
    points: 500,
    speedMultiplier: 2.2,
    size: DUCK_SIZE - 5,
    hitsRequired: 1,
    color: '#FFD700',
  },
  boss: {
    emoji: '🦅',
    points: 1000,
    speedMultiplier: 0.8,
    size: BOSS_DUCK_SIZE,
    hitsRequired: 3,
    color: '#DC143C',
  },
};

// Round configurations - difficulty increases each round
export const ROUND_CONFIG = {
  1:  { baseSpeed: 2.0, duckTypes: ['normal'],                    ducksPerRound: 4,  spawnInterval: 2200 },
  2:  { baseSpeed: 2.5, duckTypes: ['normal'],                    ducksPerRound: 5,  spawnInterval: 2000 },
  3:  { baseSpeed: 3.0, duckTypes: ['normal', 'fast'],            ducksPerRound: 5,  spawnInterval: 1900 },
  4:  { baseSpeed: 3.5, duckTypes: ['normal', 'fast'],            ducksPerRound: 6,  spawnInterval: 1800 },
  5:  { baseSpeed: 4.0, duckTypes: ['normal', 'fast', 'boss'],    ducksPerRound: 6,  spawnInterval: 1700 },
  6:  { baseSpeed: 4.5, duckTypes: ['normal', 'fast', 'golden'],  ducksPerRound: 7,  spawnInterval: 1600 },
  7:  { baseSpeed: 5.0, duckTypes: ['normal', 'fast', 'golden'],  ducksPerRound: 7,  spawnInterval: 1500 },
  8:  { baseSpeed: 5.5, duckTypes: ['fast', 'golden'],            ducksPerRound: 8,  spawnInterval: 1400 },
  9:  { baseSpeed: 6.0, duckTypes: ['fast', 'golden'],            ducksPerRound: 8,  spawnInterval: 1300 },
  10: { baseSpeed: 7.0, duckTypes: ['fast', 'golden', 'boss'],    ducksPerRound: 9,  spawnInterval: 1200 },
};

export const GAME_CONFIG = {
  maxRounds: 10,
  maxLives: 3,
  missesPerLifeLost: 3, // kaçırılan 3 ördekte 1 can gider
  comboTimeWindow: 2000, // ms - art arda vuruş combo süresi
  comboMultipliers: [1, 1.5, 2, 3, 5], // combo x1, x1.5, x2, x3, x5
};
