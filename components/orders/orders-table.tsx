"use client";

import { TableCell } from "@/components/ui/table";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderRow } from "./order-row";
import { OrderDetailsDialog } from "./order-details-dialog";
import { OrdersTableSkeleton } from "./orders-table-skeleton";
import { SearchBar } from "./search-bar";
import { Order } from "./order";
import { PaymentDialog } from "./payment-dialog";

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", page, limit, searchQuery],
    queryFn: async () => {
      const response = await api.orders.getAllForAdmin({
        page,
        limit,
        search: searchQuery,
      });
      return response.data;
    },
  });

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

  // Ensure orders is always an array
  const orders: Order[] = Array.isArray(data?.data) ? data.data : [];
  const totalPages = data?.totalPages || 1;

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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Управление заказами</CardTitle>
          <CardDescription>
            Просмотр и управление всеми заказами в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
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
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Заказы не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order: Order) => (
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
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Страница {page} из {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
