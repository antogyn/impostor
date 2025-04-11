# Impostor Game Frontend

A SolidJS-based frontend for the Impostor game, using tRPC for API communication and Pusher for real-time updates.

## Features

- Create and join game rooms
- Real-time updates via Pusher
- Responsive UI with Tailwind CSS
- End-to-end type safety with tRPC

## Technologies

- [SolidJS](https://www.solidjs.com/) - A declarative, efficient, and flexible JavaScript library for building user interfaces
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Pusher](https://pusher.com/) - Real-time updates
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_pusher_cluster
```

### Running Locally

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve
```

The development server will start on http://localhost:3000.

## Connecting to the Backend

By default, the frontend will connect to the backend at `http://localhost:8000` in development mode. You can change this in the `src/trpc.ts` file.

## Game Flow

1. Create or join a room
2. Wait for other players to join
3. Host starts the game
4. Players are assigned roles (impostor or crewmate)
5. Game proceeds with real-time updates

## License

MIT
