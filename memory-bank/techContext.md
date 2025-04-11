# Technical Context: Impostor Game

## Technology Stack

### Monorepo Technologies
- **npm**: Node.js package manager
- **npm Workspaces**: Monorepo management solution
- **TypeScript**: Typed JavaScript for all packages

### Back-end Technologies
- **Deno**: JavaScript/TypeScript runtime
- **tRPC**: End-to-end typesafe API framework
- **Deno KV**: Key-value database for state storage
- **Pusher**: Real-time messaging service

### Front-end Technologies
- **SolidJS**: Reactive JavaScript UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and development server

## Development Environment

### Monorepo Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/impostor.git
cd impostor

# Install dependencies for all packages
npm install

# Copy the example .env file for the backend
cp packages/backend/.env.example packages/backend/.env

# Create .env file for the frontend with Pusher credentials
echo "VITE_PUSHER_KEY=your_pusher_key" > packages/frontend/.env
echo "VITE_PUSHER_CLUSTER=your_pusher_cluster" >> packages/frontend/.env

# Run both frontend and backend in development mode
npm run dev
```

### Running Individual Packages
```bash
# Run only the backend
npm run --workspace packages/backend dev

# Run only the frontend
npm run --workspace packages/frontend dev
```

## Dependencies

### Back-end Dependencies
- **@trpc/server**: Server implementation of tRPC
- **zod**: TypeScript-first schema validation
- **pusher**: Pusher server SDK

### Front-end Dependencies
- **solid-js**: Core SolidJS library
- **@trpc/client**: Client implementation of tRPC
- **pusher-js**: Pusher client SDK
- **tailwindcss**: Tailwind CSS framework
- **vite**: Build tool and development server
- **typescript**: TypeScript compiler

## Project Structure

### Monorepo Structure
```
impostor/
├── package.json               # Root package.json with workspace configuration
├── .gitignore                 # Git ignore file
├── README.md                  # Project documentation
├── packages/                  # All packages are in this directory
│   ├── backend/               # Backend package
│   │   ├── .env.example       # Example environment variables
│   │   ├── deno.json          # Deno configuration
│   │   ├── kv.ts              # Deno KV operations
│   │   ├── main.ts            # Entry point
│   │   ├── pusher.ts          # Pusher integration
│   │   ├── router.ts          # tRPC router
│   │   ├── trpc.ts            # tRPC setup
│   │   └── types.ts           # Backend-specific types
│   ├── frontend/              # Frontend package
│   │   ├── index.html         # HTML entry point
│   │   ├── package.json       # Package configuration
│   │   ├── tsconfig.json      # TypeScript configuration
│   │   ├── vite.config.ts     # Vite configuration
│   │   └── src/               # Source code
│   │       ├── App.tsx        # Main application component
│   │       ├── components/    # UI components
│   │       ├── i18n/          # Internationalization
│   │       ├── index.css      # Global styles
│   │       ├── index.tsx      # JavaScript entry point
│   │       ├── pusher.ts      # Pusher client setup
│   │       ├── store.ts       # State management
│   │       ├── trpc.ts        # tRPC client setup
│   │       └── types.ts       # Frontend-specific types
│   └── shared/                # Shared package
│       ├── package.json       # Package configuration
│       ├── tsconfig.json      # TypeScript configuration
│       └── src/               # Source code
│           ├── index.ts       # Entry point
│           └── types/         # Shared type definitions
│               └── index.ts   # Common types used by both packages
└── memory-bank/               # Project documentation
```

## Technical Constraints

### Deno Deploy Constraints
- Limited CPU and memory resources
- No persistent filesystem access
- HTTP request timeout of 30 seconds
- No WebSocket support (hence the use of Pusher)

### Pusher Constraints
- Free tier limited to 100 concurrent connections
- 200,000 messages per day limit on free tier
- Maximum message size of 10KB

### Browser Compatibility
- Modern browsers only (Chrome, Firefox, Safari, Edge)
- No IE11 support
- Requires JavaScript enabled

## Environment Variables

### Back-end Environment Variables
```
# Pusher credentials
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu

# Server configuration
PORT=8000
```

### Front-end Environment Variables
```
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_pusher_cluster
```

## Deployment

### Back-end Deployment (Deno Deploy)
1. Create a new project on Deno Deploy
2. Link to GitHub repository
3. Set entry point to `packages/backend/main.ts`
4. Configure environment variables
5. Deploy

### Front-end Deployment (Any Static Host)
1. Build the frontend: `npm run --workspace packages/frontend build`
2. Deploy the `packages/frontend/dist` directory to any static hosting service
3. Configure environment variables if the hosting service supports it

## Development Tools
- **Git**: Version control
- **npm**: Package manager for the monorepo
- **VS Code**: Recommended IDE
- **Deno extension for VS Code**: For back-end development
- **SolidJS extension for VS Code**: For front-end development
