# Project Brief: Impostor Game

## Overview
Impostor is a multiplayer social deduction game where players are assigned roles (impostor or crewmate) and must work together or deceive others to win. The game is structured as a fullstack application with separate back-end and front-end components, each in its own repository.

## Core Requirements

### Back-end (impostor-back)
- Built with Deno
- HTTP API using tRPC
- Room management functionality:
  - Create a room
  - Join a room
  - Leave a room
  - Start the game
  - Kick a player
- State storage using Deno KV
- Real-time updates using Pusher
- Deployable to Deno Deploy

### Front-end (impostor-front)
- Built with SolidJS
- Consumes the tRPC API
- Real-time updates using Pusher
- Simple and sleek UI
- Responsive design

## Game Flow
1. Players can create or join a room
2. The room creator (host) can start the game when enough players have joined
3. When the game starts, one player is randomly assigned the role of impostor
4. Players can see their own role but not others'
5. The host can end the game or kick players

## Technical Architecture
- Separate repositories for back-end and front-end
- End-to-end type safety using tRPC
- Real-time communication using Pusher
- State management using Deno KV on the back-end and SolidJS stores on the front-end

## Deployment Strategy
- Back-end: Deno Deploy
- Front-end: Any static hosting service

## Success Criteria
- Functional room creation and management
- Proper role assignment
- Real-time updates across all connected clients
- Intuitive user interface
- Type-safe API communication
