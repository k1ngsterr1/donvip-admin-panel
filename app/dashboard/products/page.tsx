"use client";

import { ProductsTable } from "@/components/products/products-table";
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
import { ProductForm } from "@/components/products/product-form";
import { useState } from "react";
import { usePopupStore } from "@/lib/popup-store";

export default function ProductsPage() {
  const [open, setOpen] = useState(false);
  const { openPopup } = usePopupStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Товары</h1>
          <p className="text-muted-foreground">
            Управление товарами и их деталями.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="mr-2 h-4 w-4" />
                Добавить товар
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-primary">
                  Создать товар
                </DialogTitle>
                <DialogDescription className="text-primary">
                  Заполните форму для создания нового товара.
                </DialogDescription>
              </DialogHeader>
              <ProductForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ProductsTable />
    </div>
  );
}
