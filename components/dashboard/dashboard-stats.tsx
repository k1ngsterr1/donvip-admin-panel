import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Package, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsProps {
  isLoading?: boolean;
  data?: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    productCount: number;
  };
}

export function DashboardStats({
  isLoading = false,
  data,
}: DashboardStatsProps) {
  // Default data for when API data is not available
  const defaultData = {
    totalUsers: 1248,
    totalOrders: 3427,
    totalRevenue: 285000,
    productCount: 24,
  };

  // Use provided data or fall back to default
  const statsData = data || defaultData;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="dashboard-stat">
            {statsData.totalUsers.toLocaleString()}
          </div>
          <p className="dashboard-stat-change">+12% с прошлого месяца</p>
        </CardContent>
      </Card>
      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Заказы</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="dashboard-stat">
            {statsData.totalOrders.toLocaleString()}
          </div>
          <p className="dashboard-stat-change">+8% с прошлого месяца</p>
        </CardContent>
      </Card>
      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Товары</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="dashboard-stat">
            {statsData.productCount.toLocaleString()}
          </div>
          <p className="dashboard-stat-change">+2 новых в этом месяце</p>
        </CardContent>
      </Card>
      <Card className="dashboard-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Выручка</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="dashboard-stat">
            ₽{statsData.totalRevenue.toLocaleString()}
          </div>
          <p className="dashboard-stat-change">+18% с прошлого месяца</p>
        </CardContent>
      </Card>
    </div>
  );
}
