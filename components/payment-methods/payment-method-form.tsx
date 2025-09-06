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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Globe,
  DollarSign,
  CreditCard,
  Loader2,
} from "lucide-react";
import {
  PaymentMethodService,
  PaymentMethod,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
} from "@/services/payment-method-service";

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
  description: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      description: paymentMethod?.description || "",
    },
  });

  const watchedCountry = watch("country");
  const watchedCurrency = watch("currency");
  const watchedIsActive = watch("isActive");

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
      const payload = {
        name: data.name,
        code: data.code,
        country: data.country,
        currency: data.currency,
        minAmount: data.minAmount ? parseFloat(data.minAmount) : undefined,
        maxAmount: data.maxAmount ? parseFloat(data.maxAmount) : undefined,
        fee: data.fee ? parseFloat(data.fee) : undefined,
        isActive: data.isActive,
        description: data.description || undefined,
      };

      if (paymentMethod) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload as CreatePaymentMethodDto);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              placeholder="Например: CARD_RUB"
              className="font-mono"
            />
            {errors.code && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Страна *</Label>
            <Select
              value={watchedCountry}
              onValueChange={(value) => setValue("country", value)}
            >
              <SelectTrigger>
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Выберите страну" />
              </SelectTrigger>
              <SelectContent>
                {countriesLoading ? (
                  <div className="p-2 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : (
                  countries?.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
        </CardContent>
      </Card>

      {/* Limits and Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Лимиты и настройки</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minAmount">Минимальная сумма</Label>
            <div className="relative">
              <Input
                id="minAmount"
                type="number"
                step="0.01"
                min="0"
                {...register("minAmount")}
                placeholder="0.00"
                className="pr-12"
              />
              {watchedCurrency && (
                <Badge
                  variant="outline"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                >
                  {watchedCurrency}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAmount">Максимальная сумма</Label>
            <div className="relative">
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                min="0"
                {...register("maxAmount")}
                placeholder="0.00"
                className="pr-12"
              />
              {watchedCurrency && (
                <Badge
                  variant="outline"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                >
                  {watchedCurrency}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee">Комиссия (%)</Label>
            <div className="relative">
              <Input
                id="fee"
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...register("fee")}
                placeholder="0.00"
                className="pr-8"
              />
              <Badge
                variant="outline"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
              >
                %
              </Badge>
            </div>
          </div>

          <div className="md:col-span-3 flex items-center space-x-3 p-4 border rounded-md">
            <Switch
              id="isActive"
              checked={watchedIsActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <div className="flex-1">
              <Label htmlFor="isActive" className="text-base font-medium">
                Активен
              </Label>
              <p className="text-sm text-muted-foreground">
                Активные платежные методы доступны пользователям для выбора
              </p>
            </div>
            <Badge variant={watchedIsActive ? "default" : "secondary"}>
              {watchedIsActive ? "Активен" : "Неактивен"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={
            isSubmitting || createMutation.isPending || updateMutation.isPending
          }
          className="min-w-24"
        >
          {isSubmitting ||
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
  );
}
