import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/services/api';

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('auth', () => {
    it('logs in with valid credentials', async () => {
      const result = await api.auth.login({
        email: 'player1@example.com',
        password: 'password123',
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('SnakeMaster');
    });

    it('fails login with invalid credentials', async () => {
      const result = await api.auth.login({
        email: 'player1@example.com',
        password: 'wrongpassword',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('signs up new user', async () => {
      const result = await api.auth.signup({
        email: 'newplayer@example.com',
        password: 'password123',
        username: 'NewPlayer',
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('NewPlayer');
    });

    it('fails signup with existing email', async () => {
      const result = await api.auth.signup({
        email: 'player1@example.com',
        password: 'password123',
        username: 'AnotherName',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
    });

    it('fails signup without username', async () => {
      const result = await api.auth.signup({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('logs out successfully', async () => {
      await api.auth.login({
        email: 'player1@example.com',
        password: 'password123',
      });
      
      const result = await api.auth.logout();
      expect(result.success).toBe(true);
      
      const currentUser = await api.auth.getCurrentUser();
      expect(currentUser.success).toBe(false);
    });

    it('persists user in localStorage', async () => {
      await api.auth.login({
        email: 'player1@example.com',
        password: 'password123',
      });
      
      const stored = localStorage.getItem('snakeUser');
      expect(stored).not.toBeNull();
      
      const user = JSON.parse(stored!);
      expect(user.username).toBe('SnakeMaster');
    });
  });

  describe('leaderboard', () => {
    it('fetches all leaderboard entries', async () => {
      const result = await api.leaderboard.getAll();
      
      expect(result.success).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('filters leaderboard by mode', async () => {
      const result = await api.leaderboard.getAll('walls');
      
      expect(result.success).toBe(true);
      result.data?.forEach(entry => {
        expect(entry.mode).toBe('walls');
      });
    });

    it('sorts leaderboard by score descending', async () => {
      const result = await api.leaderboard.getAll();
      
      expect(result.success).toBe(true);
      const scores = result.data?.map(e => e.score) || [];
      
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    });

    it('requires authentication to submit score', async () => {
      const result = await api.leaderboard.submitScore(100, 'passthrough');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Must be logged in to submit score');
    });

    it('submits score when authenticated', async () => {
      await api.auth.login({
        email: 'player1@example.com',
        password: 'password123',
      });
      
      const result = await api.leaderboard.submitScore(500, 'passthrough');
      
      expect(result.success).toBe(true);
      expect(result.data?.score).toBe(500);
      expect(result.data?.mode).toBe('passthrough');
    });
  });

  describe('livePlayers', () => {
    it('fetches live players', async () => {
      const result = await api.livePlayers.getAll();
      
      expect(result.success).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('each player has required fields', async () => {
      const result = await api.livePlayers.getAll();
      
      result.data?.forEach(player => {
        expect(player).toHaveProperty('id');
        expect(player).toHaveProperty('username');
        expect(player).toHaveProperty('score');
        expect(player).toHaveProperty('mode');
        expect(player).toHaveProperty('snake');
        expect(player).toHaveProperty('food');
        expect(player).toHaveProperty('status');
      });
    });

    it('updates player state with AI movement', async () => {
      const result = await api.livePlayers.getAll();
      const player = result.data![0];
      
      const updated = await api.livePlayers.getUpdatedState(player, 20);
      
      expect(updated.snake[0]).not.toEqual(player.snake[0]);
    });

    it('wraps snake position in passthrough mode', async () => {
      const player = {
        id: 'test',
        username: 'Test',
        score: 0,
        mode: 'passthrough' as const,
        snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
        food: { x: 0, y: 10 },
        status: 'playing' as const,
      };
      
      const updated = await api.livePlayers.getUpdatedState(player, 20);
      
      // Should wrap or continue moving
      expect(updated.snake[0].x).toBeGreaterThanOrEqual(0);
      expect(updated.snake[0].x).toBeLessThan(20);
    });
  });
});
