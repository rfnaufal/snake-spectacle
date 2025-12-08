import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { AuthCredentials } from '@/types/game';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: AuthCredentials) => Promise<boolean>;
  onSignup: (credentials: AuthCredentials) => Promise<boolean>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignup,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = isLoginMode
      ? await onLogin({ email: formData.email, password: formData.password })
      : await onSignup(formData);

    setLoading(false);

    if (success) {
      onClose();
      setFormData({ email: '', password: '', username: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary arcade-border">
        <DialogHeader>
          <DialogTitle className="font-arcade text-xl text-foreground neon-text-green text-center">
            {isLoginMode ? 'LOG IN' : 'SIGN UP'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {!isLoginMode && (
            <div className="space-y-2">
              <Label htmlFor="username" className="font-arcade text-xs text-muted-foreground">
                USERNAME
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required={!isLoginMode}
                className="bg-input border-primary/50 focus:border-primary text-foreground"
                placeholder="SnakeMaster"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="font-arcade text-xs text-muted-foreground">
              EMAIL
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-input border-primary/50 focus:border-primary text-foreground"
              placeholder="player@arcade.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-arcade text-xs text-muted-foreground">
              PASSWORD
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="bg-input border-primary/50 focus:border-primary text-foreground"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="arcade"
            className="w-full"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoginMode ? 'ENTER ARCADE' : 'CREATE PLAYER'}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="font-arcade text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLoginMode ? "DON'T HAVE AN ACCOUNT? SIGN UP" : 'ALREADY A PLAYER? LOG IN'}
          </button>
        </div>

        {/* Demo credentials hint */}
        {isLoginMode && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="font-arcade text-[10px] text-muted-foreground text-center">
              DEMO: player1@example.com / password123
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
