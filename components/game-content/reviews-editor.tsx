"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Plus, Trash2, User } from "lucide-react";
import { CreateReviewDto, SupportedLanguage } from "@/types/game-content-dto";

interface ReviewsEditorProps {
  reviews: CreateReviewDto[];
  currentLanguage: SupportedLanguage;
  onChange: (reviews: CreateReviewDto[]) => void;
}

export function ReviewsEditor({
  reviews,
  currentLanguage,
  onChange,
}: ReviewsEditorProps) {
  const [newReview, setNewReview] = useState<CreateReviewDto>({
    userName: "",
    userName_en: "",
    rating: 5,
    comment: "",
    comment_en: "",
    verified: false,
  });

  const addReview = () => {
    if (!newReview.userName || !newReview.comment) return;

    onChange([...reviews, newReview]);

    setNewReview({
      userName: "",
      userName_en: "",
      rating: 5,
      comment: "",
      comment_en: "",
      verified: false,
    });
  };

  const removeReview = (index: number) => {
    onChange(reviews.filter((_, i) => i !== index));
  };

  const updateReview = (index: number, updates: Partial<CreateReviewDto>) => {
    onChange(
      reviews.map((review, i) =>
        i === index ? { ...review, ...updates } : review
      )
    );
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 cursor-pointer ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
            onClick={onChange ? () => onChange(star) : undefined}
          />
        ))}
        {onChange && (
          <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Отзывы пользователей
            <Badge variant="outline">{reviews.length} отзывов</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Reviews */}
          {reviews.map((review, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {currentLanguage === "ru"
                      ? review.userName
                      : review.userName_en || review.userName}
                  </span>
                  {review.verified && (
                    <Badge variant="secondary" className="text-green-600">
                      Подтвержден
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeReview(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Имя пользователя (RU)</Label>
                  <Input
                    value={review.userName}
                    onChange={(e) =>
                      updateReview(index, { userName: e.target.value })
                    }
                    placeholder="Имя пользователя"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Имя пользователя (EN)</Label>
                  <Input
                    value={review.userName_en || ""}
                    onChange={(e) =>
                      updateReview(index, { userName_en: e.target.value })
                    }
                    placeholder="User name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Комментарий (RU)</Label>
                  <Textarea
                    value={review.comment}
                    onChange={(e) =>
                      updateReview(index, { comment: e.target.value })
                    }
                    placeholder="Текст отзыва"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Комментарий (EN)</Label>
                  <Textarea
                    value={review.comment_en || ""}
                    onChange={(e) =>
                      updateReview(index, { comment_en: e.target.value })
                    }
                    placeholder="Review text"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Рейтинг</Label>
                  {renderStars(review.rating, (rating) =>
                    updateReview(index, { rating })
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`verified-${index}`}
                    checked={review.verified || false}
                    onCheckedChange={(checked) =>
                      updateReview(index, { verified: checked as boolean })
                    }
                  />
                  <Label htmlFor={`verified-${index}`}>
                    Подтвержденный отзыв
                  </Label>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Review */}
          <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Добавить новый отзыв
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя пользователя (RU)</Label>
                <Input
                  value={newReview.userName}
                  onChange={(e) =>
                    setNewReview({ ...newReview, userName: e.target.value })
                  }
                  placeholder="Имя пользователя"
                />
              </div>

              <div className="space-y-2">
                <Label>Имя пользователя (EN)</Label>
                <Input
                  value={newReview.userName_en || ""}
                  onChange={(e) =>
                    setNewReview({ ...newReview, userName_en: e.target.value })
                  }
                  placeholder="User name"
                />
              </div>

              <div className="space-y-2">
                <Label>Комментарий (RU)</Label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  placeholder="Текст отзыва"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Комментарий (EN)</Label>
                <Textarea
                  value={newReview.comment_en || ""}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment_en: e.target.value })
                  }
                  placeholder="Review text"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Рейтинг</Label>
                {renderStars(newReview.rating, (rating) =>
                  setNewReview({ ...newReview, rating })
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-verified"
                  checked={newReview.verified || false}
                  onCheckedChange={(checked) =>
                    setNewReview({ ...newReview, verified: checked as boolean })
                  }
                />
                <Label htmlFor="new-verified">Подтвержденный отзыв</Label>
              </div>
            </div>

            <Button
              type="button"
              onClick={addReview}
              disabled={!newReview.userName || !newReview.comment}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить отзыв
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
