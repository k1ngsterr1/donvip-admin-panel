import { api } from "@/lib/api-client";
import {
  CreateGameContentDto,
  UpdateGameContentDto,
  CreateReviewDto,
  CreateFAQDto,
  GameContent,
  GameListResponse,
  GameSearchResponse,
  GameInstructionResponse,
  GameReviewsResponse,
  GameFAQResponse,
  GameReview,
  GameFAQItem,
} from "@/types/game-content-dto";

export const GameContentService = {
  /**
   * Get all available games (for content creation)
   */
  getAvailableGames: async (): Promise<
    Array<{ gameId: string; gameName: string }>
  > => {
    const response = await api.apiClient.get("/games/available");
    return response.data;
  },

  /**
   * Get all games with content
   */
  getAllGames: async (): Promise<GameListResponse> => {
    const response = await api.gameContent.getAll();
    return response.data;
  },

  /**
   * Search games by name
   */
  searchGames: async (query: string): Promise<GameSearchResponse> => {
    const response = await api.gameContent.search(query);
    return response.data;
  },

  /**
   * Get game content by ID
   */
  getGameContent: async (gameId: string): Promise<GameContent> => {
    const response = await api.gameContent.getById(gameId);
    return response.data;
  },

  /**
   * Get game instruction
   */
  getGameInstruction: async (
    gameId: string
  ): Promise<GameInstructionResponse> => {
    const response = await api.gameContent.getInstruction(gameId);
    return response.data;
  },

  /**
   * Get game reviews with pagination
   */
  getGameReviews: async (
    gameId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<GameReviewsResponse> => {
    const response = await api.gameContent.getReviews(gameId, page, limit);
    return response.data;
  },

  /**
   * Get game FAQ
   */
  getGameFAQ: async (gameId: string): Promise<GameFAQResponse> => {
    const response = await api.gameContent.getFAQ(gameId);
    return response.data;
  },

  /**
   * Create new game content (Admin)
   */
  createGameContent: async (
    data: CreateGameContentDto
  ): Promise<GameContent> => {
    const response = await api.gameContent.create(data);
    return response.data;
  },

  /**
   * Update game content (Admin)
   */
  updateGameContent: async (
    gameId: string,
    data: UpdateGameContentDto
  ): Promise<GameContent> => {
    const response = await api.gameContent.update(gameId, data);
    return response.data;
  },

  /**
   * Delete game content (Admin)
   */
  deleteGameContent: async (
    gameId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.gameContent.delete(gameId);
    return response.data;
  },

  /**
   * Add review to game
   */
  addReview: async (
    gameId: string,
    data: CreateReviewDto
  ): Promise<GameReview> => {
    const response = await api.gameContent.addReview(gameId, data);
    return response.data;
  },

  /**
   * Delete review (Admin)
   */
  deleteReview: async (
    gameId: string,
    reviewId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.gameContent.deleteReview(gameId, reviewId);
    return response.data;
  },

  /**
   * Add FAQ item to game (Admin)
   */
  addFAQItem: async (
    gameId: string,
    data: CreateFAQDto
  ): Promise<GameFAQItem> => {
    const response = await api.gameContent.addFAQ(gameId, data);
    return response.data;
  },

  /**
   * Delete FAQ item (Admin)
   */
  deleteFAQItem: async (
    gameId: string,
    faqId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.gameContent.deleteFAQ(gameId, faqId);
    return response.data;
  },
};
