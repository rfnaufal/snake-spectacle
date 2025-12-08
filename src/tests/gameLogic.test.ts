import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  moveSnake,
  getOppositeDirection,
} from '@/hooks/useGameLogic';
import type { GameState, Direction } from '@/types/game';

describe('Game Logic', () => {
  describe('createInitialState', () => {
    it('creates initial state with passthrough mode', () => {
      const state = createInitialState('passthrough');
      expect(state.mode).toBe('passthrough');
      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.snake.length).toBe(3);
      expect(state.direction).toBe('RIGHT');
    });

    it('creates initial state with walls mode', () => {
      const state = createInitialState('walls');
      expect(state.mode).toBe('walls');
      expect(state.status).toBe('idle');
    });
  });

  describe('getOppositeDirection', () => {
    it('returns opposite direction correctly', () => {
      expect(getOppositeDirection('UP')).toBe('DOWN');
      expect(getOppositeDirection('DOWN')).toBe('UP');
      expect(getOppositeDirection('LEFT')).toBe('RIGHT');
      expect(getOppositeDirection('RIGHT')).toBe('LEFT');
    });
  });

  describe('moveSnake', () => {
    it('does not move when game is not playing', () => {
      const state = createInitialState('passthrough');
      const newState = moveSnake(state);
      expect(newState.snake).toEqual(state.snake);
    });

    it('moves snake in the current direction when playing', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
      };
      const initialHead = { ...state.snake[0] };
      const newState = moveSnake(state);
      
      expect(newState.snake[0].x).toBe(initialHead.x + 1);
      expect(newState.snake[0].y).toBe(initialHead.y);
    });

    it('wraps around in passthrough mode', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.snake[0].x).toBe(0);
      expect(newState.status).toBe('playing');
    });

    it('ends game on wall collision in walls mode', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.status).toBe('gameover');
    });

    it('ends game on self collision', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
          { x: 6, y: 6 },
          { x: 5, y: 6 },
          { x: 4, y: 6 },
          { x: 4, y: 5 },
        ],
        direction: 'LEFT',
        nextDirection: 'LEFT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.status).toBe('gameover');
    });

    it('increases score when eating food', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 6, y: 5 },
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.score).toBe(10);
      expect(newState.snake.length).toBe(4);
    });

    it('generates new food position after eating', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 6, y: 5 },
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.food).not.toEqual(state.food);
    });

    it('moves up correctly', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
        direction: 'UP',
        nextDirection: 'UP',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.snake[0].y).toBe(9);
    });

    it('moves down correctly', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [{ x: 10, y: 10 }, { x: 10, y: 9 }, { x: 10, y: 8 }],
        direction: 'DOWN',
        nextDirection: 'DOWN',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.snake[0].y).toBe(11);
    });

    it('moves left correctly', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }],
        direction: 'LEFT',
        nextDirection: 'LEFT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.snake[0].x).toBe(9);
    });

    it('wraps from top in passthrough mode', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [{ x: 10, y: 0 }, { x: 10, y: 1 }, { x: 10, y: 2 }],
        direction: 'UP',
        nextDirection: 'UP',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.snake[0].y).toBe(19);
    });

    it('wraps from left in passthrough mode', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        snake: [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }],
        direction: 'LEFT',
        nextDirection: 'LEFT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.snake[0].x).toBe(19);
    });

    it('increases speed when eating food', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        speed: 150,
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 6, y: 5 },
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.speed).toBe(148);
    });

    it('does not decrease speed below minimum', () => {
      const state: GameState = {
        ...createInitialState('passthrough'),
        status: 'playing',
        speed: 50,
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 6, y: 5 },
        direction: 'RIGHT',
        nextDirection: 'RIGHT',
      };
      
      const newState = moveSnake(state, 20);
      expect(newState.speed).toBe(50);
    });
  });
});
