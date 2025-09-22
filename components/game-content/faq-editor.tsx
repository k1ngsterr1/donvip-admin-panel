"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, HelpCircle, GripVertical } from "lucide-react";
import { CreateFAQDto, SupportedLanguage } from "@/types/game-content-dto";

interface FAQEditorProps {
  faq: CreateFAQDto[];
  currentLanguage: SupportedLanguage;
  onChange: (faq: CreateFAQDto[]) => void;
}

export function FAQEditor({ faq, currentLanguage, onChange }: FAQEditorProps) {
  const [newFAQ, setNewFAQ] = useState<CreateFAQDto>({
    question: "",
    question_en: "",
    answer: "",
    answer_en: "",
  });

  const addFAQ = () => {
    if (!newFAQ.question || !newFAQ.answer) return;

    onChange([...faq, newFAQ]);

    setNewFAQ({
      question: "",
      question_en: "",
      answer: "",
      answer_en: "",
    });
  };

  const removeFAQ = (index: number) => {
    onChange(faq.filter((_, i) => i !== index));
  };

  const updateFAQ = (index: number, updates: Partial<CreateFAQDto>) => {
    onChange(
      faq.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const moveFAQ = (fromIndex: number, toIndex: number) => {
    const newFAQ = [...faq];
    const [movedItem] = newFAQ.splice(fromIndex, 1);
    newFAQ.splice(toIndex, 0, movedItem);
    onChange(newFAQ);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Часто задаваемые вопросы
            <Badge variant="outline">{faq.length} вопросов</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing FAQ Items */}
          {faq.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">Вопрос {index + 1}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveFAQ(index, index - 1)}
                    >
                      ↑
                    </Button>
                  )}
                  {index < faq.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveFAQ(index, index + 1)}
                    >
                      ↓
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFAQ(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Вопрос (RU)</Label>
                  <Textarea
                    value={item.question}
                    onChange={(e) =>
                      updateFAQ(index, { question: e.target.value })
                    }
                    placeholder="Введите вопрос"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Вопрос (EN)</Label>
                  <Textarea
                    value={item.question_en || ""}
                    onChange={(e) =>
                      updateFAQ(index, { question_en: e.target.value })
                    }
                    placeholder="Enter question"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ответ (RU)</Label>
                  <Textarea
                    value={item.answer}
                    onChange={(e) =>
                      updateFAQ(index, { answer: e.target.value })
                    }
                    placeholder="Введите ответ"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ответ (EN)</Label>
                  <Textarea
                    value={item.answer_en || ""}
                    onChange={(e) =>
                      updateFAQ(index, { answer_en: e.target.value })
                    }
                    placeholder="Enter answer"
                    rows={4}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="space-y-2">
                  <div className="font-medium text-sm">
                    Предварительный просмотр (
                    {currentLanguage === "ru" ? "RU" : "EN"}):
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">
                      Q:{" "}
                      {currentLanguage === "ru"
                        ? item.question
                        : item.question_en || item.question}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      A:{" "}
                      {currentLanguage === "ru"
                        ? item.answer
                        : item.answer_en || item.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New FAQ */}
          <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Добавить новый вопрос
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Вопрос (RU)</Label>
                <Textarea
                  value={newFAQ.question}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, question: e.target.value })
                  }
                  placeholder="Введите вопрос"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Вопрос (EN)</Label>
                <Textarea
                  value={newFAQ.question_en || ""}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, question_en: e.target.value })
                  }
                  placeholder="Enter question"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Ответ (RU)</Label>
                <Textarea
                  value={newFAQ.answer}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, answer: e.target.value })
                  }
                  placeholder="Введите ответ"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Ответ (EN)</Label>
                <Textarea
                  value={newFAQ.answer_en || ""}
                  onChange={(e) =>
                    setNewFAQ({ ...newFAQ, answer_en: e.target.value })
                  }
                  placeholder="Enter answer"
                  rows={4}
                />
              </div>
            </div>

            {/* Preview New FAQ */}
            {(newFAQ.question || newFAQ.answer) && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="space-y-2">
                  <div className="font-medium text-sm">
                    Предварительный просмотр (
                    {currentLanguage === "ru" ? "RU" : "EN"}):
                  </div>
                  <div className="space-y-1">
                    {(newFAQ.question || newFAQ.question_en) && (
                      <div className="font-medium">
                        Q:{" "}
                        {currentLanguage === "ru"
                          ? newFAQ.question
                          : newFAQ.question_en || newFAQ.question}
                      </div>
                    )}
                    {(newFAQ.answer || newFAQ.answer_en) && (
                      <div className="text-sm text-muted-foreground">
                        A:{" "}
                        {currentLanguage === "ru"
                          ? newFAQ.answer
                          : newFAQ.answer_en || newFAQ.answer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={addFAQ}
              disabled={!newFAQ.question || !newFAQ.answer}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить вопрос
            </Button>
          </div>

          {/* FAQ Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Советы по созданию FAQ
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Используйте простые и понятные формулировки</li>
              <li>• Отвечайте на наиболее частые вопросы пользователей</li>
              <li>• Сортируйте вопросы по важности (самые важные — вверху)</li>
              <li>
                • Обязательно заполняйте английские переводы для международной
                аудитории
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
