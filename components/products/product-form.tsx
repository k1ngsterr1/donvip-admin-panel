"use client";

import { Badge } from "@/components/ui/badge";

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
import { Loader2, Plus, Trash, AlertCircle, FileImage } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// ProductType enum matching the backend
enum ProductType {
  Bigo = "Bigo",
  Smile = "Smile",
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

const replenishmentItemSchema = z.object({
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  type: z.string().min(1, "Type is required"),
  sku: z.string().min(1, "SKU is required"),
});

// Create a file validation schema
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png, .webp and .svg formats are accepted."
  );

// Base form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  image: z.union([fileSchema, z.instanceof(File).optional()]),
  replenishment: z
    .array(replenishmentItemSchema)
    .min(1, "At least one replenishment option is required"),
  smile_api_game: z.string().optional(),
  type: z.nativeEnum(ProductType, {
    errorMap: () => ({ message: "Type must be either 'Bigo' or 'Smile'" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  productId?: number;
  defaultValues?: {
    name: string;
    description: string;
    image?: string;
    replenishment: Array<{
      price: number;
      amount: number;
      type: string;
      sku: string;
    }>;
    smile_api_game?: string;
    type?: ProductType;
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
  const [previewImage, setPreviewImage] = useState<string | null>(
    defaultValues?.image || null
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Create form without the image field initially
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      replenishment: defaultValues?.replenishment || [
        { price: 0, amount: 0, type: "", sku: "" },
      ],
      smile_api_game: defaultValues?.smile_api_game || "",
      type: defaultValues?.type || undefined,
    },
    mode: "onChange",
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
      setPreviewImage(null);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      console.error("API Error:", error);
      toast({
        title: "Ошибка",
        description:
          error?.message ||
          "Не удалось создать товар. Пожалуйста, попробуйте снова.",
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
    onError: (error: any) => {
      console.error("API Error:", error);
      toast({
        title: "Ошибка",
        description:
          error?.message ||
          "Не удалось обновить товар. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setFileError(null);

    // Check if image is provided for new products
    if (!selectedFile && !productId) {
      setFileError("Изображение товара обязательно для загрузки");
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert form values to FormData
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);

      // Only append image if a file is selected
      if (selectedFile instanceof File) {
        formData.append("image", selectedFile);
        console.log(
          "Appending image file:",
          selectedFile.name,
          selectedFile.type,
          selectedFile.size
        );
      } else if (!productId) {
        setFileError("Изображение товара обязательно для загрузки");
        setIsSubmitting(false);
        return;
      }

      if (values.smile_api_game) {
        formData.append("smile_api_game", values.smile_api_game);
      }

      formData.append("type", values.type);

      // Convert replenishment array to JSON string and append
      formData.append("replenishment", JSON.stringify(values.replenishment));

      // Log the FormData entries for debugging
      console.log("FormData entries:");
      for (const pair of formData.entries()) {
        console.log(pair[0], typeof pair[1], pair[1]);
      }

      if (productId) {
        updateProductMutation.mutate(formData);
      } else {
        createProductMutation.mutate(formData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setIsSubmitting(false);
      toast({
        title: "Ошибка",
        description:
          "Произошла ошибка при отправке формы. Пожалуйста, проверьте данные и попробуйте снова.",
        variant: "destructive",
      });
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) {
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`Размер файла слишком большой. Максимальный размер: 10MB.`);
      return;
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFileError(
        "Принимаются только форматы .jpg, .jpeg, .png, .webp и .svg."
      );
      return;
    }

    // Store the file for later use
    setSelectedFile(file);

    try {
      // Set the value in the form
      form.setValue("image", file, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // Create preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error setting image:", error);
      setFileError("Ошибка при обработке изображения");
    }
  };

  const removeImage = () => {
    form.setValue("image", undefined as any);
    setPreviewImage(null);
    setSelectedFile(null);
    setFileError(null);
  };

  const addReplenishmentItem = () => {
    const currentItems = form.getValues("replenishment");
    form.setValue("replenishment", [
      ...currentItems,
      { price: 0, amount: 0, type: "", sku: "" },
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
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Обязательное поле</AlertTitle>
              <AlertDescription>
                Изображение товара обязательно для загрузки. Поддерживаемые
                форматы: JPG, PNG, WebP, SVG.
              </AlertDescription>
            </Alert>
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">Тип</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder="Выберите тип"
                              className="text-primary"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bigo" className="text-primary">
                            Bigo
                          </SelectItem>
                          <SelectItem value="Smile" className="text-primary">
                            Smile
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-600">
                        Выберите тип товара (Bigo или Smile)
                      </FormDescription>
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
                    Изображение товара <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="mt-2 flex flex-col space-y-4">
                    {!previewImage ? (
                      <div className="flex h-40 w-full items-center justify-center bg-muted rounded-md border border-dashed border-red-300">
                        <div className="text-center">
                          <FileImage className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-red-600 font-medium">
                            Требуется загрузить изображение
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Поддерживаемые форматы: JPG, PNG, WebP, SVG
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-40 w-full overflow-hidden rounded-md border">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-6 w-6"
                          onClick={removeImage}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Image
                          src={previewImage || "/placeholder.svg"}
                          alt="Product preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("file-upload")?.click()
                          }
                          className="w-full"
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Выбрать изображение
                        </Button>
                        {selectedFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={removeImage}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            setFileError(null);
                            const defaultFile = await createDefaultImageFile();
                            setSelectedFile(defaultFile);

                            // Set the value in the form
                            form.setValue("image", defaultFile, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            });

                            // Create preview URL for the image
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviewImage(reader.result as string);
                            };
                            reader.readAsDataURL(defaultFile);
                          } catch (error) {
                            console.error(
                              "Error generating default image:",
                              error
                            );
                            setFileError(
                              "Ошибка при создании изображения по умолчанию"
                            );
                          }
                        }}
                        className="w-full mt-2"
                      >
                        <FileImage className="h-4 w-4 mr-2" />
                        Создать стандартное изображение
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.svg"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {selectedFile && (
                        <div className="text-xs text-muted-foreground">
                          Выбран файл: {selectedFile.name} (
                          {Math.round(selectedFile.size / 1024)} KB)
                        </div>
                      )}
                      {fileError && (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm">{fileError}</span>
                        </Alert>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          JPG
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          PNG
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          WebP
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200"
                        >
                          SVG
                        </Badge>
                      </div>
                      <FormDescription className="text-gray-600">
                        Загрузите изображение товара. Максимальный размер: 10MB.
                      </FormDescription>
                    </div>
                  </div>
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
                        <FormDescription className="text-gray-600">
                          Обязательный идентификатор для Smile API
                        </FormDescription>
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

const createDefaultImageFile = async () => {
  try {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Fill with a light gray background
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Product Image", canvas.width / 2, canvas.height / 2);

    // Convert to blob
    return new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "default-product-image.png", {
            type: "image/png",
          });
          resolve(file);
        } else {
          reject(new Error("Could not create image blob"));
        }
      }, "image/png");
    });
  } catch (error) {
    console.error("Error creating default image:", error);
    throw error;
  }
};
