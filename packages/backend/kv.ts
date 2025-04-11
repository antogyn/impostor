import { Room, Player } from "./types.ts";

// Open the KV store
const kv = await Deno.openKv();

// Prefix for room keys
const ROOM_PREFIX = "room:";

// Get a room by ID
export async function getRoom(roomId: string): Promise<Room | null> {
  const res = await kv.get([ROOM_PREFIX, roomId]);
  return res.value as Room | null;
}

// Save a room
export async function saveRoom(room: Room): Promise<void> {
  room.updatedAt = Date.now();
  await kv.set([ROOM_PREFIX, room.id], room);
}

// Get a random word from the word list
async function getRandomWord(language: 'en' | 'fr'): Promise<string> {
  // Read the appropriate word list file
  const filePath = `./words/${language}.json`;
  const wordList = JSON.parse(await Deno.readTextFile(filePath));
  
  // Select a random word
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

// Create a new room
export async function createRoom(hostName: string, language: 'en' | 'fr' = 'en'): Promise<{ room: Room; playerId: string }> {
  // Generate IDs
  const roomId = crypto.randomUUID();
  const playerId = crypto.randomUUID();
  
  // Create host player
  const host: Player = {
    id: playerId,
    name: hostName,
    isHost: true,
  };
  
  // Create room
  const room: Room = {
    id: roomId,
    players: [host],
    status: "waiting",
    gameCount: 1,
    language: language,
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
  playerName: string
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
    isHost: false,
  };
  
  // If game is in progress, player will not have a role until the game is restarted
  if (room.status === "playing") {
    player.isImpostor = false; // Default value, will be reassigned when game restarts
  }
  
  // Add player to room
  room.players.push(player);
  
  // Save room
  await saveRoom(room);
  
  return { room, playerId };
}

// Remove a player from a room
export async function removePlayerFromRoom(
  roomId: string,
  playerId: string
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
  
  // If no players left, delete room
  if (room.players.length === 0) {
    await kv.delete([ROOM_PREFIX, roomId]);
    return null;
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
export async function startGame(roomId: string, hostId: string): Promise<Room | null> {
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
  
  // Need at least 3 players to start
  if (room.players.length < 3) {
    return null;
  }
  
  // Randomly select impostor
  const impostorIndex = Math.floor(Math.random() * room.players.length);
  room.players.forEach((player, index) => {
    player.isImpostor = index === impostorIndex;
  });
  
  // Select a random word based on room language
  room.word = await getRandomWord(room.language);
  
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
  hostId: string
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
