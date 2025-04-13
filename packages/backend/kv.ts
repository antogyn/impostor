import { Player, Room } from "./types.ts";

// Open the KV store
const kv = await Deno.openKv();

// Prefix for room keys
const ROOM_PREFIX = "room:";

// Get a room by ID
// Note: If a room hasn't been updated in 3 hours, it will be automatically deleted by the KV store's TTL
export async function getRoom(roomId: string): Promise<Room | null> {
  const res = await kv.get([ROOM_PREFIX, roomId]);
  return res.value as Room | null;
}

// Save a room
export async function saveRoom(room: Room): Promise<void> {
  room.updatedAt = Date.now();

  // Set TTL to 3 hours (10,800,000 milliseconds)
  const ttlMs = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

  await kv.set([ROOM_PREFIX, room.id], room, {
    expireIn: ttlMs, // This will auto-delete the key after 3 hours
  });
}

// Get a random word from the word list
async function getRandomWord(language: "en" | "fr"): Promise<string> {
  // Get the directory of the current file
  const currentDir = new URL(".", import.meta.url).pathname;

  // Read the appropriate word list file
  const filePath = `${currentDir}words/${language}.json`;
  const wordList = JSON.parse(await Deno.readTextFile(filePath));

  // Select a random word
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

// Create a new room
export async function createRoom(
  hostName: string,
  language: "en" | "fr" = "en",
  disallowImpostorStart: boolean = false,
): Promise<{ room: Room; playerId: string }> {
  // Generate IDs
  const roomId = crypto.randomUUID();
  const playerId = crypto.randomUUID();

  // Create host player
  const host: Player = {
    id: playerId,
    name: hostName,
    isHost: true,
    isPlaying: false, // Initially not playing until game starts
  };

  // Create room
  const room: Room = {
    id: roomId,
    players: [host],
    status: "waiting",
    gameCount: 1,
    language: language,
    disallowImpostorStart,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Save room to KV
  await saveRoom(room);

  return { room, playerId };
}

// Add a player to a room
export async function addPlayerToRoom(
  roomId: string,
  playerName: string,
): Promise<{ room: Room; playerId: string } | null> {
  // Get room
  const room = await getRoom(roomId);
  if (!room || room.status === "finished") {
    return null;
  }

  // Create player
  const playerId = crypto.randomUUID();
  const player: Player = {
    id: playerId,
    name: playerName,
    isHost: room.players.length === 0, // Make first player the host if room is empty
    isPlaying: false, // Initially not playing until game is restarted
  };

  // If game is in progress, player will not have a role until the game is restarted
  // We intentionally don't set isImpostor here to prevent players from seeing the word
  // until they've been assigned a proper role in the next game

  // Add player to room
  room.players.push(player);

  // Save room
  await saveRoom(room);

  return { room, playerId };
}

// Remove a player from a room
export async function removePlayerFromRoom(
  roomId: string,
  playerId: string,
): Promise<Room | null> {
  // Get room
  const room = await getRoom(roomId);
  if (!room) {
    return null;
  }

  // Find player index
  const playerIndex = room.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    return null;
  }

  // Remove player
  room.players.splice(playerIndex, 1);

  // If no players left, we still save the room (don't delete it)
  // The room will be automatically deleted after its TTL (3 hours)
  if (room.players.length === 0) {
    // Save room with updated players array (empty)
    await saveRoom(room);
    console.log(`Room ${roomId} is now empty but preserved for reconnection`);
    return room;
  }

  // If host left, assign new host
  if (room.players.every((p) => !p.isHost)) {
    room.players[0].isHost = true;
  }

  // Save room
  await saveRoom(room);

  return room;
}

// Start a game or restart an existing game
export async function startGame(
  roomId: string,
  hostId: string,
): Promise<Room | null> {
  // Get room
  const room = await getRoom(roomId);
  if (!room || (room.status !== "waiting" && room.status !== "playing")) {
    return null;
  }

  // Check if requester is host
  const host = room.players.find((p) => p.id === hostId);
  if (!host || !host.isHost) {
    return null;
  }

  // For testing purposes, allow starting with any number of players
  // In production, this would be: if (room.players.length < 3) { return null; }

  // Randomly select impostor and set all players to playing
  const impostorIndex = Math.floor(Math.random() * room.players.length);
  room.players.forEach((player, index) => {
    player.isImpostor = index === impostorIndex;
    player.isPlaying = true; // Mark all players as playing in this game
  });

  // Select a random word based on room language
  room.word = await getRandomWord(room.language);

  // Randomly select starting player
  let startingPlayerIndex;
  if (room.disallowImpostorStart) {
    // Filter out the impostor when selecting starting player
    const nonImpostorIndices = room.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => !player.isImpostor)
      .map(({ index }) => index);

    // Handle edge case where all players are impostors (shouldn't happen in normal gameplay)
    if (nonImpostorIndices.length === 0) {
      // Fall back to allowing any player to be the starting player
      startingPlayerIndex = Math.floor(Math.random() * room.players.length);
    } else {
      const randomNonImpostorIndex = Math.floor(
        Math.random() * nonImpostorIndices.length,
      );
      startingPlayerIndex = nonImpostorIndices[randomNonImpostorIndex];
    }
  } else {
    // Any player can be the starting player
    startingPlayerIndex = Math.floor(Math.random() * room.players.length);
  }

  room.startingPlayerId = room.players[startingPlayerIndex].id;

  // Increment game count if restarting a game
  if (room.status === "playing") {
    room.gameCount += 1;
  }

  // Update room status
  room.status = "playing";

  // Save room
  await saveRoom(room);

  return room;
}

// Kick a player
export async function kickPlayer(
  roomId: string,
  playerId: string,
  hostId: string,
): Promise<Room | null> {
  // Get room
  const room = await getRoom(roomId);
  if (!room) {
    return null;
  }

  // Check if requester is host
  const host = room.players.find((p) => p.id === hostId);
  if (!host || !host.isHost) {
    return null;
  }

  // Find player index
  const playerIndex = room.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    return null;
  }

  // Cannot kick self (host)
  if (playerId === hostId) {
    return null;
  }

  // Remove player
  room.players.splice(playerIndex, 1);

  // Save room
  await saveRoom(room);

  return room;
}
