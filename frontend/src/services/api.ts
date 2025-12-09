import type {
  User,
  LeaderboardEntry,
  LivePlayer,
  AuthCredentials,
  ApiResponse,
  GameMode,
  Position,
} from '@/types/game';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (simulating backend)
let currentUser: User | null = null;
const users: Map<string, User & { password: string }> = new Map();

// Initialize some mock users
users.set('player1@example.com', {
  id: '1',
  username: 'SnakeMaster',
  email: 'player1@example.com',
  password: 'password123',
  highScore: 1500,
  createdAt: '2024-01-15',
});

users.set('player2@example.com', {
  id: '2',
  username: 'VenomStrike',
  email: 'player2@example.com',
  password: 'password123',
  highScore: 1200,
  createdAt: '2024-02-20',
});

// Mock leaderboard data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 1500, mode: 'walls', date: '2024-12-01' },
  { id: '2', username: 'VenomStrike', score: 1200, mode: 'passthrough', date: '2024-12-02' },
  { id: '3', username: 'SlitherKing', score: 980, mode: 'walls', date: '2024-12-03' },
  { id: '4', username: 'CobraCommander', score: 850, mode: 'passthrough', date: '2024-12-04' },
  { id: '5', username: 'PythonPro', score: 720, mode: 'walls', date: '2024-12-05' },
  { id: '6', username: 'ViperVenom', score: 650, mode: 'passthrough', date: '2024-12-06' },
  { id: '7', username: 'MambaMax', score: 580, mode: 'walls', date: '2024-12-07' },
  { id: '8', username: 'RattleSnake', score: 520, mode: 'passthrough', date: '2024-12-08' },
  { id: '9', username: 'SerpentSam', score: 450, mode: 'walls', date: '2024-12-08' },
  { id: '10', username: 'BoaBlaster', score: 400, mode: 'passthrough', date: '2024-12-08' },
];

// Generate mock live players with AI movement
const generateMockLivePlayers = (): LivePlayer[] => {
  return [
    {
      id: 'live1',
      username: 'GhostPlayer',
      score: Math.floor(Math.random() * 500) + 100,
      mode: 'passthrough',
      snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
      food: { x: 10, y: 10 },
      status: 'playing',
    },
    {
      id: 'live2',
      username: 'ArcadeHero',
      score: Math.floor(Math.random() * 500) + 100,
      mode: 'walls',
      snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      food: { x: 15, y: 15 },
      status: 'playing',
    },
    {
      id: 'live3',
      username: 'PixelNinja',
      score: Math.floor(Math.random() * 500) + 100,
      mode: 'passthrough',
      snake: [{ x: 15, y: 8 }, { x: 14, y: 8 }, { x: 13, y: 8 }],
      food: { x: 5, y: 12 },
      status: 'playing',
    },
  ];
};

// Centralized API service
export const api = {
  // Auth endpoints
  auth: {
    async login(credentials: AuthCredentials): Promise<ApiResponse<User>> {
      await delay(500);

      const user = users.get(credentials.email);
      if (!user || user.password !== credentials.password) {
        return { data: null, error: 'Invalid email or password', success: false };
      }

      const { password, ...userData } = user;
      currentUser = userData;
      localStorage.setItem('snakeUser', JSON.stringify(userData));
      return { data: userData, error: null, success: true };
    },

    async signup(credentials: AuthCredentials): Promise<ApiResponse<User>> {
      await delay(500);

      if (users.has(credentials.email)) {
        return { data: null, error: 'Email already registered', success: false };
      }

      if (!credentials.username) {
        return { data: null, error: 'Username is required', success: false };
      }

      const newUser: User & { password: string } = {
        id: crypto.randomUUID(),
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        highScore: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };

      users.set(credentials.email, newUser);
      const { password, ...userData } = newUser;
      currentUser = userData;
      localStorage.setItem('snakeUser', JSON.stringify(userData));
      return { data: userData, error: null, success: true };
    },

    async logout(): Promise<ApiResponse<null>> {
      await delay(200);
      currentUser = null;
      localStorage.removeItem('snakeUser');
      return { data: null, error: null, success: true };
    },

    async getCurrentUser(): Promise<ApiResponse<User>> {
      await delay(100);

      const stored = localStorage.getItem('snakeUser');
      if (stored) {
        currentUser = JSON.parse(stored);
        return { data: currentUser, error: null, success: true };
      }

      return { data: null, error: 'Not authenticated', success: false };
    },
  },

  // Leaderboard endpoints
  leaderboard: {
    async getAll(mode?: GameMode): Promise<ApiResponse<LeaderboardEntry[]>> {
      await delay(300);

      let entries = [...mockLeaderboard];
      if (mode) {
        entries = entries.filter(e => e.mode === mode);
      }

      return { data: entries.sort((a, b) => b.score - a.score), error: null, success: true };
    },

    async submitScore(score: number, mode: GameMode): Promise<ApiResponse<LeaderboardEntry>> {
      await delay(300);

      if (!currentUser) {
        return { data: null, error: 'Must be logged in to submit score', success: false };
      }

      const entry: LeaderboardEntry = {
        id: crypto.randomUUID(),
        username: currentUser.username,
        score,
        mode,
        date: new Date().toISOString().split('T')[0],
      };

      mockLeaderboard.push(entry);

      // Update user high score
      if (score > currentUser.highScore) {
        currentUser.highScore = score;
        const user = users.get(currentUser.email);
        if (user) {
          user.highScore = score;
        }
        localStorage.setItem('snakeUser', JSON.stringify(currentUser));
      }

      return { data: entry, error: null, success: true };
    },
  },

  // Live players endpoints
  livePlayers: {
    async getAll(): Promise<ApiResponse<LivePlayer[]>> {
      await delay(200);
      return { data: generateMockLivePlayers(), error: null, success: true };
    },

    async getById(id: string): Promise<ApiResponse<LivePlayer>> {
      await delay(100);
      const players = generateMockLivePlayers();
      const player = players.find(p => p.id === id);

      if (!player) {
        return { data: null, error: 'Player not found', success: false };
      }

      return { data: player, error: null, success: true };
    },

    // Simulate AI movement for watched player
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

      // Wrap around for passthrough mode
      if (player.mode === 'passthrough') {
        newHead.x = (newHead.x + gridSize) % gridSize;
        newHead.y = (newHead.y + gridSize) % gridSize;
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
