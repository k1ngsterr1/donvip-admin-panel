"use client";

import { usePopupStore } from "@/lib/popup-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  Copy,
  Tag,
  Gem,
  AlertCircle,
  ShoppingCart,
  Code,
} from "lucide-react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { Product } from "./product";

interface ExpandedProductDetailsProps {
  product: Product;
}

export function ExpandedProductDetails({
  product,
}: ExpandedProductDetailsProps) {
  const { openPopup } = usePopupStore();
  const replenishmentOptions = parseReplenishment(product);

  const handleCreateOrder = (productId: number) => {
    openPopup("createOrder", { productId });
  };

  return (
    <div className="p-4 border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <Card className="border-muted/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary">
              <Info className="h-4 w-4 inline mr-2" />
              Информация о товаре
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground text-primary">
                ID
              </p>
              <div className="flex items-center gap-2">
                <p className="text-primary">{product.id}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => {
                    navigator.clipboard.writeText(product.id.toString());
                    toast({
                      title: "ID скопирован",
                      description: `ID товара ${product.id} скопирован в буфер обмена.`,
                      //@ts-ignore
                      icon: <Copy className="h-4 w-4" />,
                    });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground text-primary">
                Название
              </p>
              <p className="text-primary">{product.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground text-primary">
                Описание
              </p>
              <p className="text-primary">{product.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground text-primary">
                Тип
              </p>
              {product.type ? (
                <Badge
                  variant="outline"
                  className="mt-1 bg-purple-50 text-purple-700 border-purple-200"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {product.type}
                </Badge>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground text-primary">
                API Game
              </p>
              {product.smile_api_game ? (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <Info className="h-3 w-3 mr-1" />
                  {product.smile_api_game}
                </Badge>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground text-primary">
                Изображение
              </p>
              <div className="mt-1">
                <div className="h-24 w-24 relative rounded-md overflow-hidden border bg-muted/20">
                  <Image
                    src={
                      product.image ||
                      "/placeholder.svg?height=96&width=96&query=product" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground text-primary">
                Валюта
              </p>
              <div className="flex items-center gap-2 mt-1">
                {product.currency_image ? (
                  <div className="h-6 w-6 relative rounded-full overflow-hidden border">
                    <Image
                      src={
                        product.currency_image ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={product.currency_name || "Currency"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <span className="text-primary">
                  {product.currency_name || "Не указана"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <Card className="border-muted/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-primary">
              <Gem className="h-4 w-4 inline mr-2" />
              Варианты пополнения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(replenishmentOptions) &&
              replenishmentOptions.length > 0 ? (
                replenishmentOptions.map((option, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-md flex justify-between items-center bg-white hover:bg-muted/5 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">
                          {option.amount !== undefined ? option.amount : "N/A"}
                        </span>
                        <Badge variant="secondary" className="px-2 py-0.5">
                          <Gem className="h-3 w-3 mr-1" />
                          {option.type || "Unknown"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground text-primary mt-1">
                        {option.sku
                          ? `SKU: ${option.sku}`
                          : option.error
                          ? `Error: ${option.error}`
                          : "Без SKU"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary">
                        {option.price !== undefined
                          ? `₽${option.price}`
                          : "N/A"}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleCreateOrder(product.id)}
                        className="bg-primary"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Купить
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 border rounded-md bg-muted/5">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-primary font-medium">
                    Нет вариантов пополнения
                  </p>
                  <p className="text-sm text-muted-foreground text-primary mt-1">
                    {typeof product.replenishment === "string"
                      ? `Необработанные данные: ${product.replenishment}`
                      : "Добавьте варианты пополнения для этого товара"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw JSON data */}
      <div className="mt-6">
        <details className="text-primary">
          <summary className="cursor-pointer text-sm font-medium flex items-center">
            <Code className="h-4 w-4 mr-1.5" />
            Показать JSON данные
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto max-h-60">
            {JSON.stringify(
              {
                id: product.id,
                name: product.name,
                description: product.description,
                image: product.image,
                replenishment: product.replenishment, // Show the original replenishment data
                replenishment_parsed: replenishmentOptions, // Also show the parsed version
                smile_api_game: product.smile_api_game,
                type: product.type,
                currency_image: product.currency_image,
                currency_name: product.currency_name,
              },
              null,
              2
            )}
          </pre>
        </details>
      </div>
    </div>
  );
}

// Helper function to parse replenishment data
function parseReplenishment(product: Product) {
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
}
