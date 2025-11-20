//@ts-nocheck

"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Trash,
  User,
  Server,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "../status-badge/status-badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { Order } from "./order";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

interface OrderRowProps {
  order: Order;
  onViewDetails: (order: Order) => void;
}

export function OrderRow({ order, onViewDetails }: OrderRowProps) {
  const queryClient = useQueryClient();

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
    if (id && confirm("Вы уверены, что хотите удалить этот заказ?")) {
      deleteOrderMutation.mutate(id);
    }
  };

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium">
        <div className="font-mono text-primary">
          #{order.orderId || order.id}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-primary">
            {order.user?.id || order.customer || "—"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {order.original_price &&
          order.final_price &&
          order.original_price !== order.final_price ? (
            <>
              <p className="text-xs text-muted-foreground line-through">
                {order.original_price} {order.currency || "₽"}
              </p>
              <p className="text-sm font-medium text-primary">
                {order.final_price} {order.currency || "₽"}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {order.package_discount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    -{order.package_discount}% пакет
                  </Badge>
                )}
                {order.telegram_discount > 0 && (
                  <Badge
                    variant="default"
                    className="text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    📱 -{order.telegram_discount}% TG
                  </Badge>
                )}
                {order.coupon_discount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    -{order.coupon_discount} купон
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm font-medium text-primary">
              {order.price
                ? String(order.price).replace(/\s*\?/g, "")
                : order.final_price || "—"}{" "}
              {order.currency || "₽"}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          {(order.playerId || order.account_id) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{order.playerId || order.account_id}</span>
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
      <TableCell className="text-sm text-muted-foreground">
        {order.method?.toUpperCase() ?? "—"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {order.product?.image && (
            <img
              src={order.product.image}
              alt={order.product.name}
              className="w-8 h-8 rounded-md object-cover"
            />
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary">
              {order.product?.name ?? "—"}
            </span>
            {/* Отображение количества для кастомных заказов */}
            {(() => {
              // Проверяем, является ли заказ кастомным
              const isCustomOrder =
                order.response &&
                typeof order.response === "object" &&
                "custom_amount" in order.response;

              if (isCustomOrder) {
                return (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      Кастом
                    </Badge>
                    {order.response.custom_amount} шт.
                  </span>
                );
              }

              // Для обычных заказов показываем diamonds если есть
              if (order.diamonds) {
                return (
                  <span className="text-xs text-muted-foreground">
                    {order.diamonds} шт.
                  </span>
                );
              }

              return null;
            })()}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <StatusBadge status={order.status || "unknown"} />
      </TableCell>
      <TableCell>
        {order.response ? (
          (() => {
            try {
              // Check if response is already an object
              if (
                typeof order.response === "object" &&
                order.response !== null
              ) {
                return (
                  <div className="space-y-1 flex flex-col items-center justify-center">
                    {order.response.type && (
                      <Badge variant="outline">{order.response.type}</Badge>
                    )}
                    {order.response.message && (
                      <StatusBadge status={order.response.message} />
                    )}
                  </div>
                );
              }

              // If it's a string, try to clean and parse it
              if (typeof order.response === "string") {
                // Look for JSON pattern and extract it
                const jsonMatch = order.response.match(/\{[^}]*\}/);
                if (jsonMatch) {
                  const jsonStr = jsonMatch[0];
                  const parsed = JSON.parse(jsonStr);
                  return (
                    <div className="space-y-1 flex flex-col items-center justify-center">
                      {parsed.type && (
                        <Badge variant="outline">{parsed.type}</Badge>
                      )}
                      {parsed.message && (
                        <StatusBadge status={parsed.message} />
                      )}
                    </div>
                  );
                }
              }

              return (
                <div className="text-gray-400 text-sm">
                  Invalid response format
                </div>
              );
            } catch (e) {
              console.error(
                "Error parsing order response:",
                e,
                "Raw response:",
                order.response
              );
              // Show a safe fallback
              return (
                <div className="text-red-500 text-xs" title="Parse error">
                  Parse error
                </div>
              );
            }
          })()
        ) : (
          <div className="text-gray-400 text-sm">No response</div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {(() => {
              const date = order.date || "";
              const time = order.time || "";
              const dateTimeString = `${date} ${time}`.trim();
              return dateTimeString || "—";
            })()}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewDetails(order)}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Просмотр</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Открыть меню</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  const id = order.orderId || order.id;
                  if (id) handleDelete(id);
                }}
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
  );
}
