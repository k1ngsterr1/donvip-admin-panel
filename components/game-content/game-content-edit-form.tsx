"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  UpdateGameContentDto,
  GameContentResponseDto,
  SupportedLanguage,
  GameInstructionDto,
  CreateReviewDto,
  CreateFAQDto,
} from "@/types/game-content-dto";
import {
  LanguageToggle,
  InstructionEditor,
  ReviewsEditor,
  FAQEditor,
  ImageUpload,
} from "@/components/game-content";

interface GameContentEditFormProps {
  gameContent: GameContentResponseDto;
  onSubmit: (data: UpdateGameContentDto) => Promise<void>;
  isLoading?: boolean;
}

export function GameContentEditForm({
  gameContent,
  onSubmit,
  isLoading = false,
}: GameContentEditFormProps) {
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>("ru");
  const [formData, setFormData] = useState<UpdateGameContentDto>({
    gameName: gameContent.gameName,
    gameName_en: gameContent.gameName_en,
    title: gameContent.title,
    title_en: gameContent.title_en,
    description: gameContent.description,
    description_en: gameContent.description_en,
    mainDescription: gameContent.mainDescription,
    mainDescription_en: gameContent.mainDescription_en,
    instruction: gameContent.instruction,
    descriptionImage: gameContent.descriptionImage,
  });

  const updateField = (field: keyof UpdateGameContentDto, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const hasEnglishContent = !!(
    gameContent.gameName_en ||
    gameContent.title_en ||
    gameContent.description_en ||
    gameContent.mainDescription_en
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with Language Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">
            Редактирование игрового контента
          </h2>
          <p className="text-muted-foreground">
            ID игры: <Badge variant="secondary">{gameContent.gameId}</Badge>
          </p>
        </div>
        <LanguageToggle
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          hasTranslation={hasEnglishContent}
        />
      </div>

      <Separator />

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Основная информация</TabsTrigger>
          <TabsTrigger value="instruction">Инструкции</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Основная информация
                <Badge
                  variant={currentLanguage === "ru" ? "default" : "secondary"}
                >
                  {currentLanguage === "ru" ? "RU" : "EN"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Game Name */}
              <div className="space-y-2">
                <Label htmlFor="gameName">
                  Название игры {currentLanguage === "en" && "(English)"}
                </Label>
                <Input
                  id="gameName"
                  value={
                    currentLanguage === "ru"
                      ? formData.gameName
                      : formData.gameName_en || ""
                  }
                  onChange={(e) =>
                    updateField(
                      currentLanguage === "ru" ? "gameName" : "gameName_en",
                      e.target.value
                    )
                  }
                  placeholder={
                    currentLanguage === "ru"
                      ? "Введите название игры"
                      : "Enter game name"
                  }
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Заголовок {currentLanguage === "en" && "(English)"}
                </Label>
                <Input
                  id="title"
                  value={
                    currentLanguage === "ru"
                      ? formData.title || ""
                      : formData.title_en || ""
                  }
                  onChange={(e) =>
                    updateField(
                      currentLanguage === "ru" ? "title" : "title_en",
                      e.target.value
                    )
                  }
                  placeholder={
                    currentLanguage === "ru"
                      ? "Введите заголовок"
                      : "Enter title"
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Описание {currentLanguage === "en" && "(English)"}
                </Label>
                <Textarea
                  id="description"
                  value={
                    currentLanguage === "ru"
                      ? formData.description
                      : formData.description_en || ""
                  }
                  onChange={(e) =>
                    updateField(
                      currentLanguage === "ru"
                        ? "description"
                        : "description_en",
                      e.target.value
                    )
                  }
                  placeholder={
                    currentLanguage === "ru"
                      ? "Введите описание игры"
                      : "Enter game description"
                  }
                  rows={4}
                />
              </div>

              {/* Main Description */}
              <div className="space-y-2">
                <Label htmlFor="mainDescription">
                  Подробное описание {currentLanguage === "en" && "(English)"}
                </Label>
                <Textarea
                  id="mainDescription"
                  value={
                    currentLanguage === "ru"
                      ? formData.mainDescription || ""
                      : formData.mainDescription_en || ""
                  }
                  onChange={(e) =>
                    updateField(
                      currentLanguage === "ru"
                        ? "mainDescription"
                        : "mainDescription_en",
                      e.target.value
                    )
                  }
                  placeholder={
                    currentLanguage === "ru"
                      ? "Введите подробное описание"
                      : "Enter detailed description"
                  }
                  rows={6}
                />
              </div>

              {/* Description Image */}
              <ImageUpload
                value={formData.descriptionImage || ""}
                onChange={(url) => updateField("descriptionImage", url)}
                type="description"
                label="Изображение для описания"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instruction">
          <InstructionEditor
            instruction={formData.instruction}
            currentLanguage={currentLanguage}
            onChange={(instruction: GameInstructionDto) =>
              updateField("instruction", instruction)
            }
          />
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <ReviewsEditor
            reviews={formData.reviews || []}
            currentLanguage={currentLanguage}
            onChange={(reviews: CreateReviewDto[]) =>
              updateField("reviews", reviews)
            }
          />
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <FAQEditor
            faq={formData.faq || []}
            currentLanguage={currentLanguage}
            onChange={(faq: CreateFAQDto[]) => updateField("faq", faq)}
          />
        </TabsContent>
      </Tabs>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </div>
    </form>
  );
}
