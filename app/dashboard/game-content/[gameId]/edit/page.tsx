"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameContentEditForm } from "@/components/game-content/game-content-edit-form";
import { useGameContent } from "@/hooks/use-game-content";
import { GameContentResponseDto } from "@/types/game-content-dto";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface GameContentEditPageProps {
  params: {
    gameId: string;
  };
}

export default function GameContentEditPage({
  params,
}: GameContentEditPageProps) {
  const router = useRouter();
  const { getGameContent, updateGameContent, isLoading, error } =
    useGameContent();
  const [gameContent, setGameContent] = useState<GameContentResponseDto | null>(
    null
  );
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadGameContent = async () => {
      setIsLoadingData(true);
      const data = await getGameContent(params.gameId);
      if (data) {
        setGameContent(data);
      }
      setIsLoadingData(false);
    };

    loadGameContent();
  }, [params.gameId, getGameContent]);

  const handleSubmit = async (data: any) => {
    const result = await updateGameContent(params.gameId, data);
    if (result) {
      router.push("/dashboard/game-content");
    }
  };

  const handleBack = () => {
    router.push("/dashboard/game-content");
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !gameContent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ошибка загрузки</h1>
            <p className="text-muted-foreground">Игровой контент не найден</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">
                  Не удалось загрузить игровой контент
                </p>
                <p className="text-sm text-muted-foreground">
                  {error || "Игра с указанным ID не найдена"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleBack}>Вернуться к списку игр</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            Редактирование игрового контента
          </h1>
          <p className="text-muted-foreground">
            Редактируйте контент для игры: {gameContent.gameName}
          </p>
        </div>
      </div>

      <GameContentEditForm
        gameContent={gameContent}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
