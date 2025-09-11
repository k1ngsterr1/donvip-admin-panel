# Game Content API Integration

## Overview

This implementation provides comprehensive game content management functionality, including games, instructions, reviews, and FAQ management.

## Features Added

### 1. TypeScript Types (`/types/game-content-dto.ts`)

- **InstructionStepDto**: Individual instruction steps with highlights
- **InstructionImageDto**: Instruction images with metadata
- **GameInstructionDto**: Complete game instruction structure
- **CreateReviewDto**: User review creation payload
- **CreateFAQDto**: FAQ item creation payload
- **CreateGameContentDto**: Complete game content creation
- **UpdateGameContentDto**: Game content update payload
- **GameContent**: Full game content response
- **Response types**: Paginated and structured API responses

### 2. API Client Integration (`/lib/api-client.ts`)

- **Public endpoints**: Game browsing, search, content viewing
- **Admin endpoints**: Content creation, updates, deletion
- **Review management**: Add/delete reviews
- **FAQ management**: Add/delete FAQ items
- **Fully typed**: All endpoints use TypeScript interfaces

### 3. Service Layer (`/services/game-content-service.ts`)

- **GameContentService**: Complete service implementation
- **Error handling**: Proper error propagation
- **Type safety**: Full TypeScript integration
- **Async operations**: Promise-based API calls

## API Endpoints

### Public Endpoints

```typescript
// Get all games
GET /game-content
Response: GameListResponse

// Search games
GET /game-content/search?q={query}
Response: GameSearchResponse

// Get specific game content
GET /game-content/{gameId}
Response: GameContent

// Get game instruction
GET /game-content/{gameId}/instruction
Response: GameInstructionResponse

// Get game reviews (paginated)
GET /game-content/{gameId}/reviews?page={page}&limit={limit}
Response: GameReviewsResponse

// Get game FAQ
GET /game-content/{gameId}/faq
Response: GameFAQResponse
```

### Admin Endpoints (Require Authentication)

```typescript
// Create game content
POST / game - content;
Body: CreateGameContentDto;
Response: GameContent;

// Update game content
PUT / game - content / { gameId };
Body: UpdateGameContentDto;
Response: GameContent;

// Delete game content
DELETE / game - content / { gameId };
Response: {
  success: boolean;
  message: string;
}

// Add FAQ item
POST / game - content / { gameId } / faq;
Body: CreateFAQDto;
Response: GameFAQItem;

// Delete FAQ item
DELETE / game - content / { gameId } / faq / { faqId };
Response: {
  success: boolean;
  message: string;
}

// Delete review
DELETE / game - content / { gameId } / reviews / { reviewId };
Response: {
  success: boolean;
  message: string;
}
```

### Public Review Endpoint

```typescript
// Add review (public)
POST / game - content / { gameId } / reviews;
Body: CreateReviewDto;
Response: GameReview;
```

## Usage Examples

### Frontend Service Usage

```typescript
import { GameContentService } from "@/services";

// Get all games
const games = await GameContentService.getAllGames();

// Search for specific game
const searchResults = await GameContentService.searchGames("Bigo Live");

// Get game content
const gameContent = await GameContentService.getGameContent("bigo-live");

// Get reviews with pagination
const reviews = await GameContentService.getGameReviews("bigo-live", 1, 10);

// Admin: Create new game content
const newGame = await GameContentService.createGameContent({
  gameId: "new-game",
  gameName: "New Game",
  description: "Game description...",
  instruction: {
    steps: [{ id: "step-1", text: "First step" }],
    images: [],
    headerText: "How to play",
  },
});
```

### React Component Usage

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { GameContentService } from "@/services";

function GamesList() {
  const { data: games, isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: GameContentService.getAllGames,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {games?.games.map((game) => (
        <div key={game.gameId}>
          <h3>{game.gameName}</h3>
          <p>Rating: {game.averageRating}/5</p>
          <p>Reviews: {game.totalReviews}</p>
        </div>
      ))}
    </div>
  );
}

function GameContentForm() {
  const createMutation = useMutation({
    mutationFn: GameContentService.createGameContent,
    onSuccess: () => {
      // Handle success
    },
  });

  const handleSubmit = (data: CreateGameContentDto) => {
    createMutation.mutate(data);
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

## Data Structures

### Game Instruction Structure

```typescript
{
  steps: [
    {
      id: "step-1",
      text: "Войдите в приложение Bigo Live",
      highlight: "Bigo Live" // Optional highlight
    }
  ],
  images: [
    {
      id: "instruction-image",
      src: "/info-buy.png",
      alt: "Инструкция по покупке",
      width: 400, // Optional
      height: 200  // Optional
    }
  ],
  headerText: "Инструкция" // Optional
}
```

### Review Structure

```typescript
{
  userName: "Игорь К.",
  rating: 5, // 1-5
  comment: "Быстрая доставка алмазов!",
  verified: true // Optional
}
```

### FAQ Structure

```typescript
{
  question: "Как долго происходит начисление алмазов?",
  answer: "Обычно алмазы поступают на аккаунт в течение 5-15 минут после оплаты."
}
```

## File Structure

```
types/
└── game-content-dto.ts     # TypeScript types and interfaces

lib/
└── api-client.ts          # API client with game content endpoints

services/
├── game-content-service.ts # Service layer implementation
└── index.ts               # Service exports
```

## Authentication

Admin endpoints require JWT authentication. Include the Authorization header:

```typescript
Authorization: Bearer {jwt_token}
```

## Error Handling

All service methods return typed responses and proper error handling:

```typescript
try {
  const game = await GameContentService.getGameContent("game-id");
  // Handle success
} catch (error) {
  // Handle error
  console.error("Failed to fetch game content:", error);
}
```
