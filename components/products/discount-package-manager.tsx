"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductService } from "@/services/product-service";
import { useToast } from "@/hooks/use-toast";
import { Percent, Tag } from "lucide-react";

interface DiscountPackageManagerProps {
  productId: number;
  packages: any[];
  onSuccess?: () => void;
}

export function DiscountPackageManager({
  productId,
  packages,
  onSuccess,
}: DiscountPackageManagerProps) {
  const [open, setOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddDiscount = async () => {
    if (!selectedPackageId || discountPercent <= 0 || discountPercent >= 100) {
      toast({
        title: "Ошибка",
        description:
          "Выберите пакет и укажите корректный процент скидки (1-99%)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await ProductService.addDiscountPackage(
        productId,
        parseInt(selectedPackageId),
        discountPercent
      );

      toast({
        title: "Успех",
        description: "Скидочный пакет успешно добавлен",
      });

      setOpen(false);
      setSelectedPackageId("");
      setDiscountPercent(0);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding discount package:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить скидочный пакет",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтруем пакеты, которые еще не имеют скидки
  const availablePackages = packages.filter((pkg, index) => !pkg.isDiscounted);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Tag className="h-4 w-4" />
          Добавить скидку
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Добавить скидочный пакет
          </DialogTitle>
          <DialogDescription>
            Выберите пакет и процент скидки для создания специального
            предложения.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="package-select">Выберите пакет</Label>
            <Select
              value={selectedPackageId}
              onValueChange={setSelectedPackageId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите пакет для скидки" />
              </SelectTrigger>
              <SelectContent>
                {availablePackages.map((pkg, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {pkg.amount} {pkg.type} - {pkg.price} руб
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discount-percent">Процент скидки</Label>
            <div className="flex items-center gap-2">
              <Input
                id="discount-percent"
                type="number"
                min={1}
                max={99}
                value={discountPercent || ""}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                placeholder="Например: 25"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {selectedPackageId && discountPercent > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Предварительный просмотр:</h4>
              {(() => {
                const pkg = availablePackages[parseInt(selectedPackageId)];
                if (!pkg) return null;

                const originalPrice = pkg.price;
                const discountedPrice =
                  originalPrice * (1 - discountPercent / 100);

                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Цена со скидкой:</span>
                      <span className="text-sm font-medium text-red-600">
                        {discountedPrice.toFixed(2)} руб
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleAddDiscount}
              disabled={isLoading || !selectedPackageId || discountPercent <= 0}
            >
              {isLoading ? "Создание..." : "Создать скидочный пакет"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
