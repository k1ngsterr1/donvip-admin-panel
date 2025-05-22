"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Product } from "./product";

interface DeleteProductDialogProps {
  product: Product | null;
  onClose: () => void;
}

export function DeleteProductDialog({
  product,
  onClose,
}: DeleteProductDialogProps) {
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Товар удален",
        description: "Товар был успешно удален.",
        //@ts-ignore
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить товар. Пожалуйста, попробуйте снова.",
        variant: "destructive",
        //@ts-ignore
        icon: <XCircle className="h-4 w-4" />,
      });
    },
  });

  const confirmDelete = () => {
    if (product) {
      deleteProductMutation.mutate(product.id);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">
            Подтверждение удаления
          </DialogTitle>
          <DialogDescription className="text-primary">
            Вы уверены, что хотите удалить этот товар? Это действие нельзя
            отменить.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 border rounded-md bg-red-50 my-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">{product?.name}</p>
              <p className="text-sm text-red-600 mt-1">ID: {product?.id}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteProductMutation.isPending}
          >
            {deleteProductMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
