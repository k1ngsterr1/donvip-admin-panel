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
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CreditCard,
  Eye,
  MoreHorizontal,
  Search,
  Server,
  Trash,
  User,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "../status-badge/status-badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Order {
  id: string;
  orderId?: string;
  price: number;
  amount: number;
  type: string;
  payment: string;
  account_id?: string;
  playerId?: string;
  server_id?: string;
  serverId?: string | null;
  status: string;
  date: string;
  customer: string;
  user?: {
    id: string;
  };
}

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

  const handlePaymentSuccess = () => {
    setPaymentDialog(false);
    setSelectedOrder(null);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
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
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ID заказа или клиенту..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
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
                      <TableHead>Статус</TableHead>
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
                        <TableRow
                          key={order.orderId || order.id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="font-medium">
                            <div className="font-mono text-primary">
                              #{order.orderId || order.id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-primary">
                                {order.user?.id || order.customer}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="mt-1 text-sm font-medium text-primary">
                                {order.price}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {(order.playerId || order.account_id) && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  <span>
                                    {order.playerId || order.account_id}
                                  </span>
                                </div>
                              )}
                              {order.serverId && order.serverId !== "N/A" && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Server className="h-3 w-3" />
                                  <span>{order.serverId}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{order.date}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(order)}
                                className="h-8 w-8"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Просмотр</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <span className="sr-only">
                                      Открыть меню
                                    </span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    Действия
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDelete(order.orderId as any)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
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

      <Dialog
        open={!!selectedOrder && !paymentDialog}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Детали заказа #{selectedOrder?.orderId || selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>Полная информация о заказе</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Клиент
                  </p>
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" />
                    <p className="font-medium">
                      {selectedOrder.user?.id || selectedOrder.customer}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Статус
                  </p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Товар
                  </p>
                  <p className="font-medium text-primary">
                    {selectedOrder.amount} {selectedOrder.type}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Цена
                  </p>
                  <p className="font-medium text-primary">
                    {selectedOrder.price} ₽
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Способ оплаты
                  </p>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <p className="font-medium">{selectedOrder.payment}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">
                    Дата
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <p className="font-medium">{selectedOrder.date}</p>
                  </div>
                </div>
                {(selectedOrder.account_id || selectedOrder.playerId) && (
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                      ID аккаунта
                    </p>
                    <p className="font-medium">
                      {selectedOrder.account_id || selectedOrder.playerId}
                    </p>
                  </div>
                )}
                {(selectedOrder.server_id || selectedOrder.serverId) && (
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-muted-foreground">
                      ID сервера
                    </p>
                    <p className="font-medium">
                      {selectedOrder.server_id || selectedOrder.serverId}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                >
                  Закрыть
                </Button>
                {selectedOrder.status === "pending" && (
                  <Button onClick={() => setPaymentDialog(true)}>
                    Оплатить
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={paymentDialog}
        onOpenChange={(open) => !open && setPaymentDialog(false)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Оплата заказа #{selectedOrder?.orderId || selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>Выберите способ оплаты</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <Tabs defaultValue="tbank">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tbank">Т-Банк</TabsTrigger>
                <TabsTrigger value="pagsmile">Pagsmile</TabsTrigger>
              </TabsList>
              <TabsContent value="tbank" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="mb-4 text-lg font-medium">
                        Оплата через Т-Банк
                      </p>
                      <div className="mb-6 rounded-lg bg-muted p-4">
                        <p className="text-2xl font-bold">
                          {selectedOrder.price} ₽
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Итоговая сумма
                        </p>
                      </div>
                      <Button
                        className="w-full"
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
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pagsmile" className="space-y-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="mb-4 text-lg font-medium">
                        Оплата через Pagsmile
                      </p>
                      <div className="mb-6 rounded-lg bg-muted p-4">
                        <p className="text-2xl font-bold">
                          {selectedOrder.price} ₽
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Итоговая сумма
                        </p>
                      </div>
                      <Button
                        className="w-full"
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
