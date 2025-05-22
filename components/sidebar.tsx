"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Tag,
  Package,
  LogOut,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

const navItems = [
  {
    title: "Главная",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Пользователи",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Продукты",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Заказы",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Купоны",
    href: "/dashboard/coupons",
    icon: Tag,
  },
  {
    title: "Отзывы",
    href: "/dashboard/feedback",
    icon: Star,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    try {
      logout();

      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      // Show error toast
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="hidden border-r bg-white lg:block w-64">
      <div className="flex flex-col h-full">
        <div className="flex h-14 items-center border-b px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <div className="h-6 w-6 rounded-full bg-primary"></div>
            <span className="text-primary">Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                  pathname === item.href && "bg-muted text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button
            variant="outline"
            className="w-full bg-red-200 border-none justify-start text-red-500 hover:bg-red-600 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
}
