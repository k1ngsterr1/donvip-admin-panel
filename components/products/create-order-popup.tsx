"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, type DonatBankCreateOrderDto } from "@/lib/api-client";
import { usePopupStore } from "@/lib/popup-store";

// Define the form schema based on the OpenAPI spec
const formSchema = z.object({
  product_id: z.number({
    required_error: "Выберите продукт",
  }),
  item_id: z.number({
    required_error: "Выберите пакет",
  }),
  payment: z.string({
    required_error: "Выберите способ оплаты",
  }),
  account_id: z.string().optional(),
  server_id: z.string().optional(),
  quantity: z.number().min(1).optional(), // For DonatBank orders
});

type FormValues = z.infer<typeof formSchema>;

export function CreateOrderPopup() {
  const queryClient = useQueryClient();
  const { activePopups, popupData, closePopup } = usePopupStore();
  const isOpen = activePopups.createOrder || false;
  const orderData = popupData.createOrder || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(
    orderData.productId || null
  );

  // Fetch products
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.products.getAll();
      return response.data;
    },
    enabled: isOpen,
  });

  // Fetch product details when a product is selected
  const { data: productDetails, isLoading: loadingProductDetails } = useQuery({
    queryKey: ["product", selectedProduct],
    queryFn: async () => {
      if (!selectedProduct) return null;
      const response = await api.products.getById(selectedProduct);
      return response.data;
    },
    enabled: !!selectedProduct && isOpen,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: orderData.productId || undefined,
      item_id: orderData.preselectedItemId || undefined,
      payment: "Tinkoff",
      account_id: "",
      server_id: "",
      quantity: 1,
    },
  });

  // Update form when product is selected
  useEffect(() => {
    if (selectedProduct) {
      form.setValue("product_id", selectedProduct);
    }
  }, [selectedProduct, form]);

  // Reset form when popup is closed
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedProduct(null);
    } else if (orderData.productId) {
      setSelectedProduct(orderData.productId);
    }
  }, [isOpen, form, orderData]);

  const createOrderMutation = useMutation({
    mutationFn: (data: FormValues) => {
      // Check if the selected product is DonatBank type
      const selectedProductData = products?.find(
        (p: any) => p.id === data.product_id
      );

      if (selectedProductData?.type === "DonatBank") {
        // Convert FormValues to DonatBankCreateOrderDto
        const donatBankData = {
          productId: selectedProductData.donatbank_product_id || "", // Use the stored DonatBank product ID
          packageId: data.item_id?.toString() || "0", // Convert to string
          quantity: data.quantity || 1,
          fields: {
            account_id: data.account_id || "",
            server_id: data.server_id || "",
          },
        };
        return api.orders.createDonatBankOrder(donatBankData);
      } else {
        // Regular order creation for other product types
        return api.orders.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Заказ создан",
        description: "Заказ был успешно создан.",
      });
      closePopup("createOrder");
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать заказ. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    createOrderMutation.mutate(values);
  }

  const paymentMethods = [
    { id: "Tinkoff", name: "Т-Банк" },
    { id: "Pagsmile", name: "Pagsmile" },
    { id: "Smile", name: "Smile API" },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closePopup("createOrder")}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Создать заказ</DialogTitle>
          <DialogDescription>
            Заполните форму для создания нового заказа.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Selection */}
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Продукт</FormLabel>
                  <Select
                    disabled={loadingProducts}
                    onValueChange={(value) => {
                      field.onChange(Number.parseInt(value));
                      setSelectedProduct(Number.parseInt(value));
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите продукт" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingProducts ? (
                        <SelectItem value="loading" disabled>
                          Загрузка...
                        </SelectItem>
                      ) : (
                        products?.map((product: any) => (
                          <SelectItem
                            key={product.id}
                            value={product.id.toString()}
                          >
                            {product.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Package Selection */}
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пакет</FormLabel>
                  <Select
                    disabled={!selectedProduct || loadingProductDetails}
                    onValueChange={(value) =>
                      field.onChange(Number.parseInt(value))
                    }
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите пакет" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingProductDetails ? (
                        <SelectItem value="loading" disabled>
                          Загрузка...
                        </SelectItem>
                      ) : (
                        productDetails?.replenishment?.map(
                          (item: any, index: number) => (
                            <SelectItem key={index} value={index.toString()}>
                              {item.amount} {item.type} - ₽{item.price}
                            </SelectItem>
                          )
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Выберите пакет пополнения для выбранного продукта.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="payment"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Способ оплаты</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={method.id}
                            id={`payment-${method.id}`}
                          />
                          <Label htmlFor={`payment-${method.id}`}>
                            {method.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account ID */}
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID аккаунта</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите ID аккаунта" {...field} />
                  </FormControl>
                  <FormDescription>
                    ID аккаунта пользователя в игре или сервисе.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Server ID */}
            <FormField
              control={form.control}
              name="server_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID сервера</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите ID сервера (если применимо)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    ID сервера, если применимо для выбранного продукта.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => closePopup("createOrder")}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
