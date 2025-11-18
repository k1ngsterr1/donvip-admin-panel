"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  XCircle,
  Plus,
  Power,
  PowerOff,
  Filter,
  CreditCard,
  AlertCircle,
  Globe,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  PaymentMethodService,
  PaymentMethod,
  Country,
} from "@/services/payment-method-service";
import { PaymentMethodForm } from "./payment-method-form";
import { getIconUrl } from "@/lib/icon-utils";

export function PaymentMethodsTable() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [deleteConfirmMethod, setDeleteConfirmMethod] =
    useState<PaymentMethod | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const queryClient = useQueryClient();

  // Fetch payment methods
  const {
    data: paymentMethods,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["payment-methods", countryFilter, activeFilter],
    queryFn: async () => {
      const filters = {
        ...(countryFilter !== "all" && { country: countryFilter }),
        ...(activeFilter === "active" && { isActive: true }),
        ...(activeFilter === "inactive" && { isActive: false }),
      };
      return PaymentMethodService.getPaymentMethods(filters);
    },
  });

  // Fetch countries for filter
  const { data: countries } = useQuery({
    queryKey: ["supported-countries"],
    queryFn: () => PaymentMethodService.getAllSupportedCountries(),
  });

  // Delete mutation
  const deleteMethodMutation = useMutation({
    mutationFn: (id: number) => PaymentMethodService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Платежный метод удален",
        description: "Платежный метод был успешно удален.",
      });
      setDeleteConfirmMethod(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить платежный метод. Попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  // Move up mutation
  const moveUpMutation = useMutation({
    mutationFn: (id: number) => PaymentMethodService.movePaymentMethodUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Успешно",
        description: "Платежный метод перемещен вверх.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось переместить платежный метод.",
        variant: "destructive",
      });
    },
  });

  // Move down mutation
  const moveDownMutation = useMutation({
    mutationFn: (id: number) => PaymentMethodService.movePaymentMethodDown(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({
        title: "Успешно",
        description: "Платежный метод перемещен вниз.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось переместить платежный метод.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (method: PaymentMethod) => {
    setDeleteConfirmMethod(method);
  };

  const confirmDelete = () => {
    if (deleteConfirmMethod) {
      deleteMethodMutation.mutate(deleteConfirmMethod.id);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
  };

  const handleMoveUp = (id: number) => {
    moveUpMutation.mutate(id);
  };

  const handleMoveDown = (id: number) => {
    moveDownMutation.mutate(id);
  };

  const handleFormSuccess = () => {
    setEditingMethod(null);
    setShowCreateForm(false);
    queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    toast({
      title: "Успешно",
      description: "Платежный метод был успешно сохранен.",
    });
  };

  // Filter methods based on search and sort by sortOrder and name
  const filteredMethods =
    paymentMethods?.data
      ?.filter(
        (method) =>
          method.name.toLowerCase().includes(search.toLowerCase()) ||
          method.code.toLowerCase().includes(search.toLowerCase()) ||
          method.country.toLowerCase().includes(search.toLowerCase()) ||
          method.currency.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        // First sort by sortOrder (default to 0 if undefined)
        const orderA = a.sortOrder ?? 0;
        const orderB = b.sortOrder ?? 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Then sort by name
        return a.name.localeCompare(b.name);
      }) || [];

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
          <CardTitle className="text-xl text-red-800 mt-4">
            Ошибка загрузки платежных методов
          </CardTitle>
          <CardDescription className="text-red-600">
            Не удалось загрузить список платежных методов. Пожалуйста,
            попробуйте снова.
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

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <Card className="border-muted/40">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск по названию, коду, стране..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все страны</SelectItem>
                    {countries?.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="active">Активные</SelectItem>
                    <SelectItem value="inactive">Неактивные</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Добавить метод
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results info */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Найдено {filteredMethods.length} платежных методов
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-medium">Иконка</TableHead>
              <TableHead className="font-medium">Название</TableHead>
              <TableHead className="font-medium">Код</TableHead>
              <TableHead className="font-medium">Страна</TableHead>
              <TableHead className="font-medium">Валюта</TableHead>
              <TableHead className="font-medium">Комиссия</TableHead>
              <TableHead className="font-medium">Статус</TableHead>
              <TableHead className="text-right font-medium">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMethods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <CreditCard className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Нет платежных методов
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Добавьте первый платежный метод для начала работы
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMethods.map((method) => (
                <TableRow key={method.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {method.icon ? (
                        <img
                          src={getIconUrl(method.icon) || ""}
                          alt={method.name}
                          className="h-8 w-8 object-contain rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{method.name}</p>
                          {method.isMoneta && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Moneta
                            </Badge>
                          )}
                          {method.isDukPay && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                            >
                              DukPay
                            </Badge>
                          )}
                        </div>
                        {method.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {method.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {method.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {method.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {method.currency}
                    </div>
                  </TableCell>

                  <TableCell>
                    {method.fee ? (
                      <span>{method.fee}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={method.isActive ? "default" : "secondary"}
                      className={
                        method.isActive
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }
                    >
                      {method.isActive ? (
                        <>
                          <Power className="h-3 w-3 mr-1" />
                          Активен
                        </>
                      ) : (
                        <>
                          <PowerOff className="h-3 w-3 mr-1" />
                          Неактивен
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Move Up Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(method.id)}
                        disabled={moveUpMutation.isPending}
                        title="Переместить вверх"
                        className="h-8 w-8 hover:bg-muted"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>

                      {/* Move Down Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(method.id)}
                        disabled={moveDownMutation.isPending}
                        title="Переместить вниз"
                        className="h-8 w-8 hover:bg-muted"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>

                      {/* More Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-muted h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(method)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(method)}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Добавить платежный метод</DialogTitle>
            <DialogDescription>
              Создайте новый платежный метод для определенной страны.
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingMethod}
        onOpenChange={(open) => !open && setEditingMethod(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать платежный метод</DialogTitle>
            <DialogDescription>
              Измените параметры платежного метода.
            </DialogDescription>
          </DialogHeader>
          {editingMethod && (
            <PaymentMethodForm
              paymentMethod={editingMethod}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmMethod}
        onOpenChange={(open) => !open && setDeleteConfirmMethod(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот платежный метод? Это действие
              нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md bg-red-50 my-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">
                  {deleteConfirmMethod?.name}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Код: {deleteConfirmMethod?.code} | Страна:{" "}
                  {deleteConfirmMethod?.country}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmMethod(null)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMethodMutation.isPending}
            >
              {deleteMethodMutation.isPending ? (
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
