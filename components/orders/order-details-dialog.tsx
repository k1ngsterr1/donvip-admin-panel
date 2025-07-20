"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Calendar, CreditCard } from "lucide-react";
import { StatusBadge } from "../status-badge/status-badge";
import { Order } from "./order";

interface OrderDetailsDialogProps {
  order: Order | null;
  onClose: () => void;
  onOpenPayment: () => void;
}

export function OrderDetailsDialog({
  order,
  onClose,
  onOpenPayment,
}: OrderDetailsDialogProps) {
  if (!order) return null;
  let replenishment = { amount: 0, price: 0 };

  try {
    const parsed = Array.isArray(order.product.replenishment)
      ? order.product.replenishment
      : JSON.parse(order.product.replenishment as any);

    if (parsed && parsed[order.itemId]) {
      replenishment = parsed[order.itemId];
    }
  } catch (err) {
    console.log("Error when parsing replenishment in getAllForAdmin", err);
  }
  console.log("ORDER", order.product.replenishment);
  console.log("REPLENISMENT", replenishment);

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Детали заказа #{order.orderId || order.id}</DialogTitle>
          <DialogDescription>Полная информация о заказе</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Клиент
              </p>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />
                <p className="font-medium">
                  {order.user?.id || order.customer}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Статус
              </p>
              <StatusBadge status={order.status} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Пакет</p>
              <p className="font-medium text-primary">
                {order.product.name} {replenishment.amount}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Цена</p>
              <p className="font-medium text-primary">
                {String(order.price).replace(/\s*\?/g, "")}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                Способ оплаты
              </p>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-primary" />
                <p className="font-medium">{order.method}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Дата</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="font-medium">{order.date}</p>
              </div>
            </div>
            {(order.account_id || order.playerId) && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">
                  ID аккаунта
                </p>
                <p className="font-medium">
                  {order.account_id || order.playerId}
                </p>
              </div>
            )}
            {(order.server_id || order.serverId) && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">
                  ID сервера
                </p>
                <p className="font-medium">
                  {order.server_id || order.serverId}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            {order.status === "pending" && (
              <Button onClick={onOpenPayment}>Оплатить</Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
