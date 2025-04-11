import { Player, Room as SharedRoom } from '@impostor/shared';

// Re-export shared types
export type { Player };

// Extend the Room type with additional backend-specific fields
export interface Room extends SharedRoom {
  createdAt: number;
  updatedAt: number;
}

// Context type for tRPC
export interface Context {
  playerId?: string;
}

// Input types for API endpoints
export interface CreateRoomInput {
  playerName: string;
  language: 'en' | 'fr';
}

export interface JoinRoomInput {
  roomId: string;
  playerName: string;
}

export interface LeaveRoomInput {
  roomId: string;
  playerId: string;
}

export interface StartGameInput {
  roomId: string;
  playerId: string; // Must be the host
}

export interface KickPlayerInput {
  roomId: string;
  playerId: string; // Player to kick
  hostId: string; // Must be the host
}
