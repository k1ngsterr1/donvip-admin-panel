"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import type { Product } from "./product";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditProductDialogProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Define a more specific type for replenishment items
interface ReplenishmentItem {
  price: number;
  type: string;
  sku: string;
  quantity?: number;
  amount?: number;
}

export function EditProductDialog({
  product,
  onClose,
  onSuccess,
}: EditProductDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  // Use useMemo to process the product data only when the product changes
  const parsedProduct = useMemo(() => {
    if (!product) return null;

    try {
      // Parse the replenishment data
      let replenishmentData: ReplenishmentItem[] = [];

      if (product.replenishment) {
        if (typeof product.replenishment === "string") {
          try {
            let replenishmentStr = product.replenishment.trim();

            // Handle different string formats
            if (
              !replenishmentStr.startsWith("[") &&
              !replenishmentStr.startsWith("{")
            ) {
              replenishmentStr = "[" + replenishmentStr + "]";
            } else if (
              !replenishmentStr.startsWith("[") &&
              replenishmentStr.startsWith("{")
            ) {
              replenishmentStr = "[" + replenishmentStr + "]";
            }

            // Clean up common JSON formatting issues
            replenishmentStr = replenishmentStr
              .replace(/\}\s*,\s*\{/g, "},{")
              .replace(/,\s*\}/g, "}")
              .replace(/,\s*\]/g, "]");

            const parsed = JSON.parse(replenishmentStr);
            replenishmentData = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            console.error("Error parsing replenishment string:", e);
            replenishmentData = [];
          }
        } else if (Array.isArray(product.replenishment)) {
          replenishmentData = product.replenishment.map((item) => ({
            ...item,
            sku: item.sku ?? "",
          }));
        }
      }

      // Process each replenishment item to ensure it has all required fields
      const processedReplenishment = replenishmentData.map((item) => {
        // Extract quantity from SKU if possible
        let quantity = 0;
        if (item.sku) {
          const skuParts = item.sku.split("_");
          const lastPart = skuParts[skuParts.length - 1];
          const parsedLastPart = Number.parseInt(lastPart, 10);
          if (!isNaN(parsedLastPart)) {
            quantity = parsedLastPart;
          }
        }

        // Create a new object with all required fields
        return {
          price:
            typeof item.price === "number"
              ? item.price
              : Number.parseFloat(item.price as any) || 0,
          type: item.type || "diamonds",
          sku: item.sku || "",
          quantity: quantity, // Add quantity field
          amount: quantity, // Add amount field with same value as quantity
        };
      });

      return {
        ...product,
        replenishment: processedReplenishment,
      };
    } catch (error) {
      console.error("Error processing product data:", error);
      setParseError(
        "Ошибка при обработке данных товара. Некоторые поля могут отображаться некорректно."
      );
      return product; // Return original product as fallback
    } finally {
      setIsLoading(false);
    }
  }, [product]);

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "У вас есть несохраненные изменения. Вы уверены, что хотите закрыть?"
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSuccess = () => {
    setHasUnsavedChanges(false);
    onSuccess();
    toast({
      title: "Товар обновлен",
      description: "Изменения успешно сохранены.",
    });
  };

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[95%] md:max-w-[85%] lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-primary text-xl">
              Редактировать товар: {product.name}
            </DialogTitle>
            <DialogDescription className="text-primary">
              Измените детали товара. Нажмите сохранить, когда закончите.
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {parseError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : parsedProduct ? (
          <ProductForm
            productId={parsedProduct.id}
            defaultValues={{
              name: parsedProduct.name,
              description: parsedProduct.description,
              images:
                parsedProduct.images ||
                (parsedProduct.image ? [parsedProduct.image] : []),
              replenishment: Array.isArray(parsedProduct.replenishment)
                ? parsedProduct.replenishment.filter(
                    (
                      item
                    ): item is {
                      price: number;
                      amount: number;
                      type: string;
                      sku: string;
                    } =>
                      typeof item === "object" &&
                      item !== null &&
                      typeof item.price === "number" &&
                      typeof item.amount === "number" &&
                      typeof item.type === "string" &&
                      typeof item.sku === "string"
                  )
                : [],
              smile_api_game: parsedProduct.smile_api_game,
              donatbank_product_id: parsedProduct.donatbank_product_id,
              //@ts-ignore
              type: parsedProduct.type,
              currency_image: parsedProduct.currency_image,
              currency_name: parsedProduct.currency_name,
              order_number: parsedProduct.order_number,
              isServerRequired: parsedProduct.isServerRequired,
              requireUserId: parsedProduct.requireUserId,
              requireServer: parsedProduct.requireServer,
              requireEmail: parsedProduct.requireEmail,
              requireUID: parsedProduct.requireUID,
            }}
            onSuccess={handleSuccess}
            onChange={handleFormChange}
          />
        ) : (
          <div className="text-center py-8 text-red-500">
            Не удалось загрузить данные товара
          </div>
        )}

        <DialogFooter className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">ID: {product.id}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" form="product-form" className="bg-primary">
              Сохранить изменения
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
