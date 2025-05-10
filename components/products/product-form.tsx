"use client";

import type React from "react";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { Loader2, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";

const replenishmentItemSchema = z.object({
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  type: z.string().min(1, "Type is required"),
  sku: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  images: z.array(z.instanceof(File)).optional(),
  replenishment: z
    .array(replenishmentItemSchema)
    .min(1, "At least one replenishment option is required"),
  smile_api_game: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  productId?: number;
  defaultValues?: {
    name: string;
    description: string;
    images?: string[];
    replenishment: Array<{
      price: number;
      amount: number;
      type: string;
      sku?: string;
    }>;
    smile_api_game?: string;
  };
  onSuccess?: () => void;
}

export function ProductForm({
  productId,
  defaultValues,
  onSuccess,
}: ProductFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(
    defaultValues?.images || []
  );

  // Fetch Smile products for dropdown
  const { data: smileProducts, isLoading: loadingSmileProducts } = useQuery({
    queryKey: ["smileProducts"],
    queryFn: async () => {
      // In a real app, this would fetch from your API
      // const response = await api.products.getSmileProducts()
      // return response.data

      // For now, return mock data
      return [
        { id: "mobilelegendsru", name: "Mobile Legends" },
        { id: "bigolive", name: "Bigo LIVE" },
        { id: "pubgmobile", name: "PUBG Mobile" },
        { id: "freefire", name: "Free Fire" },
        { id: "clashofclans", name: "Clash of Clans" },
      ];
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      images: [],
      replenishment: defaultValues?.replenishment || [
        { price: 0, amount: 0, type: "" },
      ],
      smile_api_game: defaultValues?.smile_api_game || "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: FormData) => api.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Товар создан",
        description: "Товар был успешно создан.",
      });
      if (onSuccess) onSuccess();
      form.reset();
      setPreviewImages([]);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать товар. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (data: FormData) => {
      if (!productId) throw new Error("Product ID is required for update");
      return api.products.update(productId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Товар обновлен",
        description: "Товар был успешно обновлен.",
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить товар. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    // Convert form values to FormData
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);

    if (values.images && values.images.length > 0) {
      values.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    if (values.smile_api_game) {
      formData.append("smile_api_game", values.smile_api_game);
    }

    // Convert replenishment array to JSON string and append
    formData.append("replenishment", JSON.stringify(values.replenishment));

    if (productId) {
      updateProductMutation.mutate(formData);
    } else {
      createProductMutation.mutate(formData);
    }
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const currentImages = form.getValues("images") || [];
      form.setValue("images", [...currentImages, ...fileArray]);

      // Create preview URLs for each new image
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    form.setValue("images", newImages);

    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addReplenishmentItem = () => {
    const currentItems = form.getValues("replenishment");
    form.setValue("replenishment", [
      ...currentItems,
      { price: 0, amount: 0, type: "" },
    ]);
  };

  const removeReplenishmentItem = (index: number) => {
    const currentItems = form.getValues("replenishment");
    if (currentItems.length > 1) {
      form.setValue(
        "replenishment",
        currentItems.filter((_, i) => i !== index)
      );
    }
  };

  return (
    <ScrollArea className="max-h-[calc(90vh-120px)]">
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">
                        Название товара
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bigo LIVE"
                          {...field}
                          className="text-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">Описание</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Подробное описание товара..."
                          className="min-h-[120px] text-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smile_api_game"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">
                        Smile API Game
                      </FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-primary"
                          {...field}
                        >
                          <option value="" className="text-primary">
                            Выберите игру
                          </option>
                          {loadingSmileProducts ? (
                            <option disabled>Загрузка...</option>
                          ) : (
                            smileProducts?.map((game) => (
                              <option
                                key={game.id}
                                value={game.id}
                                className="text-primary"
                              >
                                {game.name}
                              </option>
                            ))
                          )}
                        </select>
                      </FormControl>
                      <FormDescription className="text-gray-600">
                        Выберите игру из Smile API для интеграции.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormItem>
                  <FormLabel className="text-primary">
                    Изображения товара
                  </FormLabel>
                  <div className="mt-2 flex flex-col space-y-4">
                    {previewImages.length === 0 ? (
                      <div className="flex h-40 w-full items-center justify-center bg-muted rounded-md border">
                        <p className="text-sm text-muted-foreground">
                          Нет загруженных изображений
                        </p>
                      </div>
                    ) : previewImages.length === 1 ? (
                      <div className="relative h-40 w-full overflow-hidden rounded-md border">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-6 w-6"
                          onClick={() => removeImage(0)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Image
                          src={previewImages[0] || "/placeholder.svg"}
                          alt="Product preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {previewImages.map((preview, index) => (
                          <div
                            key={index}
                            className="relative h-40 overflow-hidden rounded-md border"
                          >
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 z-10 h-6 w-6"
                              onClick={() => removeImage(index)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Image
                              src={preview || "/placeholder.svg"}
                              alt={`Product preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImagesChange}
                      className="w-full text-primary"
                      multiple
                    />
                  </div>
                  <FormDescription className="text-gray-600">
                    Загрузите изображения товара. Вы можете выбрать несколько
                    файлов. Рекомендуемый размер: 800x600 пикселей.
                  </FormDescription>
                </FormItem>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <FormLabel className="text-primary">
                  Варианты пополнения
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-primary text-white"
                  onClick={addReplenishmentItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить вариант
                </Button>
              </div>

              {form.watch("replenishment").map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-md"
                >
                  <FormField
                    control={form.control}
                    name={`replenishment.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          Количество
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            className="text-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`replenishment.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">Тип</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="diamonds"
                            {...field}
                            className="text-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`replenishment.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">Цена (₽)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="text-primary"
                            min={0.01}
                            step={0.01}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`replenishment.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">SKU</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input
                              placeholder="ML001"
                              {...field}
                              value={field.value || ""}
                              className="text-primary"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeReplenishmentItem(index)}
                            disabled={form.watch("replenishment").length <= 1}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="bg-primary"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {productId ? "Обновить товар" : "Создать товар"}
            </Button>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
