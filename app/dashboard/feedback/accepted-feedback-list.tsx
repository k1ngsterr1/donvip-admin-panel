"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, X, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api-client";
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

interface AcceptedFeedbackListProps {
  onRefresh?: () => void;
}

export function AcceptedFeedbackList({ onRefresh }: AcceptedFeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedFeedback, setExpandedFeedback] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.feedback.getAccepted({ page, limit: 10 });
      setFeedbacks(response.data.data);
      setTotalPages(response.data.lastPage);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить принятые отзывы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page]);

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

  const renderReaction = (reaction: number) => {
    if (reaction > 0) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
          <span className="text-green-600 text-lg">👍</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
          <span className="text-red-600 text-lg">👎</span>
        </div>
      );
    }
  };

  const toggleFeedbackExpansion = (feedbackId: number) => {
    setExpandedFeedback(expandedFeedback === feedbackId ? null : feedbackId);
  };

  const truncateText = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
          <p className="text-muted-foreground">Нет принятых отзывов</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => {
        const isExpanded = expandedFeedback === feedback.id;
        const shouldShowToggle = feedback.text.length > 200;

        return (
          <Card key={feedback.id} className="w-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src={feedback.user.avatar || undefined} />
                    <AvatarFallback>
                      {feedback.user.first_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {feedback.user.first_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {feedback.product.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {renderReaction(feedback.reaction)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4">
                <p className="text-sm whitespace-pre-wrap break-words overflow-hidden">
                  {isExpanded ? feedback.text : truncateText(feedback.text)}
                </p>
                {shouldShowToggle && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeedbackExpansion(feedback.id)}
                    className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-700"
                  >
                    {isExpanded ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Свернуть
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Показать полностью
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800 flex-shrink-0"
                >
                  Принят
                </Badge>

                <div className="flex flex-wrap gap-2">
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
        );
      })}

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
