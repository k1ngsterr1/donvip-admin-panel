// @ts-nocheck
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { GameSelector } from "./game-selector";

const formSchema = z.object({
  code: z
    .string()
    .min(3, {
      message: "Coupon code must be at least 3 characters.",
    })
    .max(20, {
      message: "Coupon code must not exceed 20 characters.",
    }),
  discount: z.coerce
    .number()
    .min(1, {
      message: "Discount must be at least 1%.",
    })
    .max(100, {
      message: "Discount cannot exceed 100%.",
    }),
  limit: z.coerce.number().optional(),
  gameIds: z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface CouponFormProps {
  couponId?: number;
  defaultValues?: {
    code: string;
    discount: number;
    limit?: number;
    gameIds?: number[];
  };
  onSuccess?: () => void;
}

export function CouponFormWithGameSelector({
  couponId,
  defaultValues,
  onSuccess,
}: CouponFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      code: "",
      discount: 10,
      limit: undefined,
      gameIds: [],
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: (data: FormValues) => api.coupons.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Coupon created",
        description: "The coupon has been created successfully.",
      });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateCouponMutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!couponId) throw new Error("Coupon ID is required for update");
      return api.coupons.update(couponId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Coupon updated",
        description: "The coupon has been updated successfully.",
      });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update coupon. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    if (couponId) {
      updateCouponMutation.mutate(values);
    } else {
      createCouponMutation.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Код промокода</FormLabel>
              <FormControl>
                <Input
                  placeholder="SUMMER20"
                  {...field}
                  className="uppercase text-gray-600"
                />
              </FormControl>
              <FormDescription className="text-gray-600">
                Код, который пользователи будут вводить для получения скидки.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Скидка (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="placeholder:text-gray-600 text-gray-600"
                  min={1}
                  max={100}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Процент скидки, который будет применен (от 1 до 100).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">
                Лимит использований
              </FormLabel>
              <FormControl>
                <Input
                  min={1}
                  className="placeholder:text-gray-600 text-gray-600"
                  placeholder="Без ограничений"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value =
                      e.target.value === ""
                        ? undefined
                        : Number.parseInt(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Максимальное количество использований промокода. Оставьте пустым
                для неограниченного использования.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Game Selection using our simplified GameSelector component */}
        <FormField
          control={form.control}
          name="gameIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Игры</FormLabel>
              <FormDescription>
                Выберите игры, к которым будет применяться этот промокод. Если
                не выбрано ни одной игры, промокод будет применяться ко всем
                играм.
              </FormDescription>

              <GameSelector
                selectedGameIds={field.value || []}
                onChange={(gameIds) => field.onChange(gameIds)}
                disabled={isSubmitting}
              />

              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {couponId ? "Обновить промокод" : "Создать промокод"}
        </Button>
      </form>
    </Form>
  );
}
