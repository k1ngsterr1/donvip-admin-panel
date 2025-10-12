//@ts-nocheck

"use client";

import type React from "react";

import { TableCell } from "@/components/ui/table";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
} from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderRow } from "./order-row";
import { OrderDetailsDialog } from "./order-details-dialog";
import { OrdersTableSkeleton } from "./orders-table-skeleton";
import { OrdersTableLoading } from "./orders-loading";
import {
  OrderFilters,
  type OrderFilters as OrderFiltersType,
} from "./order-filters";
import type { Order } from "./order";
import { PaymentDialog } from "./payment-dialog";

const defaultFilters: OrderFiltersType = {
  search: "",
  status: "all",
  paymentMethod: "all",
  productId: "",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  providerStatus: "all",
};

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [filters, setFilters] = useState<OrderFiltersType>(defaultFilters);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const queryClient = useQueryClient();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setPageInput("1");
  }, [filters]);

  // Update page input when page changes
  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  // Fetch orders with proper server-side pagination
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["orders", page, limit, filters],
    queryFn: async () => {
      const params: any = {
        page,
        limit,
      };

      // Add filters to API call
      if (filters.search) params.search = filters.search;
      if (filters.status !== "all") params.status = filters.status;
      if (filters.paymentMethod !== "all")
        params.paymentMethod = filters.paymentMethod;
      if (filters.productId) params.productId = filters.productId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;
      if (filters.providerStatus !== "all")
        params.providerStatus = filters.providerStatus;

      const response = await api.orders.getAllForAdmin(params);
      return response.data;
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
    keepPreviousData: true, // Keep previous data while loading new data
  });

  // Orders from API response
  const allOrders: Order[] = Array.isArray(data?.data)
    ? data.data.filter((order) => order && (order.orderId || order.id))
    : [];

  // Get total count and pagination info from API response
  const totalFromApi =
    data?.total || data?.pagination?.total || allOrders.length;
  const totalPages = Math.ceil(totalFromApi / limit);

  // Since filtering and pagination are now done server-side, we just use the orders from API
  const filteredOrders = allOrders;
  const paginatedOrders = allOrders; // API already returns paginated results

  // Calculate pagination info using server data
  const total = totalFromApi;
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handlePaymentSuccess = () => {
    setPaymentDialog(false);
    setSelectedOrder(null);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const handleOpenPayment = () => {
    setPaymentDialog(true);
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number(newLimit));
    setPage(1); // Reset to first page when changing limit
  };

  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters(defaultFilters);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = Number.parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      setPageInput("");
    }
  };

  const handleExport = async () => {
    try {
      // Export filtered results
      const csvContent = [
        // CSV Header
        [
          "ID заказа",
          "Клиент",
          "Стоимость",
          "Метод",
          "Продукт",
          "Статус",
          "Дата",
        ].join(","),
        // CSV Data
        ...filteredOrders.map((order) =>
          [
            order.orderId,
            order.playerId || order.account_id,
            order.price || "—",
            order.method || "—",
            order.product?.name || "—",
            order.status,
            order.date,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `orders_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Ошибка при экспорте данных");
    }
  };

  // Generate page numbers for pagination with better logic
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    const sidePages = 2;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, page - sidePages);
      let endPage = Math.min(totalPages - 1, page + sidePages);

      // Adjust range if we're near the beginning
      if (page <= sidePages + 2) {
        endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
      }

      // Adjust range if we're near the end
      if (page >= totalPages - sidePages - 1) {
        startPage = Math.max(2, totalPages - maxVisiblePages + 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page if there's more than one page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Show loading state for initial load
  if (isLoading) {
    return <OrdersTableLoading />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Ошибка загрузки заказов. Пожалуйста, попробуйте снова.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление заказами</CardTitle>
              <CardDescription>
                Просмотр и управление всеми заказами в системе
                {isFetching && (
                  <span className="ml-2 text-blue-600 animate-pulse">
                    • Загружаем данные...
                  </span>
                )}
                {!isFetching && (
                  <span className="ml-2 text-green-600">
                    • Показано {allOrders.length} заказов (стр. {page} из{" "}
                    {totalPages})
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
                disabled={filteredOrders.length === 0}
              >
                <Download className="h-4 w-4" />
                Экспорт ({filteredOrders.length})
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Показать:</span>
                <Select
                  value={limit.toString()}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">заказов</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <OrdersTableSkeleton />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>ID заказа</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Cтоимость</TableHead>
                      <TableHead>Детали</TableHead>
                      <TableHead>Метод</TableHead>
                      <TableHead>Продукт</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Статус провайдера</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          {Object.values(filters).some(
                            (value) => value !== "" && value !== "all"
                          ) ? (
                            <div className="text-muted-foreground">
                              <p className="font-medium">Заказы не найдены</p>
                              <p className="text-sm">
                                Попробуйте изменить параметры фильтрации. Всего
                                заказов: {allOrders.length}
                              </p>
                            </div>
                          ) : (
                            "Заказы не найдены"
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedOrders
                        .filter((order) => order && (order.orderId || order.id))
                        .map((order: Order) => (
                          <OrderRow
                            key={order.orderId || order.id}
                            order={order}
                            onViewDetails={handleViewDetails}
                          />
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Enhanced Pagination - Only show if there are orders */}
              {total > 0 && (
                <div className="mt-6 space-y-4">
                  {/* Info and page size selector */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Показано {startItem}-{endItem} из {total} заказов
                      {total !== allOrders.length && (
                        <span className="ml-1">
                          (отфильтровано из {allOrders.length})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Страница {page} из {totalPages}
                    </div>
                  </div>

                  {/* Main pagination controls - Only show if more than one page */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      {/* Navigation buttons */}
                      <div className="flex items-center gap-1">
                        {/* First page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(1)}
                          disabled={page === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                          Первая
                        </Button>

                        {/* Previous page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Пред.
                        </Button>
                      </div>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((pageNum, index) => (
                          <div key={index}>
                            {pageNum === "..." ? (
                              <span className="px-3 py-2 text-muted-foreground">
                                ...
                              </span>
                            ) : (
                              <Button
                                variant={
                                  page === pageNum ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setPage(pageNum as number)}
                                className="min-w-[40px]"
                              >
                                {pageNum}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex items-center gap-1">
                        {/* Next page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={page === totalPages}
                          className="flex items-center gap-1"
                        >
                          След.
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Last page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          disabled={page === totalPages}
                          className="flex items-center gap-1"
                        >
                          Последняя
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Direct page navigation - Only show if more than 5 pages */}
                  {totalPages > 5 && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Перейти на страницу:
                      </span>
                      <form
                        onSubmit={handlePageInputSubmit}
                        className="flex items-center gap-2"
                      >
                        <Input
                          type="number"
                          min="1"
                          max={totalPages}
                          value={pageInput}
                          onChange={(e) => setPageInput(e.target.value)}
                          placeholder={page.toString()}
                          className="w-20 text-center"
                        />
                        <Button type="submit" variant="outline" size="sm">
                          Перейти
                        </Button>
                      </form>
                      <span className="text-sm text-muted-foreground">
                        из {totalPages}
                      </span>
                    </div>
                  )}

                  {/* Quick jump buttons for large datasets */}
                  {totalPages > 20 && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Быстрый переход:
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 10))}
                        disabled={page <= 10}
                      >
                        -10
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 5))}
                        disabled={page <= 5}
                      >
                        -5
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 5))}
                        disabled={page > totalPages - 5}
                      >
                        +5
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 10))}
                        disabled={page > totalPages - 10}
                      >
                        +10
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOpenPayment={handleOpenPayment}
      />
      <PaymentDialog
        open={paymentDialog}
        order={selectedOrder}
        onClose={() => setPaymentDialog(false)}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
