// Game Content DTOs for Frontend
export interface InstructionStepDto {
  id: string;
  text: string;
  highlight?: string;
}

export interface InstructionImageDto {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface GameInstructionDto {
  headerText: string;
  steps: InstructionStepDto[];
  images: InstructionImageDto[];
}

export interface CreateReviewDto {
  userName: string;
  rating: number; // 1-5
  comment: string;
  verified?: boolean;
}

export interface CreateFAQDto {
  question: string;
  answer: string;
}

export interface CreateGameContentDto {
  gameId: string; // Выбирается из существующих игр
  instruction: GameInstructionDto;
  description: string;
  reviews?: CreateReviewDto[];
  faq?: CreateFAQDto[];
}

export interface UpdateGameContentDto {
  gameName?: string;
  instruction?: GameInstructionDto;
  description?: string;
  reviews?: CreateReviewDto[];
  faq?: CreateFAQDto[];
}

export interface GameContentResponseDto {
  gameId: string;
  gameName: string;
  instruction: GameInstructionDto;
  description: string;
  totalReviews: number;
  averageRating: number;
  totalFAQItems: number;
  lastUpdated: string;
}

// Additional types for API responses
export interface GameReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
  createdAt: string;
}

export interface GameFAQItem {
  id: string;
  question: string;
  answer: string;
  order?: number;
}

export interface GameContent {
  gameId: string;
  gameName: string;
  instruction: GameInstructionDto;
  description: string;
  reviews: GameReview[];
  faq: GameFAQItem[];
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameListResponse {
  games: Array<{
    gameId: string;
    gameName: string;
    description: string;
    totalReviews: number;
    averageRating: number;
    lastUpdated: string;
    isActive?: boolean;
  }>;
  total: number;
}

export interface GameSearchResponse {
  results: Array<{
    gameId: string;
    gameName: string;
    description: string;
    averageRating: number;
  }>;
  total: number;
  query: string;
}

export interface GameInstructionResponse {
  gameId: string;
  gameName: string;
  instruction: GameInstructionDto;
}

export interface GameReviewsResponse {
  gameId: string;
  reviews: GameReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  averageRating: number;
}

export interface GameFAQResponse {
  gameId: string;
  faq: GameFAQItem[];
  total: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
