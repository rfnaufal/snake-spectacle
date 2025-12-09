import React from 'react';
import type { GameState } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  gridSize: number;
  cellSize?: number;
  isWatching?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  gridSize,
  cellSize = 20,
  isWatching = false,
}) => {
  const canvasSize = gridSize * cellSize;

  return (
    <div className="relative">
      {/* Game board */}
      <div
        className="relative game-grid arcade-border rounded-lg overflow-hidden"
        style={{
          width: canvasSize,
          height: canvasSize,
        }}
      >
        {/* Scanlines overlay */}
        <div className="absolute inset-0 scanlines pointer-events-none z-10" />

        {/* Food */}
        <div
          className="absolute rounded-full animate-pulse-glow"
          style={{
            left: gameState.food.x * cellSize + 2,
            top: gameState.food.y * cellSize + 2,
            width: cellSize - 4,
            height: cellSize - 4,
            backgroundColor: 'hsl(var(--food))',
            boxShadow: 'var(--glow-yellow)',
          }}
        />

        {/* Snake */}
        {gameState.snake.map((segment, index) => (
          <div
            key={index}
            className="absolute rounded-sm transition-all duration-75"
            style={{
              left: segment.x * cellSize + 1,
              top: segment.y * cellSize + 1,
              width: cellSize - 2,
              height: cellSize - 2,
              backgroundColor: index === 0 ? 'hsl(var(--snake))' : `hsl(120, 100%, ${50 - index * 2}%)`,
              boxShadow: index === 0 ? 'var(--glow-green)' : undefined,
              opacity: 1 - (index * 0.02),
            }}
          />
        ))}

        {/* Wall indicators for walls mode */}
        {gameState.mode === 'walls' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 20px hsl(var(--secondary) / 0.5)',
              border: '3px solid hsl(var(--secondary))',
            }}
          />
        )}

        {/* Game over overlay */}
        {gameState.status === 'gameover' && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
            <div className="text-center">
              <h2 className="font-arcade text-2xl text-destructive neon-text-pink mb-4">
                GAME OVER
              </h2>
              <p className="font-arcade text-sm text-foreground">
                SCORE: {gameState.score}
              </p>
            </div>
          </div>
        )}

        {/* Paused overlay */}
        {gameState.status === 'paused' && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
            <h2 className="font-arcade text-2xl text-accent neon-text-cyan animate-pulse">
              PAUSED
            </h2>
          </div>
        )}

        {/* Idle overlay */}
        {gameState.status === 'idle' && !isWatching && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-20">
            <div className="text-center">
              <h2 className="font-arcade text-lg text-foreground neon-text-green mb-4">
                PRESS SPACE
              </h2>
              <p className="font-arcade text-xs text-muted-foreground">
                TO START
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
