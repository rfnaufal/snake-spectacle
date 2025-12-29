import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api } from '@/services/api';
import { User, LeaderboardEntry, LivePlayer } from '@/types/game';

// Helper to mock successful fetch response
function mockFetchSuccess(data: any) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, data, error: null }),
  } as Response;
}

// Helper to mock error fetch response
function mockFetchError(error: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: false, data: null, error }),
  } as Response;
}

describe('API Service', () => {
  const fetchSpy = vi.spyOn(global, 'fetch');

  beforeEach(() => {
    localStorage.clear();
    fetchSpy.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('auth', () => {
    const mockUser: User = {
      id: '1',
      username: 'SnakeMaster',
      email: 'player1@example.com',
      highScore: 1000,
      createdAt: '2024-01-01',
    };

    it('logs in with valid credentials', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchSuccess(mockUser));

      const result = await api.auth.login({
        email: 'player1@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('SnakeMaster');
      expect(fetchSpy).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
    });

    it('fails login with invalid credentials', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchError('Invalid email or password'));

      const result = await api.auth.login({
        email: 'player1@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('signs up new user', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchSuccess(mockUser));

      const result = await api.auth.signup({
        email: 'newplayer@example.com',
        password: 'password123',
        username: 'NewPlayer',
      });

      expect(result.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith('/api/auth/signup', expect.any(Object));
    });

    it('logs out successfully', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchSuccess(null));

      const result = await api.auth.logout();
      expect(result.success).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith('/api/auth/logout', expect.any(Object));
    });

    it('gets current user', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchSuccess(mockUser));

      const result = await api.auth.getCurrentUser();
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('SnakeMaster');
    });
  });

  describe('leaderboard', () => {
    const mockEntries: LeaderboardEntry[] = [
      { id: '1', username: 'P1', score: 100, mode: 'walls', date: '2024-01-01' },
      { id: '2', username: 'P2', score: 50, mode: 'walls', date: '2024-01-01' },
    ];

    it('fetches all leaderboard entries', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchSuccess(mockEntries));

      const result = await api.leaderboard.getAll();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(fetchSpy).toHaveBeenCalledWith('/api/leaderboard', expect.any(Object));
    });

    it('filters leaderboard by mode', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchSuccess(mockEntries));

      const result = await api.leaderboard.getAll('walls');

      expect(result.success).toBe(true);
      // Determine if query param was passed correctly
      expect(fetchSpy).toHaveBeenCalledWith('/api/leaderboard?mode=walls', expect.any(Object));
    });

    it('submits score', async () => {
      const mockEntry = mockEntries[0];
      fetchSpy.mockResolvedValueOnce(mockFetchSuccess(mockEntry));

      const result = await api.leaderboard.submitScore(100, 'walls');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEntry);
      expect(fetchSpy).toHaveBeenCalledWith('/api/leaderboard', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ score: 100, mode: 'walls' }),
      }));
    });
  });

  describe('livePlayers', () => {
    const mockPlayers: LivePlayer[] = [{
      id: 'live1',
      username: 'LiveWire',
      score: 100,
      mode: 'walls',
      snake: [{ x: 5, y: 5 }],
      food: { x: 10, y: 10 },
      status: 'playing',
    }];

    it('fetches live players', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetchSuccess(mockPlayers));

      const result = await api.livePlayers.getAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlayers);
      expect(fetchSpy).toHaveBeenCalledWith('/api/live-players', expect.any(Object));
    });

    it('updates player state with AI movement (client-side)', async () => {
      // getUpdatedState is still client-side logic, so we test it directly with data
      const player = mockPlayers[0];
      const updated = await api.livePlayers.getUpdatedState(player, 20);

      expect(updated.snake).toBeInstanceOf(Array);
      expect(updated.snake.length).toBeGreaterThan(0);
      // We can't easily predict random movement but we can check structure
      expect(updated).toHaveProperty('snake');
    });
  });
});
