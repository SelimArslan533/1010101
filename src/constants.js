import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const DUCK_SIZE = 60;
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
};

export const GAME_CONFIG = {
  roundDuration: 10000,
  ducksPerRound: 5,
  maxRounds: 10,
  baseSpeed: 3,
  speedIncrement: 0.5,
  pointsPerDuck: 100,
  bonusPoints: 500,
};
