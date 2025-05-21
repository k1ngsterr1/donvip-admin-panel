import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  PauseCircle,
  RotateCcw,
  Info,
  ShieldAlert,
  Tag,
  TagIcon as TagOff,
  Percent,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const getStatusStyles = (status: string): string => {
    switch (status) {
      case "completed":
      case "Выполнен":
      case "Активен":
      case "Active":
      case "Активный":
      case "Paid":
      case "Разблокирован":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
      case "Обработка":
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
      case "Заблокирован":
      case "Отключен":
      case "Disabled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Ожидается оплата":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "На удержании":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Отменен":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Возврат":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "Новый":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Использован":
      case "Used":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Истек":
      case "Expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "Выполнен":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "Активен":
      case "Active":
      case "Активный":
        return <Tag className="h-3 w-3 mr-1" />;
      case "processing":
      case "Обработка":
        return <RefreshCw className="h-3 w-3 mr-1 animate-spin" />;
      case "failed":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "Заблокирован":
        return <ShieldAlert className="h-3 w-3 mr-1" />;
      case "Отключен":
      case "Disabled":
        return <TagOff className="h-3 w-3 mr-1" />;
      case "Ожидается оплата":
        return <Clock className="h-3 w-3 mr-1" />;
      case "На удержании":
        return <PauseCircle className="h-3 w-3 mr-1" />;
      case "Отменен":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "Возврат":
        return <RotateCcw className="h-3 w-3 mr-1" />;
      case "Новый":
        return <Info className="h-3 w-3 mr-1" />;
      case "Использован":
      case "Used":
        return <Percent className="h-3 w-3 mr-1" />;
      case "Истек":
      case "Expired":
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return <AlertTriangle className="h-3 w-3 mr-1" />;
    }
  };

  const getStatusLabel = (status: string): string => {
    const translations: Record<string, string> = {
      Paid: "Оплачено",
      Processing: "В обработке",
      Pending: "Ожидание",
      Cancelled: "Отменен",
      Failed: "Ошибка",
      Used: "Использован",
      Expired: "Истек",
      Active: "Активный",
      Disabled: "Отключен",
      New: "Новый",
    };

    return translations[status] || status;
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        getStatusStyles(status),
        className
      )}
    >
      {showIcon && getStatusIcon(status)}
      {getStatusLabel(status)}
    </span>
  );
}
