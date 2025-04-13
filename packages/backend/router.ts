import { z } from "npm:zod@3.22.4";
import { publicProcedure, router } from "./trpc.ts";
import {
  addPlayerToRoom,
  createRoom,
  getRoom,
  kickPlayer,
  removePlayerFromRoom,
  startGame,
} from "./kv.ts";
import {
  notifyGameStarted,
  notifyPlayerJoined,
  notifyPlayerKicked,
  notifyPlayerLeft,
} from "./pusher.ts";

// Create the tRPC router
export const appRouter = router({
  // Create a new room
  createRoom: publicProcedure
    .input(
      z.object({
        playerName: z.string().min(1).max(20),
        language: z.enum(["en", "fr"]).default("en"),
        disallowImpostorStart: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const { room, playerId } = await createRoom(
        input.playerName,
        input.language,
        input.disallowImpostorStart,
      );
      console.log(`Room ${room.id} created by player ${input.playerName}`);
      return { roomId: room.id, playerId };
    }),

  // Join an existing room
  joinRoom: publicProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
        playerName: z.string().min(1).max(20),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await addPlayerToRoom(input.roomId, input.playerName);
      if (!result) {
        throw new Error("Room not found or game already finished");
      }

      const { room, playerId } = result;

      // Notify other players
      await notifyPlayerJoined(room, playerId);

      console.log(`Room ${room.id} joined by player ${input.playerName}`);

      return { roomId: room.id, playerId };
    }),

  // Leave a room
  leaveRoom: publicProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
        playerId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      // Get player name before removing
      const room = await getRoom(input.roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      const player = room.players.find((p) => p.id === input.playerId);
      if (!player) {
        throw new Error("Player not found in room");
      }

      const playerName = player.name;

      // Remove player from room
      const updatedRoom = await removePlayerFromRoom(
        input.roomId,
        input.playerId,
      );

      // Notify other players
      await notifyPlayerLeft(updatedRoom, input.playerId, playerName);

      console.log(`Room ${room.id} left by player ${playerName}`);

      return { success: true };
    }),

  // Start the game
  startGame: publicProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
        playerId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const room = await startGame(input.roomId, input.playerId);
      if (!room) {
        throw new Error(
          "Failed to start game. Make sure you are the host and have at least 3 players.",
        );
      }

      // Notify all players
      await notifyGameStarted(room);

      return { success: true };
    }),

  // Kick a player
  kickPlayer: publicProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
        playerId: z.string().uuid(), // Player to kick
        hostId: z.string().uuid(), // Must be the host
      }),
    )
    .mutation(async ({ input }) => {
      // Get player name before kicking
      const room = await getRoom(input.roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      const player = room.players.find((p) => p.id === input.playerId);
      if (!player) {
        throw new Error("Player not found in room");
      }

      const playerName = player.name;

      // Kick player
      const updatedRoom = await kickPlayer(
        input.roomId,
        input.playerId,
        input.hostId,
      );
      if (!updatedRoom) {
        throw new Error("Failed to kick player. Make sure you are the host.");
      }

      // Notify all players
      await notifyPlayerKicked(updatedRoom, input.playerId, playerName);

      return { success: true };
    }),

  // Handle player disconnect (from presence channel)
  handlePlayerDisconnect: publicProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
        playerId: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      // Get room and player info before removing
      const room = await getRoom(input.roomId);
      if (!room) {
        return { success: false, error: "Room not found" };
      }

      const player = room.players.find((p) => p.id === input.playerId);
      if (!player) {
        return { success: false, error: "Player not found" };
      }

      const playerName = player.name;

      // Remove player from room
      const updatedRoom = await removePlayerFromRoom(
        input.roomId,
        input.playerId,
      );

      // Notify other players
      if (updatedRoom) {
        await notifyPlayerLeft(updatedRoom, input.playerId, playerName);
      }

      return { success: true };
    }),

  // Get room details
  getRoom: publicProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
        playerId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ input }) => {
      const room = await getRoom(input.roomId);
      if (!room) {
        throw new Error("Room not found");
      }

      // If game is in progress and playerId is provided, include role information for that player only
      if (room.status === "playing" && input.playerId) {
        const player = room.players.find((p) => p.id === input.playerId);
        if (player) {
          return {
            id: room.id,
            status: room.status,
            gameCount: room.gameCount,
            language: room.language,
            startingPlayerId: room.startingPlayerId,
            disallowImpostorStart: room.disallowImpostorStart,
            word: player.id === input.playerId && player.isImpostor === false
              ? room.word
              : undefined,
            players: room.players.map((p) => ({
              id: p.id,
              name: p.name,
              isHost: p.isHost,
              isPlaying: p.isPlaying, // Include isPlaying for all players
              isImpostor: p.id === input.playerId ? p.isImpostor : undefined, // Only include isImpostor for current player
            })),
          };
        }
      }

      // Otherwise, return room without role information
      return {
        id: room.id,
        status: room.status,
        gameCount: room.gameCount,
        language: room.language,
        startingPlayerId: room.startingPlayerId,
        disallowImpostorStart: room.disallowImpostorStart,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isHost: p.isHost,
          isPlaying: p.isPlaying, // Include isPlaying for all players
        })),
      };
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;
