"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderService } from "@/services";

export function AnalyticsOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => OrderService.getAnalytics(),
  });

  if (!data) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="bg-slate-800 text-white">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Обзор
        </TabsTrigger>
        <TabsTrigger
          value="packages"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Пакеты
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Всего заказов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="dashboard-stat">
                {data?.totalOrders.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Общая выручка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="dashboard-stat">
                ₽{data?.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний чек</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="dashboard-stat">
                ₽{data?.averageOrderValue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Обзор продаж</CardTitle>
            <CardDescription className="text-gray-400">
              Ежемесячные продажи за текущий год
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data?.ordersByMonth}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₽${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`₽${value}`, "Выручка"]}
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="packages" className="space-y-4">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Покупки пакетов</CardTitle>
            <CardDescription className="text-gray-400">
              Количество покупок по типам пакетов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data?.packagesPurchased}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}`, "Покупки"]}
                  cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
