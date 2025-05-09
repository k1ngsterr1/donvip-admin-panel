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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tigh text-primary">
          Панель управления
        </h1>
        <p className="text-muted-foreground">
          Обзор статистики и недавней активности.
        </p>
      </div>

      <DashboardStats />

      <AnalyticsOverview />

      <Card>
        <CardHeader>
          <CardTitle>Недавняя активность</CardTitle>
          <CardDescription>
            Последние заказы и регистрации пользователей.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>
    </div>
  );
}
