import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { GameCanvas } from '@/components/game/GameCanvas';
import { Eye, Users, ArrowLeft } from 'lucide-react';
import type { LivePlayer, GameState } from '@/types/game';

interface WatchModeProps {
  onClose: () => void;
}

export const WatchMode: React.FC<WatchModeProps> = ({ onClose }) => {
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LivePlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const animationRef = useRef<number | null>(null);

  // Fetch live players
  useEffect(() => {
    const fetchPlayers = async () => {
      const result = await api.livePlayers.getAll();
      if (result.success && result.data) {
        setLivePlayers(result.data);
      }
      setLoading(false);
    };
    fetchPlayers();

    // Refresh player list every 5 seconds
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animate selected player
  useEffect(() => {
    if (!selectedPlayer) return;

    let lastTime = 0;
    const speed = 200;

    const animate = async (timestamp: number) => {
      if (timestamp - lastTime >= speed) {
        const updated = await api.livePlayers.getUpdatedState(selectedPlayer, 20);
        setSelectedPlayer(updated);
        lastTime = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedPlayer?.id]);

  const convertToGameState = (player: LivePlayer): GameState => ({
    snake: player.snake,
    food: player.food,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: player.score,
    status: player.status,
    mode: player.mode,
    speed: 150,
  });

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl arcade-border rounded-lg bg-card p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {selectedPlayer && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedPlayer(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <h2 className="font-arcade text-xl text-foreground neon-text-cyan flex items-center gap-2">
              <Eye className="w-6 h-6" />
              {selectedPlayer ? `WATCHING ${selectedPlayer.username.toUpperCase()}` : 'LIVE PLAYERS'}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="font-arcade text-sm text-muted-foreground animate-pulse">
              SCANNING FOR PLAYERS...
            </p>
          </div>
        ) : selectedPlayer ? (
          /* Watching a player */
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="arcade-border rounded-lg px-4 py-2 bg-card">
                <p className="font-arcade text-xs text-muted-foreground">SCORE</p>
                <p className="font-arcade text-xl text-foreground neon-text-green">
                  {selectedPlayer.score}
                </p>
              </div>
              <div className="arcade-border rounded-lg px-4 py-2 bg-card">
                <p className="font-arcade text-xs text-muted-foreground">MODE</p>
                <p className={`font-arcade text-sm ${
                  selectedPlayer.mode === 'walls' ? 'text-secondary neon-text-pink' : 'text-foreground neon-text-green'
                }`}>
                  {selectedPlayer.mode.toUpperCase()}
                </p>
              </div>
            </div>
            <GameCanvas
              gameState={convertToGameState(selectedPlayer)}
              gridSize={20}
              isWatching
            />
            <p className="font-arcade text-xs text-muted-foreground animate-pulse">
              LIVE GAMEPLAY
            </p>
          </div>
        ) : (
          /* Player list */
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-accent" />
              <p className="font-arcade text-sm text-muted-foreground">
                {livePlayers.length} PLAYERS ONLINE
              </p>
            </div>

            {livePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="w-full flex items-center gap-4 p-4 rounded-lg bg-muted hover:bg-muted/80 border border-border hover:border-primary transition-all group"
              >
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                <div className="flex-1 text-left">
                  <p className="font-arcade text-sm text-foreground group-hover:neon-text-green transition-all">
                    {player.username}
                  </p>
                  <p className="font-arcade text-[10px] text-muted-foreground">
                    {player.mode.toUpperCase()} MODE
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-arcade text-lg text-foreground">
                    {player.score}
                  </p>
                  <p className="font-arcade text-[10px] text-muted-foreground">
                    SCORE
                  </p>
                </div>
                <Eye className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}

            {livePlayers.length === 0 && (
              <div className="text-center py-8">
                <p className="font-arcade text-sm text-muted-foreground">
                  NO PLAYERS CURRENTLY ONLINE
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
