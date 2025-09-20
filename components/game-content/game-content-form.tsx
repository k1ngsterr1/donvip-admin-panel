"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Type,
  GamepadIcon,
  Star,
  HelpCircle,
} from "lucide-react";
import { GameContentService } from "@/services/game-content-service";
import { ProductService } from "@/services/product-service";
import {
  GameContent,
  CreateGameContentDto,
  UpdateGameContentDto,
  InstructionStepDto,
  InstructionImageDto,
  CreateReviewDto,
  CreateFAQDto,
} from "@/types/game-content-dto";

interface GameContentFormProps {
  gameContent?: GameContent;
  onSuccess: () => void;
}

interface FormData {
  gameId: string;
  gameName: string;
  description: string;
  mainDescription: string;
  instruction: {
    headerText: string;
    steps: InstructionStepDto[];
    images: InstructionImageDto[];
  };
  reviews: CreateReviewDto[];
  faq: CreateFAQDto[];
}

export function GameContentForm({
  gameContent,
  onSuccess,
}: GameContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<{ [key: number]: File | null }>(
    {}
  );
  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>(
    {}
  );

  // Fetch available games from products
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: () => ProductService.getProducts({ activeOnly: true }),
    enabled: !gameContent, // Only fetch if creating new content
  });

  const availableGames =
    productsData?.data.map((product) => ({
      gameId:
        product.smile_api_game ||
        product.name.toLowerCase().replace(/\s+/g, "-"),
      gameName: product.name,
      description: product.description,
    })) || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      gameId: gameContent?.gameId || "",
      gameName: gameContent?.gameName || "",
      description: gameContent?.description || "",
      mainDescription: gameContent?.mainDescription || "",
      instruction: {
        headerText: gameContent?.instruction?.headerText || "Инструкция",
        steps: gameContent?.instruction?.steps || [
          { id: "step-1", text: "", highlight: "" },
        ],
        images: gameContent?.instruction?.images || [],
      },
      reviews:
        gameContent?.reviews?.map((review) => ({
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
          verified: review.verified,
        })) || [],
      faq:
        gameContent?.faq?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })) || [],
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

  const {
    fields: reviewFields,
    append: appendReview,
    remove: removeReview,
  } = useFieldArray({
    control,
    name: "reviews",
  });

  const {
    fields: faqFields,
    append: appendFAQ,
    remove: removeFAQ,
  } = useFieldArray({
    control,
    name: "faq",
  });

  // Update form when gameContent changes
  useEffect(() => {
    if (gameContent) {
      console.log("Initializing form with game content:", gameContent);
      console.log("FAQ data from gameContent:", gameContent.faq);
      console.log("Reviews data from gameContent:", gameContent.reviews);

      setValue("gameId", gameContent.gameId);
      setValue("description", gameContent.description);
      setValue("instruction", gameContent.instruction);

      // Convert reviews from API format to form format
      const formattedReviews =
        gameContent.reviews?.map((review) => ({
          userName: review.userName,
          rating: review.rating,
          comment: review.comment,
          verified: review.verified || false,
        })) || [];

      setValue("reviews", formattedReviews);
      setValue("faq", gameContent.faq || []);

      console.log("Formatted reviews for form:", formattedReviews);
    }
  }, [gameContent, setValue]);

  // Auto-fill game name when gameId is selected
  useEffect(() => {
    const selectedGameId = watch("gameId");
    if (selectedGameId && availableGames && !gameContent) {
      const selectedGame = availableGames.find(
        (game) => game.gameId === selectedGameId
      );
      if (selectedGame) {
        setValue("gameName", selectedGame.gameName);
      }
    }
  }, [watch("gameId"), availableGames, gameContent, setValue]);

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
    onSuccess: (updatedGameContent) => {
      console.log("Successfully updated game content:", updatedGameContent);
      toast({
        title: "Успешно",
        description: "Игровой контент обновлен",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error updating game content:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить игровой контент",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    console.log("=== FORM SUBMISSION START ===");
    console.log("Raw form data:", data);
    console.log("Form reviews field:", data.reviews);
    console.log("Form faq field:", data.faq);
    console.log("Image files:", imageFiles);

    try {
      // Upload image files first if any
      const updatedInstruction = { ...data.instruction };

      for (let i = 0; i < updatedInstruction.images.length; i++) {
        const imageFile = imageFiles[i];
        if (imageFile) {
          console.log(`Uploading image ${i}:`, imageFile.name);
          try {
            const uploadResponse =
              await GameContentService.uploadInstructionImage(imageFile);
            console.log(
              `Image ${i} uploaded successfully:`,
              uploadResponse.imageUrl
            );
            // Update the src with the uploaded image URL
            updatedInstruction.images[i].src = uploadResponse.imageUrl;
          } catch (error) {
            console.error(`Failed to upload image ${i}:`, error);
            toast({
              title: "Ошибка загрузки изображения",
              description: `Не удалось загрузить изображение ${i + 1}`,
              variant: "destructive",
            });
            throw error;
          }
        }
      }

      if (gameContent) {
        // Update existing game
        const payload: UpdateGameContentDto = {
          gameName: data.gameName,
          description: data.description,
          mainDescription: data.mainDescription,
          instruction: updatedInstruction,
          reviews: data.reviews,
          faq: data.faq,
        };

        console.log("Updating game content with payload:", payload);
        console.log("FAQ data:", payload.faq);
        console.log("Reviews data:", payload.reviews);

        await updateMutation.mutateAsync({
          gameId: gameContent.gameId,
          payload,
        });
      } else {
        // Create new game content
        const payload: CreateGameContentDto = {
          gameId: data.gameId,
          gameName: data.gameName,
          description: data.description,
          mainDescription: data.mainDescription,
          instruction: updatedInstruction,
          reviews: data.reviews,
          faq: data.faq,
        };

        console.log("Creating game content with payload:", payload);

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

  const addReview = () => {
    appendReview({
      userName: "",
      rating: 5,
      comment: "",
      verified: false,
    });
  };

  const addFAQ = () => {
    appendFAQ({
      question: "",
      answer: "",
    });
  };

  // File handling functions
  const handleImageFileSelect = (index: number, file: File | null) => {
    if (file) {
      // Update file state
      setImageFiles((prev) => ({ ...prev, [index]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => ({
          ...prev,
          [index]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);

      // Set alt text based on filename if empty
      const currentAlt = watch(`instruction.images.${index}.alt`);
      if (!currentAlt) {
        setValue(`instruction.images.${index}.alt`, file.name.split(".")[0]);
      }
    } else {
      // Clear file and preview
      setImageFiles((prev) => ({ ...prev, [index]: null }));
      setImagePreviews((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
    setImagePreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
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
          <CardContent className="space-y-4">
            {!gameContent ? (
              <div className="space-y-2">
                <Label htmlFor="gameId">Выберите игру *</Label>
                <Select
                  value={watch("gameId")}
                  onValueChange={(value) => setValue("gameId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите игру для создания контента" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGames?.map((game) => (
                      <SelectItem key={game.gameId} value={game.gameId}>
                        <div className="flex items-center gap-2">
                          <GamepadIcon className="h-4 w-4" />
                          <span>{game.gameName}</span>
                          <Badge variant="outline" className="text-xs">
                            {game.gameId}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gameId && (
                  <p className="text-sm text-red-600">
                    {errors.gameId.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Игра</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <GamepadIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{gameContent.gameName}</span>
                  <Badge variant="outline">{gameContent.gameId}</Badge>
                </div>
              </div>
            )}

            {/* Game Title Field - для создания и редактирования */}
            <div className="space-y-2">
              <Label htmlFor="gameName">Название игры *</Label>
              <Input
                id="gameName"
                {...register("gameName", {
                  required: "Название игры обязательно",
                })}
                placeholder="Введите название игры..."
              />
              {errors.gameName && (
                <p className="text-sm text-red-600">
                  {errors.gameName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="mainDescription">Основное описание игры</Label>
              <Textarea
                id="mainDescription"
                {...register("mainDescription")}
                placeholder="Подробное описание игры для пользователей..."
                rows={4}
              />
              {errors.mainDescription && (
                <p className="text-sm text-red-600">
                  {errors.mainDescription.message}
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
                    onClick={() => {
                      removeImageFile(index);
                      removeImage(index);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image Preview */}
                <div className="mb-4">
                  {imagePreviews[index] && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <img
                        src={imagePreviews[index]}
                        alt="Превью файла"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Загруженный файл</p>
                        <p className="text-xs text-gray-600">
                          {imageFiles[index]?.name} (
                          {Math.round((imageFiles[index]?.size || 0) / 1024)}{" "}
                          KB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Файл изображения *</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleImageFileSelect(index, file);
                      }}
                      className="file:mr-3 file:py-1 file:px-3 file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
                    />
                  </div>

                  {/* Hidden field for src - will be populated by file upload */}
                  <input
                    type="hidden"
                    {...register(`instruction.images.${index}.src`)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Отзывы пользователей
              </div>
              <Button type="button" onClick={addReview} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить отзыв
              </Button>
            </CardTitle>
            <CardDescription>
              Добавьте отзывы пользователей о данной игре
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Отзыв {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReview(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Имя пользователя *</Label>
                    <Input
                      {...register(`reviews.${index}.userName`, {
                        required: "Имя пользователя обязательно",
                      })}
                      placeholder="Игорь К."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Рейтинг *</Label>
                    <Select
                      value={watch(`reviews.${index}.rating`)?.toString()}
                      onValueChange={(value) =>
                        setValue(`reviews.${index}.rating`, parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите рейтинг" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                              <span className="ml-1">{rating}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label>Комментарий *</Label>
                    <Textarea
                      {...register(`reviews.${index}.comment`, {
                        required: "Комментарий обязателен",
                      })}
                      placeholder="Быстрая доставка алмазов, все пришло в течение 5 минут. Рекомендую!"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`verified-${index}`}
                      {...register(`reviews.${index}.verified`)}
                      className="rounded"
                    />
                    <Label htmlFor={`verified-${index}`}>
                      Проверенный отзыв
                    </Label>
                  </div>
                </div>
              </div>
            ))}

            {reviewFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Отзывы не добавлены</p>
                <p className="text-sm">Нажмите кнопку выше для добавления</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Часто задаваемые вопросы
              </div>
              <Button type="button" onClick={addFAQ} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить FAQ
              </Button>
            </CardTitle>
            <CardDescription>
              Добавьте часто задаваемые вопросы и ответы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqFields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">FAQ {index + 1}</Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFAQ(index)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Вопрос *</Label>
                    <Input
                      {...register(`faq.${index}.question`, {
                        required: "Вопрос обязателен",
                      })}
                      placeholder="Как долго происходит начисление алмазов?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ответ *</Label>
                    <Textarea
                      {...register(`faq.${index}.answer`, {
                        required: "Ответ обязателен",
                      })}
                      placeholder="Обычно алмазы поступают на аккаунт в течение 5-15 минут после оплаты."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}

            {faqFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>FAQ не добавлены</p>
                <p className="text-sm">Нажмите кнопку выше для добавления</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          {/* Debug button - remove in production */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const currentData = watch();
              console.log("=== DEBUG: Current form data ===");
              console.log("All form data:", currentData);
              console.log("Reviews:", currentData.reviews);
              console.log("FAQ:", currentData.faq);
              console.log("Reviews length:", currentData.reviews?.length);
              console.log("FAQ length:", currentData.faq?.length);
            }}
          >
            Debug Form
          </Button>

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
