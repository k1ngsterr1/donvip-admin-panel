"use client";

import { Badge } from "@/components/ui/badge";
import type React from "react";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import {
  Loader2,
  Plus,
  Trash,
  AlertCircle,
  FileImage,
  RefreshCw,
} from "lucide-react";
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
import { ProductService } from "@/services";

// ProductType enum matching the backend
enum ProductType {
  Bigo = "Bigo",
  Smile = "Smile",
  DonatBank = "DonatBank",
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
  discountPercent: z.coerce.number().min(0).max(90).optional(),
  isActive: z.boolean().optional(),
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
  order_number: z.coerce.number().int().min(1, {
    message: "Order number must be at least 1",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  description_en: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  image: z.union([fileSchema, z.instanceof(File).optional()]),
  replenishment: z
    .array(replenishmentItemSchema)
    .min(1, "At least one replenishment option is required"),
  smile_api_game: z.string().optional(),
  donatbank_product_id: z.string().optional(),
  type: z.nativeEnum(ProductType, {
    errorMap: () => ({
      message: "Type must be 'Bigo', 'Smile', or 'DonatBank'",
    }),
  }),
  currency_image: z.union([fileSchema, z.instanceof(File).optional()]),
  currency_name: z.string().min(1, "Currency name is required"),
  isServerRequired: z.boolean().optional(),
  requireUserId: z.boolean().optional(),
  requireServer: z.boolean().optional(),
  requireEmail: z.boolean().optional(),
  requireUID: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  productId?: number;
  defaultValues?: {
    name: string;
    order_number?: number;
    description: string;
    description_en: string;
    image?: string;
    replenishment: Array<{
      price: number;
      amount: number;
      type: string;
      sku: string;
      discountPercent?: number;
    }>;
    smile_api_game?: string;
    donatbank_product_id?: string;
    type?: ProductType;
    currency_image?: string;
    currency_name?: string;
    isServerRequired?: boolean;
    requireUserId?: boolean;
    requireServer?: boolean;
    requireEmail?: boolean;
    requireUID?: boolean;
  };
  onSuccess?: () => void;
}

// Interface for Smile SKU items
interface SmileSKUItem {
  id: string;
  name: string;
  price: number;
  amount: number;
}

// Update the ProductForm component to include state for currency image
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

  // Add state for currency image
  const [previewCurrencyImage, setPreviewCurrencyImage] = useState<
    string | null
  >(defaultValues?.currency_image || null);
  const [currencyFileError, setCurrencyFileError] = useState<string | null>(
    null
  );
  const [selectedCurrencyFile, setSelectedCurrencyFile] = useState<File | null>(
    null
  );

  // Create form without the image field initially
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      order_number: defaultValues?.order_number ?? 1,
      image: undefined as any,
      description: defaultValues?.description || "",
      description_en: defaultValues?.description_en || "",
      replenishment: defaultValues?.replenishment?.map((item) => ({
        ...item,
        discountPercent:
          item.discountPercent && item.discountPercent > 0
            ? item.discountPercent
            : undefined,
      })) || [
        { price: 0, amount: 1, type: "", sku: "", discountPercent: undefined },
      ],
      smile_api_game: defaultValues?.smile_api_game || "",
      donatbank_product_id: defaultValues?.donatbank_product_id || "",
      type: defaultValues?.type || undefined,
      currency_name: defaultValues?.currency_name || "",
      currency_image: undefined as any, // Will be set by file input
      isServerRequired: defaultValues?.isServerRequired || false,
      requireUserId: defaultValues?.requireUserId ?? true,
      requireServer: defaultValues?.requireServer || false,
      requireEmail: defaultValues?.requireEmail || false,
      requireUID: defaultValues?.requireUID || false,
    },
    mode: "onChange",
  });

  // Add debugging for form values
  useEffect(() => {
    console.log("DefaultValues passed to form:", defaultValues);
    console.log(
      "Raw replenishment from defaultValues:",
      defaultValues?.replenishment
    );
    console.log(
      "Processed replenishment:",
      defaultValues?.replenishment?.map((item) => ({
        ...item,
        discountPercent:
          item.discountPercent && item.discountPercent > 0
            ? item.discountPercent
            : undefined,
      }))
    );

    // Log current form values
    const currentValues = form.getValues();
    console.log(
      "Current form replenishment values:",
      currentValues.replenishment
    );

    const subscription = form.watch((value) => {
      console.log("Form values changed:", value);
      console.log("Current replenishment:", value.replenishment);
      console.log("Current smile_api_game:", value.smile_api_game);
    });
    return () => subscription.unsubscribe();
  }, [form, defaultValues]);

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues && productId) {
      console.log("=== FORM RESET DEBUG ===");
      console.log(
        "Full defaultValues from backend:",
        JSON.stringify(defaultValues, null, 2)
      );
      console.log("Raw replenishment items:", defaultValues.replenishment);

      // Check each replenishment item for discountPercent
      defaultValues.replenishment?.forEach((item, index) => {
        console.log(`Replenishment[${index}]:`, {
          hasDiscountPercent: "discountPercent" in item,
          discountPercentValue: item.discountPercent,
          fullItem: item,
        });
      });

      const processedReplenishment = defaultValues.replenishment?.map(
        (item) => {
          // Ensure every item has discountPercent field, even if it's undefined
          const processedItem = {
            ...item,
            discountPercent: undefined as number | undefined, // Default to undefined
          };

          // If discountPercent exists and is > 0, use it
          if (item.discountPercent && item.discountPercent > 0) {
            processedItem.discountPercent = item.discountPercent;
          }

          console.log(`Processing item:`, {
            original: item,
            processed: processedItem,
          });
          return processedItem;
        }
      ) || [
        { price: 0, amount: 1, type: "", sku: "", discountPercent: undefined },
      ];

      console.log("Processed replenishment for reset:", processedReplenishment);

      form.reset({
        name: defaultValues.name || "",
        order_number: defaultValues.order_number ?? 1,
        image: undefined as any,
        description: defaultValues.description || "",
        description_en: defaultValues.description_en || "",
        replenishment: processedReplenishment,
        smile_api_game: defaultValues.smile_api_game || "",
        donatbank_product_id: defaultValues.donatbank_product_id || "",
        type: defaultValues.type || undefined,
        currency_name: defaultValues.currency_name || "",
        currency_image: undefined as any,
        isServerRequired: defaultValues.isServerRequired || false,
        requireUserId: defaultValues.requireUserId ?? true,
        requireServer: defaultValues.requireServer || false,
        requireEmail: defaultValues.requireEmail || false,
        requireUID: defaultValues.requireUID || false,
      });
    }
  }, [defaultValues, productId, form]);

  // Watch for product type changes to conditionally show Smile API fields
  const productType = useWatch({
    control: form.control,
    name: "type",
  });

  const selectedSmileGame = useWatch({
    control: form.control,
    name: "smile_api_game",
  });

  const selectedDonatBankProduct = useWatch({
    control: form.control,
    name: "donatbank_product_id",
  });

  // Debug when component mounts and when productType changes
  useEffect(() => {
    console.log("ProductForm mounted or productType changed:", { productType });
    if (productType === "Smile") {
      console.log("Product type is Smile, API requests should be enabled");
    }
  }, [productType]);

  // Fetch Smile products for dropdown - only when product type is Smile
  const {
    data: smileProducts,
    isLoading: loadingSmileProducts,
    refetch: refetchSmileProducts,
  } = useQuery({
    queryKey: ["smileProducts"],
    queryFn: async () => {
      console.log(
        "Fetching Smile products... enabled:",
        productType === "Smile"
      );
      try {
        const data = await ProductService.getSmileProducts();
        console.log("Smile products API response:", data);

        // If the data is already in the expected format (array of objects with name and apiGame)
        if (Array.isArray(data) && data.length > 0 && data[0].apiGame) {
          console.log("Data is already in the correct format");
          return data;
        }

        // Check if data exists and has the expected structure
        if (data && data.data) {
          console.log("Data has a 'data' property");
          return Array.isArray(data.data) ? data.data : [];
        }

        // Fallback to empty array
        console.warn("Smile products data is not in expected format:", data);
        return [];
      } catch (error) {
        console.error("Error fetching Smile products:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список игр Smile API",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: productType === "Smile", // Only fetch when product type is Smile
    staleTime: 0, // Don't cache the results
    refetchOnMount: true, // Always refetch when component mounts
  });

  // DonatBank products query
  const {
    data: donatBankProducts,
    isLoading: loadingDonatBankProducts,
    refetch: refetchDonatBankProducts,
  } = useQuery({
    queryKey: ["donatBankProducts"],
    queryFn: async () => {
      console.log(
        "Fetching DonatBank products... enabled:",
        productType === "DonatBank"
      );
      try {
        const data = await ProductService.getDonatBankProducts();
        console.log("DonatBank products API response:", data);

        if (data && data.product_list) {
          console.log("Data has a 'product_list' property");
          // Convert the product_list object to an array
          const productsArray = Object.values(data.product_list);
          console.log("Converted products array:", productsArray);
          return productsArray;
        }

        return [];
      } catch (error) {
        console.error("Error fetching DonatBank products:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить список продуктов DonatBank",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: productType === "DonatBank", // Only fetch when product type is DonatBank
    staleTime: 0, // Don't cache the results
    refetchOnMount: true, // Always refetch when component mounts
  });

  // Force fetch DonatBank products when type is DonatBank
  useEffect(() => {
    if (productType === "DonatBank") {
      console.log("Forcing refetch of DonatBank products");
      refetchDonatBankProducts();
    }
  }, [productType, refetchDonatBankProducts]);

  // Force fetch Smile products when type is Smile
  useEffect(() => {
    if (productType === "Smile") {
      console.log("Forcing refetch of Smile products");
      refetchSmileProducts();
    }
  }, [productType, refetchSmileProducts]);

  // Add a debugging effect to track smileProducts
  useEffect(() => {
    console.log("smileProducts updated:", smileProducts);
  }, [smileProducts]);

  // Add a debugging effect to track donatBankProducts
  useEffect(() => {
    console.log("donatBankProducts updated:", donatBankProducts);
    console.log("donatBankProducts array length:", donatBankProducts?.length);
    console.log("Is array?", Array.isArray(donatBankProducts));
    if (donatBankProducts && donatBankProducts.length > 0) {
      console.log("First product:", donatBankProducts[0]);
    }
  }, [donatBankProducts]);

  // Add this debugging effect after the other useEffect hooks to help diagnose the issue:
  useEffect(() => {
    if (productType === "Smile") {
      console.log(
        "Smile products data structure:",
        smileProducts && smileProducts.length > 0
          ? smileProducts[0]
          : "No products"
      );
      console.log("All Smile products:", smileProducts);
      console.log("Current selected game:", selectedSmileGame);
    }
  }, [productType, smileProducts, selectedSmileGame]);

  // Fetch Smile SKUs for the selected game
  const {
    data: smileSKUs,
    isLoading: loadingSmileSKUs,
    refetch: refetchSmileSKUs,
  } = useQuery({
    queryKey: ["smileSKUs", selectedSmileGame],
    queryFn: async () => {
      if (!selectedSmileGame) return [];

      try {
        console.log(`Fetching Smile SKUs for game: ${selectedSmileGame}`);
        const data = await ProductService.getSmileSKU(selectedSmileGame);
        console.log("Smile SKUs response:", data);

        // Check if data exists and has the expected structure
        if (data && data.data) {
          return Array.isArray(data.data) ? data.data : [];
        }

        // If data is directly an array
        if (Array.isArray(data)) {
          return data;
        }

        // Fallback to empty array
        console.warn("Smile SKUs data is not in expected format:", data);
        return [];
      } catch (error) {
        console.error("Error fetching Smile SKUs:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить SKU для выбранной игры",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedSmileGame && productType === "Smile", // Only fetch when a game is selected and product type is Smile
  });

  // Fetch DonatBank packages for the selected product
  const {
    data: donatBankPackages,
    isLoading: loadingDonatBankPackages,
    refetch: refetchDonatBankPackages,
  } = useQuery({
    queryKey: ["donatBankPackages", selectedDonatBankProduct],
    queryFn: async () => {
      if (!selectedDonatBankProduct) return [];

      try {
        console.log(
          `Fetching DonatBank packages for product: ${selectedDonatBankProduct}`
        );
        const data = await ProductService.getDonatBankPackages(
          selectedDonatBankProduct
        );
        console.log("DonatBank packages response:", data);

        return data;
      } catch (error) {
        console.error("Error fetching DonatBank packages:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить пакеты для выбранного продукта",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!selectedDonatBankProduct && productType === "DonatBank", // Only fetch when a product is selected and product type is DonatBank
  });

  // Effect to clear smile_api_game and donatbank_product_id when product type changes
  useEffect(() => {
    if (productType !== "Smile") {
      form.setValue("smile_api_game", "");
    }
    if (productType !== "DonatBank") {
      form.setValue("donatbank_product_id", "");
    }
  }, [productType, form]);

  // Add tracking effect for selectedSmileGame changes
  useEffect(() => {
    console.log("Selected Smile game changed:", selectedSmileGame);
  }, [selectedSmileGame]);

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

  // Update the onSubmit function to handle both image uploads
  function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setFileError(null);
    setCurrencyFileError(null);

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
      formData.append("order_number", values.order_number.toString());
      formData.append("description", values.description);
      formData.append("description_en", values.description_en);

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

      if (values.smile_api_game && values.type === "Smile") {
        formData.append("smile_api_game", values.smile_api_game);
      }

      if (values.donatbank_product_id && values.type === "DonatBank") {
        formData.append("donatbank_product_id", values.donatbank_product_id);
      }

      formData.append("type", values.type);

      // Convert replenishment array to JSON string and append
      // Process replenishment to ensure discountPercent is properly handled
      const processedReplenishment = values.replenishment.map((item) => ({
        ...item,
        discountPercent:
          item.discountPercent && item.discountPercent > 0
            ? item.discountPercent
            : undefined,
      }));

      console.log(
        "Processed replenishment before sending:",
        processedReplenishment
      );
      formData.append("replenishment", JSON.stringify(processedReplenishment));

      // Append currency name
      formData.append("currency_name", values.currency_name);

      // Append isServerRequired
      formData.append(
        "isServerRequired",
        (values.isServerRequired ?? false).toString()
      );

      // Append new requirement fields
      formData.append(
        "requireUserId",
        (values.requireUserId ?? true).toString()
      );
      formData.append(
        "requireServer",
        (values.requireServer ?? false).toString()
      );
      formData.append(
        "requireEmail",
        (values.requireEmail ?? false).toString()
      );
      formData.append("requireUID", (values.requireUID ?? false).toString());

      // Append currency image if selected
      if (selectedCurrencyFile instanceof File) {
        formData.append("currency_image", selectedCurrencyFile);
        console.log(
          "Appending currency image file:",
          selectedCurrencyFile.name,
          selectedCurrencyFile.type,
          selectedCurrencyFile.size
        );
      }

      // Log the FormData entries for debugging
      console.log("FormData entries:");
      for (const pair of formData.entries()) {
        if (pair[0] === "replenishment") {
          console.log(pair[0], "JSON:", JSON.parse(pair[1] as string));
        } else {
          console.log(pair[0], typeof pair[1], pair[1]);
        }
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

  // Add a handler for currency image changes
  const handleCurrencyImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    setCurrencyFileError(null);

    if (!file) {
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setCurrencyFileError(
        `Размер файла слишком большой. Максимальный размер: 10MB.`
      );
      return;
    }

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setCurrencyFileError(
        "Принимаются только форматы .jpg, .jpeg, .png, .webp и .svg."
      );
      return;
    }

    // Store the file for later use
    setSelectedCurrencyFile(file);

    try {
      // Set the value in the form
      form.setValue("currency_image", file, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // Create preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCurrencyImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error setting currency image:", error);
      setCurrencyFileError("Ошибка при обработке изображения");
    }
  };

  const removeCurrencyImage = () => {
    form.setValue("currency_image", undefined as any);
    setPreviewCurrencyImage(null);
    setSelectedCurrencyFile(null);
    setCurrencyFileError(null);
  };

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
      {
        price: 0,
        amount: 1,
        type: "",
        sku: "",
        discountPercent: undefined,
        isActive: true,
      },
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
                  name="order_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">
                        Порядковый номер
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
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
                  name="description_en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">
                        Описание (EN)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Подробное описание товара на английском..."
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
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Clear smile_api_game when changing type
                          if (value !== "Smile") {
                            form.setValue("smile_api_game", "");
                          }
                          // Clear donatbank_product_id when changing type
                          if (value !== "DonatBank") {
                            form.setValue("donatbank_product_id", "");
                          }
                        }}
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
                          <SelectItem
                            value="DonatBank"
                            className="text-primary"
                          >
                            DonatBank
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-gray-600">
                        Выберите тип товара (Bigo, Smile или DonatBank)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Only show Smile API Game field when product type is Smile */}
                {productType === "Smile" && (
                  <FormField
                    control={form.control}
                    name="smile_api_game"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          Smile API Game
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl className="flex-1">
                            <Select
                              onValueChange={(value) => {
                                console.log("Selected game value:", value);
                                console.log(
                                  "Current smileProducts:",
                                  smileProducts
                                );
                                // Set the value directly without any conditions
                                field.onChange(value);
                                form.setValue("smile_api_game", value, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                  shouldTouch: true,
                                });

                                // Only reset replenishment items for valid game IDs (not placeholders)
                                if (value && !value.startsWith("_")) {
                                  console.log(
                                    "Selected new game, fetching SKUs"
                                  );
                                  // Don't reset replenishment items - let user manage them
                                  // Force refetch SKUs for the new game
                                  setTimeout(() => {
                                    refetchSmileSKUs();
                                  }, 100);
                                }
                              }}
                              value={field.value || "_placeholder"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите игру" />
                              </SelectTrigger>
                              <SelectContent>
                                {/* LOGS for DonatBank packages dropdown */}
                                {String(productType) === "DonatBank"
                                  ? [
                                      <SelectItem
                                        key="_placeholder"
                                        value="_placeholder"
                                        disabled
                                      >
                                        Выберите пакет
                                      </SelectItem>,
                                      donatBankPackages?.product_info
                                        ?.packages_list &&
                                      Object.keys(
                                        donatBankPackages.product_info
                                          .packages_list
                                      ).length > 0
                                        ? Object.entries(
                                            donatBankPackages.product_info
                                              .packages_list
                                          ).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                              {typeof value === "object"
                                                ? JSON.stringify(value)
                                                : String(value)}
                                            </SelectItem>
                                          ))
                                        : [
                                            <SelectItem
                                              key="_no_packages"
                                              value="_no_packages"
                                              disabled
                                            >
                                              Нет доступных пакетов
                                            </SelectItem>,
                                          ],
                                    ]
                                  : [
                                      <SelectItem
                                        key="_placeholder"
                                        value="_placeholder"
                                        disabled
                                      >
                                        Выберите игру
                                      </SelectItem>,
                                      loadingSmileProducts ? (
                                        <SelectItem
                                          key="_loading"
                                          value="_loading"
                                          disabled
                                        >
                                          Загрузка...
                                        </SelectItem>
                                      ) : Array.isArray(smileProducts) &&
                                        smileProducts.length > 0 ? (
                                        smileProducts.map((game: any) => (
                                          <SelectItem
                                            key={game.apiGame}
                                            value={game.apiGame}
                                          >
                                            {game.name}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem
                                          key="_no_games"
                                          value="_no_games"
                                          disabled
                                        >
                                          Нет доступных игр
                                        </SelectItem>
                                      ),
                                    ]}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              console.log("Refreshing Smile products");
                              refetchSmileProducts();
                            }}
                            disabled={loadingSmileProducts}
                            title="Обновить список игр"
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${
                                loadingSmileProducts ? "animate-spin" : ""
                              }`}
                            />
                          </Button>
                        </div>
                        <FormDescription className="text-gray-600">
                          Выберите игру из Smile API для интеграции. SKU будут
                          загружены автоматически.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Only show DonatBank Product field when product type is DonatBank */}
                {productType === "DonatBank" && (
                  <FormField
                    control={form.control}
                    name="donatbank_product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">
                          DonatBank Product
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl className="flex-1">
                            <Select
                              onValueChange={(value) => {
                                console.log(
                                  "Selected DonatBank product ID:",
                                  value
                                );
                                console.log(
                                  "Current donatBankProducts:",
                                  donatBankProducts
                                );
                                // Set the value directly
                                field.onChange(value);
                                form.setValue("donatbank_product_id", value, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                  shouldTouch: true,
                                });
                              }}
                              value={field.value || "_placeholder"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите продукт" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem
                                  key="_placeholder"
                                  value="_placeholder"
                                  disabled
                                >
                                  Выберите продукт
                                </SelectItem>
                                {loadingDonatBankProducts ? (
                                  <SelectItem
                                    key="_loading"
                                    value="_loading"
                                    disabled
                                  >
                                    Загрузка...
                                  </SelectItem>
                                ) : Array.isArray(donatBankProducts) &&
                                  donatBankProducts.length > 0 ? (
                                  <>
                                    {console.log(
                                      "RENDERING DONATBANK PRODUCTS:",
                                      donatBankProducts
                                    )}
                                    {donatBankProducts.map((product: any) => {
                                      console.log(
                                        "Rendering product:",
                                        product
                                      );
                                      return (
                                        <SelectItem
                                          key={product.id}
                                          value={product.id}
                                        >
                                          {product.name}
                                        </SelectItem>
                                      );
                                    })}
                                  </>
                                ) : (
                                  <>
                                    {console.log("NO PRODUCTS - Debug info:", {
                                      donatBankProducts,
                                      isArray: Array.isArray(donatBankProducts),
                                      length: donatBankProducts?.length,
                                      loadingDonatBankProducts,
                                    })}
                                    <SelectItem
                                      key="_no_products"
                                      value="_no_products"
                                      disabled
                                    >
                                      Нет доступных продуктов
                                    </SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              console.log("Refreshing DonatBank products");
                              refetchDonatBankProducts();
                            }}
                            disabled={loadingDonatBankProducts}
                            title="Обновить список продуктов"
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${
                                loadingDonatBankProducts ? "animate-spin" : ""
                              }`}
                            />
                          </Button>
                        </div>
                        <FormDescription className="text-gray-600">
                          Выберите продукт из DonatBank API для интеграции.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="currency_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">
                        Currency Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="USD"
                          {...field}
                          className="text-primary"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-600">
                        Name of the currency (e.g., USD, EUR, RUB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isServerRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-primary">
                          Server ID Required
                        </FormLabel>
                        <FormDescription className="text-gray-600">
                          Check this if users need to provide a server ID for
                          this product
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireUserId"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-primary">
                          User ID Required
                        </FormLabel>
                        <FormDescription className="text-gray-600">
                          Check this if users need to provide a user ID for
                          purchase
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireServer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-primary">
                          Server Required
                        </FormLabel>
                        <FormDescription className="text-gray-600">
                          Check this if server information is required for
                          purchase
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireEmail"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-primary">
                          Email Required
                        </FormLabel>
                        <FormDescription className="text-gray-600">
                          Check this if email is required for purchase
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireUID"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-primary">
                          UID Required
                        </FormLabel>
                        <FormDescription className="text-gray-600">
                          Check this if UID is required for purchase
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary">
                        Currency Image
                      </FormLabel>
                      <div className="mt-2 flex flex-col space-y-4">
                        {!previewCurrencyImage ? (
                          <div className="flex h-24 w-full items-center justify-center bg-muted rounded-md border border-dashed">
                            <div className="text-center">
                              <FileImage className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Upload currency icon image
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Recommended: 64x64px
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 z-10 h-6 w-6"
                              onClick={removeCurrencyImage}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                            <Image
                              src={previewCurrencyImage || "/placeholder.svg"}
                              alt="Currency icon preview"
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
                                document
                                  .getElementById("currency-file-upload")
                                  ?.click()
                              }
                              className="w-full"
                            >
                              <FileImage className="h-4 w-4 mr-2" />
                              Choose Currency Icon
                            </Button>
                            {selectedCurrencyFile && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={removeCurrencyImage}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <Input
                            id="currency-file-upload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.svg"
                            onChange={handleCurrencyImageChange}
                            className="hidden"
                          />
                          {selectedCurrencyFile && (
                            <div className="text-xs text-muted-foreground">
                              Selected file: {selectedCurrencyFile.name} (
                              {Math.round(selectedCurrencyFile.size / 1024)} KB)
                            </div>
                          )}
                          {currencyFileError && (
                            <Alert variant="destructive" className="py-2">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              <span className="text-sm">
                                {currencyFileError}
                              </span>
                            </Alert>
                          )}
                          <FormDescription className="text-gray-600">
                            Upload an icon for the currency. This will be
                            displayed next to the currency name.
                          </FormDescription>
                        </div>
                      </div>
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
                <FormItem className="mt-6">
                  <FormLabel className="text-primary">Currency Image</FormLabel>
                  <div className="mt-2 flex flex-col space-y-4">
                    {!previewCurrencyImage ? (
                      <div className="flex h-40 w-full items-center justify-center bg-muted rounded-md border border-dashed">
                        <div className="text-center">
                          <FileImage className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Загрузите изображение валюты
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Рекомендуемый размер: 64x64px
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
                          onClick={removeCurrencyImage}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Image
                          src={previewCurrencyImage || "/placeholder.svg"}
                          alt="Currency image preview"
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
                            document
                              .getElementById("currency-file-upload-2")
                              ?.click()
                          }
                          className="w-full"
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Выбрать изображение валюты
                        </Button>
                        {selectedCurrencyFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={removeCurrencyImage}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        id="currency-file-upload-2"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.svg"
                        onChange={handleCurrencyImageChange}
                        className="hidden"
                      />
                      {selectedCurrencyFile && (
                        <div className="text-xs text-muted-foreground">
                          Выбран файл: {selectedCurrencyFile.name} (
                          {Math.round(selectedCurrencyFile.size / 1024)} KB)
                        </div>
                      )}
                      {currencyFileError && (
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm">{currencyFileError}</span>
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
                        Загрузите изображение валюты. Максимальный размер: 10MB.
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
                <div className="flex gap-2">
                  {productType === "Smile" && selectedSmileGame && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => refetchSmileSKUs()}
                      disabled={loadingSmileSKUs}
                      className="text-primary"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          loadingSmileSKUs ? "animate-spin" : ""
                        }`}
                      />
                      Обновить SKU
                    </Button>
                  )}
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
              </div>
              {productType === "Smile" &&
                selectedSmileGame &&
                loadingSmileSKUs && (
                  <div className="flex items-center justify-center p-8 border rounded-md bg-muted/5">
                    <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
                    <p className="text-primary">
                      Загрузка SKU для {selectedSmileGame}...
                    </p>
                  </div>
                )}
              {productType === "Smile" &&
                selectedSmileGame &&
                !loadingSmileSKUs &&
                smileSKUs?.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-muted/5">
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-primary font-medium">
                      Нет доступных SKU для выбранной игры
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Попробуйте обновить список SKU или добавьте варианты
                      пополнения вручную
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => refetchSmileSKUs()}
                      className="mt-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Обновить SKU
                    </Button>
                  </div>
                )}

              {form.watch("replenishment").map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 p-4 border rounded-md"
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
                          <FormControl className="flex-1">
                            {productType === "Smile" ? (
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                                disabled={loadingSmileSKUs}
                              >
                                <SelectTrigger className="text-primary">
                                  <SelectValue placeholder="Выберите SKU" />
                                </SelectTrigger>
                                <SelectContent>
                                  {loadingSmileSKUs ? (
                                    <SelectItem value="_loading" disabled>
                                      Загрузка SKU...
                                    </SelectItem>
                                  ) : Array.isArray(smileSKUs) &&
                                    smileSKUs.length > 0 ? (
                                    smileSKUs.map((sku: any) => (
                                      <SelectItem
                                        key={sku.id}
                                        value={sku.id}
                                        className="text-primary"
                                      >
                                        {sku.code} - {sku.amount}{" "}
                                        {sku.name || "единиц"} (₽{sku.price})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="_empty" disabled>
                                      Нет доступных SKU
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            ) : productType === "DonatBank" ? (
                              <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                                disabled={loadingDonatBankPackages}
                              >
                                <SelectTrigger className="text-primary">
                                  <SelectValue placeholder="Выберите пакет" />
                                </SelectTrigger>
                                <SelectContent>
                                  {loadingDonatBankPackages ? (
                                    <SelectItem value="_loading" disabled>
                                      Загрузка пакетов...
                                    </SelectItem>
                                  ) : donatBankPackages &&
                                    donatBankPackages.product_info &&
                                    donatBankPackages.product_info
                                      .packages_list &&
                                    Object.keys(
                                      donatBankPackages.product_info
                                        .packages_list
                                    ).length > 0 ? (
                                    Object.entries(
                                      donatBankPackages.product_info
                                        .packages_list
                                    ).map(([, pkg]: [string, any]) => (
                                      <SelectItem
                                        key={pkg.id}
                                        value={pkg.id}
                                        className="text-primary"
                                      >
                                        {pkg.name} (₽{pkg.price})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="_empty" disabled>
                                      Нет доступных пакетов
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                placeholder="ML001"
                                {...field}
                                value={field.value || ""}
                                className="text-primary"
                              />
                            )}
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
                          {productType === "Smile"
                            ? "Выберите SKU из списка доступных для Smile API"
                            : productType === "DonatBank"
                            ? "Выберите пакет из списка доступных для DonatBank"
                            : "Уникальный идентификатор товара"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`replenishment.${index}.discountPercent`}
                    render={({ field }) => {
                      console.log(`Field discountPercent[${index}]:`, {
                        fieldValue: field.value,
                        formValue: form.getValues(
                          `replenishment.${index}.discountPercent`
                        ),
                        rawValue: form.getValues(`replenishment.${index}`),
                      });

                      return (
                        <FormItem>
                          <FormLabel className="text-primary">
                            Скидка (%)
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="text-primary"
                              placeholder="0-90"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-600 text-xs">
                            Процент скидки (опционально)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name={`replenishment.${index}.isActive`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-primary">Статус</FormLabel>
                        <div className="flex flex-col space-y-3 mt-2">
                          <FormControl>
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={field.value !== false}
                                  onChange={(e) =>
                                    field.onChange(e.target.checked)
                                  }
                                  id={`switch-${index}`}
                                />
                                <label
                                  htmlFor={`switch-${index}`}
                                  className={`
                                    relative inline-flex items-center justify-center w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out
                                    ${
                                      field.value !== false
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-gray-300 hover:bg-gray-400"
                                    }
                                  `}
                                >
                                  <span
                                    className={`
                                      absolute w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform duration-200 ease-in-out
                                      ${
                                        field.value !== false
                                          ? "translate-x-2.5"
                                          : "-translate-x-2.5"
                                      }
                                    `}
                                  />
                                </label>
                              </div>
                              <div className="flex flex-col">
                                <span
                                  className={`text-sm font-medium ${
                                    field.value !== false
                                      ? "text-green-700"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {field.value !== false
                                    ? "Активен"
                                    : "Отключен"}
                                </span>
                                <div
                                  className={`flex items-center space-x-1 ${
                                    field.value !== false
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {field.value !== false ? (
                                    <>
                                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                      <span className="text-xs">
                                        Доступен для покупки
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                      <span className="text-xs">
                                        Скрыт от пользователей
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription className="text-gray-600 text-xs mt-2">
                          {field.value !== false
                            ? "Пакет отображается пользователям и доступен для покупки"
                            : "Пакет скрыт от пользователей и недоступен для покупки"}
                        </FormDescription>
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
