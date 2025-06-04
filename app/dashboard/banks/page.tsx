"use client";

import { CardContent } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { useState, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // Keep for refetch button
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { api, type Bank, type PaginatedBanksResponse } from "@/lib/api-client";
import { AlertCircle, CheckCircle, XCircle, University } from "lucide-react";
import { PaginationControls } from "@/components/pagination-controls";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export default function BanksPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // selectedBank, isDeleteConfirmOpen, deleteBankMutation, handleDeleteBank, openDeleteConfirm are removed

  const {
    data: banksData,
    isLoading: isLoadingBanks,
    error: banksError,
    refetch: refetchBanks,
  } = useQuery<
    PaginatedBanksResponse,
    Error,
    PaginatedBanksResponse,
    (string | number)[]
  >({
    queryKey: ["banks", page, limit],
    queryFn: () => api.banks.getAll({ page, limit }).then((res) => res.data),
    placeholderData: keepPreviousData,
  });

  const toggleBankStatusMutation = useMutation<
    Bank,
    Error,
    { id: number; isActive: boolean }
  >({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.banks.update(id, { isActive }).then((res) => res.data),
    onSuccess: (data) => {
      toast({
        title: "Статус обновлен",
        description: `Банк "${data.name}" теперь ${
          data.isActive ? "активен" : "неактивен"
        }.`,
      });
      queryClient.invalidateQueries({ queryKey: ["banks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description:
          error.response?.data?.message || "Не удалось изменить статус банка.",
        variant: "destructive",
      });
    },
  });

  const banks = useMemo(() => banksData?.data || [], [banksData]);
  const totalItems = useMemo(() => banksData?.total || 0, [banksData]);

  if (banksError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>
            Не удалось загрузить список банков: {(banksError as Error).message}.
            <Button
              onClick={() => refetchBanks()}
              variant="link"
              className="ml-2"
            >
              Повторить
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary flex items-center">
            <University className="mr-3 h-7 w-7" />
            Управление банками
          </h1>
          <p className="text-muted-foreground">
            Просмотр и управление активностью банков.
          </p>
        </div>
      </div>

      {isLoadingBanks && !banksData ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Список банков</CardTitle>
              <CardDescription>Всего банков: {totalItems}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead className="text-center">
                      Статус (Вкл/Выкл)
                    </TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead>Дата обновления</TableHead>
                    {/* Действия column removed */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banks.length === 0 && !isLoadingBanks ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        {" "}
                        {/* ColSpan reduced */}
                        Банки не найдены.
                      </TableCell>
                    </TableRow>
                  ) : (
                    banks.map((bank) => (
                      <TableRow key={bank.id}>
                        <TableCell>{bank.id}</TableCell>
                        <TableCell className="font-medium">
                          {bank.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={bank.isActive}
                            onCheckedChange={(isActive) =>
                              toggleBankStatusMutation.mutate({
                                id: bank.id,
                                isActive,
                              })
                            }
                            disabled={
                              toggleBankStatusMutation.isPending &&
                              toggleBankStatusMutation.variables?.id === bank.id
                            }
                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                            aria-label={
                              bank.isActive
                                ? `Деактивировать ${bank.name}`
                                : `Активировать ${bank.name}`
                            }
                          />
                          {bank.isActive ? (
                            <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="inline-block ml-2 h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(bank.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(bank.updatedAt).toLocaleDateString()}
                        </TableCell>
                        {/* Cell for actions removed */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {totalItems > 0 && (
            <PaginationControls
              currentPage={page}
              totalPages={Math.ceil(totalItems / limit)}
              onPageChange={setPage}
            />
          )}
        </>
      )}
      {/* Delete Confirmation Dialog Removed */}
    </div>
  );
}
