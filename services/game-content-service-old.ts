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
   * Delete game content
   */
  deleteGameContent: async (gameId: string): Promise<void> => {
    await api.gameContent.delete(gameId);
  },

  // Reviews methods
  /**
   * Add review to game
   */
  addReview: async (gameId: string, reviewData: CreateReviewDto): Promise<GameReview> => {
    const response = await api.gameContent.addReview(gameId, reviewData);
    return response.data;
  },

  /**
   * Delete review
   */
  deleteReview: async (gameId: string, reviewId: string): Promise<void> => {
    await api.gameContent.deleteReview(gameId, reviewId);
  },

  /**
   * Get review statistics
   */
  getReviewStats: async (gameId: string): Promise<any> => {
    const response = await api.gameContent.getReviewStats(gameId);
    return response.data;
  },

  /**
   * Get top reviews
   */
  getTopReviews: async (gameId: string, limit: number = 5): Promise<GameReview[]> => {
    const response = await api.gameContent.getTopReviews(gameId, limit);
    return response.data;
  },

  /**
   * Search reviews
   */
  searchReviews: async (gameId: string, query: string): Promise<GameReview[]> => {
    const response = await api.gameContent.searchReviews(gameId, query);
    return response.data;
  },

  /**
   * Get reviews by rating
   */
  getReviewsByRating: async (gameId: string, rating: number): Promise<GameReview[]> => {
    const response = await api.gameContent.getReviewsByRating(gameId, rating);
    return response.data;
  },

  /**
   * Mark review as spam
   */
  markReviewAsSpam: async (gameId: string, reviewId: string): Promise<void> => {
    await api.gameContent.markReviewAsSpam(gameId, reviewId);
  },

  /**
   * Export reviews
   */
  exportReviews: async (gameId?: string): Promise<any> => {
    const response = await api.gameContent.exportReviews(gameId);
    return response.data;
  },

  /**
   * Get all games review stats
   */
  getAllGamesReviewStats: async (): Promise<any> => {
    const response = await api.gameContent.getAllGamesReviewStats();
    return response.data;
  },

  // FAQ methods
  /**
   * Add FAQ item to game
   */
  addFAQItem: async (gameId: string, faqData: CreateFAQDto): Promise<GameFAQItem> => {
    const response = await api.gameContent.addFAQItem(gameId, faqData);
    return response.data;
  },

  /**
   * Delete FAQ item
   */
  deleteFAQItem: async (gameId: string, faqId: string): Promise<void> => {
    await api.gameContent.deleteFAQItem(gameId, faqId);
  },

  /**
   * Search FAQ
   */
  searchFAQ: async (gameId: string, query: string): Promise<GameFAQItem[]> => {
    const response = await api.gameContent.searchFAQ(gameId, query);
    return response.data;
  },

  /**
   * Get random FAQ items
   */
  getRandomFAQ: async (gameId: string, limit: number = 3): Promise<GameFAQItem[]> => {
    const response = await api.gameContent.getRandomFAQ(gameId, limit);
    return response.data;
  },

  /**
   * Get FAQ statistics
   */
  getFAQStats: async (gameId: string): Promise<any> => {
    const response = await api.gameContent.getFAQStats(gameId);
    return response.data;
  },

  /**
   * Update FAQ item
   */
  updateFAQItem: async (
    gameId: string, 
    faqId: string, 
    updateData: { question?: string; answer?: string }
  ): Promise<GameFAQItem> => {
    const response = await api.gameContent.updateFAQItem(gameId, faqId, updateData);
    return response.data;
  },

  /**
   * Generate FAQ item from template
   */
  generateFAQItem: async (gameId: string, template: string): Promise<GameFAQItem> => {
    const response = await api.gameContent.generateFAQItem(gameId, template);
    return response.data;
  },

  /**
   * Get FAQ for all games
   */
  getAllGamesFAQ: async (): Promise<any> => {
    const response = await api.gameContent.getAllGamesFAQ();
    return response.data;
  },

  /**
   * Export FAQ data
   */
  exportFAQ: async (gameId?: string): Promise<any> => {
    const response = await api.gameContent.exportFAQ(gameId);
    return response.data;
  },
};

  /**
   * Get review statistics
   */
  getReviewStats: async (gameId: string): Promise<any> => {
    const response = await api.gameContent.getReviewStats(gameId);
    return response.data;
  },

  /**
   * Get top reviews
   */
  getTopReviews: async (gameId: string, limit: number = 5): Promise<GameReview[]> => {
    const response = await api.gameContent.getTopReviews(gameId, limit);
    return response.data;
  },

  /**
   * Search reviews
   */
  searchReviews: async (gameId: string, query: string): Promise<GameReview[]> => {
    const response = await api.gameContent.searchReviews(gameId, query);
    return response.data;
  },

  /**
   * Get reviews by rating
   */
  getReviewsByRating: async (gameId: string, rating: number): Promise<GameReview[]> => {
    const response = await api.gameContent.getReviewsByRating(gameId, rating);
    return response.data;
  },

  /**
   * Mark review as spam
   */
  markReviewAsSpam: async (gameId: string, reviewId: string): Promise<void> => {
    await api.gameContent.markReviewAsSpam(gameId, reviewId);
  },

  /**
   * Export reviews
   */
  exportReviews: async (gameId?: string): Promise<any> => {
    const response = await api.gameContent.exportReviews(gameId);
    return response.data;
  },

  /**
   * Get all games review stats
   */
  getAllGamesReviewStats: async (): Promise<any> => {
    const response = await api.gameContent.getAllGamesReviewStats();
    return response.data;
  },

  // FAQ methods
  /**
   * Add FAQ item to game
   */
  addFAQItem: async (gameId: string, faqData: CreateFAQDto): Promise<GameFAQItem> => {
    const response = await api.gameContent.addFAQItem(gameId, faqData);
    return response.data;
  },

  /**
   * Delete FAQ item
   */
  deleteFAQItem: async (gameId: string, faqId: string): Promise<void> => {
    await api.gameContent.deleteFAQItem(gameId, faqId);
  },

  /**
   * Search FAQ
   */
  searchFAQ: async (gameId: string, query: string): Promise<GameFAQItem[]> => {
    const response = await api.gameContent.searchFAQ(gameId, query);
    return response.data;
  },

  /**
   * Get random FAQ items
   */
  getRandomFAQ: async (gameId: string, limit: number = 3): Promise<GameFAQItem[]> => {
    const response = await api.gameContent.getRandomFAQ(gameId, limit);
    return response.data;
  },

  /**
   * Get FAQ statistics
   */
  getFAQStats: async (gameId: string): Promise<any> => {
    const response = await api.gameContent.getFAQStats(gameId);
    return response.data;
  },

  /**
   * Update FAQ item
   */
  updateFAQItem: async (
    gameId: string, 
    faqId: string, 
    updateData: { question?: string; answer?: string }
  ): Promise<GameFAQItem> => {
    const response = await api.gameContent.updateFAQItem(gameId, faqId, updateData);
    return response.data;
  },

  /**
   * Generate FAQ item from template
   */
  generateFAQItem: async (gameId: string, template: string): Promise<GameFAQItem> => {
    const response = await api.gameContent.generateFAQItem(gameId, template);
    return response.data;
  },

  /**
   * Get FAQ for all games
   */
  getAllGamesFAQ: async (): Promise<any> => {
    const response = await api.gameContent.getAllGamesFAQ();
    return response.data;
  },

  /**
   * Export FAQ data
   */
  exportFAQ: async (gameId?: string): Promise<any> => {
    const response = await api.gameContent.exportFAQ(gameId);
    return response.data;
  },
};

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
