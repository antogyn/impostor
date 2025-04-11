import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../backend/router';

// Define API URL based on environment
const getBaseUrl = () => {
  // In production, use the deployed API URL
  if (import.meta.env.PROD) {
    return 'https://your-deno-deploy-url.deno.dev';
  }
  // In development, use localhost
  return 'http://localhost:8000';
};

// Create tRPC client
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
    }),
  ],
});
