"use client";

import { useState } from "react";
import { CouponsTable } from "@/components/coupons/coupons-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CouponFormWithGameSelector } from "@/components/coupons/coupon-form";

export default function CouponsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Промокоды
          </h1>
          <p className="text-muted-foreground">
            Управление скидочными промокодами для ваших товаров.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="mr-2 h-4 w-4" />
              Добавить промокод
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle className="text-primary">
                Создать промокод
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Заполните форму для создания нового промокода.
              </DialogDescription>
            </DialogHeader>
            <CouponFormWithGameSelector onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <CouponsTable />
    </div>
  );
}
