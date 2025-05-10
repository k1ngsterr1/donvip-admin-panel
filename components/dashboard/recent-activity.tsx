import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: string | number;
  type: string;
  title: string;
  description: string;
  time: string;
  initials: string;
}

interface RecentActivityProps {
  isLoading?: boolean;
  activities?: Activity[];
}

export function RecentActivity({
  isLoading = false,
  activities,
}: RecentActivityProps) {
  // Default activities for when API data is not available
  const defaultActivities = [
    {
      id: 1,
      type: "order",
      title: "New Order #12345",
      description: "John Doe purchased Mobile Legends Diamonds",
      time: "2 minutes ago",
      initials: "JD",
    },
    {
      id: 2,
      type: "user",
      title: "New User Registration",
      description: "Alice Smith created an account",
      time: "15 minutes ago",
      initials: "AS",
    },
    {
      id: 3,
      type: "feedback",
      title: "New Feedback",
      description: "Bob Johnson left a 5-star review",
      time: "1 hour ago",
      initials: "BJ",
    },
    {
      id: 4,
      type: "order",
      title: "New Order #12346",
      description: "Emma Wilson purchased Bigo LIVE Diamonds",
      time: "2 hours ago",
      initials: "EW",
    },
    {
      id: 5,
      type: "coupon",
      title: "Coupon Used",
      description: "SUMMER20 coupon used by Michael Brown",
      time: "3 hours ago",
      initials: "MB",
    },
  ];

  // Use provided activities or fall back to default
  const displayActivities = activities || defaultActivities;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
