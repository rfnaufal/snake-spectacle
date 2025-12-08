import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Direction, GameMode, Position } from '@/types/game';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

export const createInitialState = (mode: GameMode): GameState => ({
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  food: { x: 15, y: 10 },
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  score: 0,
  status: 'idle',
  mode,
  speed: INITIAL_SPEED,
});

export const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  return opposites[dir];
};

export const moveSnake = (state: GameState, gridSize: number = GRID_SIZE): GameState => {
  if (state.status !== 'playing') return state;

  const head = state.snake[0];
  let newHead: Position;

  switch (state.nextDirection) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle wall collision based on mode
  if (state.mode === 'passthrough') {
    newHead.x = (newHead.x + gridSize) % gridSize;
    newHead.y = (newHead.y + gridSize) % gridSize;
  } else {
    // Walls mode - check for collision
    if (
      newHead.x < 0 ||
      newHead.x >= gridSize ||
      newHead.y < 0 ||
      newHead.y >= gridSize
    ) {
      return { ...state, status: 'gameover' };
    }
  }

  // Check self collision
  if (state.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    return { ...state, status: 'gameover' };
  }

  // Check if eating food
  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;
  
  const newSnake = [newHead, ...state.snake];
  if (!ateFood) {
    newSnake.pop();
  }

  // Generate new food if eaten
  let newFood = state.food;
  if (ateFood) {
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  }

  // Speed up slightly when eating
  const newSpeed = ateFood ? Math.max(state.speed - 2, 50) : state.speed;

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction: state.nextDirection,
    score: ateFood ? state.score + 10 : state.score,
    speed: newSpeed,
  };
};

export const useGameLogic = (initialMode: GameMode = 'passthrough') => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const gameLoopRef = useRef<number | null>(null);

  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;
      if (newDirection === getOppositeDirection(prev.direction)) return prev;
      return { ...prev, nextDirection: newDirection };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...createInitialState(prev.mode),
      status: 'playing',
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => createInitialState(prev.mode));
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    setGameState(createInitialState(mode));
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastTime = 0;
    
    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTime >= gameState.speed) {
        setGameState(prev => moveSnake(prev));
        lastTime = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.status === 'idle' || gameState.status === 'gameover') {
            startGame();
          } else {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, startGame, pauseGame, gameState.status]);

  return {
    gameState,
    changeDirection,
    startGame,
    pauseGame,
    resetGame,
    setMode,
    gridSize: GRID_SIZE,
  };
};
