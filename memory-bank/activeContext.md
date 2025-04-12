# Active Context: Impostor Game

## Current Work Focus
The project has been converted to a monorepo structure using npm workspaces. The back-end and front-end code has been moved to separate packages within the monorepo, and a shared package has been created for common types. The focus is now on ensuring that the shared types are properly used across packages and that the build and development processes work correctly in the monorepo structure.

## Recent Changes

### Project Structure
- Converted the project to a monorepo using npm workspaces
- Created three packages: frontend, backend, and shared
- Set up shared types between frontend and backend
- Updated import paths to use the new package structure

### Back-end
- Created the basic Deno project structure
- Implemented tRPC API with endpoints for room management
- Set up Deno KV for state storage
- Implemented automatic room cleanup using Deno KV's TTL feature
- Integrated Pusher for real-time updates
- Added support for loading environment variables from .env files
- Created comprehensive documentation

### Front-end
- Set up SolidJS project with TypeScript and Tailwind CSS
- Implemented tRPC client for API communication
- Integrated Pusher client for real-time updates
- Created UI components for all game screens
- Implemented state management using SolidJS stores
- Added comprehensive documentation

## Next Steps

### Immediate Priorities
1. **Testing**: Create comprehensive tests for both back-end and front-end
2. **Deployment**: Deploy the back-end to Deno Deploy and the front-end to a static hosting service
3. **Environment Setup**: Create proper development, staging, and production environments
4. **Game Restart Feature**: Implement ability for the host to restart a game in the same room (✅ Completed)
5. **Game Counter**: Add a counter visible to all players that shows the current game being played (✅ Completed)
6. **Join In-Progress Games**: Allow players to join a game that's already in progress (✅ Completed)
7. **QR Code Sharing**: Add QR code generation and scanning for easier room joining (✅ Completed)
8. **Localization**: Add support for multiple languages (✅ Completed)
9. **Room Auto-Deletion**: Implement automatic deletion of inactive rooms (✅ Completed)

### Short-term Goals
1. **Enhanced Game Logic**: Add more sophisticated game mechanics
2. **UI Polish**: Improve the visual design and user experience
3. **Error Handling**: Implement more robust error handling and recovery mechanisms
4. **Monitoring**: Add logging and monitoring for production

### Long-term Goals
1. **Additional Features**: Add chat functionality, game history, user accounts
2. **Performance Optimization**: Optimize for scale and performance
3. **Mobile App**: Consider creating native mobile apps using the same API

## Active Decisions and Considerations

### Architecture Decisions
- **Monorepo Structure**: The project has been converted to a monorepo using npm workspaces to simplify dependency management and code sharing between packages.
- **Shared Types Package**: A shared package has been created to house common types used by both the frontend and backend, particularly the tRPC router types.
- **tRPC**: Chosen for its end-to-end type safety, which reduces the need for manual API documentation and validation.
- **Pusher**: Selected as the real-time messaging service due to Deno Deploy's lack of WebSocket support.
- **Deno KV**: Used for state storage due to its simplicity and integration with Deno Deploy.

### Technical Considerations
- **Workspace Management**: Using npm workspaces to manage dependencies across packages and enable code sharing.
- **Shared Types**: Common types are defined in a shared package to ensure consistency between frontend and backend.
- **Import Paths**: Updated import paths to use package names (e.g., @impostor/shared) instead of relative paths.
- **Environment Variables**: Added support for .env files in the back-end to simplify local development.
- **Type Safety**: Emphasized throughout the project to catch errors at compile time.
- **Component Reusability**: Created reusable UI components to maintain consistency and reduce duplication.
- **State Management**: Implemented a centralized store for front-end state management.
- **Room Cleanup**: Using Deno KV's TTL feature to automatically delete inactive rooms after 3 hours.

### Open Questions
- **Scalability**: How will the system perform under load? Will Deno KV be sufficient for larger user bases?
- **Error Recovery**: How should the system handle network interruptions or service failures?
- **Game Balance**: Is the current game mechanics balanced and engaging for players?
- **User Authentication**: Should we add user accounts and authentication in the future?

## Learnings and Insights
- **Monorepo Benefits**: The monorepo structure simplifies dependency management and enables code sharing between packages.
- **Type Sharing**: Sharing types between frontend and backend improves consistency and reduces duplication.
- **npm Workspaces**: npm workspaces provide an efficient way to manage multiple packages in a single repository.
- **Deno and tRPC Integration**: Successfully integrated Deno with tRPC, which provides a great developer experience.
- **SolidJS and Tailwind**: The combination of SolidJS and Tailwind CSS allows for rapid UI development.
- **Real-time Updates**: Pusher provides a simple yet powerful way to implement real-time features.
- **Type Safety**: End-to-end type safety with tRPC significantly reduces runtime errors and improves developer confidence.
- **Deno KV TTL**: Deno KV's TTL feature provides an elegant solution for automatic cleanup of stale data without requiring cron jobs or manual maintenance.

## Current Challenges
- **Monorepo Integration**: Ensuring smooth integration between Deno (backend) and Node.js (frontend) in the monorepo structure.
- **Type Sharing**: Managing shared types between packages without creating circular dependencies.
- **Build Process**: Coordinating build processes across different packages with different technologies.
- **Deno Deploy Limitations**: Working within the constraints of Deno Deploy, particularly the lack of WebSocket support.
- **Testing Real-time Features**: Developing effective testing strategies for real-time features.
- **Environment Configuration**: Managing environment variables across different environments.
- **Cross-browser Compatibility**: Ensuring consistent behavior across different browsers and devices.
