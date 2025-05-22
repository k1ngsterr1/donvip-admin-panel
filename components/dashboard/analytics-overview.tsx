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
  CartesianGrid,
  Bar,
  BarChart,
  ReferenceDot,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

// Define the API response type
interface MonthlyPayment {
  month: string;
  totalRevenue: number;
  totalOrders: number;
}

// Sample data for testing
const sampleData = [
  { month: "2025-01", totalRevenue: 12000, totalOrders: 32 },
  { month: "2025-02", totalRevenue: 14200, totalOrders: 38 },
  { month: "2025-03", totalRevenue: 18500, totalOrders: 42 },
  { month: "2025-04", totalRevenue: 22000, totalOrders: 50 },
  { month: "2025-05", totalRevenue: 81804, totalOrders: 9 },
  { month: "2025-06", totalRevenue: 0, totalOrders: 0 },
  { month: "2025-07", totalRevenue: 0, totalOrders: 0 },
  { month: "2025-08", totalRevenue: 0, totalOrders: 0 },
  { month: "2025-09", totalRevenue: 0, totalOrders: 0 },
  { month: "2025-10", totalRevenue: 0, totalOrders: 0 },
  { month: "2025-11", totalRevenue: 0, totalOrders: 0 },
  { month: "2025-12", totalRevenue: 0, totalOrders: 0 },
];

export function AnalyticsOverview() {
  const {
    data: apiData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["monthlyPayments"],
    queryFn: async () => {
      try {
        const response = await api.orders.getMonthlyPayments();
        return response.data as MonthlyPayment[];
      } catch (err) {
        console.error("Error fetching data:", err);
        // Fall back to sample data for testing
        return sampleData;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ошибка загрузки данных. Пожалуйста, попробуйте позже.
        </AlertDescription>
      </Alert>
    );
  }

  const dataToUse = apiData || sampleData;

  const chartData = dataToUse.map((item) => {
    const revenue =
      typeof item.totalRevenue === "string"
        ? Number.parseFloat(item.totalRevenue)
        : Number(item.totalRevenue);

    const orders =
      typeof item.totalOrders === "string"
        ? Number.parseInt(item.totalOrders, 10)
        : Number(item.totalOrders);

    return {
      name: formatMonth(item.month),
      month: item.month,
      total: revenue,
      orders: orders,
    };
  });

  const maxRevenuePoint = [...chartData].sort((a, b) => b.total - a.total)[0];

  const totalRevenue = chartData.reduce((sum, item) => sum + item.total, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const hasChartData =
    chartData &&
    chartData.length > 0 &&
    chartData.some((item) => item.total > 0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Выручка</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Динамика выручки</CardTitle>
              <CardDescription>
                Ежемесячная выручка за текущий год
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasChartData ? (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  Нет данных для отображения графика
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                      tickFormatter={(value) => `₽${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `₽${(value / 100).toLocaleString("ru-RU", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`,
                        "Выручка",
                      ]}
                      labelFormatter={(label) => `${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                      }}
                      itemStyle={{ color: "var(--primary)" }}
                    />

                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Выручка"
                      stroke="#1E40AF" // Use a specific color instead of CSS variable
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#1E40AF", strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: "#1E40AF" }}
                      isAnimationActive={true}
                      connectNulls={true}
                    />
                    {/* Add reference dot for the highest revenue point */}
                    {maxRevenuePoint && maxRevenuePoint.total > 0 && (
                      <ReferenceDot
                        x={maxRevenuePoint.name}
                        y={maxRevenuePoint.total}
                        r={6}
                        fill="#1E40AF"
                        stroke="white"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Количество заказов</CardTitle>
              <CardDescription>
                Ежемесячное количество заказов за текущий год
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasChartData ? (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                  Нет данных для отображения графика
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                      formatter={(value: number) => [`${value}`, "Заказов"]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                      }}
                      itemStyle={{ color: "#1E40AF" }}
                    />
                    <Bar
                      dataKey="orders"
                      name="Заказы"
                      fill="#1E40AF"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to format month from "2025-01" to "Янв 2025"
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const monthNames = [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ];
  const monthIndex = Number.parseInt(month, 10) - 1;
  return `${monthNames[monthIndex]} ${year}`;
}
