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
import { Badge } from "@/components/ui/badge";
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

  // Проверяем, является ли это кастомным заказом
  const isCustomOrder =
    order.response &&
    typeof order.response === "object" &&
    "custom_amount" in order.response &&
    "custom_price" in order.response;

  try {
    if (order.product?.replenishment) {
      const parsed = Array.isArray(order.product.replenishment)
        ? order.product.replenishment
        : (() => {
            try {
              // Clean the replenishment string from invalid characters
              let replenishmentStr =
                typeof order.product.replenishment === "string"
                  ? order.product.replenishment
                  : JSON.stringify(order.product.replenishment);

              // Remove invalid Unicode characters
              replenishmentStr = replenishmentStr.replace(
                /[\u0000-\u001F\u007F-\u009F]/g,
                ""
              );
              replenishmentStr = replenishmentStr.replace(
                /[^\x20-\x7E\u00A0-\uFFFF]/g,
                ""
              );

              return JSON.parse(replenishmentStr);
            } catch (parseError) {
              console.error("Error parsing replenishment data:", parseError);
              return null;
            }
          })();

      if (parsed && parsed[order.itemId as any]) {
        replenishment = parsed[order.itemId as any];
      }
    }
  } catch (err) {
    console.log("Error when parsing replenishment in getAllForAdmin", err);
  }

  // Для кастомного заказа используем данные из response
  if (isCustomOrder) {
    replenishment = {
      amount: order.response.custom_amount,
      price: order.response.custom_price,
    };
  }

  console.log("ORDER", order.product.replenishment);
  console.log("REPLENISMENT", replenishment);
  console.log("IS CUSTOM ORDER", isCustomOrder);

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
              <StatusBadge status={order.status as any} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Пакет</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-primary">
                  {isCustomOrder
                    ? // Для кастомного заказа только количество
                      `${replenishment.amount} шт.`
                    : // Для обычного заказа название + количество
                      `${order.product.name} ${replenishment.amount}`}
                </p>
                {isCustomOrder && (
                  <Badge variant="secondary" className="text-xs">
                    Кастомное значение
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">Цена</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-primary">
                  {order.price
                    ? String(order.price).replace(/\s*\?/g, "")
                    : "—"}{" "}
                  ₽
                </p>
                {isCustomOrder && (
                  <Badge variant="outline" className="text-xs">
                    Кастомная цена: {replenishment.price} ₽
                  </Badge>
                )}
              </div>
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

          {/* Discount Information Section */}
          {(order.telegram_discount ||
            order.package_discount ||
            order.coupon_discount) && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">Примененные скидки</p>
              <div className="space-y-2">
                {order.package_discount &&
                  Number(order.package_discount) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Скидка пакета
                      </span>
                      <Badge variant="secondary">
                        {order.package_discount}%
                      </Badge>
                    </div>
                  )}
                {order.telegram_discount &&
                  Number(order.telegram_discount) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Telegram скидка
                      </span>
                      <Badge variant="default" className="bg-blue-600">
                        {order.telegram_discount}% 📱
                      </Badge>
                    </div>
                  )}
                {order.coupon_discount && Number(order.coupon_discount) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Купон</span>
                    <Badge variant="outline">-{order.coupon_discount} ₽</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

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
