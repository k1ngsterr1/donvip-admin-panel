"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Gem,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { DiamondPrice } from "@/types/diamond-price";
import { toast } from "@/hooks/use-toast";

export default function DiamondPricePage() {
  const [diamondPrices, setDiamondPrices] = useState<DiamondPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<DiamondPrice | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    price_per_diamond: "",
    currency: "RUB",
    custom_amount_enabled: true,
  });

  const currencies = [
    { value: "RUB", label: "Рубль (₽)" },
    { value: "USD", label: "Доллар ($)" },
    { value: "EUR", label: "Евро (€)" },
    { value: "BRL", label: "Реал (R$)" },
  ];

  const fetchDiamondPrices = async () => {
    setLoading(true);
    try {
      const response = await api.diamondPrice.getAll();
      setDiamondPrices(response.data);
    } catch (error) {
      console.error("Error fetching diamond prices:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить цены на алмазы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiamondPrices();
  }, []);

  const handleCreate = async () => {
    try {
      if (
        !formData.price_per_diamond ||
        parseFloat(formData.price_per_diamond) <= 0
      ) {
        toast({
          title: "Ошибка",
          description: "Цена должна быть больше 0",
          variant: "destructive",
        });
        return;
      }

      await api.diamondPrice.create({
        price_per_diamond: parseFloat(formData.price_per_diamond),
        currency: formData.currency,
        custom_amount_enabled: formData.custom_amount_enabled,
      });

      toast({
        title: "Успешно",
        description: "Цена на алмазы создана",
      });

      setCreateDialogOpen(false);
      setFormData({
        price_per_diamond: "",
        currency: "RUB",
        custom_amount_enabled: true,
      });
      fetchDiamondPrices();
    } catch (error) {
      console.error("Error creating diamond price:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать цену",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    try {
      if (!editingPrice) return;

      if (
        !formData.price_per_diamond ||
        parseFloat(formData.price_per_diamond) <= 0
      ) {
        toast({
          title: "Ошибка",
          description: "Цена должна быть больше 0",
          variant: "destructive",
        });
        return;
      }

      await api.diamondPrice.update(editingPrice.id, {
        price_per_diamond: parseFloat(formData.price_per_diamond),
        currency: formData.currency,
        custom_amount_enabled: formData.custom_amount_enabled,
      });

      toast({
        title: "Успешно",
        description: "Цена обновлена",
      });

      setEditDialogOpen(false);
      setEditingPrice(null);
      setFormData({
        price_per_diamond: "",
        currency: "RUB",
        custom_amount_enabled: true,
      });
      fetchDiamondPrices();
    } catch (error) {
      console.error("Error updating diamond price:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить цену",
        variant: "destructive",
      });
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await api.diamondPrice.activate(id);
      toast({
        title: "Успешно",
        description: "Цена активирована",
      });
      fetchDiamondPrices();
    } catch (error) {
      console.error("Error activating diamond price:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось активировать цену",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту цену?")) return;

    try {
      await api.diamondPrice.delete(id);
      toast({
        title: "Успешно",
        description: "Цена удалена",
      });
      fetchDiamondPrices();
    } catch (error) {
      console.error("Error deleting diamond price:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить цену",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (price: DiamondPrice) => {
    setEditingPrice(price);
    setFormData({
      price_per_diamond: price.price_per_diamond.toString(),
      currency: price.currency,
      custom_amount_enabled: price.custom_amount_enabled,
    });
    setEditDialogOpen(true);
  };

  const formatPrice = (price: number, currency: string) => {
    const formatters: { [key: string]: string } = {
      RUB: `${price.toFixed(2)} ₽`,
      USD: `$${price.toFixed(2)}`,
      EUR: `€${price.toFixed(2)}`,
      BRL: `R$${price.toFixed(2)}`,
    };
    return formatters[currency] || `${price.toFixed(2)} ${currency}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gem className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Цены на алмазы</h1>
            <p className="text-muted-foreground">
              Управление ценами за 1 алмаз в разных валютах
            </p>
          </div>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить цену
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новую цену на алмазы</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="price">Цена за 1 алмаз</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Введите цену"
                  value={formData.price_per_diamond}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price_per_diamond: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="currency">Валюта</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите валюту" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom_amount_enabled"
                  checked={formData.custom_amount_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      custom_amount_enabled: checked === true,
                    }))
                  }
                />
                <Label
                  htmlFor="custom_amount_enabled"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Разрешить произвольное количество алмазов
                </Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreate} className="flex-1">
                  Создать
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {diamondPrices.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Цены на алмазы не найдены</p>
            </CardContent>
          </Card>
        ) : (
          diamondPrices.map((price) => (
            <Card
              key={price.id}
              className={price.is_active ? "border-green-500" : ""}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Gem
                    className={`h-6 w-6 ${
                      price.is_active ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {formatPrice(price.price_per_diamond, price.currency)}
                      </h3>
                      {price.is_active && (
                        <Badge variant="default" className="bg-green-500">
                          Активная
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Валюта: {price.currency} • Создана:{" "}
                      {new Date(price.created_at).toLocaleString("ru-RU")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Произвольное количество:{" "}
                      {price.custom_amount_enabled ? (
                        <span className="text-green-600">✓ Включено</span>
                      ) : (
                        <span className="text-red-600">✗ Отключено</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!price.is_active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleActivate(price.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Активировать
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(price)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(price.id)}
                    disabled={price.is_active}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать цену на алмазы</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-price">Цена за 1 алмаз</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Введите цену"
                value={formData.price_per_diamond}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price_per_diamond: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-currency">Валюта</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите валюту" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_custom_amount_enabled"
                checked={formData.custom_amount_enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    custom_amount_enabled: checked === true,
                  }))
                }
              />
              <Label
                htmlFor="edit_custom_amount_enabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Разрешить произвольное количество алмазов
              </Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit} className="flex-1">
                Сохранить
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
