import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  DollarSign,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

interface PackageInfo {
  productId: number;
  name: string;
  type: string;
  count: number;
}

interface DashboardStatsProps {
  isLoading?: boolean;
  data?: {
    totalOrders: number;
    totalRevenue: string;
    packages: PackageInfo[];
    telegramDiscounts?: {
      totalOrders: number;
      totalDiscountAmount: number;
      percentage: number;
    };
  };
}

export function DashboardStats({
  isLoading = false,
  data,
}: DashboardStatsProps) {
  // Default data for when API data is not available
  const defaultData = {
    totalOrders: 0,
    totalRevenue: "0",
    packages: [],
    telegramDiscounts: {
      totalOrders: 0,
      totalDiscountAmount: 0,
      percentage: 0,
    },
  };

  // Use provided data or fall back to default
  const statsData = data || defaultData;

  // Ensure packages is always an array
  const packages = statsData.packages || [];

  useEffect(() => {
    console.log(statsData);
  });

  // Calculate total products from packages
  const totalProducts = packages.reduce((sum, pkg) => sum + pkg.count, 0);

  // Get top package by count
  const topPackage =
    packages.length > 0
      ? [...packages].sort((a, b) => b.count - a.count)[0]
      : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заказы</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {topPackage
                ? `Самый популярный: ${topPackage.name}`
                : "Нет данных о заказах"}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₽{Number(statsData.totalRevenue).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsData.totalOrders > 0
                ? `В среднем ₽${(
                    Number(statsData.totalRevenue) / statsData.totalOrders
                  ).toFixed(2)} за заказ`
                : "Нет данных о выручке"}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Товары</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {packages.length > 0
                ? `${packages.length} различных продуктов`
                : "Нет данных о товарах"}
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Telegram скидки
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.telegramDiscounts?.totalOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsData.telegramDiscounts && statsData.totalOrders > 0
                ? `${statsData.telegramDiscounts.percentage.toFixed(
                    1
                  )}% заказов, ₽${statsData.telegramDiscounts.totalDiscountAmount.toFixed(
                    2
                  )} скидок`
                : "Нет данных о скидках"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Packages breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Популярные товары
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Нет данных о товарах
            </p>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.productId}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pkg.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {pkg.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ID: {pkg.productId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">
                      {pkg.count} заказов
                    </div>
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{
                        width: `${Math.max(
                          20,
                          (pkg.count / totalProducts) * 100
                        )}px`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
