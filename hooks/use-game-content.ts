"use client";

import { useState, useCallback } from "react";
import {
  UpdateGameContentDto,
  GameContentResponseDto,
  CreateGameContentDto,
  DeleteResponse,
} from "@/types/game-content-dto";
import { useToast } from "@/hooks/use-toast";

// API конфигурация для реального эндпоинта
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://admin-panel.don-vip.com/api";

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
          const response = await fetch(`${API_BASE_URL}/game-content`, {
            method: "POST",
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error("Ошибка при создании игрового контента");
          }

          return response.json();
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
          const response = await fetch(
            `${API_BASE_URL}/game-content/${gameId}`,
            {
              method: "PATCH",
              headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(data),
            }
          );

          if (!response.ok) {
            throw new Error("Ошибка при обновлении игрового контента");
          }

          return response.json();
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
          console.log(`📡 API URL: ${API_BASE_URL}/game-content/${gameId}`);

          const response = await fetch(
            `${API_BASE_URL}/game-content/${gameId}`,
            {
              method: "GET",
              headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
              },
              credentials: "include", // Для отправки cookies
            }
          );

          console.log(`📊 Response status: ${response.status}`);
          console.log(`📊 Response ok: ${response.ok}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error: ${response.status} - ${errorText}`);
            throw new Error(
              `Ошибка при получении игрового контента: ${response.status}`
            );
          }

          const data = await response.json();
          console.log(`✅ Received data:`, data);
          return data;
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
          const response = await fetch(
            `${API_BASE_URL}/game-content/${gameId}`,
            {
              method: "DELETE",
              headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error("Ошибка при удалении игрового контента");
          }

          const data: DeleteResponse = await response.json();
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

        const response = await fetch(
          `${API_BASE_URL}/game-content?${searchParams.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при получении списка игрового контента");
        }

        return await response.json();
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
        const response = await fetch(
          `${API_BASE_URL}/game-content/${gameId}/reviews`,
          {
            method: "PATCH",
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ reviews }),
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при обновлении отзывов");
        }

        toast({
          title: "Успешно",
          description: "Отзывы успешно обновлены",
        });

        return await response.json();
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
        const response = await fetch(
          `${API_BASE_URL}/game-content/${gameId}/faq`,
          {
            method: "PATCH",
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ faq }),
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при обновлении FAQ");
        }

        toast({
          title: "Успешно",
          description: "FAQ успешно обновлены",
        });

        return await response.json();
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
