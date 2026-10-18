export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type TrackId = 'city' | 'desert' | 'night' | 'snow';
export type CarId = 'red_ferrari' | 'blue_mclaren' | 'yellow_redbull' | 'green_mercedes' | 'purple_alpine' | 'cyan_williams';

export interface Position {
  x: number;
  y: number;
}

export interface CarConfig {
  id: CarId;
  name: string;
  color: string;
  accentColor: string;
  speed: number;
  emoji: string;
}

export interface TrackConfig {
  id: TrackId;
  name: string;
  roadColor: string;
  grassColor: string;
  skyColor: string;
  lineColor: string;
  emoji: string;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  lane: number;
  type: 'car' | 'truck' | 'barrier';
  color: string;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  lane: number;
  collected: boolean;
  rotation: number;
}

export interface JumpBarrier {
  id: number;
  x: number;
  y: number;
  lane: number;
  width: number;
  height: number;
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

export const CARS: CarConfig[] = [
  {
    id: 'red_ferrari',
    name: 'Red Ferrari',
    color: '#ef4444',
    accentColor: '#dc2626',
    speed: 1.0,
    emoji: '🏎️',
  },
  {
    id: 'blue_mclaren',
    name: 'Blue McLaren',
    color: '#3b82f6',
    accentColor: '#2563eb',
    speed: 1.1,
    emoji: '🚗',
  },
  {
    id: 'yellow_redbull',
    name: 'Yellow RedBull',
    color: '#f59e0b',
    accentColor: '#d97706',
    speed: 1.2,
    emoji: '🚙',
  },
  {
    id: 'green_mercedes',
    name: 'Green Mercedes',
    color: '#10b981',
    accentColor: '#059669',
    speed: 1.05,
    emoji: '🚕',
  },
  {
    id: 'purple_alpine',
    name: 'Purple Alpine',
    color: '#8b5cf6',
    accentColor: '#7c3aed',
    speed: 1.15,
    emoji: '🚓',
  },
  {
    id: 'cyan_williams',
    name: 'Cyan Williams',
    color: '#06b6d4',
    accentColor: '#0891b2',
    speed: 1.08,
    emoji: '🚖',
  },
];

export const TRACKS: TrackConfig[] = [
  {
    id: 'city',
    name: 'City Circuit',
    roadColor: '#374151',
    grassColor: '#059669',
    skyColor: '#1e3a8a',
    lineColor: '#fbbf24',
    emoji: '🏙️',
  },
  {
    id: 'desert',
    name: 'Desert Track',
    roadColor: '#78350f',
    grassColor: '#d97706',
    skyColor: '#ea580c',
    lineColor: '#fef3c7',
    emoji: '🏜️',
  },
  {
    id: 'night',
    name: 'Night Race',
    roadColor: '#1f2937',
    grassColor: '#064e3b',
    skyColor: '#0f172a',
    lineColor: '#60a5fa',
    emoji: '🌃',
  },
  {
    id: 'snow',
    name: 'Snow Circuit',
    roadColor: '#64748b',
    grassColor: '#e0f2fe',
    skyColor: '#bae6fd',
    lineColor: '#f97316',
    emoji: '🏔️',
  },
];
