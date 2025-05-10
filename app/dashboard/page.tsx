//@ts-nocheck

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { OrderService, ProductService, UserService } from "@/services";

export default function DashboardPage() {
  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => OrderService.getAnalytics(),
  });

  // Fetch recent activity data (orders and user registrations)
  const {
    data: recentOrdersData,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const response = await api.orders.getAll({ limit: 5, page: 1 });
      return response.data;
    },
  });

  // Fetch recent user registrations
  const {
    data: recentUsersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["recent-users"],
    queryFn: async () => {
      const response = await UserService.getUsers({
        limit: 5,
        page: 1,
      });
      return response.data;
    },
  });

  // Fetch product count
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products-count"],
    queryFn: async () => {
      const response = await ProductService.getProducts({
        limit: 1,
        page: 1,
      });
      return response.meta?.totalItems || 0;
    },
  });

  // Combine all loading states
  const isLoading =
    isLoadingAnalytics ||
    isLoadingOrders ||
    isLoadingUsers ||
    isLoadingProducts;

  // Combine all error states
  const hasError = analyticsError || ordersError || usersError || productsError;

  // Combine all refetch functions
  const handleRefetchAll = () => {
    refetchAnalytics();
    refetchOrders();
    refetchUsers();
    refetchProducts();
  };

  const statsData = {
    totalUsers: recentUsersData?.meta?.totalItems || 0,
    totalOrders: analyticsData?.totalOrders || 0,
    totalRevenue: analyticsData?.totalRevenue || 0,
    productCount: productsData || 0,
  };

  // Prepare recent activity data by combining orders and user registrations
  const recentActivity = [] as any;

  // Add recent orders to activity
  if (recentOrdersData && Array.isArray(recentOrdersData)) {
    recentOrdersData.forEach((order) => {
      recentActivity.push({
        id: order.id,
        type: "order",
        title: `Новый заказ #${order.id}`,
        description: `${order.customer} приобрел ${order.amount} ${order.type}`,
        time: order.date,
        initials:
          order.customer
            ?.split(" ")
            .map((n: any) => n[0])
            .join("") || "ЗК",
      });
    });
  }

  // Add recent user registrations to activity
  if (recentUsersData && Array.isArray(recentUsersData)) {
    recentUsersData.forEach((user) => {
      recentActivity.push({
        id: user.id,
        type: "user",
        title: "Новый пользователь",
        description: `${user.name || user.identifier} создал аккаунт`,
        time: user.createdAt,
        initials: user.name
          ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
          : user.identifier[0].toUpperCase(),
      });
    });
  }

  // Limit to 5 most recent activities
  const limitedActivity = recentActivity.slice(0, 5);

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Панель управления
          </h1>
          <p className="text-muted-foreground">
            Обзор статистики и недавней активности.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>
            Произошла ошибка при загрузке данных. Пожалуйста, попробуйте снова.
          </AlertDescription>
          <Button
            onClick={handleRefetchAll}
            variant="outline"
            size="sm"
            className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Повторить
          </Button>
        </Alert>

        {/* Show skeleton UI */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Панель управления
        </h1>
        <p className="text-muted-foreground">
          Обзор статистики и недавней активности.
        </p>
      </div>

      <DashboardStats isLoading={isLoading} data={statsData} />

      <AnalyticsOverview isLoading={isLoadingAnalytics} data={analyticsData} />

      <Card>
        <CardHeader>
          <CardTitle>Недавняя активность</CardTitle>
          <CardDescription>
            Последние заказы и регистрации пользователей.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity isLoading={isLoading} activities={limitedActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
