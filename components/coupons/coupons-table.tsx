// @ts-nocheck
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
import { MoreHorizontal, Edit, Trash, Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CouponForm } from "@/components/coupons/coupon-form";
import { StatusBadge } from "../status-badge/status-badge";

// Define coupon status enum to match Prisma schema
export enum CouponStatus {
  Active = "Active",
  Used = "Used",
  Expired = "Expired",
  Disabled = "Disabled",
}

interface Coupon {
  id: number;
  code: string;
  discount: number;
  limit: number | null;
  used: number;
  status: any;
  created: string;
}

export function CouponsTable() {
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await api.coupons.getAll();
      return response.data;
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id: number) => api.coupons.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Промокод удален",
        description: "Промокод был успешно удален.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description:
          "Не удалось удалить промокод. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const updateCouponStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: any }) => {
      return api.coupons.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast({
        title: "Статус промокода изменен",
        description: "Статус промокода был успешно изменен.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description:
          "Не удалось изменить статус промокода. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот промокод?")) {
      deleteCouponMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number, currentStatus: CouponStatus) => {
    // If coupon is disabled, activate it, otherwise disable it
    const newStatus =
      currentStatus === CouponStatus.Disabled
        ? CouponStatus.Active
        : CouponStatus.Disabled;
    updateCouponStatusMutation.mutate({ id, status: newStatus });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
  };

  const handleEditSuccess = () => {
    setEditingCoupon(null);
  };

  const getStatusLabel = (status: CouponStatus) => {
    switch (status) {
      case CouponStatus.Active:
        return "Активный";
      case CouponStatus.Used:
        return "Использован";
      case CouponStatus.Expired:
        return "Истек";
      case CouponStatus.Disabled:
        return "Отключен";
      default:
        return status;
    }
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
        Ошибка загрузки промокодов. Пожалуйста, попробуйте снова.
      </div>
    );
  }

  // For demo purposes, using mock data if API call isn't implemented yet
  const coupons: Coupon[] = data || [];

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary">Код</TableHead>
              <TableHead className="text-primary">Скидка</TableHead>
              <TableHead className="text-primary">Использование</TableHead>
              <TableHead className="text-primary">Статус</TableHead>
              <TableHead className="text-right text-primary">
                Действия
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium text-primary">
                  <div className="font-mono uppercase">{coupon.code}</div>
                </TableCell>
                <TableCell className="text-primary">
                  {coupon.discount}%
                </TableCell>
                <TableCell className="text-primary">
                  <div>
                    <p>{coupon.used} использовано</p>
                    {coupon.limit ? (
                      <p className="text-sm text-muted-foreground">
                        Лимит: {coupon.limit}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Без лимита
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-primary">
                  <StatusBadge
                    status={getStatusLabel(coupon.status)}
                    showIcon={true}
                  />
                </TableCell>
                <TableCell className="text-right text-primary">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Действия</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => handleDelete(coupon.id)}>
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

      <Dialog
        open={!!editingCoupon}
        onOpenChange={(open) => !open && setEditingCoupon(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-primary">
              Редактировать промокод
            </DialogTitle>
            <DialogDescription>
              Измените детали промокода. Нажмите сохранить, когда закончите.
            </DialogDescription>
          </DialogHeader>
          {editingCoupon && (
            <CouponForm
              couponId={editingCoupon.id}
              defaultValues={{
                code: editingCoupon.code,
                discount: editingCoupon.discount,
                limit: editingCoupon.limit || undefined,
                status: editingCoupon.status,
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
