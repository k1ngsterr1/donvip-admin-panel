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
  Palette,
  ChevronDown,
  Building2,
  CreditCard,
  Wrench,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useSidebarStore } from "@/hooks/use-sidebar";

// Группируем навигационные элементы по категориям
const navGroups = [
  {
    title: "Основное",
    items: [
      { title: "Обзор", href: "/dashboard", icon: BarChart3, badge: null },
      {
        title: "Заказы",
        href: "/dashboard/orders",
        icon: ShoppingCart,
        badge: "new",
      },
    ],
  },
  {
    title: "Контент",
    items: [
      { title: "Баннеры", href: "/dashboard/banner", icon: Image, badge: null },
      {
        title: "Статьи",
        href: "/dashboard/articles",
        icon: Pencil,
        badge: null,
      },
      {
        title: "Дизайн-услуги",
        href: "/dashboard/design-services",
        icon: Palette,
        badge: null,
      },
      {
        title: "Игровой контент",
        href: "/dashboard/game-content",
        icon: Gamepad2,
        badge: null,
      },
    ],
  },
  {
    title: "Управление",
    items: [
      {
        title: "Пользователи",
        href: "/dashboard/users",
        icon: Users,
        badge: null,
      },
      {
        title: "Продукты",
        href: "/dashboard/products",
        icon: Package,
        badge: null,
      },
      { title: "Купоны", href: "/dashboard/coupons", icon: Tag, badge: null },
      { title: "Отзывы", href: "/dashboard/feedback", icon: Star, badge: null },
    ],
  },
  {
    title: "Финансы",
    items: [
      {
        title: "Банки",
        href: "/dashboard/banks",
        icon: University,
        badge: null,
      },
      {
        title: "Платежные методы",
        href: "/dashboard/payment-methods",
        icon: CreditCard,
        badge: null,
      },
    ],
  },
  {
    title: "Система",
    items: [
      {
        title: "Тех. работы",
        href: "/dashboard/tech-work",
        icon: Wrench,
        badge: null,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isMobileOpen, setMobileOpen } = useSidebarStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

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

  const toggleGroup = (groupTitle: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupTitle)) {
      newCollapsed.delete(groupTitle);
    } else {
      newCollapsed.add(groupTitle);
    }
    setCollapsedGroups(newCollapsed);
  };

  const SidebarContent = () => (
    <div className="flex h-full max-h-screen flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] lg:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-bold text-lg text-primary hover:text-primary/80 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </Link>

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-3">
          {navGroups.map((group) => {
            const isCollapsed = collapsedGroups.has(group.title);

            return (
              <div key={group.title} className="space-y-1">
                {/* Group Header */}
                <Button
                  variant="ghost"
                  className="w-full justify-between h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  onClick={() => toggleGroup(group.title)}
                >
                  <span className="uppercase tracking-wider">
                    {group.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isCollapsed && "rotate-180"
                    )}
                  />
                </Button>

                {/* Group Items */}
                {!isCollapsed && (
                  <div className="space-y-0.5 ml-2">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                            isActive
                              ? "bg-accent text-accent-foreground shadow-sm"
                              : "text-muted-foreground"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4 transition-colors",
                              isActive && "text-primary"
                            )}
                          />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs h-5">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <Separator />

      {/* Footer */}
      <div className="p-4 space-y-2">
        <div className="text-xs text-muted-foreground text-center">
          DonVip Admin v1.0
        </div>
        <Button
          variant="outline"
          className="w-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block w-64">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r z-50 lg:hidden">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
