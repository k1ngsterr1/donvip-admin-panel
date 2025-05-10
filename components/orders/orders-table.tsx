"use client";

import { useState } from "react";
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
import { MoreHorizontal, Eye, Trash, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "../status-badge/status-badge";

interface Order {
  id: string;
  price: number;
  amount: number;
  type: string;
  payment: string;
  account_id?: string;
  server_id?: string;
  status: string;
  date: string;
  customer: string;
}

export function OrdersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", page, limit],
    queryFn: async () => {
      const response = await api.orders.getAll({ page, limit });
      return response.data;
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => api.orders.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Заказ удален",
        description: "Заказ был успешно удален.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заказ. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
      deleteOrderMutation.mutate(id);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
  };

  const handlePayment = (order: Order) => {
    setSelectedOrder(order);
    setPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentDialog(false);
    setSelectedOrder(null);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Ошибка загрузки заказов. Пожалуйста, попробуйте снова.
      </div>
    );
  }

  // Ensure orders is always an array
  const orders: Order[] = Array.isArray(data) ? data : [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID заказа</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Детали</TableHead>
              <TableHead>Оплата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <div className="font-mono text-primary">#{order.id}</div>
                </TableCell>
                <TableCell className="text-primary">{order.customer}</TableCell>
                <TableCell>
                  <div className="text-primary">
                    <p>
                      {order.amount} {order.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₽{order.price}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-primary">{order.payment}</p>
                    {order.account_id && (
                      <p className="text-xs text-muted-foreground">
                        Аккаунт: {order.account_id}
                      </p>
                    )}
                    {order.server_id && (
                      <p className="text-xs text-muted-foreground">
                        Сервер: {order.server_id}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-primary">{order.date}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-primary" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(order.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder && !paymentDialog}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Детали заказа #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Полная информация о заказе.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Клиент
                  </p>
                  <p>{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Статус
                  </p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Товар
                  </p>
                  <p className="text-primary">
                    {selectedOrder.amount} {selectedOrder.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Цена
                  </p>
                  <p className="text-primary">₽{selectedOrder.price}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Способ оплаты
                  </p>
                  <p>{selectedOrder.payment}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Дата
                  </p>
                  <p>{selectedOrder.date}</p>
                </div>
                {selectedOrder.account_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      ID аккаунта
                    </p>
                    <p>{selectedOrder.account_id}</p>
                  </div>
                )}
                {selectedOrder.server_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      ID сервера
                    </p>
                    <p>{selectedOrder.server_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialog}
        onOpenChange={(open) => !open && setPaymentDialog(false)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Оплата заказа #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>Выберите способ оплаты.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <Tabs defaultValue="tbank">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tbank">Т-Банк</TabsTrigger>
                <TabsTrigger value="pagsmile">Pagsmile</TabsTrigger>
              </TabsList>
              <TabsContent value="tbank" className="space-y-4 pt-4">
                <div className="text-center">
                  <p className="mb-4">
                    Оплата через Т-Банк на сумму ₽{selectedOrder.price}
                  </p>
                  <Button
                    className="bg-primary w-full"
                    onClick={() => {
                      toast({
                        title: "Перенаправление на оплату",
                        description:
                          "Вы будете перенаправлены на страницу оплаты Т-Банка.",
                      });
                      // In a real app, this would redirect to the payment page
                      setTimeout(handlePaymentSuccess, 1500);
                    }}
                  >
                    Перейти к оплате
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="pagsmile" className="space-y-4 pt-4">
                <div className="text-center">
                  <p className="mb-4">
                    Оплата через Pagsmile на сумму ₽{selectedOrder.price}
                  </p>
                  <Button
                    className="bg-primary w-full"
                    onClick={() => {
                      toast({
                        title: "Перенаправление на оплату",
                        description:
                          "Вы будете перенаправлены на страницу оплаты Pagsmile.",
                      });
                      // In a real app, this would redirect to the payment page
                      setTimeout(handlePaymentSuccess, 1500);
                    }}
                  >
                    Перейти к оплате
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
