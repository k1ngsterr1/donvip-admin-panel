"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Order } from "./order";

interface PaymentDialogProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentDialog({
  open,
  order,
  onClose,
  onSuccess,
}: PaymentDialogProps) {
  if (!order) return null;

  const handlePayment = (provider: string) => {
    toast({
      title: "Перенаправление на оплату",
      description: `Вы будете перенаправлены на страницу оплаты ${provider}.`,
    });
    // In a real app, this would redirect to the payment page
    setTimeout(onSuccess, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Оплата заказа #{order.orderId || order.id}</DialogTitle>
          <DialogDescription>Выберите способ оплаты</DialogDescription>
        </DialogHeader>
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
                    <p className="text-2xl font-bold">{order.price} ₽</p>
                    <p className="text-sm text-muted-foreground">
                      Итоговая сумма
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handlePayment("Т-Банк")}
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
                    <p className="text-2xl font-bold">{order.price} ₽</p>
                    <p className="text-sm text-muted-foreground">
                      Итоговая сумма
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handlePayment("Pagsmile")}
                  >
                    Перейти к оплате
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
