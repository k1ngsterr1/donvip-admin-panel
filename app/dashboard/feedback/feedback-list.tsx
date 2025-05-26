"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, Star, Trash2 } from "lucide-react";
import { api } from "@/api/client";
import { useToast } from "@/hooks/use-toast";

interface Feedback {
  id: number;
  text: string;
  reaction: number;
  isVerified: boolean | null;
  user: {
    first_name: string;
    avatar: string | null;
  };
  product: {
    name: string;
    image: string | null;
  };
}

interface FeedbackListProps {
  onRefresh?: () => void;
}

export function FeedbackList({ onRefresh }: FeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.feedback.getIncoming({ page, limit: 10 });
      setFeedbacks(response.data.data);
      setTotalPages(response.data.lastPage);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить отзывы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page]);

  const handleAccept = async (id: number) => {
    try {
      setActionLoading(id);
      await api.feedback.accept(id);

      // Удаляем отзыв из текущего списка
      setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== id));

      toast({
        title: "Успешно",
        description: "Отзыв принят",
      });

      // Вызываем обновление родительского компонента если нужно
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось принять отзыв",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: number) => {
    try {
      setActionLoading(id);
      await api.feedback.decline(id);

      // Удаляем отзыв из текущего списка
      setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== id));

      toast({
        title: "Успешно",
        description: "Отзыв отклонен",
      });

      // Вызываем обновление родительского компонента если нужно
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отклонить отзыв",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setActionLoading(id);
      await api.feedback.delete(id);

      // Удаляем отзыв из текущего списка
      setFeedbacks((prev) => prev.filter((feedback) => feedback.id !== id));

      toast({
        title: "Успешно",
        description: "Отзыв удален",
      });

      // Вызываем обновление родительского компонента если нужно
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить отзыв",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Нет новых отзывов для модерации
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <Card key={feedback.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={feedback.user.avatar || undefined} />
                  <AvatarFallback>
                    {feedback.user.first_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{feedback.user.first_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {feedback.product.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(feedback.reaction)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm mb-4">{feedback.text}</p>

            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {feedback.isVerified === null
                  ? "На модерации"
                  : feedback.isVerified
                  ? "Принят"
                  : "Отклонен"}
              </Badge>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAccept(feedback.id)}
                  disabled={actionLoading === feedback.id}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Принять
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(feedback.id)}
                  disabled={actionLoading === feedback.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Отклонить
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(feedback.id)}
                  disabled={actionLoading === feedback.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Удалить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Предыдущая
          </Button>
          <span className="flex items-center px-4">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Следующая
          </Button>
        </div>
      )}
    </div>
  );
}
