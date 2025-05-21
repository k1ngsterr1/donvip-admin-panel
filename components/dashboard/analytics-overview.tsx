"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnalyticsOverviewProps {
  isLoading?: boolean;
  data?: {
    ordersByMonth?: Array<{ name: string; total: number }>;
    packagesPurchased?: Array<{ name: string; count: number }>;
    totalOrders?: number;
    totalRevenue?: number;
    averageOrderValue?: number;
  };
}

export function AnalyticsOverview({
  isLoading = false,
  data,
}: AnalyticsOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Check if data is available
  const hasData =
    data &&
    (data.totalOrders !== undefined ||
      data.totalRevenue !== undefined ||
      data.averageOrderValue !== undefined);

  // Check if chart data is available
  const hasChartData = data?.ordersByMonth && data.ordersByMonth.length > 0;

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="bg-slate-300 text-white">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Обзор
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        {!hasData ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Данные аналитики недоступны. Пожалуйста, попробуйте позже.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="dashboard-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего заказов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="dashboard-stat">
                  {data.totalOrders !== undefined
                    ? data.totalOrders.toLocaleString()
                    : "—"}
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
                  {data.totalRevenue !== undefined
                    ? `₽${data.totalRevenue.toLocaleString()}`
                    : "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="dashboard-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Средний чек
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="dashboard-stat">
                  {data.averageOrderValue !== undefined
                    ? `₽${data.averageOrderValue.toFixed(2)}`
                    : "—"}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Обзор продаж</CardTitle>
            <CardDescription className="text-gray-400">
              Ежемесячные продажи за текущий год
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasChartData ? (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Нет данных для отображения графика
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.ordersByMonth}>
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
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
