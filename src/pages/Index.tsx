import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameControls } from '@/components/game/GameControls';
import { MobileControls } from '@/components/game/MobileControls';
import { AuthModal } from '@/components/auth/AuthModal';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { WatchMode } from '@/components/watch/WatchMode';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { api } from '@/services/api';
import { toast } from 'sonner';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showWatchMode, setShowWatchMode] = useState(false);

  const { user, login, signup, logout, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  
  const {
    gameState,
    changeDirection,
    startGame,
    pauseGame,
    resetGame,
    setMode,
    gridSize,
  } = useGameLogic();

  // Submit score when game ends
  React.useEffect(() => {
    if (gameState.status === 'gameover' && gameState.score > 0 && isAuthenticated) {
      api.leaderboard.submitScore(gameState.score, gameState.mode).then((result) => {
        if (result.success) {
          toast.success('Score submitted to leaderboard!');
        }
      });
    }
  }, [gameState.status, gameState.score, gameState.mode, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={logout}
        onLeaderboardClick={() => setShowLeaderboard(true)}
        onWatchClick={() => setShowWatchMode(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Game title */}
        <div className="text-center mb-4">
          <h2 className="font-arcade text-2xl md:text-4xl text-foreground neon-text-green animate-pulse-glow">
            SNAKE
          </h2>
          <p className="font-arcade text-xs text-muted-foreground mt-2">
            {gameState.mode === 'passthrough' ? 'PASS-THROUGH MODE' : 'WALLS MODE'}
          </p>
        </div>

        {/* Game area */}
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <GameCanvas gameState={gameState} gridSize={gridSize} />
          <GameControls
            status={gameState.status}
            mode={gameState.mode}
            score={gameState.score}
            onStart={startGame}
            onPause={pauseGame}
            onReset={resetGame}
            onModeChange={setMode}
          />
        </div>

        {/* Mobile controls */}
        {isMobile && gameState.status === 'playing' && (
          <div className="mt-4">
            <MobileControls onDirectionChange={changeDirection} />
          </div>
        )}

        {/* Login prompt for guests */}
        {!isAuthenticated && gameState.status === 'gameover' && gameState.score > 0 && (
          <div className="arcade-border rounded-lg p-4 bg-card text-center animate-slide-in">
            <p className="font-arcade text-xs text-muted-foreground mb-2">
              LOG IN TO SAVE YOUR SCORE
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="font-arcade text-xs text-primary hover:text-primary/80 underline"
            >
              CREATE AN ACCOUNT
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-border">
        <p className="font-arcade text-[10px] text-muted-foreground">
          © 2024 SNAKE.ARCADE • PLAY RESPONSIBLY
        </p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={login}
        onSignup={signup}
      />

      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}

      {showWatchMode && (
        <WatchMode onClose={() => setShowWatchMode(false)} />
      )}
    </div>
  );
};

export default Index;
