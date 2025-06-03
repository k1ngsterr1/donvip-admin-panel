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
    if (confirm("Вы уверены, что хотите удалить этот заказ?")) {
      deleteOrderMutation.mutate(id);
    }
  };

  return (
    <TableRow key={order.orderId || order.id} className="hover:bg-muted/30">
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
          <p className="mt-1 text-sm font-medium text-primary">{order.price}</p>
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
          <span className="text-sm font-medium text-primary">
            {order.product?.name ?? "—"}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <StatusBadge status={order.status} />
      </TableCell>
      <TableCell>
        {order.response ? (
          (() => {
            try {
              const parsed = JSON.parse(order.response);
              return (
                <div className="space-y-1 flex flex-col items-center justify-center">
                  <Badge variant="outline">{parsed.type}</Badge>
                  <StatusBadge status={parsed.message} />
                </div>
              );
            } catch (e) {
              return <div className="text-red-500 text-sm">-</div>;
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
            {format(
              new Date(`${order.date} ${order.time}`),
              "dd.MM.yyyy HH:mm"
            )}
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
                onClick={() => handleDelete(order.orderId || order.id)}
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
