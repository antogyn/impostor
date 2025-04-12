// These types will be shared between frontend and backend

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isImpostor?: boolean;
}

export interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  gameCount: number;
  language: 'en' | 'fr';
  word?: string;
  startingPlayerId?: string;         // New field to track the starting player
  disallowImpostorStart: boolean;    // New field to prevent impostor from being starting player
}

// For now, we'll just define a placeholder AppRouter type
// In a real setup, we would properly import it from the backend
export type AppRouter = any;
