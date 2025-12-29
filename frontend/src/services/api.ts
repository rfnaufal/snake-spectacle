import type {
  User,
  LeaderboardEntry,
  LivePlayer,
  AuthCredentials,
  ApiResponse,
  GameMode,
  Position,
} from '@/types/game';

// Helper for making API requests
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (res.status === 204) {
      return { success: true, data: null, error: null } as ApiResponse<T>;
    }

    const data = await res.json();

    // The backend returns {success: boolean, data: T, error: string}
    // matching ApiResponse<T>
    return data;
  } catch (err) {
    console.error(`API Error ${endpoint}:`, err);
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

// Centralized API service
export const api = {
  // Auth endpoints
  auth: {
    async login(credentials: AuthCredentials): Promise<ApiResponse<User>> {
      return fetchApi<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    async signup(credentials: AuthCredentials): Promise<ApiResponse<User>> {
      return fetchApi<User>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },

    async logout(): Promise<ApiResponse<null>> {
      return fetchApi<null>('/auth/logout', {
        method: 'POST',
      });
    },

    async getCurrentUser(): Promise<ApiResponse<User>> {
      return fetchApi<User>('/auth/me');
    },
  },

  // Leaderboard endpoints
  leaderboard: {
    async getAll(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
      const query = mode ? `?mode=${mode}` : '';
      return fetchApi<LeaderboardEntry[]>(`/leaderboard${query}`);
    },

    async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
      return fetchApi<LeaderboardEntry>('/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ score, mode }),
      });
    },
  },

  // Live players endpoints
  livePlayers: {
    async getAll(): Promise<ApiResponse<LivePlayer[]>> {
      return fetchApi<LivePlayer[]>('/live-players');
    },

    async getById(id: string): Promise<ApiResponse<LivePlayer>> {
      return fetchApi<LivePlayer>(`/live-players/${id}`);
    },

    // Simulate AI movement for watched player (Client-side simulation)
    // NOTE: This runs on the client to simulate "live" movement as the backend 
    // mock implementation is static.
    async getUpdatedState(player: LivePlayer, gridSize: number): Promise<LivePlayer> {
      const directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'] as const;
      const head = player.snake[0];

      // Simple AI: move towards food with some randomness
      let dx = player.food.x - head.x;
      let dy = player.food.y - head.y;

      let newHead: Position;

      if (Math.random() > 0.3) {
        // Move towards food
        if (Math.abs(dx) > Math.abs(dy)) {
          newHead = { x: head.x + Math.sign(dx), y: head.y };
        } else {
          newHead = { x: head.x, y: head.y + Math.sign(dy) };
        }
      } else {
        // Random movement
        const dir = directions[Math.floor(Math.random() * 4)];
        switch (dir) {
          case 'UP': newHead = { x: head.x, y: head.y - 1 }; break;
          case 'DOWN': newHead = { x: head.x, y: head.y + 1 }; break;
          case 'LEFT': newHead = { x: head.x - 1, y: head.y }; break;
          case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
        }
      }

      // Wrap around for passthrough mode or walls logic handling
      // Note: original mock didn't explicitly handle walls collision for 'walls' mode in simulation 
      // other than just moving. We keep identical logic to previous mock for consistency.
      if (player.mode === 'passthrough') {
        newHead.x = (newHead.x + gridSize) % gridSize;
        if (newHead.x < 0) newHead.x += gridSize;
        newHead.y = (newHead.y + gridSize) % gridSize;
        if (newHead.y < 0) newHead.y += gridSize;
      } else {
        // Keep within bounds for walls mode
        newHead.x = Math.max(0, Math.min(newHead.x, gridSize - 1));
        newHead.y = Math.max(0, Math.min(newHead.y, gridSize - 1));
      }

      // Check if ate food
      const ateFood = newHead.x === player.food.x && newHead.y === player.food.y;

      const newSnake = [newHead, ...player.snake];
      if (!ateFood) {
        newSnake.pop();
      }

      const newFood = ateFood
        ? { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }
        : player.food;

      return {
        ...player,
        snake: newSnake,
        food: newFood,
        score: ateFood ? player.score + 10 : player.score,
      };
    },
  },
};
