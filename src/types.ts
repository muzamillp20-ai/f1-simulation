export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface Position {
  x: number;
  y: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  lane: number;
  type: 'car' | 'truck' | 'barrier';
  color: string;
}

export interface RoadLine {
  id: number;
  y: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Easy',
    speed: 3,
    spawnRate: 1800,
    maxObstacles: 3,
    lanes: 3,
    color: '#22c55e',
  },
  medium: {
    label: 'Medium',
    speed: 5,
    spawnRate: 1200,
    maxObstacles: 5,
    lanes: 4,
    color: '#f59e0b',
  },
  hard: {
    label: 'Hard',
    speed: 7,
    spawnRate: 800,
    maxObstacles: 7,
    lanes: 5,
    color: '#ef4444',
  },
};

export const CAR_COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
