# System Patterns: Impostor Game

## System Architecture

The Impostor Game follows a client-server architecture with a clear separation between the front-end and back-end components. The system is designed around the following key architectural patterns:

### Monorepo Architecture
- Back-end and front-end are developed within a single repository using a monorepo structure
- The codebase is organized into packages (frontend, backend, shared)
- npm workspaces are used to manage dependencies between packages
- Shared types ensure consistency between front-end and back-end
- Services communicate through well-defined APIs

### Real-time Event-driven Architecture
- Pusher is used as the real-time messaging service
- Events are published by the server and subscribed to by clients
- State changes are propagated to all connected clients in real-time

## Component Relationships

```
┌─────────────────┐     HTTP/tRPC     ┌─────────────────┐
│                 │◄────────────────►│                 │
│   SolidJS       │                   │   Deno          │
│   Front-end     │                   │   Back-end      │
│                 │                   │                 │
└────────┬────────┘                   └────────┬────────┘
         │                                     │
         │                                     │
         │         ┌─────────────────┐         │
         │         │                 │         │
         ├────────►│   Shared        │◄────────┤
         │         │   Types         │         │
         │         │                 │         │
         │         └─────────────────┘         │
         │                                     │
         ▼                                     ▼
┌─────────────────┐                   ┌─────────────────┐
│                 │                   │                 │
│   Pusher        │◄──────────────────│   Deno KV       │
│   Client        │                   │   Database      │
│                 │                   │                 │
└─────────────────┘                   └─────────────────┘
```

### Key Components

#### Shared Components
1. **Type Definitions**: Common TypeScript interfaces and types used by both front-end and back-end
2. **tRPC Router Types**: Type definitions for the API router to ensure type safety across packages

#### Back-end Components
1. **API Layer (tRPC)**: Handles HTTP requests and provides type-safe endpoints
2. **Game Logic**: Manages room creation, player management, and game state
3. **State Storage (Deno KV)**: Persists game state and room information
4. **Real-time Notifications (Pusher)**: Broadcasts state changes to clients

#### Front-end Components
1. **API Client (tRPC)**: Communicates with the back-end API
2. **State Management (SolidJS Store)**: Manages client-side application state
3. **Real-time Updates (Pusher Client)**: Receives and processes real-time events
4. **UI Components**: Renders the user interface based on application state

## Design Patterns

### Repository Pattern (Back-end)
- Deno KV operations are abstracted in the `kv.ts` file
- Provides methods for CRUD operations on rooms and players
- Centralizes data access logic

### Facade Pattern (Back-end)
- The tRPC router acts as a facade for the underlying game logic
- Simplifies the API surface and provides a unified interface

### Observer Pattern (Real-time Updates)
- Pusher implements the observer pattern for real-time updates
- Back-end publishes events, front-end subscribes to them
- Ensures all clients have the latest game state

### State Management Pattern (Front-end)
- SolidJS reactive primitives manage application state
- Components react to state changes automatically
- Provides a predictable state flow throughout the application

### Component-based Architecture (Front-end)
- UI is composed of reusable components
- Components are organized by functionality
- Promotes code reuse and maintainability

## Data Flow

1. **User Action**: User interacts with the UI (e.g., creates a room)
2. **API Request**: Front-end sends a tRPC request to the back-end
3. **State Update**: Back-end processes the request and updates the state in Deno KV
4. **Event Publication**: Back-end publishes an event to Pusher
5. **Event Reception**: All connected clients receive the event via Pusher
6. **State Synchronization**: Clients update their local state based on the event
7. **UI Update**: UI components re-render to reflect the new state

## Key Technical Decisions

### npm Workspaces for Monorepo
- Efficient package management with built-in workspace support
- Simplified dependency management across packages
- Enables code sharing between packages
- Supports parallel script execution across packages

### Shared Types Package
- Centralizes common type definitions
- Ensures consistency between front-end and back-end
- Reduces duplication and maintenance overhead
- Leverages TypeScript's type system for cross-package type safety

### tRPC for API Communication
- Provides end-to-end type safety between front-end and back-end
- Eliminates the need for manual API documentation
- Simplifies API development and consumption

### Deno for Back-end
- Modern JavaScript/TypeScript runtime with built-in security features
- Native TypeScript support without configuration
- Built-in testing and formatting tools

### Deno KV for State Storage
- Simple key-value storage that's perfect for game state
- Built into Deno Deploy for easy deployment
- No need for external database setup

### Pusher for Real-time Updates
- Managed service for real-time messaging
- Simple API for publishing and subscribing to events
- Handles the complexity of maintaining WebSocket connections

### SolidJS for Front-end
- Reactive programming model for efficient UI updates
- Small bundle size for fast loading
- Familiar JSX syntax with powerful reactivity system
