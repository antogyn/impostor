import Pusher from 'pusher-js';
import { PusherEvent } from './types';

// Initialize Pusher with environment variables or default values
const pusherKey = import.meta.env.VITE_PUSHER_KEY || 'your-pusher-key';
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || 'eu';

// Create Pusher instance
export const pusher = new Pusher(pusherKey, {
  cluster: pusherCluster,
});

// Subscribe to a channel (room)
export function subscribeToRoom(roomId: string, callbacks: {
  onRoomUpdated?: (data: any) => void;
  onPlayerJoined?: (data: any) => void;
  onPlayerLeft?: (data: any) => void;
  onGameStarted?: (data: any) => void;
  onPlayerKicked?: (data: any) => void;
}) {
  const channel = pusher.subscribe(roomId);

  // Set up event handlers
  if (callbacks.onRoomUpdated) {
    channel.bind(PusherEvent.ROOM_UPDATED, callbacks.onRoomUpdated);
  }

  if (callbacks.onPlayerJoined) {
    channel.bind(PusherEvent.PLAYER_JOINED, callbacks.onPlayerJoined);
  }

  if (callbacks.onPlayerLeft) {
    channel.bind(PusherEvent.PLAYER_LEFT, callbacks.onPlayerLeft);
  }

  if (callbacks.onGameStarted) {
    channel.bind(PusherEvent.GAME_STARTED, callbacks.onGameStarted);
  }

  if (callbacks.onPlayerKicked) {
    channel.bind(PusherEvent.PLAYER_KICKED, callbacks.onPlayerKicked);
  }

  return channel;
}

// Unsubscribe from a channel (room)
export function unsubscribeFromRoom(roomId: string) {
  pusher.unsubscribe(roomId);
}
