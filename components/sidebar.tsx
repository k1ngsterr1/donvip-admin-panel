import {
  BarChart3,
  Users,
  ShoppingCart,
  Tag,
  Package,
  LogOut,
  Star,
  Settings,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  {
    title: "Обзор",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Пользователи",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Заказы",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Продукты",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Категории",
    href: "/dashboard/categories",
    icon: Tag,
  },
  {
    title: "Отзывы",
    href: "/dashboard/feedback",
    icon: Star,
  },
  {
    title: "Тех. работы",
    href: "/dashboard/tech-work",
    icon: Settings,
  },
  {
    title: "Выйти",
    href: "/logout",
    icon: LogOut,
  },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-100 h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Панель управления</h1>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.title} className="mb-2">
              <a
                href={item.href}
                className="flex items-center p-2 rounded hover:bg-gray-200"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
