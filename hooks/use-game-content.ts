"use client";

import { useState, useCallback } from "react";
import {
  UpdateGameContentDto,
  GameContentResponseDto,
  CreateGameContentDto,
  DeleteResponse,
} from "@/types/game-content-dto";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

interface UseGameContentReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Game Content Operations
  createGameContent: (
    data: CreateGameContentDto
  ) => Promise<GameContentResponseDto | null>;
  updateGameContent: (
    gameId: string,
    data: UpdateGameContentDto
  ) => Promise<GameContentResponseDto | null>;
  getGameContent: (gameId: string) => Promise<GameContentResponseDto | null>;
  deleteGameContent: (gameId: string) => Promise<boolean>;

  // Utility functions
  clearError: () => void;
}

export function useGameContent(): UseGameContentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      successMessage?: string,
      errorMessage?: string
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiCall();

        if (successMessage) {
          toast({
            title: "Успешно",
            description: successMessage,
            variant: "default",
          });
        }

        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : errorMessage || "Произошла ошибка";
        setError(message);

        toast({
          title: "Ошибка",
          description: message,
          variant: "destructive",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const createGameContent = useCallback(
    async (
      data: CreateGameContentDto
    ): Promise<GameContentResponseDto | null> => {
      return handleApiCall(
        async () => {
          const response = await apiClient.post("/game-content", data);
          return response.data;
        },
        "Игровой контент успешно создан",
        "Ошибка при создании игрового контента"
      );
    },
    [handleApiCall]
  );

  const updateGameContent = useCallback(
    async (
      gameId: string,
      data: UpdateGameContentDto
    ): Promise<GameContentResponseDto | null> => {
      return handleApiCall(
        async () => {
          const response = await apiClient.patch(
            `/game-content/${gameId}`,
            data
          );
          return response.data;
        },
        "Игровой контент успешно обновлен",
        "Ошибка при обновлении игрового контента"
      );
    },
    [handleApiCall]
  );

  const getGameContent = useCallback(
    async (gameId: string): Promise<GameContentResponseDto | null> => {
      return handleApiCall(
        async () => {
          console.log(`🔍 Fetching game content for: ${gameId}`);

          const response = await apiClient.get(`/game-content/${gameId}`);

          console.log(`📊 Response status: ${response.status}`);
          console.log(`✅ Received data:`, response.data);

          return response.data;
        },
        undefined,
        "Ошибка при загрузке игрового контента"
      );
    },
    [handleApiCall]
  );

  const deleteGameContent = useCallback(
    async (gameId: string): Promise<boolean> => {
      const result = await handleApiCall(
        async () => {
          const response = await apiClient.delete(`/game-content/${gameId}`);
          const data: DeleteResponse = response.data;
          return data.success;
        },
        "Игровой контент успешно удален",
        "Ошибка при удалении игрового контента"
      );

      return result || false;
    },
    [handleApiCall]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    createGameContent,
    updateGameContent,
    getGameContent,
    deleteGameContent,
    clearError,
  };
}

// Дополнительный хук для работы со списком игрового контента
export function useGameContentList() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getGameContentList = useCallback(
    async (params?: { page?: number; limit?: number; search?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set("page", params.page.toString());
        if (params?.limit) searchParams.set("limit", params.limit.toString());
        if (params?.search) searchParams.set("search", params.search);

        const response = await apiClient.get(
          `/game-content?${searchParams.toString()}`
        );
        return response.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Произошла ошибка";
        setError(message);

        toast({
          title: "Ошибка",
          description: message,
          variant: "destructive",
        });

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    isLoading,
    error,
    getGameContentList,
    clearError: () => setError(null),
  };
}

// Хук для работы с отдельными компонентами (отзывы, FAQ)
export function useGameContentComponents() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateReviews = useCallback(
    async (gameId: string, reviews: any[]) => {
      setIsLoading(true);
      try {
        const response = await apiClient.patch(
          `/game-content/${gameId}/reviews`,
          { reviews }
        );

        toast({
          title: "Успешно",
          description: "Отзывы успешно обновлены",
        });

        return response.data;
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Ошибка при обновлении отзывов",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const updateFAQ = useCallback(
    async (gameId: string, faq: any[]) => {
      setIsLoading(true);
      try {
        const response = await apiClient.patch(`/game-content/${gameId}/faq`, {
          faq,
        });

        toast({
          title: "Успешно",
          description: "FAQ успешно обновлены",
        });

        return response.data;
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Ошибка при обновлении FAQ",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    isLoading,
    updateReviews,
    updateFAQ,
  };
}
