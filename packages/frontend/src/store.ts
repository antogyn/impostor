import { createSignal, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Room, Player, PusherEvent } from './types';
import { trpc } from './trpc';
import { subscribeToRoom, unsubscribeFromRoom } from './pusher';

// Create store for game state
export const [gameState, setGameState] = createStore({
  room: null as Room | null,
  playerId: null as string | null,
  playerName: null as string | null,
  isConnecting: false,
  error: null as string | null,
});

// Create signals for UI state
export const [isCreatingRoom, setIsCreatingRoom] = createSignal(false);
export const [isJoiningRoom, setIsJoiningRoom] = createSignal(false);
export const [isLeavingRoom, setIsLeavingRoom] = createSignal(false);
export const [isStartingGame, setIsStartingGame] = createSignal(false);
export const [isKickingPlayer, setIsKickingPlayer] = createSignal(false);

// Helper to check if current player is host
export function isHost() {
  if (!gameState.room || !gameState.playerId) return false;
  const player = gameState.room.players.find(p => p.id === gameState.playerId);
  return player?.isHost || false;
}

// Helper to get current player
export function getCurrentPlayer(): Player | undefined {
  if (!gameState.room || !gameState.playerId) return undefined;
  return gameState.room.players.find(p => p.id === gameState.playerId);
}

// Create a new room
export async function createRoom(
  playerName: string, 
  language: 'en' | 'fr' = 'en',
  disallowImpostorStart: boolean = false
) {
  setIsCreatingRoom(true);
  setGameState('error', null);
  
  try {
    const result = await trpc.createRoom.mutate({ 
      playerName, 
      language,
      disallowImpostorStart
    });
    
    // Save player info
    setGameState({
      playerId: result.playerId,
      playerName,
    });
    
    // Fetch room details
    await fetchRoomDetails(result.roomId);
    
    // Subscribe to room updates
    subscribeToRoomUpdates(result.roomId);
    
    return result.roomId;
  } catch (error) {
    console.error('Error creating room:', error);
    setGameState('error', 'Failed to create room. Please try again.');
    return null;
  } finally {
    setIsCreatingRoom(false);
  }
}

// Join an existing room
export async function joinRoom(roomId: string, playerName: string) {
  setIsJoiningRoom(true);
  setGameState('error', null);
  
  try {
    const result = await trpc.joinRoom.mutate({ roomId, playerName });
    
    // Save player info
    setGameState({
      playerId: result.playerId,
      playerName,
    });
    
    // Fetch room details
    await fetchRoomDetails(roomId);
    
    // Subscribe to room updates
    subscribeToRoomUpdates(roomId);
    
    return true;
  } catch (error) {
    console.error('Error joining room:', error);
    setGameState('error', 'Failed to join room. It may not exist or the game has already started.');
    return false;
  } finally {
    setIsJoiningRoom(false);
  }
}

// Leave the current room
export async function leaveRoom() {
  if (!gameState.room || !gameState.playerId) return false;
  
  setIsLeavingRoom(true);
  setGameState('error', null);
  
  try {
    await trpc.leaveRoom.mutate({
      roomId: gameState.room.id,
      playerId: gameState.playerId,
    });
    
    // Unsubscribe from room updates
    unsubscribeFromRoom(gameState.room.id);
    
    // Clear game state
    setGameState({
      room: null,
      playerId: null,
      playerName: null,
    });
    
    return true;
  } catch (error) {
    console.error('Error leaving room:', error);
    setGameState('error', 'Failed to leave room. Please try again.');
    return false;
  } finally {
    setIsLeavingRoom(false);
  }
}

// Start the game
export async function startGame() {
  if (!gameState.room || !gameState.playerId || !isHost()) return false;
  
  setIsStartingGame(true);
  setGameState('error', null);
  
  try {
    await trpc.startGame.mutate({
      roomId: gameState.room.id,
      playerId: gameState.playerId,
    });
    
    return true;
  } catch (error) {
    console.error('Error starting game:', error);
    setGameState('error', 'Failed to start game. Make sure you are the host and have at least 3 players.');
    return false;
  } finally {
    setIsStartingGame(false);
  }
}

// Kick a player
export async function kickPlayer(playerId: string) {
  if (!gameState.room || !gameState.playerId || !isHost()) return false;
  
  setIsKickingPlayer(true);
  setGameState('error', null);
  
  try {
    await trpc.kickPlayer.mutate({
      roomId: gameState.room.id,
      playerId,
      hostId: gameState.playerId,
    });
    
    return true;
  } catch (error) {
    console.error('Error kicking player:', error);
    setGameState('error', 'Failed to kick player. Make sure you are the host.');
    return false;
  } finally {
    setIsKickingPlayer(false);
  }
}

// Fetch room details
async function fetchRoomDetails(roomId: string) {
  try {
    const room = await trpc.getRoom.query({
      roomId,
      playerId: gameState.playerId || undefined,
    });
    
    setGameState('room', room);
    return room;
  } catch (error) {
    console.error('Error fetching room details:', error);
    setGameState('error', 'Failed to fetch room details.');
    return null;
  }
}

// Subscribe to room updates via Pusher
function subscribeToRoomUpdates(roomId: string) {
  if (!gameState.playerId) return;
  
  subscribeToRoom(roomId, gameState.playerId, {
    onRoomUpdated: (data) => {
      setGameState('room', data.room);
    },
    onPlayerJoined: (data) => {
      setGameState('room', data.room);
    },
    onPlayerLeft: (data) => {
      setGameState('room', data.room);
    },
    onGameStarted: (data) => {
      setGameState('room', data.room);
    },
    onPlayerKicked: (data) => {
      // If current player was kicked, leave the room
      if (data.kickedPlayerId === gameState.playerId) {
        unsubscribeFromRoom(roomId);
        setGameState({
          room: null,
          error: 'You have been kicked from the room.',
        });
      } else {
        setGameState('room', data.room);
      }
    },
    onMemberAdded: (member) => {
      console.log('Member added to presence channel:', member);
    },
    onMemberRemoved: (member) => {
      console.log('Member removed from presence channel:', member);
      
      // Disconnections are now handled by the server via webhooks
    },
  });
}
