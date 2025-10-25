"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Globe,
  DollarSign,
  CreditCard,
  Loader2,
  Upload,
  X,
  Image,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  PaymentMethodService,
  PaymentMethod,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from "@/services/payment-method-service";
import { getIconUrl } from "@/lib/icon-utils";

interface PaymentMethodFormProps {
  paymentMethod?: PaymentMethod;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  code: string;
  country: string;
  currency: string;
  minAmount: string;
  maxAmount: string;
  fee: string;
  isActive: boolean;
  isMoneta: boolean;
  isDukPay: boolean;
  isPay4Game: boolean;
  description: string;
  icon: string;
}

const commonCurrencies = [
  { code: "RUB", name: "Российский рубль" },
  { code: "USD", name: "Доллар США" },
  { code: "EUR", name: "Евро" },
  { code: "KZT", name: "Тенге" },
  { code: "UAH", name: "Украинская гривна" },
  { code: "BYN", name: "Белорусский рубль" },
  { code: "CNY", name: "Китайский юань" },
];

export function PaymentMethodForm({
  paymentMethod,
  onSuccess,
}: PaymentMethodFormProps) {
  console.log("🔍 PaymentMethodForm mounted with:", {
    paymentMethod,
    isMoneta: paymentMethod?.isMoneta,
    hasIsMonetaField: "isMoneta" in (paymentMethod || {}),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(
    getIconUrl(paymentMethod?.icon || null)
  );
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [iconError, setIconError] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: paymentMethod?.name || "",
      code: paymentMethod?.code || "",
      country: paymentMethod?.country || "",
      currency: paymentMethod?.currency || "",
      minAmount: paymentMethod?.minAmount?.toString() || "",
      maxAmount: paymentMethod?.maxAmount?.toString() || "",
      fee: paymentMethod?.fee?.toString() || "",
      isActive: paymentMethod?.isActive ?? true,
      isMoneta: paymentMethod?.isMoneta ?? false,
      isDukPay: paymentMethod?.isDukPay ?? false,
      isPay4Game: paymentMethod?.isPay4Game ?? false,
      description: paymentMethod?.description || "",
      icon: paymentMethod?.icon || "",
    },
  });

  const watchedCountry = watch("country");
  const watchedCurrency = watch("currency");
  const watchedIsActive = watch("isActive");
  const watchedIsMoneta = watch("isMoneta");
  const watchedIsDukPay = watch("isDukPay");
  const watchedIsPay4Game = watch("isPay4Game");

  // Debug: Watch isMoneta changes
  React.useEffect(() => {
    console.log("👀 watchedIsMoneta changed:", watchedIsMoneta);
  }, [watchedIsMoneta]);

  // Icon upload handlers
  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setIconError("Поддерживаются только файлы JPEG, PNG и SVG");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setIconError("Размер файла не должен превышать 5MB");
      return;
    }

    setIconError(null);
    setIconFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setIconPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleIconUpload = async () => {
    if (!iconFile) return null;

    setIsUploadingIcon(true);
    try {
      const response = await PaymentMethodService.uploadIcon(iconFile);
      const iconPath = response.iconPath;
      setValue("icon", iconPath);
      setIconFile(null);
      return iconPath;
    } catch (error) {
      console.error("Icon upload failed:", error);
      setIconError("Ошибка загрузки иконки");
      throw error;
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleRemoveIcon = async () => {
    if (paymentMethod?.id && paymentMethod.icon) {
      try {
        await PaymentMethodService.deleteIcon(paymentMethod.id);
      } catch (error) {
        console.error("Failed to delete icon:", error);
      }
    }

    setValue("icon", "");
    setIconPreview(null);
    setIconFile(null);
  };

  // Fetch supported countries
  const { data: countries, isLoading: countriesLoading } = useQuery({
    queryKey: ["supported-countries"],
    queryFn: () => PaymentMethodService.getAllSupportedCountries(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentMethodDto) =>
      PaymentMethodService.createPaymentMethod(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Create error:", error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdatePaymentMethodDto) =>
      PaymentMethodService.updatePaymentMethod(paymentMethod!.id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Update error:", error);
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Upload icon first if a new file is selected
      let iconPath = data.icon;
      if (iconFile) {
        const uploadedIconPath = await handleIconUpload();
        if (uploadedIconPath) {
          iconPath = uploadedIconPath;
        }
      }

      const payload = {
        name: data.name,
        code: data.code,
        country: data.country,
        currency: data.currency,
        minAmount: data.minAmount ? parseFloat(data.minAmount) : undefined,
        maxAmount: data.maxAmount ? parseFloat(data.maxAmount) : undefined,
        fee: data.fee ? parseFloat(data.fee) : undefined,
        isActive: data.isActive,
        isMoneta: data.isMoneta,
        isDukPay: data.isDukPay,
        isPay4Game: data.isPay4Game,
        description: data.description || undefined,
        icon: iconPath || undefined,
      };

      console.log("📤 Submitting payment method:", payload);
      console.log("📋 Form data isMoneta:", data.isMoneta);
      console.log("📋 Form data isDukPay:", data.isDukPay);
      console.log("📋 Form data isPay4Game:", data.isPay4Game);
      console.log("📋 Watched isMoneta:", watchedIsMoneta);
      console.log("📋 Watched isDukPay:", watchedIsDukPay);
      console.log("📋 Watched isPay4Game:", watchedIsPay4Game);

      if (paymentMethod) {
        const result = await updateMutation.mutateAsync(payload);
        console.log("✅ Update response:", result);
      } else {
        const result = await createMutation.mutateAsync(
          payload as CreatePaymentMethodDto
        );
        console.log("✅ Create response:", result);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Основная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                {...register("name", { required: "Название обязательно" })}
                placeholder="Например: Банковская карта"
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Код *</Label>
              <Input
                id="code"
                {...register("code", { required: "Код обязателен" })}
                placeholder="Например: CARD, QIWI"
              />
              {errors.code && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.code.message}
                </p>
              )}
            </div>{" "}
            <div className="space-y-2">
              <Label htmlFor="country">Страна *</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      {watchedCountry
                        ? countries?.find(
                            (country) => country.code === watchedCountry
                          )?.name + ` (${watchedCountry})`
                        : "Выберите страну"}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Поиск страны..." />
                    <CommandEmpty>Страна не найдена.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {countriesLoading ? (
                        <div className="p-2 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      ) : (
                        countries?.map((country) => (
                          <CommandItem
                            key={country.code}
                            value={`${country.name} ${country.code}`}
                            onSelect={() => {
                              setValue("country", country.code);
                              setCountryOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                watchedCountry === country.code
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {country.name} ({country.code})
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.country && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.country.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Валюта *</Label>
              <Select
                value={watchedCurrency}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger>
                  <DollarSign className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Выберите валюту" />
                </SelectTrigger>
                <SelectContent>
                  {commonCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currency.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Краткое описание платежного метода"
                rows={2}
              />
            </div>
            {/* Toggle switches for isActive, isMoneta, and isDukPay */}
            <div className="md:col-span-2 space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Активен</Label>
                  <p className="text-sm text-muted-foreground">
                    Включить/выключить этот метод оплаты для пользователей
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={watchedIsActive}
                  onCheckedChange={(checked) => setValue("isActive", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isMoneta">Использовать Moneta</Label>
                  <p className="text-sm text-muted-foreground">
                    Обрабатывать платежи через платежный шлюз Moneta.ru
                  </p>
                </div>
                <Switch
                  id="isMoneta"
                  checked={watchedIsMoneta}
                  onCheckedChange={(checked) => setValue("isMoneta", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isDukPay">Использовать DukPay</Label>
                  <p className="text-sm text-muted-foreground">
                    Обрабатывать платежи через платежный шлюз DukPay (для
                    России)
                  </p>
                </div>
                <Switch
                  id="isDukPay"
                  checked={watchedIsDukPay}
                  onCheckedChange={(checked) => setValue("isDukPay", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPay4Game">Использовать Pay4Game</Label>
                  <p className="text-sm text-muted-foreground">
                    Обрабатывать платежи через платежный шлюз Pay4Game (СБП,
                    карты, SberPay)
                  </p>
                </div>
                <Switch
                  id="isPay4Game"
                  checked={watchedIsPay4Game}
                  onCheckedChange={(checked) => setValue("isPay4Game", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icon Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Иконка метода</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current icon preview */}
            {iconPreview && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="relative">
                  <img
                    src={iconPreview}
                    alt="Icon preview"
                    className="w-12 h-12 object-contain rounded"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {iconFile ? "Новая иконка" : "Текущая иконка"}
                  </p>
                  {iconFile && (
                    <p className="text-xs text-muted-foreground">
                      {iconFile.name} ({(iconFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveIcon}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Upload area */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-muted-foreground" />
                </div>

                <div>
                  <Label
                    htmlFor="icon-upload"
                    className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                  >
                    <Upload className="w-4 h-4" />
                    {iconPreview ? "Изменить иконку" : "Загрузить иконку"}
                  </Label>
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/svg+xml"
                    onChange={handleIconSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    JPEG, PNG или SVG до 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Upload button for new file */}
            {iconFile && !isUploadingIcon && (
              <Button
                type="button"
                onClick={handleIconUpload}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Загрузить иконку
              </Button>
            )}

            {isUploadingIcon && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Загрузка иконки...
                </div>
              </div>
            )}

            {iconError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {iconError}
              </div>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isUploadingIcon ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            className="min-w-24"
          >
            {isSubmitting ||
            isUploadingIcon ||
            createMutation.isPending ||
            updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : paymentMethod ? (
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
