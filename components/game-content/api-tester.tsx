"use client";

import { useState } from "react";
import { useGameContent } from "@/hooks/use-game-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Download,
  Upload,
  Trash,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export function GameContentApiTester() {
  const {
    getGameContent,
    createGameContent,
    updateGameContent,
    deleteGameContent,
    isLoading,
  } = useGameContent();
  const [gameId, setGameId] = useState("bigo");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<string>("");
  const [operationStatus, setOperationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleApiCall = async (
    operation: string,
    apiCall: () => Promise<any>
  ) => {
    setLastOperation(operation);
    setOperationStatus("loading");
    setApiError(null);
    setApiResponse(null);

    try {
      const result = await apiCall();
      setApiResponse(result);
      setOperationStatus("success");
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Неизвестная ошибка"
      );
      setOperationStatus("error");
    }
  };

  const testGetGameContent = () => {
    handleApiCall(`GET /game-content/${gameId}`, () => getGameContent(gameId));
  };

  const testCreateGameContent = () => {
    const sampleData = {
      gameId: `test-${Date.now()}`,
      gameName: "Test Game",
      gameName_en: "Test Game EN",
      title: "Тестовая игра",
      title_en: "Test Game",
      instruction: {
        headerText: "Инструкция",
        headerText_en: "Instruction",
        steps: [
          {
            id: `step-${Date.now()}`,
            text: "Первый шаг",
            text_en: "First step",
          },
        ],
        images: [],
      },
      description: "Описание тестовой игры",
      description_en: "Test game description",
      descriptionImage: "https://example.com/image.jpg",
      mainDescription: "Основное описание",
      mainDescription_en: "Main description",
      reviews: [],
      faq: [],
    };

    handleApiCall("POST /game-content", () => createGameContent(sampleData));
  };

  const testUpdateGameContent = () => {
    const updateData = {
      title: `Обновленное название ${Date.now()}`,
      title_en: `Updated title ${Date.now()}`,
      description: "Обновленное описание",
      description_en: "Updated description",
    };

    handleApiCall(`PUT /game-content/${gameId}`, () =>
      updateGameContent(gameId, updateData)
    );
  };

  const testDeleteGameContent = () => {
    handleApiCall(`DELETE /game-content/${gameId}`, () =>
      deleteGameContent(gameId)
    );
  };

  const getStatusIcon = () => {
    switch (operationStatus) {
      case "loading":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (operationStatus) {
      case "loading":
        return (
          <Badge variant="outline" className="text-blue-500">
            Выполняется
          </Badge>
        );
      case "success":
        return (
          <Badge variant="outline" className="text-green-500">
            Успешно
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Ошибка</Badge>;
      default:
        return <Badge variant="secondary">Готов</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="h-5 w-5" />
          <span>API Тестер Game Content</span>
          {getStatusIcon()}
          {getStatusBadge()}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Тестирование API endpoints для игрового контента
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Game ID Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Game ID для тестирования:
          </label>
          <Input
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Введите ID игры (например: bigo)"
            className="max-w-md"
          />
        </div>

        {/* API Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={testGetGameContent}
            disabled={isLoading || !gameId}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>GET</span>
          </Button>

          <Button
            onClick={testCreateGameContent}
            disabled={isLoading}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>CREATE</span>
          </Button>

          <Button
            onClick={testUpdateGameContent}
            disabled={isLoading || !gameId}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>UPDATE</span>
          </Button>

          <Button
            onClick={testDeleteGameContent}
            disabled={isLoading || !gameId}
            variant="outline"
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
            <span>DELETE</span>
          </Button>
        </div>

        {/* Last Operation Info */}
        {lastOperation && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Последняя операция:</span>
              <Badge variant="outline">{lastOperation}</Badge>
            </div>
          </div>
        )}

        <Separator />

        {/* API Response */}
        {(apiResponse || apiError) && (
          <div className="space-y-3">
            <h4 className="font-medium">Результат API запроса:</h4>

            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-700 mb-2">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Ошибка:</span>
                </div>
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            )}

            {apiResponse && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Успешный ответ:</span>
                </div>

                <Textarea
                  value={JSON.stringify(apiResponse, null, 2)}
                  readOnly
                  className="font-mono text-xs min-h-[200px] max-h-[400px]"
                />

                {/* Quick Info */}
                {apiResponse && typeof apiResponse === "object" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>Game ID:</strong> {apiResponse.gameId || "N/A"}
                      </div>
                      <div>
                        <strong>Game Name:</strong>{" "}
                        {apiResponse.gameName || "N/A"}
                      </div>
                      <div>
                        <strong>Game Name (EN):</strong>{" "}
                        {apiResponse.gameName_en || "N/A"}
                      </div>
                      <div>
                        <strong>Title:</strong> {apiResponse.title || "N/A"}
                      </div>
                      <div>
                        <strong>Title (EN):</strong>{" "}
                        {apiResponse.title_en || "N/A"}
                      </div>
                      <div>
                        <strong>Last Updated:</strong>{" "}
                        {apiResponse.lastUpdated || "N/A"}
                      </div>
                      {apiResponse.instruction && (
                        <div>
                          <strong>Instructions:</strong>{" "}
                          {apiResponse.instruction.steps?.length || 0} шагов
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* API Info */}
        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Base URL:</strong> http://api.don-vip.com
          </p>
          <p>
            <strong>Authentication:</strong> Bearer token (автоматически
            добавляется)
          </p>
          <p>
            <strong>Content-Type:</strong> application/json
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
