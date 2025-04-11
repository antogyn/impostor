import { initTRPC } from "npm:@trpc/server@10.45.0";
import { z } from "npm:zod@3.22.4";
import { Context } from "./types.ts";

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;

// Middleware to check if player exists
export const playerMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.playerId) {
    throw new Error("Player ID is required");
  }
  return next({
    ctx: {
      ...ctx,
      playerId: ctx.playerId,
    },
  });
});

// Protected procedure that requires a player ID
export const playerProcedure = publicProcedure.use(playerMiddleware);
