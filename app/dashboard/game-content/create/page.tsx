'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameContentEditForm } from '@/components/game-content/game-content-edit-form';
import { useGameContent } from '@/hooks/use-game-content';
import { CreateGameContentDto, GameContentResponseDto } from '@/types/game-content-dto';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GameContentCreatePage() {
  const router = useRouter();
  const { createGameContent, isLoading } = useGameContent();

  // Создаем пустую структуру для нового контента
  const emptyGameContent: GameContentResponseDto = {
    gameId: '',
    gameName: '',
    gameName_en: '',
    title: '',
    title_en: '',
    instruction: {
      headerText: '',
      headerText_en: '',
      steps: [],
      images: []
    },
    description: '',
    description_en: '',
    descriptionImage: '',
    mainDescription: '',
    mainDescription_en: '',
    totalReviews: 0,
    averageRating: 0,
    totalFAQItems: 0,
    lastUpdated: new Date().toISOString()
  };

  const handleSubmit = async (data: any) => {
    // Преобразуем в CreateGameContentDto
    const createData: CreateGameContentDto = {
      gameId: data.gameId || `game-${Date.now()}`, // Генерируем ID если не указан
      gameName: data.gameName,
      gameName_en: data.gameName_en,
      title: data.title,
      title_en: data.title_en,
      instruction: data.instruction,
      description: data.description,
      description_en: data.description_en,
      descriptionImage: data.descriptionImage,
      mainDescription: data.mainDescription,
      mainDescription_en: data.mainDescription_en,
      reviews: data.reviews || [],
      faq: data.faq || []
    };

    const result = await createGameContent(createData);
    if (result) {
      router.push('/dashboard/game-content');
    }
  };

  const handleBack = () => {
    router.push('/dashboard/game-content');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Создание игрового контента</h1>
          <p className="text-muted-foreground">
            Создайте новый игровой контент с поддержкой двух языков
          </p>
        </div>
      </div>

      <GameContentEditForm
        gameContent={emptyGameContent}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}