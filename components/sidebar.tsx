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
  Settings,
  University,
  Image,
  Gamepad2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";

const navItems = [
  { title: "Обзор", href: "/dashboard", icon: BarChart3 },
  {
    title: "Баннеры",
    href: "/dashboard/banner",
    icon: Image,
  },
  { title: "Пользователи", href: "/dashboard/users", icon: Users },
  { title: "Продукты", href: "/dashboard/products", icon: Package },
  { title: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
  { title: "Купоны", href: "/dashboard/coupons", icon: Tag },
  { title: "Статьи", href: "/dashboard/articles", icon: Pencil },

  { title: "Игровой контент", href: "/dashboard/game-content", icon: Gamepad2 },
  { title: "Отзывы", href: "/dashboard/feedback", icon: Star },
  { title: "Банки", href: "/dashboard/banks", icon: University },
  {
    title: "Платежные методы",
    href: "/dashboard/payment-methods",
    icon: Settings,
  },
  { title: "Тех. работы", href: "/dashboard/tech-work", icon: Settings },
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
        description: "Вы успешно вышли из системы.",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Ошибка выхода",
        description: "Не удалось выйти из системы.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="hidden border-r bg-background lg:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-primary"
          >
            <Package className="h-6 w-6" />
            <span>Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
}
