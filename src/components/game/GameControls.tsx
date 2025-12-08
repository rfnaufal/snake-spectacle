import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { GameStatus, GameMode } from '@/types/game';

interface GameControlsProps {
  status: GameStatus;
  mode: GameMode;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  status,
  mode,
  score,
  onStart,
  onPause,
  onReset,
  onModeChange,
}) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Score display */}
      <div className="arcade-border rounded-lg px-6 py-3 bg-card">
        <p className="font-arcade text-xs text-muted-foreground mb-1">SCORE</p>
        <p className="font-arcade text-2xl text-foreground neon-text-green">
          {score.toString().padStart(6, '0')}
        </p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'passthrough' ? 'neon' : 'outline'}
          size="sm"
          onClick={() => onModeChange('passthrough')}
          disabled={status === 'playing'}
          className="text-xs"
        >
          PASS-THROUGH
        </Button>
        <Button
          variant={mode === 'walls' ? 'neonPink' : 'outline'}
          size="sm"
          onClick={() => onModeChange('walls')}
          disabled={status === 'playing'}
          className="text-xs"
        >
          WALLS
        </Button>
      </div>

      {/* Game controls */}
      <div className="flex gap-2">
        {status === 'idle' || status === 'gameover' ? (
          <Button variant="arcade" size="lg" onClick={onStart}>
            <Play className="w-5 h-5" />
            START
          </Button>
        ) : (
          <Button variant="neon" size="lg" onClick={onPause}>
            {status === 'paused' ? (
              <>
                <Play className="w-5 h-5" />
                RESUME
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                PAUSE
              </>
            )}
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={onReset}>
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Controls hint */}
      <div className="text-center mt-4">
        <p className="font-arcade text-[10px] text-muted-foreground">
          USE ARROW KEYS OR WASD TO MOVE
        </p>
        <p className="font-arcade text-[10px] text-muted-foreground mt-1">
          SPACE TO START/PAUSE
        </p>
      </div>
    </div>
  );
};
