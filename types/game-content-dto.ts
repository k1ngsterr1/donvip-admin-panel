// Game Content DTOs for Frontend
export interface InstructionStepDto {
  id: string;
  text: string;
  text_en?: string;
  highlight?: string;
  highlight_en?: string;
}

export interface InstructionImageDto {
  id: string;
  src: string;
  alt: string;
  alt_en?: string;
  width?: number;
  height?: number;
}

export interface GameInstructionDto {
  headerText: string;
  headerText_en?: string;
  steps: InstructionStepDto[];
  images: InstructionImageDto[];
}

export interface CreateReviewDto {
  userName: string;
  userName_en?: string;
  rating: number; // 1-5
  comment: string;
  comment_en?: string;
  verified?: boolean;
}

export interface CreateFAQDto {
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
}

export interface CreateGameContentDto {
  gameId: string; // Выбирается из существующих игр
  gameName?: string; // Опциональное название игры
  gameName_en?: string;
  title?: string; // Заголовок игры
  title_en?: string;
  instruction: GameInstructionDto;
  description: string;
  description_en?: string;
  descriptionImage?: string; // Изображение для описания
  mainDescription?: string; // Основное описание игры
  mainDescription_en?: string;
  reviews?: CreateReviewDto[];
  faq?: CreateFAQDto[];
}

export interface UpdateGameContentDto {
  gameName?: string;
  gameName_en?: string;
  title?: string; // Заголовок игры
  title_en?: string;
  instruction?: GameInstructionDto;
  description?: string;
  description_en?: string;
  descriptionImage?: string; // Изображение для описания
  mainDescription?: string; // Основное описание игры
  mainDescription_en?: string;
  reviews?: CreateReviewDto[];
  faq?: CreateFAQDto[];
}

export interface GameContentResponseDto {
  gameId: string;
  gameName: string;
  gameName_en?: string;
  title?: string; // Заголовок игры
  title_en?: string;
  instruction: GameInstructionDto;
  description: string;
  description_en?: string;
  descriptionImage?: string; // Изображение для описания
  mainDescription?: string; // Основное описание игры
  mainDescription_en?: string;
  totalReviews: number;
  averageRating: number;
  totalFAQItems: number;
  lastUpdated: string;
}

// Additional types for API responses
export interface GameReview {
  id: string;
  userName: string;
  userName_en?: string;
  rating: number;
  comment: string;
  comment_en?: string;
  verified: boolean;
  date: string;
  createdAt: string;
}

export interface GameFAQItem {
  id: string;
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
  order?: number;
}

export interface GameContent {
  gameId: string;
  gameName: string;
  gameName_en?: string;
  title?: string; // Заголовок игры
  title_en?: string;
  instruction: GameInstructionDto;
  description: string;
  description_en?: string;
  descriptionImage?: string; // Изображение для описания
  mainDescription?: string; // Основное описание игры
  mainDescription_en?: string;
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
    gameName_en?: string;
    title?: string; // Заголовок игры
    title_en?: string;
    description: string;
    description_en?: string;
    mainDescription?: string; // Основное описание игры
    mainDescription_en?: string;
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
    gameName_en?: string;
    title?: string; // Заголовок игры
    title_en?: string;
    description: string;
    description_en?: string;
    mainDescription?: string; // Основное описание игры
    mainDescription_en?: string;
    averageRating: number;
  }>;
  total: number;
  query: string;
}

export interface GameInstructionResponse {
  gameId: string;
  gameName: string;
  gameName_en?: string;
  title?: string; // Заголовок игры
  title_en?: string;
  instruction: GameInstructionDto;
}

export interface GameReviewsResponse {
  gameId: string;
  gameName?: string;
  gameName_en?: string;
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
  gameName?: string;
  gameName_en?: string;
  faq: GameFAQItem[];
  total: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  message_en?: string;
}

// Additional interfaces for comprehensive English support
export interface UpdateReviewDto {
  userName?: string;
  userName_en?: string;
  rating?: number; // 1-5
  comment?: string;
  comment_en?: string;
  verified?: boolean;
}

export interface UpdateFAQDto {
  question?: string;
  question_en?: string;
  answer?: string;
  answer_en?: string;
  order?: number;
}

export interface UpdateInstructionStepDto {
  id: string;
  text?: string;
  text_en?: string;
  highlight?: string;
  highlight_en?: string;
}

export interface UpdateInstructionImageDto {
  id: string;
  src?: string;
  alt?: string;
  alt_en?: string;
  width?: number;
  height?: number;
}

export interface UpdateGameInstructionDto {
  headerText?: string;
  headerText_en?: string;
  steps?: UpdateInstructionStepDto[];
  images?: UpdateInstructionImageDto[];
}

// Language helper types
export type SupportedLanguage = "ru" | "en";

export interface LocalizedText {
  ru: string;
  en?: string;
}

export interface GameContentLocalization {
  gameName: LocalizedText;
  title?: LocalizedText;
  description: LocalizedText;
  mainDescription?: LocalizedText;
  instruction: {
    headerText: LocalizedText;
    steps: Array<{
      id: string;
      text: LocalizedText;
      highlight?: LocalizedText;
    }>;
    images: Array<{
      id: string;
      src: string;
      alt: LocalizedText;
      width?: number;
      height?: number;
    }>;
  };
  reviews?: Array<{
    id: string;
    userName: LocalizedText;
    rating: number;
    comment: LocalizedText;
    verified: boolean;
    date: string;
    createdAt: string;
  }>;
  faq?: Array<{
    id: string;
    question: LocalizedText;
    answer: LocalizedText;
    order?: number;
  }>;
}

// API Response interfaces with full language support
export interface GameContentFullResponse {
  gameId: string;
  content: GameContentLocalization;
  metadata: {
    totalReviews: number;
    averageRating: number;
    totalFAQItems: number;
    lastUpdated: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    supportedLanguages: SupportedLanguage[];
  };
}

export interface GameListFullResponse {
  games: Array<{
    gameId: string;
    content: {
      gameName: LocalizedText;
      title?: LocalizedText;
      description: LocalizedText;
      mainDescription?: LocalizedText;
    };
    metadata: {
      totalReviews: number;
      averageRating: number;
      lastUpdated: string;
      isActive: boolean;
      supportedLanguages: SupportedLanguage[];
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metadata: {
    totalGames: number;
    activeGames: number;
    supportedLanguages: SupportedLanguage[];
  };
}

// Bulk operations interfaces
export interface BulkUpdateGameContentDto {
  gameIds: string[];
  updates: Partial<UpdateGameContentDto>;
}

export interface BulkDeleteResponse {
  success: boolean;
  deleted: string[];
  failed: Array<{
    gameId: string;
    error: string;
    error_en?: string;
  }>;
  message: string;
  message_en?: string;
}

// Language switching interfaces
export interface LanguageSwitchRequest {
  gameId: string;
  targetLanguage: SupportedLanguage;
  fallbackLanguage?: SupportedLanguage;
}

export interface LanguageSwitchResponse {
  gameId: string;
  language: SupportedLanguage;
  content: GameContentResponseDto;
  hasTranslation: boolean;
  missingTranslations: string[]; // Array of field names that don't have translation
}
