import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award } from 'lucide-react';
import type { LeaderboardEntry, GameMode } from '@/types/game';

interface LeaderboardProps {
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const result = await api.leaderboard.getAll(filter === 'all' ? undefined : filter);
      if (result.success && result.data) {
        setEntries(result.data);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center font-arcade text-xs text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg arcade-border rounded-lg bg-card p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-arcade text-xl text-foreground neon-text-green">
            LEADERBOARD
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            ALL
          </Button>
          <Button
            variant={filter === 'passthrough' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setFilter('passthrough')}
            className="text-xs"
          >
            PASS-THROUGH
          </Button>
          <Button
            variant={filter === 'walls' ? 'neonPink' : 'outline'}
            size="sm"
            onClick={() => setFilter('walls')}
            className="text-xs"
          >
            WALLS
          </Button>
        </div>

        {/* Entries */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="font-arcade text-sm text-muted-foreground animate-pulse">
                LOADING...
              </p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  index < 3 ? 'bg-muted' : 'bg-card'
                } border border-border`}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="flex-1">
                  <p className="font-arcade text-sm text-foreground">
                    {entry.username}
                  </p>
                  <p className="font-arcade text-[10px] text-muted-foreground">
                    {entry.mode.toUpperCase()} • {entry.date}
                  </p>
                </div>
                <p className="font-arcade text-lg text-foreground neon-text-green">
                  {entry.score}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
