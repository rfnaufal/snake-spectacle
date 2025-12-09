import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Trophy, Eye } from 'lucide-react';
import type { User as UserType } from '@/types/game';

interface HeaderProps {
  user: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onLeaderboardClick: () => void;
  onWatchClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLoginClick,
  onLogout,
  onLeaderboardClick,
  onWatchClick,
}) => {
  return (
    <header className="w-full px-4 py-3 bg-card/50 border-b border-border backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <h1 className="font-arcade text-lg md:text-xl text-foreground neon-text-green">
          SNAKE<span className="text-secondary">.</span>ARCADE
        </h1>

        {/* Navigation */}
        <nav className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaderboardClick}
            className="font-arcade text-xs"
          >
            <Trophy className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">LEADERBOARD</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onWatchClick}
            className="font-arcade text-xs"
          >
            <Eye className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">WATCH</span>
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:block arcade-border rounded-lg px-3 py-1">
                <p className="font-arcade text-xs text-foreground">
                  {user.username}
                </p>
                <p className="font-arcade text-[10px] text-muted-foreground">
                  HIGH: {user.highScore}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="neon"
              size="sm"
              onClick={onLoginClick}
              className="font-arcade text-xs"
            >
              <User className="w-4 h-4 mr-1" />
              LOGIN
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
