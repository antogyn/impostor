# Impostor Game

A multiplayer game where one player is the impostor and must blend in with the crewmates.

## Project Structure

This is a monorepo containing:

- `packages/frontend`: SolidJS frontend application
- `packages/backend`: Deno backend server with tRPC
- `packages/shared`: Shared TypeScript types

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Deno](https://deno.land/) (v1.37 or later)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# Start only the backend
npm run start:backend

# Start only the frontend
npm run start:frontend
```

### Building

```bash
# Build the frontend
npm run build
```

## License

MIT
