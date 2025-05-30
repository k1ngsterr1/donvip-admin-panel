"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Download, RefreshCw, AlertCircle } from "lucide-react";
import { UserService } from "@/services";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserPaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch user payments
  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userPayments", userId, page, limit],
    queryFn: async () => {
      const response = await UserService.getUserPayments(userId, {
        page,
        limit,
      });
      return response;
    },
  });

  const payments = paymentsData?.data || [];
  const totalPages = paymentsData?.meta?.totalPages || 1;
  const totalItems = paymentsData?.meta?.totalItems || 0;

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Неверная дата";
    }

    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
      case "paid":
        return <Badge className="bg-green-500">Успешно</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">В обработке</Badge>;
      case "failed":
      case "error":
        return <Badge className="bg-red-500">Ошибка</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            История платежей пользователя
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Обновить
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{`Пользователь #${userId}`}</CardTitle>
          <CardDescription>
            ID: {userId} • Всего платежей: {totalItems}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ошибка</AlertTitle>
              <AlertDescription>
                {(error as Error)?.message ||
                  "Не удалось загрузить историю платежей. Пожалуйста, попробуйте снова."}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Показано {Math.min(limit, payments.length)} из {totalItems}{" "}
              платежей
            </div>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="10 на стр." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 на стр.</SelectItem>
                <SelectItem value="10">10 на стр.</SelectItem>
                <SelectItem value="20">20 на стр.</SelectItem>
                <SelectItem value="50">50 на стр.</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoadingPayments ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                У пользователя пока нет платежей
              </p>
            </div>
          ) : (
            <div className="rounded-md border shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-medium">ID</TableHead>
                    <TableHead className="font-medium">Продукт</TableHead>
                    <TableHead className="font-medium">Сумма</TableHead>
                    <TableHead className="font-medium">Метод</TableHead>
                    <TableHead className="font-medium">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {payment.id}
                      </TableCell>
                      <TableCell>{payment.product}</TableCell>
                      <TableCell className="font-medium">
                        {payment.price?.toLocaleString() || 0}₽
                      </TableCell>
                      <TableCell>
                        {payment.payment_method || payment.method || "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = page - 2 + i;
                if (pageNum <= 0) pageNum = i + 1;
                if (pageNum > totalPages) return null;

                return (
                  <Button
                    key={i}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && page < totalPages - 2 && (
                <>
                  <span className="mx-1">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
