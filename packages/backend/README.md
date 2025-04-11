# Impostor Game Backend

A Deno-based backend for the Impostor game, using tRPC, Deno KV, and Pusher for real-time updates.

## Features

- Create and manage game rooms
- Join and leave rooms
- Start games
- Kick players
- Real-time updates via Pusher

## Technologies

- [Deno](https://deno.land/) - A secure runtime for JavaScript and TypeScript
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Deno KV](https://deno.com/kv) - Key-value database for state management
- [Pusher](https://pusher.com/) - Real-time updates

## Development

### Prerequisites

- [Deno](https://deno.land/#installation) installed
- [Pusher](https://pusher.com/) account and credentials

### Environment Variables

The project uses a `.env` file for local development. Copy the example file and add your credentials:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your credentials
# PUSHER_APP_ID=your_app_id
# PUSHER_KEY=your_key
# PUSHER_SECRET=your_secret
# PUSHER_CLUSTER=your_cluster
```

When deploying to Deno Deploy, you'll need to set these environment variables in the Deno Deploy dashboard.

### Running Locally

```bash
# Run in development mode with hot reloading
deno task dev

# Run in production mode
deno task start
```

The server will start on http://localhost:8000.

## API Endpoints

The API is built with tRPC and exposed at the `/trpc` endpoint. The following procedures are available:

- `createRoom` - Create a new game room
- `joinRoom` - Join an existing room
- `leaveRoom` - Leave a room
- `startGame` - Start the game (host only)
- `kickPlayer` - Kick a player from the room (host only)
- `getRoom` - Get room details

## Deployment

This project is designed to be deployed on [Deno Deploy](https://deno.com/deploy).

1. Create a new project on Deno Deploy
2. Link your GitHub repository
3. Set the entry point to `main.ts`
4. Add the required environment variables
5. Deploy!

## License

MIT
