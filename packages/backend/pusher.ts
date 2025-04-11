import Pusher from "npm:pusher@5.2.0";
import { Room } from "./types.ts";

// Initialize Pusher with environment variables
// These would be set in the Deno Deploy environment
const pusher = new Pusher({
  appId: Deno.env.get("PUSHER_APP_ID") || "",
  key: Deno.env.get("PUSHER_KEY") || "",
  secret: Deno.env.get("PUSHER_SECRET") || "",
  cluster: Deno.env.get("PUSHER_CLUSTER") || "eu",
  useTLS: true,
});

// Event types
export enum PusherEvent {
  ROOM_UPDATED = "room-updated",
  PLAYER_JOINED = "player-joined",
  PLAYER_LEFT = "player-left",
  GAME_STARTED = "game-started",
  PLAYER_KICKED = "player-kicked",
}

// Send room update to all players in the room
export async function notifyRoomUpdate(room: Room): Promise<void> {
  await pusher.trigger(room.id, PusherEvent.ROOM_UPDATED, {
    room: sanitizeRoom(room, room.status === "playing"),
  });
}

// Notify when a player joins
export async function notifyPlayerJoined(room: Room, playerId: string): Promise<void> {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return;

  await pusher.trigger(room.id, PusherEvent.PLAYER_JOINED, {
    room: sanitizeRoom(room, room.status === "playing"),
    player: {
      id: player.id,
      name: player.name,
      isHost: player.isHost,
    },
  });
}

// Notify when a player leaves
export async function notifyPlayerLeft(room: Room | null, playerId: string, playerName: string): Promise<void> {
  if (!room) return;

  await pusher.trigger(room.id, PusherEvent.PLAYER_LEFT, {
    room: sanitizeRoom(room, room.status === "playing"),
    playerId,
    playerName,
  });
}

// Notify when game starts
export async function notifyGameStarted(room: Room): Promise<void> {
  await pusher.trigger(room.id, PusherEvent.GAME_STARTED, {
    room: sanitizeRoom(room, true),
  });
}

// Notify when a player is kicked
export async function notifyPlayerKicked(room: Room, kickedPlayerId: string, kickedPlayerName: string): Promise<void> {
  await pusher.trigger(room.id, PusherEvent.PLAYER_KICKED, {
    room: sanitizeRoom(room, room.status === "playing"),
    kickedPlayerId,
    kickedPlayerName,
  });
}

// Helper to sanitize room data before sending to clients
// If includeRoles is true, include impostor information
function sanitizeRoom(room: Room, includeRoles = false): Partial<Room> {
  return {
    id: room.id,
    status: room.status,
    gameCount: room.gameCount,
    language: room.language,
    word: includeRoles ? room.word : undefined,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      isHost: player.isHost,
      ...(includeRoles ? { isImpostor: player.isImpostor } : {}),
    })),
  };
}
