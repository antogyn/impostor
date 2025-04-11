import { Player, Room } from '@impostor/shared';

// Re-export shared types
export type { Player, Room };

// API response types
export interface CreateRoomResponse {
  roomId: string;
  playerId: string;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
}

export interface LeaveRoomResponse {
  success: boolean;
}

export interface StartGameResponse {
  success: boolean;
}

export interface KickPlayerResponse {
  success: boolean;
}

// Pusher event types
export enum PusherEvent {
  ROOM_UPDATED = "room-updated",
  PLAYER_JOINED = "player-joined",
  PLAYER_LEFT = "player-left",
  GAME_STARTED = "game-started",
  PLAYER_KICKED = "player-kicked",
}

export interface PlayerJoinedEvent {
  room: Room;
  player: Player;
}

export interface PlayerLeftEvent {
  room: Room;
  playerId: string;
  playerName: string;
}

export interface GameStartedEvent {
  room: Room;
}

export interface PlayerKickedEvent {
  room: Room;
  kickedPlayerId: string;
  kickedPlayerName: string;
}
