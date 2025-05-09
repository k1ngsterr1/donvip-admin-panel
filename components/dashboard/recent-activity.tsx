import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentActivity() {
  const activities = [
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
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
