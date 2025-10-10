"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { DesignService, UpdatePriceDto } from "@/types/design-services";

interface EditingState {
  [key: number]: boolean;
}

interface TempPrices {
  [key: number]: string;
}

export default function DesignServicesPage() {
  const [services, setServices] = useState<DesignService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState>({});
  const [tempPrices, setTempPrices] = useState<TempPrices>({});
  const [initializing, setInitializing] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.designServices.getAll();
      setServices(response.data);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast.error("Ошибка при загрузке услуг");
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      const response = await api.designServices.initialize();
      toast.success(response.data.message);
      await fetchServices();
    } catch (error: any) {
      console.error("Error initializing services:", error);
      toast.error("Ошибка при инициализации услуг");
    } finally {
      setInitializing(false);
    }
  };

  const startEditing = (serviceId: number, currentPrice: number) => {
    setEditing((prev) => ({ ...prev, [serviceId]: true }));
    setTempPrices((prev) => ({
      ...prev,
      [serviceId]: currentPrice.toString(),
    }));
  };

  const cancelEditing = (serviceId: number) => {
    setEditing((prev) => {
      const newState = { ...prev };
      delete newState[serviceId];
      return newState;
    });
    setTempPrices((prev) => {
      const newState = { ...prev };
      delete newState[serviceId];
      return newState;
    });
  };

  const savePriceEdit = async (serviceId: number) => {
    const newPriceStr = tempPrices[serviceId];
    const newPrice = parseFloat(newPriceStr);

    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Введите корректную цену");
      return;
    }

    try {
      const updateData: UpdatePriceDto = { price: newPrice };
      await api.designServices.updatePrice(serviceId, updateData);

      // Обновляем локальное состояние
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId ? { ...service, price: newPrice } : service
        )
      );

      // Очищаем состояние редактирования
      cancelEditing(serviceId);

      toast.success("Цена успешно обновлена");
    } catch (error: any) {
      console.error("Error updating price:", error);
      toast.error("Ошибка при обновлении цены");
    }
  };

  const toggleActiveStatus = async (
    serviceId: number,
    currentStatus: boolean
  ) => {
    try {
      await api.designServices.update(serviceId, { is_active: !currentStatus });

      // Обновляем локальное состояние
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId
            ? { ...service, is_active: !currentStatus }
            : service
        )
      );

      toast.success(
        `Услуга ${!currentStatus ? "активирована" : "деактивирована"}`
      );
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error("Ошибка при изменении статуса");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление дизайн-услугами</h1>
        <div className="flex gap-2">
          <Button onClick={fetchServices} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
          {services.length === 0 && (
            <Button
              onClick={handleInitialize}
              disabled={initializing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {initializing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Инициализировать услуги
            </Button>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-gray-500 mb-4">
              Услуги не найдены. Нажмите кнопку "Инициализировать услуги" для
              создания стандартного набора услуг.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{service.title}</h3>
                      <Badge
                        variant={service.is_active ? "default" : "secondary"}
                        className={
                          service.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {service.is_active ? "Активна" : "Неактивна"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {service.service_key}
                      </Badge>
                    </div>

                    {service.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`price-${service.id}`}
                          className="text-sm font-medium"
                        >
                          Цена:
                        </Label>
                        {editing[service.id] ? (
                          <div className="flex items-center gap-2">
                            <Input
                              id={`price-${service.id}`}
                              type="number"
                              value={tempPrices[service.id] || ""}
                              onChange={(e) =>
                                setTempPrices((prev) => ({
                                  ...prev,
                                  [service.id]: e.target.value,
                                }))
                              }
                              className="w-24 h-8"
                              min="0"
                              step="0.01"
                            />
                            <span className="text-sm text-gray-500">₽</span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-blue-600">
                            {service.price.toLocaleString("ru-RU")} ₽
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Активна:</Label>
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() =>
                            toggleActiveStatus(service.id, service.is_active)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {editing[service.id] ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => savePriceEdit(service.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelEditing(service.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(service.id, service.price)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
