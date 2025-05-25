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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the status enum to match backend requirements
const CouponStatus = {
  Active: "Active",
  Used: "Used",
  Expired: "Expired",
  Disabled: "Disabled",
} as const;

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
  status: z.enum(["Active", "Used", "Expired", "Disabled"], {
    required_error: "Status is required",
  }),
  // We'll handle gameIds separately and not include it in the form submission
});

type FormValues = z.infer<typeof formSchema>;

interface CouponFormProps {
  couponId?: number;
  defaultValues?: {
    code: string;
    discount: number;
    limit?: number;
    status?: "Active" | "Used" | "Expired" | "Disabled";
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
  const [selectedGameIds, setSelectedGameIds] = useState<number[]>(
    defaultValues?.gameIds || []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: defaultValues?.code || "",
      discount: defaultValues?.discount || 10,
      limit: defaultValues?.limit,
      status: defaultValues?.status || "Active",
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
      setSelectedGameIds([]);
    },
    onError: (error) => {
      console.error("Error creating coupon:", error);
      toast({
        title: "Error",
        description:
          "Failed to create coupon. Please check the form and try again.",
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
    onError: (error) => {
      console.error("Error updating coupon:", error);
      toast({
        title: "Error",
        description:
          "Failed to update coupon. Please check the form and try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    // We don't include gameIds in the submission as per the validation error
    const submissionData = {
      ...values,
      // Explicitly remove gameIds from the submission
    };

    if (couponId) {
      updateCouponMutation.mutate(submissionData);
    } else {
      createCouponMutation.mutate(submissionData);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
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

        {/* Add the required status field */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-primary">Статус</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-gray-600">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Активный</SelectItem>
                  <SelectItem value="Used">Использованный</SelectItem>
                  <SelectItem value="Expired">Истекший</SelectItem>
                  <SelectItem value="Disabled">Отключенный</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Текущий статус промокода.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Game Selection - we'll keep the UI but not include it in form submission */}
        <div className="col-span-1 md:col-span-2">
          <div className="space-y-2">
            <FormLabel className="text-primary">Игры</FormLabel>
            <FormDescription>
              <span className="text-yellow-600 font-medium ">
                Примечание: Игры можно выбрать только при создании промокода.
                При редактировании промокода игры не могут быть изменены.
              </span>
            </FormDescription>

            {/* Keep the UI but disable it */}
            <div className="opacity-50 pointer-events-none">
              <GameSelector
                selectedGameIds={selectedGameIds}
                onChange={setSelectedGameIds}
                disabled={true}
              />
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 flex justify-end">
          <Button type="submit" className="bg-primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {couponId ? "Обновить промокод" : "Создать промокод"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
