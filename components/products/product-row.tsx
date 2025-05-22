"use client";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Gem,
  Tag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Product } from "./product";
import { ExpandedProductDetails } from "./expanded-product-details";

interface ProductRowProps {
  product: Product;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (id: number) => void;
}

export function ProductRow({
  product,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onView,
}: ProductRowProps) {
  const replenishmentOptions = parseReplenishment(product);

  return (
    <>
      <TableRow
        className={cn(
          "hover:bg-muted/30 transition-colors",
          isExpanded && "bg-muted/20"
        )}
      >
        <TableCell className="p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Свернуть" : "Развернуть"}
            className="hover:bg-muted/50"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-primary" />
            ) : (
              <ChevronDown className="h-4 w-4 text-primary" />
            )}
          </Button>
        </TableCell>
        <TableCell className="text-primary">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 relative rounded-md overflow-hidden border bg-muted/20">
              {product.images && product.images.length > 0 ? (
                <>
                  <Image
                    src={
                      product.images[0] ||
                      "/placeholder.svg?height=48&width=48&query=product" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.images.length > 1 && (
                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                      +{product.images.length - 1}
                    </div>
                  )}
                </>
              ) : (
                <Image
                  src={
                    product.image ||
                    "/placeholder.svg?height=48&width=48&query=product" ||
                    "/placeholder.svg" ||
                    "/placeholder.svg" ||
                    "/placeholder.svg"
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium text-primary">{product.name}</p>
              <p className="text-sm text-muted-foreground text-primary line-clamp-1">
                {product.description}
              </p>
              {product.type && (
                <Badge
                  variant="outline"
                  className="mt-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {product.type}
                </Badge>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="text-primary">
          {product.smile_api_game ? (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <Info className="h-3 w-3 mr-1" />
              {product.smile_api_game}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="text-primary">
          <div className="space-y-1">
            {Array.isArray(replenishmentOptions) &&
              replenishmentOptions.slice(0, 2).map((item, index) => (
                <div key={index} className="text-sm flex items-center gap-2">
                  <span className="font-medium text-primary">
                    {item.amount}
                  </span>
                  <Badge variant="secondary" className="px-1.5 py-0">
                    <Gem className="h-3 w-3 mr-1" />
                    {item.type}
                  </Badge>
                  <span className="text-primary">-</span>
                  <span className="text-primary font-semibold">
                    ₽{item.price}
                  </span>
                </div>
              ))}
            {Array.isArray(replenishmentOptions) &&
              replenishmentOptions.length > 2 && (
                <div className="text-xs text-muted-foreground text-primary">
                  + еще {replenishmentOptions.length - 2}
                </div>
              )}
          </div>
        </TableCell>
        <TableCell className="text-right text-primary">
          <div className="flex justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    className="hover:bg-amber-50 hover:text-amber-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-primary">
                  <p>Редактировать</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-primary">
                  Действия
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onEdit(product)}
                  className="text-primary"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(product.id.toString());
                    toast({
                      title: "ID скопирован",
                      description: `ID товара ${product.id} скопирован в буфер обмена.`,
                    });
                  }}
                  className="text-primary"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Копировать ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(product)}
                  className="text-red-600 focus:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded row with all product details */}
      {isExpanded && (
        <TableRow className="bg-muted/10">
          <TableCell colSpan={5} className="p-0">
            <ExpandedProductDetails product={product} />
          </TableCell>
        </TableRow>
      )}
    </>
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
