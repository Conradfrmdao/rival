# Rival Game Engine Architecture

This document provides a comprehensive overview of the Rival game engine, a modular and extensible system for managing real-time, multi-player games. The engine is designed to be easy to maintain and to simplify the process of adding new games to the platform.

## Core Concepts

The game engine is built around a set of core interfaces that define the contract for all games. These interfaces ensure that all games adhere to a consistent structure, making them interchangeable and easy to manage.

- **`IGame`**: The central interface for all game logic. It defines the methods for creating a new game, making a move, checking for a winner, ending a game, and sanitizing the game state for broadcasting to clients.

- **`GameState`**: A generic interface that all specific game state objects must extend. It includes common properties like `gameId`, `gameType`, `players`, `stakes`, and `status`.

- **`Move`**: A base interface for all game moves. Each game defines its own move structure, which extends this base interface.

- **`GameResult`**: The object returned when a game ends. It includes the final status, the calculated payouts for each player, and the platform fee.

## GameManager

The `GameManager` is a singleton that serves as the central hub for managing all active game instances. It is responsible for:

- **Creating Games**: The `createGame` method takes a game type, a list of players, and the stakes, and it returns a new game state object. It uses a game registry to find the correct game logic class for the given game type.

- **Managing State**: The `GameManager` stores all active game states in an in-memory map, using the `matchId` as the key. It provides methods for adding, retrieving, and removing games.

- **Processing Moves**: The `makeMove` method takes a `matchId` and a move object, and it updates the game state accordingly. It also handles turn progression and checks for a winner after each move.

- **Sanitizing State**: The `getSanitizedState` method is used to create a view of the game state that is safe to broadcast to a specific player. This is crucial for games where some information must be kept private (e.g., a player's cards in a card game).

## Adding a New Game

Adding a new game to the engine is a straightforward process:

1.  **Create a New Directory**: Create a new directory for the game under `src/game-engine/games/`.

2.  **Define Types**: Create a `types.ts` file in the new directory to define the game-specific `GameState` and `Move` interfaces.

3.  **Implement the Game Logic**: Create an `index.ts` file and implement the `IGame` interface in a new game class (e.g., `MyNewGame`).

4.  **Register the Game**: In `src/game-engine/games/index.ts`, import the new game class and register it with the `GameManager` using the `registerGame` function.

## WebSocket Integration

The `WebSocketService` is responsible for handling all real-time communication between the clients and the server. It has been refactored to use the `GameManager` for all game-related events:

- **`join_match`**: When a player joins a match, the `WebSocketService` calls the `GameManager` to either create a new game instance or retrieve the existing one.

- **`game_move`**: When a player makes a move, the `WebSocketService` passes the move to the `GameManager`, which processes it and returns the updated game state.

- **Broadcasting State**: After each move, the `WebSocketService` retrieves the sanitized game state for each player from the `GameManager` and broadcasts it to the respective clients. This ensures that no private information is leaked.

## Payouts

Payouts are calculated by the `calculatePayouts` function in `src/game-engine/payout.ts`. This function takes the final game state as input and returns a `GameResult` object containing the payouts for each player and the platform fee. The platform fee is a percentage of the total pot, and it is defined by the `APP_FEE_PERCENTAGE` constant.
