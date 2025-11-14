"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface OrderFilters {
  search: string;
  status: string;
  paymentMethod: string;
  productId: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  providerStatus: string;
  hasTelegramDiscount: string; // 'all' | 'yes' | 'no'
}

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "all", label: "Все статусы" },
  { value: "Pending", label: "В ожидании" },
  { value: "Paid", label: "Оплачен" },
  { value: "Cancelled", label: "Отменен" },
];

const paymentMethodOptions = [
  { value: "all", label: "Все методы" },
  { value: "SBP", label: "СБП" },
  { value: "CreditCard", label: "Банковская карта" },
  { value: "SberPay", label: "SberPay" },
  { value: "T-Bank", label: "Т-Банк" },
];

const providerStatusOptions = [
  { value: "all", label: "Все статусы провайдера" },
  { value: "pending", label: "Ожидает" },
  { value: "processing", label: "Обрабатывается" },
  { value: "success", label: "Успешно" },
  { value: "failed", label: "Ошибка" },
  { value: "cancelled", label: "Отменено" },
];

const telegramDiscountOptions = [
  { value: "all", label: "Все заказы" },
  { value: "yes", label: "С Telegram скидкой 📱" },
  { value: "no", label: "Без Telegram скидки" },
];

export function OrderFilters({
  filters,
  onFiltersChange,
  onReset,
}: OrderFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({
          ...filters,
          search: localSearch,
        });
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [localSearch, filters, onFiltersChange]);

  // Update local search when filters change externally (like reset)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const updateFilter = (key: keyof OrderFilters, value: string) => {
    console.log("🎛️ UpdateFilter called:", key, "=", value);
    const newFilters = {
      ...filters,
      [key]: value,
    };
    console.log("🎛️ New filters object:", newFilters);
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return false; // Don't count search as a filter
      if (value === "all") return false; // Don't count "all" selections as active filters
      return value !== "";
    }).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const getActiveFilterLabels = () => {
    const labels = [];

    if (filters.status && filters.status !== "all") {
      const statusLabel = statusOptions.find(
        (opt) => opt.value === filters.status
      )?.label;
      labels.push(`Статус: ${statusLabel}`);
    }

    if (filters.paymentMethod && filters.paymentMethod !== "all") {
      const methodLabel = paymentMethodOptions.find(
        (opt) => opt.value === filters.paymentMethod
      )?.label;
      labels.push(`Метод: ${methodLabel}`);
    }

    if (filters.providerStatus && filters.providerStatus !== "all") {
      const providerLabel = providerStatusOptions.find(
        (opt) => opt.value === filters.providerStatus
      )?.label;
      labels.push(`Провайдер: ${providerLabel}`);
    }

    if (filters.hasTelegramDiscount && filters.hasTelegramDiscount !== "all") {
      const telegramLabel = telegramDiscountOptions.find(
        (opt) => opt.value === filters.hasTelegramDiscount
      )?.label;
      labels.push(telegramLabel || "");
    }

    if (filters.productId) {
      labels.push(`Продукт ID: ${filters.productId}`);
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateRange = `${filters.dateFrom || "..."} - ${
        filters.dateTo || "..."
      }`;
      labels.push(`Период: ${dateRange}`);
    }

    if (filters.minAmount || filters.maxAmount) {
      const amountRange = `${filters.minAmount || "0"} - ${
        filters.maxAmount || "∞"
      }`;
      labels.push(`Сумма: ${amountRange}`);
    }

    return labels;
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Фильтры</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Сбросить
                </Button>
              )}
            </div>

            {/* Search bar - always visible */}
            <div className="flex-1 max-w-md ml-4">
              <div className="relative">
                <Input
                  placeholder="Поиск по ID заказа, клиенту, email, ID игрока..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pr-8"
                />
                {localSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLocalSearch("");
                      updateFilter("search", "");
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {getActiveFilterLabels().map((label, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Статус заказа</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Метод оплаты</Label>
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) =>
                    updateFilter("paymentMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите метод" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Provider Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="providerStatus">Статус провайдера</Label>
                <Select
                  value={filters.providerStatus}
                  onValueChange={(value) =>
                    updateFilter("providerStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Telegram Discount Filter */}
              <div className="space-y-2">
                <Label htmlFor="hasTelegramDiscount">Telegram скидка</Label>
                <Select
                  value={filters.hasTelegramDiscount}
                  onValueChange={(value) =>
                    updateFilter("hasTelegramDiscount", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все заказы" />
                  </SelectTrigger>
                  <SelectContent>
                    {telegramDiscountOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product ID Filter */}
              <div className="space-y-2">
                <Label htmlFor="productId">ID продукта</Label>
                <Input
                  id="productId"
                  type="number"
                  placeholder="Введите ID продукта"
                  value={filters.productId}
                  onChange={(e) => updateFilter("productId", e.target.value)}
                />
              </div>

              {/* Date From Filter */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Дата от</Label>
                <div className="relative">
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Date To Filter */}
              <div className="space-y-2">
                <Label htmlFor="dateTo">Дата до</Label>
                <div className="relative">
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter("dateTo", e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Min Amount Filter */}
              <div className="space-y-2">
                <Label htmlFor="minAmount">Мин. сумма</Label>
                <Input
                  id="minAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={(e) => updateFilter("minAmount", e.target.value)}
                />
              </div>

              {/* Max Amount Filter */}
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Макс. сумма</Label>
                <Input
                  id="maxAmount"
                  type="number"
                  step="0.01"
                  placeholder="∞"
                  value={filters.maxAmount}
                  onChange={(e) => updateFilter("maxAmount", e.target.value)}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {activeFiltersCount > 0
                  ? `Применено фильтров: ${activeFiltersCount}`
                  : "Фильтры не применены"}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={activeFiltersCount === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Сбросить все
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Применить фильтры
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
