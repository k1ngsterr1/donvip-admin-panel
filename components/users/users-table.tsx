"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreHorizontal,
  Ban,
  Eye,
  History,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { type User, UserService } from "@/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "../status-badge/status-badge";

export function UsersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", page, limit, debouncedSearch],
    queryFn: async () => {
      const response = await UserService.getUsers({
        page,
        limit,
        search: debouncedSearch || undefined,
      });

      // Set total pages based on response metadata
      if (response.meta) {
        setTotalPages(response.meta.totalPages || 1);
        setTotalUsers(response.meta.totalItems || 0);
      } else if (response.total) {
        // Handle pagination from the response format provided in the example
        const calculatedTotalPages = Math.ceil(response.total / limit);
        setTotalPages(calculatedTotalPages);
        setTotalUsers(response.total);
      }

      return response.data || [];
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: (userId: string) => UserService.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Пользователь заблокирован",
        description: "Пользователь был успешно заблокирован.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description:
          "Не удалось заблокировать пользователя. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: (userId: string) => UserService.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Пользователь разблокирован",
        description: "Пользователь был успешно разблокирован.",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description:
          "Не удалось разблокировать пользователя. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  const handleViewUser = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const handleViewPaymentHistory = (userId: string) => {
    router.push(`/dashboard/users/${userId}/payments`);
  };

  const handleToggleBlock = (userId: string, currentStatus: boolean) => {
    if (currentStatus === true) {
      unblockUserMutation.mutate(userId);
    } else {
      blockUserMutation.mutate(userId);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Ensure users is always an array
  const users: User[] = Array.isArray(data) ? data : [];

  // Filter out users with null identifier
  const displayUsers = users.filter((user) => user.identifier !== null);

  // Calculate how many users were filtered out
  const filteredOutCount = users.length - displayUsers.length;

  // Check if we need to fetch the next page because all users were filtered out
  useEffect(() => {
    if (users.length > 0 && displayUsers.length === 0 && page < totalPages) {
      // All users on this page have null identifiers, move to next page
      setPage(page + 1);
    }

    // Update filtered count for display
    setFilteredCount(filteredOutCount);
  }, [users, displayUsers, page, totalPages]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-3">
            <Ban className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Ошибка загрузки пользователей
        </h3>
        <p className="text-red-600 mb-4">
          Не удалось загрузить список пользователей. Пожалуйста, попробуйте
          снова.
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Повторить
        </Button>
      </div>
    );
  }

  if (displayUsers.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl mt-4">
            Нет пользователей с идентификаторами
          </CardTitle>
          <CardDescription>
            {filteredOutCount > 0
              ? `${filteredOutCount} пользователей было скрыто, так как у них отсутствуют идентификаторы.`
              : "В системе пока нет зарегистрированных пользователей с идентификаторами."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-center text-muted-foreground mb-6">
            Вы можете добавить нового пользователя или дождаться, пока
            пользователи зарегистрируются самостоятельно.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить данные
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:w-auto flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск пользователей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-[120px] text-white bg-primary">
              <SelectValue placeholder="10 на стр." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 на стр.</SelectItem>
              <SelectItem value="10">10 на стр.</SelectItem>
              <SelectItem value="20">20 на стр.</SelectItem>
              <SelectItem value="50">50 на стр.</SelectItem>
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  className="h-9 w-9"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Обновить</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Обновить данные</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Filtered users notification */}
      {filteredOutCount > 0 && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Внимание</AlertTitle>
          <AlertDescription>
            {filteredOutCount} пользователей скрыто, так как у них отсутствуют
            идентификаторы.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-medium">Пользователь</TableHead>
              <TableHead className="font-medium">Контакт</TableHead>
              <TableHead className="font-medium">Статус</TableHead>
              <TableHead className="font-medium">Роль</TableHead>
              <TableHead className="font-medium ">Заказы</TableHead>
              <TableHead className="font-medium">Сумма расходов</TableHead>
              <TableHead className="text-right font-medium">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayUsers.map((user: any) => (
              <TableRow
                key={user.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.identifier}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.identifier?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-primary">
                      <p className="font-medium">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ""} ${
                              user.last_name || ""
                            }`.trim()
                          : "АНОНИМ"}
                      </p>
                      <p className="text-sm text-muted-foreground ">
                        ID: {user.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-primary">
                    <p>{user.identifier}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={user.is_banned ? "Заблокирован" : "Разблокирован"}
                  />
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-primary">
                  {user.orderCount || "0"}
                </TableCell>
                <TableCell className="text-primary">
                  <span className="font-medium">
                    {(user.totalSpent ? user.totalSpent / 100 : 0).toFixed(2)}₽
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-primary" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleViewPaymentHistory(user.id)}
                      >
                        <History className="mr-2 h-4 w-4" />
                        История платежей
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggleBlock(user.id, user.is_banned)
                        }
                        className={
                          user.is_banned === true
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        {user.is_banned === true
                          ? "Разблокировать"
                          : "Заблокировать"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Страница {page} из {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="bg-primary"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Предыдущая страница</span>
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Show pages around current page
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
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-primary"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Следующая страница</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
