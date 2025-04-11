import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { fetchRequestHandler } from "npm:@trpc/server@10.45.0/adapters/fetch";
import { appRouter } from "./router.ts";
import { Context } from "./types.ts";

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
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  // Handle 404
  return new Response("Not found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// Start the server
const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Server running on http://localhost:${port}`);

serve(handler, { port });
