import Pusher from "pusher-js";
import { PusherEvent } from "./types.ts";
import { getBaseUrl } from "./trpc.ts";
import { createSignal } from "solid-js";

// Initialize Pusher with environment variables or default values
const pusherKey = import.meta.env.VITE_PUSHER_KEY || "your-pusher-key";
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || "eu";
const apiUrl = getBaseUrl();

export const [isPlayed, setPlayerIsSubscribed] = createSignal(false);

// Store the current player ID for auth
let currentPlayerId = "";

// Create a custom authorizer function
const authorizer = (channel: any, options: any) => {
  return {
    authorize: (
      socketId: string,
      callback: (error: any, authData: any) => void,
    ) => {
      // Create a form for the auth request
      const formData = new FormData();
      formData.append("socket_id", socketId);
      formData.append("channel_name", channel.name);

      // Make the auth request
      fetch(`${apiUrl}/pusher/auth`, {
        method: "POST",
        headers: {
          "X-Player-ID": currentPlayerId,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          callback(null, data);
        })
        .catch((error) => {
          callback(error, null);
        });
    },
  };
};

// Create Pusher instance with custom authorizer
export const pusher = new Pusher(pusherKey, {
  cluster: pusherCluster,
  authorizer: authorizer,
});


// Get presence channel name for a room
function getPresenceChannelName(roomId: string): string {
  return `presence-${roomId}`;
}

// Subscribe to a presence channel (room)
export function subscribeToRoom(roomId: string, playerId: string, callbacks: {
  onRoomUpdated?: (data: any) => void;
  onPlayerJoined?: (data: any) => void;
  onPlayerLeft?: (data: any) => void;
  onGameStarted?: (data: any) => void;
  onPlayerKicked?: (data: any) => void;
  onMemberAdded?: (member: any) => void;
  onMemberRemoved?: (member: any) => void;
}) {
  // Use presence channel format
  const channelName = getPresenceChannelName(roomId);

  // Set the current player ID for auth
  currentPlayerId = playerId;

  const alreadyExistingChannel = pusher.channel(channelName);

  if (alreadyExistingChannel) {
    console.log("Player already subscribed.")
    return alreadyExistingChannel;
  }

  console.log("Subscribing player...")

  // Subscribe to presence channel
  const channel = pusher.subscribe(channelName);

  // Handle subscription events
  channel.bind("pusher:subscription_succeeded", () => {
    console.log("Successfully subscribed to presence channel");
  });

  channel.bind("pusher:subscription_error", (error: any) => {
    console.error("Pusher subscription error:", error);
  });

  // Set up presence events
  channel.bind("pusher:member_added", (member: any) => {
    console.log("Member added:", member);
    if (callbacks.onMemberAdded) {
      callbacks.onMemberAdded(member);
    }
  });

  channel.bind("pusher:member_removed", (member: any) => {
    console.log("Member removed:", member);
    if (callbacks.onMemberRemoved) {
      callbacks.onMemberRemoved(member);
    }

    // Disconnections are now handled by the server via webhooks
  });

  // Set up event handlers for game events
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
  pusher.unsubscribe(getPresenceChannelName(roomId));
}
