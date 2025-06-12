"use client";

import { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  RefreshCw,
  Settings,
  Save,
  CalendarClock,
  ServerCrash,
  Server,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  api,
  type WebsiteTechWorkInfoFromApi,
  type UpdateTechWorksDto,
} from "@/lib/api-client";

// Define the ID of your single website.
// This could also come from an environment variable or config.
const SINGLE_WEBSITE_ID = 1; // Or your specific website ID

export default function TechWorkPage() {
  const [updateData, setUpdateData] = useState<UpdateTechWorksDto>({
    isTechWorks: false,
    techWorksEndsAt: null,
  });
  const queryClient = useQueryClient();

  const {
    data: websiteStatus,
    isLoading: isLoadingWebsiteStatus,
    error: websiteStatusError,
    refetch: refetchWebsiteStatus,
  }: UseQueryResult<WebsiteTechWorkInfoFromApi, Error> = useQuery<
    WebsiteTechWorkInfoFromApi,
    Error,
    WebsiteTechWorkInfoFromApi,
    ["singleWebsiteTechStatus", number] // Query key includes the ID
  >({
    queryKey: ["singleWebsiteTechStatus", SINGLE_WEBSITE_ID],
    queryFn: async () => {
      const response = await api.techworks.getById(SINGLE_WEBSITE_ID);
      return response.data;
    },
  });

  useEffect(() => {
    if (websiteStatus) {
      let localDateTimeStringForInput = "";
      if (websiteStatus.techWorksEndsAt) {
        const dateObj = new Date(websiteStatus.techWorksEndsAt);
        // Check if dateObj is valid
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
          const day = dateObj.getDate().toString().padStart(2, "0");
          const hours = dateObj.getHours().toString().padStart(2, "0"); // Gets local hours from the Date object
          const minutes = dateObj.getMinutes().toString().padStart(2, "0"); // Gets local minutes

          localDateTimeStringForInput = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
      }
      setUpdateData({
        isTechWorks: websiteStatus.isTechWorks,
        techWorksEndsAt: localDateTimeStringForInput,
      });
    }
  }, [websiteStatus]);

  const updateTechWorksMutation = useMutation<
    WebsiteTechWorkInfoFromApi,
    Error,
    { id: number; data: UpdateTechWorksDto }
  >({
    mutationFn: ({ id, data }) =>
      api.techworks.updateTechWorks(id, data).then((res) => res.data),
    onSuccess: (data) => {
      toast({
        title: "Успешно обновлено",
        description: "Настройки технических работ обновлены.",
      });
      queryClient.invalidateQueries({
        queryKey: ["singleWebsiteTechStatus", SINGLE_WEBSITE_ID],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка обновления",
        description:
          error.response?.data?.message ||
          error.message ||
          "Не удалось обновить настройки.",
        variant: "destructive",
      });
    },
  });

  const toggleTechWorksMutation = useMutation<
    WebsiteTechWorkInfoFromApi,
    Error,
    number
  >({
    mutationFn: (id) =>
      api.techworks.toggleTechWorks(id).then((res) => res.data),
    onSuccess: (data) => {
      toast({
        title: "Статус изменен",
        description: `Режим технических работ ${
          data.isTechWorks ? "включен" : "выключен"
        }.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["singleWebsiteTechStatus", SINGLE_WEBSITE_ID],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка переключения",
        description:
          error.response?.data?.message ||
          error.message ||
          "Не удалось изменить статус.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateTechWorks = () => {
    const payload: UpdateTechWorksDto = {
      isTechWorks: updateData.isTechWorks,
      techWorksEndsAt:
        updateData.isTechWorks && updateData.techWorksEndsAt
          ? new Date(updateData.techWorksEndsAt).toISOString()
          : null,
    };
    updateTechWorksMutation.mutate({ id: SINGLE_WEBSITE_ID, data: payload });
  };

  // This function can be used if you want a direct toggle button outside the form
  const handleDirectToggle = () => {
    toggleTechWorksMutation.mutate(SINGLE_WEBSITE_ID);
  };

  if (websiteStatusError) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
              Технические работы
            </h1>
            <p className="text-muted-foreground">
              Управление режимом технических работ для сайта.
            </p>
          </div>
          <Button
            onClick={() => refetchWebsiteStatus()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка загрузки данных</AlertTitle>
          <AlertDescription>
            Не удалось загрузить текущий статус сайта:{" "}
            {websiteStatusError.message}. Пожалуйста, попробуйте обновить.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
            Технические работы
          </h1>
          <p className="text-muted-foreground">
            Управление режимом технических работ для сайта.
          </p>
        </div>
        {!isLoadingWebsiteStatus && (
          <Button
            onClick={() => refetchWebsiteStatus()}
            variant="outline"
            size="sm"
            disabled={
              isLoadingWebsiteStatus ||
              toggleTechWorksMutation.isPending ||
              updateTechWorksMutation.isPending
            }
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isLoadingWebsiteStatus ? "animate-spin" : ""
              }`}
            />
            Обновить статус
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Control Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Управление техническими работами
            </CardTitle>
            <CardDescription>
              {/* You can add website name here if your API returns it: websiteStatus?.name || "Ваш сайт" */}
              Настройте режим технических работ для вашего сайта.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingWebsiteStatus ? (
              <div className="space-y-4 py-8">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : websiteStatus ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/40">
                  <div>
                    <Label
                      htmlFor="isTechWorksToggle"
                      className="text-lg font-medium"
                    >
                      Режим технических работ
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {websiteStatus.isTechWorks ? "Включен" : "Выключен"}
                      {websiteStatus.isTechWorks &&
                        websiteStatus.techWorksEndsAt && (
                          <span className="block text-xs">
                            Автоматическое отключение:{" "}
                            {new Date(
                              websiteStatus.techWorksEndsAt
                            ).toLocaleDateString("ru-RU", {
                              timeZone: "Europe/Moscow",
                            })}
                          </span>
                        )}
                    </p>
                  </div>
                  <Switch
                    id="isTechWorksToggle"
                    checked={websiteStatus.isTechWorks}
                    onCheckedChange={handleDirectToggle} // Use direct toggle for the main switch
                    disabled={
                      toggleTechWorksMutation.isPending ||
                      updateTechWorksMutation.isPending
                    }
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>

                {/* Form for setting end time, only if tech works is ON */}
                {websiteStatus.isTechWorks && (
                  <div className="space-y-4 pt-4 border-t">
                    <Label
                      htmlFor="techWorksEndsAt"
                      className="flex items-center font-medium"
                    >
                      <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                      Время автоматического отключения (необязательно)
                    </Label>
                    <Input
                      id="techWorksEndsAt"
                      type="datetime-local"
                      value={updateData.techWorksEndsAt || ""}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          isTechWorks: true,
                          techWorksEndsAt: e.target.value,
                        })
                      }
                    />
                    {updateData.techWorksEndsAt && (
                      <p className="text-xs text-muted-foreground">
                        Выбранное время:{" "}
                        {new Date(
                          updateData.techWorksEndsAt
                        ).toLocaleDateString("ru-RU", {
                          timeZone: "Europe/Moscow",
                        })}
                      </p>
                    )}
                    <Button
                      onClick={handleUpdateTechWorks}
                      disabled={
                        updateTechWorksMutation.isPending ||
                        !updateData.techWorksEndsAt
                      }
                      className="w-full sm:w-auto"
                    >
                      {updateTechWorksMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Установить время
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Не удалось загрузить данные о сайте.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Обзор статуса</CardTitle>
            <CardDescription>Текущий статус сайта.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 h-full min-h-[200px]">
            {isLoadingWebsiteStatus ? (
              <Skeleton className="h-24 w-3/4" />
            ) : websiteStatus ? (
              websiteStatus.isTechWorks ? (
                <>
                  <ServerCrash className="h-16 w-16 text-orange-500" />
                  <p className="text-xl font-semibold text-orange-500">
                    На тех. работах
                  </p>
                  {websiteStatus.techWorksEndsAt && (
                    <p className="text-sm text-muted-foreground">
                      До:{" "}
                      {new Date(
                        websiteStatus.techWorksEndsAt
                      ).toLocaleDateString("ru-RU", {
                        timeZone: "Europe/Moscow",
                      })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Server className="h-16 w-16 text-green-500" />
                  <p className="text-xl font-semibold text-green-500">
                    Сайт работает
                  </p>
                </>
              )
            ) : (
              <p className="text-muted-foreground">Статус неизвестен</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
