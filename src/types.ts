export type GameStatus = 'idle' | 'playing' | 'gameover' | 'paused';

export interface Car {
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
  angle: number;
}

export interface EnemyCar {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  lane: number;
  modelType: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface RoadMarking {
  y: number;
}

export interface ControlState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}
