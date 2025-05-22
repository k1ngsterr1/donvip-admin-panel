"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { Product } from "./product";

interface EditProductDialogProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductDialog({
  product,
  onClose,
  onSuccess,
}: EditProductDialogProps) {
  if (!product) return null;

  const parseReplenishment = (product: Product) => {
    if (typeof product.replenishment === "string") {
      try {
        let replenishmentStr = product.replenishment.trim();

        if (
          !replenishmentStr.startsWith("[") &&
          replenishmentStr.includes("},{")
        ) {
          replenishmentStr = "[" + replenishmentStr + "]";
        } else if (
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

        replenishmentStr = replenishmentStr.replace(/\}\s*,\s*\{/g, "},{");
        replenishmentStr = replenishmentStr.replace(/,\s*\}/g, "}");
        replenishmentStr = replenishmentStr.replace(/,\s*\]/g, "]");

        return JSON.parse(replenishmentStr);
      } catch (e) {
        console.error(
          "Error parsing replenishment data:",
          e,
          product.replenishment
        );
        return [{ error: "Parsing error", raw: product.replenishment }];
      }
    }
    return product.replenishment || [];
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Редактировать товар
          </DialogTitle>
          <DialogDescription className="text-primary">
            Измените детали товара. Нажмите сохранить, когда закончите.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          productId={product.id}
          defaultValues={{
            name: product.name,
            description: product.description,
            images: product.images || (product.image ? [product.image] : []),
            replenishment: parseReplenishment(product),
            smile_api_game: product.smile_api_game,
            //@ts-ignore
            type: product.type,
            currency_image: product.currency_image,
            currency_name: product.currency_name,
          }}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
