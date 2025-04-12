import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { fetchRequestHandler } from "npm:@trpc/server@10.45.0/adapters/fetch";
import { appRouter } from "./router.ts";
import { Context } from "./types.ts";
import { authorizeChannel, notifyPlayerLeft } from "./pusher.ts";
import { getRoom, removePlayerFromRoom } from "./kv.ts";

// Create context for tRPC requests
function createContext(): Context {
  return {};
}

// Handle tRPC requests
async function handler(req: Request): Promise<Response> {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Player-ID",
      },
    });
  }

  // Handle tRPC requests
  const url = new URL(req.url);
  if (url.pathname.startsWith("/trpc")) {
    try {
      const response = await fetchRequestHandler({
        endpoint: "/trpc",
        req,
        router: appRouter,
        createContext,
      });
      
      // Add CORS headers to response
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      
      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      console.error("tRPC error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }

  // Handle Pusher authentication for presence channels
  if (url.pathname === "/pusher/auth" && req.method === "POST") {
    try {
      // Parse form data from request
      const formData = await req.formData();
      const socketId = formData.get("socket_id")?.toString() || "";
      const channel = formData.get("channel_name")?.toString() || "";
      
      // Get player ID from headers
      const playerId = req.headers.get("X-Player-ID");
      
      if (!playerId) {
        return new Response(JSON.stringify({ error: "Player ID is required" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      
      // Verify channel is a presence channel
      if (!channel.startsWith("presence-")) {
        return new Response(JSON.stringify({ error: "Invalid channel" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      
      // Extract roomId from channel name (presence-{roomId})
      const roomId = channel.replace("presence-", "");
      
      // Verify player exists in room
      const room = await getRoom(roomId);
      if (!room) {
        return new Response(JSON.stringify({ error: "Room not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        return new Response(JSON.stringify({ error: "Player not found in room" }), {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      
      // Generate auth signature with user data
      const auth = authorizeChannel(socketId, channel, player.id, player.name, player.isHost);
      
      return new Response(JSON.stringify(auth), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Pusher auth error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }
  
  // Handle health check
  if (url.pathname === "/health") {
    return new Response(JSON.stringify({ status: "ok" }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Handle root path
  if (url.pathname === "/") {
    return new Response("Impostor Game API - Use /trpc endpoint for API calls", {
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

    // Handle Pusher webhooks
  if (url.pathname === "/pusher/webhooks" && req.method === "POST") {
    try {
      const body = await req.json();
      
      // Verify webhook signature
      const signature = req.headers.get("X-Pusher-Signature") || "";
      if (!verifyPusherWebhook(body, signature)) {
        return new Response("Invalid signature", { 
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      
      // Process webhook events
      if (body.events) {
        for (const event of body.events) {
          if (event.name === "member_removed") {
            // Extract room ID from channel name
            const channelName = event.channel;
            if (!channelName.startsWith("presence-")) continue;
            
            const roomId = channelName.replace("presence-", "");
            
            // Extract player ID from user ID
            const playerId = event.user_id;
            
            // Handle player disconnection
            await handlePlayerDisconnection(roomId, playerId);
          }
        }
      }
      
      return new Response("OK", { 
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Error processing webhook", { 
        status: 500,
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }

  // Handle 404
  return new Response("Not found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// Verify Pusher webhook signature
function verifyPusherWebhook(body: any, signature: string): boolean {
  // For development purposes, we'll skip signature verification
  // In production, you would implement proper HMAC-SHA256 verification
  console.log("Webhook received, signature verification skipped for development");
  return true;
}

// Handle player disconnection
async function handlePlayerDisconnection(roomId: string, playerId: string): Promise<void> {
  try {
    // Get room and player info
    const room = await getRoom(roomId);
    if (!room) return;
    
    const player = room.players.find(p => p.id === playerId);
    if (!player) return;
    
    const playerName = player.name;
    
    // Remove player from room
    const updatedRoom = await removePlayerFromRoom(roomId, playerId);
    
    // Notify other players
    if (updatedRoom) {
      await notifyPlayerLeft(updatedRoom, playerId, playerName);
    }
    
    console.log(`Player ${playerName} (${playerId}) disconnected from room ${roomId}`);
  } catch (error) {
    console.error("Error handling player disconnection:", error);
  }
}

// Start the server
const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Server running on http://localhost:${port}`);

serve(handler, { port });
