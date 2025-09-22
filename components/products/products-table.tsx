//@ts-nocheck

"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Package,
  Tag,
  Gem,
  Info,
  Copy,
  CheckCircle2,
  XCircle,
  Code,
  Power,
  PowerOff,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/products/product-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePopupStore } from "@/lib/popup-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReplenishmentOption {
  price: number;
  amount: number;
  type: string;
  sku?: string;
  error?: string;
}

interface Product {
  id: number;
  name: string;
  order_number: number;
  description: string;
  description_en: string;
  image?: string;
  images?: string[];
  replenishment: ReplenishmentOption[] | string;
  smile_api_game?: string;
  donatbank_product_id?: string;
  type?: string;
  currency_image?: string;
  currency_name?: string;
  isActive?: boolean; // Add isActive field
  // Required fields for purchase
  isServerRequired?: boolean;
  requireUserId?: boolean;
  requireServer?: boolean;
  requireEmail?: boolean;
  requireUID?: boolean;
}

interface ProductsResponse {
  data: {
    data: {
      data: Product[] | Product;
      total: number;
      page: number;
      lastPage: number;
    };
  };
}

// Sortable row component
function SortableRow({ product, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: product.id.toString() });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:bg-muted/30 transition-colors"
    >
      {children}
    </TableRow>
  );
}
export function ProductsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState<string>("all");
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [deleteConfirmProduct, setDeleteConfirmProduct] =
    useState<Product | null>(null);
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openPopup } = usePopupStore();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const storageKey = `productsOrder-page-${page}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, error, refetch } = useQuery<ProductsResponse>({
    queryKey: ["products", page, limit, debouncedSearch, activeOnly],
    queryFn: async () => {
      try {
        const response = await api.products.getAll({
          page: page,
          limit: limit,
          search: debouncedSearch || undefined,
          activeOnly:
            activeOnly === "active"
              ? true
              : activeOnly === "inactive"
              ? false
              : undefined,
        });

        // Set total pages based on response metadata
        if (response?.data?.data) {
          setTotalPages(response.data.data.lastPage || 1);
          setTotalProducts(response.data.data.total || 0);
        }

        return response;
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (!data) return;

    const list: Product[] = Array.isArray(data.data.data)
      ? data.data.data
      : [data.data.data];

    let ids = list.map((p) => p.id);

    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          const parsed: number[] = JSON.parse(raw);
          const valid = parsed.filter((id) => ids.includes(id));
          ids = [...valid, ...ids.filter((id) => !valid.includes(id))];
        } catch (error) {
          console.log(error);
        }
      }
    }

    setOrderedProducts(
      ids.map((id) => list.find((p) => p.id === id)!).filter(Boolean)
    );
  }, [data, page]);

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Товар удален",
        description: "Товар был успешно удален.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
      setDeleteConfirmProduct(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар. Пожалуйста, попробуйте снова.",
        variant: "destructive",
        icon: <XCircle className="h-4 w-4" />,
      });
    },
  });

  const toggleProductActiveMutation = useMutation({
    mutationFn: (id: number) => api.products.toggleActive(id),
    onSuccess: (response, productId) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const isNowActive = response?.data?.isActive || response?.isActive;
      toast({
        title: isNowActive ? "Игра активирована" : "Игра деактивирована",
        description: isNowActive
          ? "Игра теперь доступна для пользователей."
          : "Игра скрыта от пользователей.",
        icon: isNowActive ? (
          <Power className="h-4 w-4 text-green-500" />
        ) : (
          <PowerOff className="h-4 w-4 text-orange-500" />
        ),
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус игры. Попробуйте снова.",
        variant: "destructive",
        icon: <XCircle className="h-4 w-4" />,
      });
    },
  });

  const handleDelete = (product: Product) => {
    setDeleteConfirmProduct(product);
  };

  const handleToggleActive = (product: Product) => {
    toggleProductActiveMutation.mutate(product.id);
  };

  const confirmDelete = () => {
    if (deleteConfirmProduct) {
      deleteProductMutation.mutate(deleteConfirmProduct.id);
    }
  };

  const handleView = (id: number) => {
    router.push(`/dashboard/products/${id}`);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Ensure replenishment options have default values
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    // grab your IDs as strings
    const activeId = active.id.toString();
    const overId = over.id.toString();

    // compute indexes
    const oldIndex = orderedProducts.findIndex(
      (p) => p.id.toString() === activeId
    );
    const newIndex = orderedProducts.findIndex(
      (p) => p.id.toString() === overId
    );

    // **now** it’s safe to log
    console.log({ activeId, overId, oldIndex, newIndex });

    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(orderedProducts, oldIndex, newIndex);
    setOrderedProducts(next);
    localStorage.setItem(storageKey, JSON.stringify(next.map((p) => p.id)));
  };

  const handleCreateOrder = (productId: number) => {
    openPopup("createOrder", { productId });
  };

  const handleEditSuccess = () => {
    setEditingProduct(null);
    toast({
      title: "Товар обновлен",
      description: "Товар был успешно обновлен.",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const products = Array.isArray(data?.data?.data)
    ? data.data.data
    : data?.data?.data
    ? [data.data.data]
    : [];

  const itemsToRender = orderedProducts.length > 0 ? orderedProducts : products;

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

        const parsed = JSON.parse(replenishmentStr);
        // Ensure each item has proper default values
        return Array.isArray(parsed)
          ? parsed.map((item) => ({
              amount: item.amount !== undefined ? Number(item.amount) : 1, // Convert to number and default to 1
              type: item.type || "",
              price: item.price !== undefined ? Number(item.price) : 0, // Convert to number and default to 0
              sku: item.sku || "",
              ...item,
            }))
          : [];
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-800 text-primary mt-4">
            Ошибка загрузки товаров
          </CardTitle>
          <CardDescription className="text-red-600 text-primary">
            Не удалось загрузить список товаров. Пожалуйста, попробуйте снова.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center pt-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Повторить
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Check if there are no products
  if (products.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl text-primary mt-4">
            Нет товаров
          </CardTitle>
          <CardDescription className="text-primary">
            В системе пока нет добавленных товаров.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-center text-muted-foreground text-primary mb-6">
            Вы можете добавить новый товар, нажав на кнопку ниже.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-muted/40">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск товаров..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Select
                value={activeOnly}
                onValueChange={(value) => {
                  setActiveOnly(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все игры</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue
                    placeholder="10 на стр."
                    className="text-primary"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5" className="text-primary">
                    5 на стр.
                  </SelectItem>
                  <SelectItem value="10" className="text-primary">
                    10 на стр.
                  </SelectItem>
                  <SelectItem value="20" className="text-primary">
                    20 на стр.
                  </SelectItem>
                  <SelectItem value="50" className="text-primary">
                    50 на стр.
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground text-primary">
          Показано {products.length} из {totalProducts || products.length}{" "}
          товаров
        </div>
      </div>
      <div className="rounded-md border shadow-sm overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemsToRender.map((p) => {
              return p.id.toString();
            })}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="font-medium text-primary">
                    Товар
                  </TableHead>
                  <TableHead className="font-medium text-primary">
                    API Game
                  </TableHead>
                  <TableHead className="font-medium text-primary">
                    Статус
                  </TableHead>
                  <TableHead className="font-medium text-primary">
                    Варианты пополнения
                  </TableHead>
                  <TableHead className="text-right font-medium text-primary">
                    Действия
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsToRender.map((product) => {
                  const replenishmentOptions = parseReplenishment(product);
                  const isExpanded = expandedRows[product.id] || false;

                  return (
                    <React.Fragment key={product.id}>
                      <SortableRow product={product}>
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleRowExpansion(product.id)}
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
                              <p className="font-medium text-primary">
                                {product.name}
                              </p>
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
                          {product.smile_api_game || product.type ? (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              <Info className="h-3 w-3 mr-1" />
                              {product.smile_api_game || product.type}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-primary">
                          {/* Debug: Check multiple possible active status fields */}
                          {console.log("Product active fields:", {
                            isActive: product.isActive,
                            active: (product as any).active,
                            status: (product as any).status,
                            is_active: (product as any).is_active,
                            productName: product.name,
                          })}
                          <Badge
                            variant={
                              product.isActive ||
                              (product as any).active ||
                              (product as any).is_active ||
                              (product as any).status === "active" ||
                              (product as any).status === true
                                ? "default"
                                : "secondary"
                            }
                            className={
                              product.isActive ||
                              (product as any).active ||
                              (product as any).is_active ||
                              (product as any).status === "active" ||
                              (product as any).status === true
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }
                          >
                            {product.isActive ||
                            (product as any).active ||
                            (product as any).is_active ||
                            (product as any).status === "active" ||
                            (product as any).status === true ? (
                              <>
                                <Power className="h-3 w-3 mr-1" />
                                Активна
                              </>
                            ) : (
                              <>
                                <PowerOff className="h-3 w-3 mr-1" />
                                Неактивна
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-primary">
                          <div className="space-y-1">
                            {Array.isArray(replenishmentOptions) &&
                              replenishmentOptions
                                .slice(0, 2)
                                .map((item, index) => (
                                  <div
                                    key={index}
                                    className="text-sm flex items-center gap-2"
                                  >
                                    <span className="font-medium text-primary">
                                      {item.amount}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="px-1.5 py-0"
                                    >
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
                                <TooltipTrigger asChild></TooltipTrigger>
                                <TooltipContent className="text-primary">
                                  <p>Создать заказ</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild></TooltipTrigger>
                                <TooltipContent className="text-primary">
                                  <p>Просмотр</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(product)}
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-muted"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="text-primary">
                                  Действия
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => handleEdit(product)}
                                  className="text-primary"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(product)}
                                  className={
                                    product.isActive ||
                                    (product as any).active ||
                                    (product as any).is_active ||
                                    (product as any).status === "active" ||
                                    (product as any).status === true
                                      ? "text-orange-600 focus:text-orange-600 hover:bg-orange-50"
                                      : "text-green-600 focus:text-green-600 hover:bg-green-50"
                                  }
                                >
                                  {/* Debug: log the product.isActive value */}
                                  {console.log(
                                    "Product isActive:",
                                    product.isActive,
                                    "for product:",
                                    product.name
                                  )}
                                  {product.isActive ||
                                  (product as any).active ||
                                  (product as any).is_active ||
                                  (product as any).status === "active" ||
                                  (product as any).status === true ? (
                                    <>
                                      <PowerOff className="mr-2 h-4 w-4" />
                                      Деактивировать
                                    </>
                                  ) : (
                                    <>
                                      <Power className="mr-2 h-4 w-4" />
                                      Активировать
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      product.id.toString()
                                    );
                                    toast({
                                      title: "ID скопирован",
                                      description: `ID товара ${product.id} скопирован в буфер обмена.`,
                                      icon: <Copy className="h-4 w-4" />,
                                    });
                                  }}
                                  className="text-primary"
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Копировать ID
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(product)}
                                  className="text-red-600 focus:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Удалить
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </SortableRow>

                      {/* Expanded row with all product details */}
                      {isExpanded && (
                        <TableRow
                          className="bg-muted/10"
                          key={`exp-${product.id}`}
                        >
                          <TableCell colSpan={5} className="p-0">
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
                                        <p className="text-primary">
                                          {product.id}
                                        </p>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5"
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              product.id.toString()
                                            );
                                            toast({
                                              title: "ID скопирован",
                                              description: `ID товара ${product.id} скопирован в буфер обмена.`,
                                              icon: (
                                                <Copy className="h-4 w-4" />
                                              ),
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
                                      <p className="text-primary">
                                        {product.name}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground text-primary">
                                        Описание
                                      </p>
                                      <p className="text-primary">
                                        {product.description}
                                      </p>
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
                                        <p className="text-muted-foreground">
                                          —
                                        </p>
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
                                        <p className="text-muted-foreground">
                                          —
                                        </p>
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
                                              alt={
                                                product.currency_name ||
                                                "Currency"
                                              }
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                        ) : null}
                                        <span className="text-primary">
                                          {product.currency_name ||
                                            "Не указана"}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                  <CardFooter className="pt-0 flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(product)}
                                    >
                                      <Edit className="h-3.5 w-3.5 mr-1" />
                                      Редактировать
                                    </Button>
                                  </CardFooter>
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
                                        replenishmentOptions.map(
                                          (option, index) => (
                                            <div
                                              key={index}
                                              className="p-3 border rounded-md flex justify-between items-center bg-white hover:bg-muted/5 transition-colors"
                                            >
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium text-primary">
                                                    {option.amount !== undefined
                                                      ? option.amount
                                                      : "N/A"}
                                                  </span>
                                                  <Badge
                                                    variant="secondary"
                                                    className="px-2 py-0.5"
                                                  >
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
                                                  onClick={() =>
                                                    handleCreateOrder(
                                                      product.id
                                                    )
                                                  }
                                                  className="bg-primary"
                                                >
                                                  <ShoppingCart className="h-3 w-3 mr-1" />
                                                  Купить
                                                </Button>
                                              </div>
                                            </div>
                                          )
                                        )
                                      ) : (
                                        <div className="text-center p-6 border rounded-md bg-muted/5">
                                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/20 mb-3">
                                            <AlertCircle className="h-6 w-6 text-muted-foreground" />
                                          </div>
                                          <p className="text-muted-foreground text-primary font-medium">
                                            Нет вариантов пополнения
                                          </p>
                                          <p className="text-sm text-muted-foreground text-primary mt-1">
                                            {typeof product.replenishment ===
                                            "string"
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
                                        order_number: product.order_number,
                                        description: product.description,
                                        image: product.image,
                                        replenishment: product.replenishment, // Show the original replenishment data
                                        replenishment_parsed:
                                          replenishmentOptions, // Also show the parsed version
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
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground text-primary">
          Страница {page} из {totalPages}
        </div>
        <div className="flex items-center space-x-2 text-primary">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Show pages around current page
              let pageNum = page - 2 + i;
              if (pageNum <= 0) pageNum = i + 1;
              if (pageNum > totalPages) return null;

              return (
                <Button
                  key={i}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    pageNum === page && "bg-primary"
                  )}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <>
                <span className="mx-1 text-primary">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8"
          >
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Редактировать товар
            </DialogTitle>
            <DialogDescription className="text-primary">
              Измените детали товара. Нажмите сохранить, когда закончите.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              productId={editingProduct.id}
              defaultValues={{
                name: editingProduct.name,
                order_number: editingProduct.order_number,
                description: editingProduct.description,
                description_en: editingProduct.description_en,
                image: editingProduct.image || "",
                replenishment: parseReplenishment(editingProduct).map(
                  (item) => ({
                    amount: item.amount || 1,
                    type: item.type || "",
                    price: item.price || 0,
                    sku: item.sku || "",
                    error: item.error,
                  })
                ),
                smile_api_game: editingProduct.smile_api_game || "", // Preserve original value without modification
                donatbank_product_id: editingProduct.donatbank_product_id || "",
                type: editingProduct.type || "",
                currency_image: editingProduct.currency_image || "",
                currency_name: editingProduct.currency_name || "",
                // Add required fields from API response
                isServerRequired: editingProduct.isServerRequired || false,
                requireUserId: editingProduct.requireUserId ?? true,
                requireServer: editingProduct.requireServer || false,
                requireEmail: editingProduct.requireEmail || false,
                requireUID: editingProduct.requireUID || false,
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleteConfirmProduct}
        onOpenChange={(open) => !open && setDeleteConfirmProduct(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Подтверждение удаления
            </DialogTitle>
            <DialogDescription className="text-primary">
              Вы уверены, что хотите удалить этот товар? Это действие нельзя
              отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md bg-red-50 my-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">
                  {deleteConfirmProduct?.name}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  ID: {deleteConfirmProduct?.id}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmProduct(null)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
