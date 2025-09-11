"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Image as ImageIcon, Type } from "lucide-react";
import { GameContentService } from "@/services/game-content-service";
import {
  GameContent,
  CreateGameContentDto,
  UpdateGameContentDto,
  InstructionStepDto,
  InstructionImageDto,
} from "@/types/game-content-dto";

interface GameContentFormProps {
  gameContent?: GameContent;
  onSuccess: () => void;
}

interface FormData {
  gameId: string;
  gameName: string;
  description: string;
  instruction: {
    headerText: string;
    steps: InstructionStepDto[];
    images: InstructionImageDto[];
  };
}

export function GameContentForm({
  gameContent,
  onSuccess,
}: GameContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      gameId: gameContent?.gameId || "",
      gameName: gameContent?.gameName || "",
      description: gameContent?.description || "",
      instruction: {
        headerText: gameContent?.instruction?.headerText || "Инструкция",
        steps: gameContent?.instruction?.steps || [
          { id: "step-1", text: "", highlight: "" },
        ],
        images: gameContent?.instruction?.images || [],
      },
    },
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "instruction.steps",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "instruction.images",
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateGameContentDto) =>
      GameContentService.createGameContent(data),
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Игровой контент создан",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать игровой контент",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { gameId: string; payload: UpdateGameContentDto }) =>
      GameContentService.updateGameContent(data.gameId, data.payload),
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Игровой контент обновлен",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить игровой контент",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (gameContent) {
        // Update existing game
        const payload: UpdateGameContentDto = {
          gameName: data.gameName,
          description: data.description,
          instruction: data.instruction,
        };
        await updateMutation.mutateAsync({
          gameId: gameContent.gameId,
          payload,
        });
      } else {
        // Create new game
        const payload: CreateGameContentDto = {
          gameId: data.gameId,
          gameName: data.gameName,
          description: data.description,
          instruction: data.instruction,
        };
        await createMutation.mutateAsync(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStep = () => {
    appendStep({
      id: `step-${stepFields.length + 1}`,
      text: "",
      highlight: "",
    });
  };

  const addImage = () => {
    appendImage({
      id: `image-${imageFields.length + 1}`,
      src: "",
      alt: "",
      width: 400,
      height: 200,
    });
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Основная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gameId">ID игры *</Label>
              <Input
                id="gameId"
                {...register("gameId", { required: "ID игры обязателен" })}
                placeholder="bigo-live"
                disabled={!!gameContent} // Disable editing ID for existing games
              />
              {errors.gameId && (
                <p className="text-sm text-red-600">{errors.gameId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gameName">Название игры *</Label>
              <Input
                id="gameName"
                {...register("gameName", { required: "Название обязательно" })}
                placeholder="Bigo Live"
              />
              {errors.gameName && (
                <p className="text-sm text-red-600">
                  {errors.gameName.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Описание игры *</Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "Описание обязательно",
                })}
                placeholder="Описание игры и что в ней можно купить..."
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instruction Header */}
        <Card>
          <CardHeader>
            <CardTitle>Заголовок инструкции</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="headerText">Заголовок</Label>
              <Input
                id="headerText"
                {...register("instruction.headerText")}
                placeholder="Инструкция"
              />
            </div>
          </CardContent>
        </Card>

        {/* Instruction Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Шаги инструкции
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить шаг
              </Button>
            </CardTitle>
            <CardDescription>
              Добавьте пошаговые инструкции для пользователей
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stepFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Шаг {index + 1}</Badge>
                  {stepFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Текст шага *</Label>
                    <Textarea
                      {...register(`instruction.steps.${index}.text`, {
                        required: "Текст шага обязателен",
                      })}
                      placeholder="Войдите в приложение..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Выделить слово</Label>
                    <Input
                      {...register(`instruction.steps.${index}.highlight`)}
                      placeholder="Bigo Live"
                    />
                    <p className="text-xs text-muted-foreground">
                      Слово, которое будет выделено в тексте
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instruction Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Изображения для инструкции
              </div>
              <Button type="button" onClick={addImage} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить изображение
              </Button>
            </CardTitle>
            <CardDescription>
              Добавьте изображения, которые помогут пользователям
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {imageFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Изображение {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>URL изображения *</Label>
                    <Input
                      {...register(`instruction.images.${index}.src`, {
                        required: "URL изображения обязателен",
                      })}
                      placeholder="/info-buy.png"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Описание изображения *</Label>
                    <Input
                      {...register(`instruction.images.${index}.alt`, {
                        required: "Описание обязательно",
                      })}
                      placeholder="Инструкция по покупке"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ширина (px)</Label>
                    <Input
                      type="number"
                      {...register(`instruction.images.${index}.width`)}
                      placeholder="400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Высота (px)</Label>
                    <Input
                      type="number"
                      {...register(`instruction.images.${index}.height`)}
                      placeholder="200"
                    />
                  </div>
                </div>
              </div>
            ))}

            {imageFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Изображения не добавлены</p>
                <p className="text-sm">Нажмите кнопку выше для добавления</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            className="min-w-24"
          >
            {isSubmitting ||
            createMutation.isPending ||
            updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : gameContent ? (
              "Обновить"
            ) : (
              "Создать"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
