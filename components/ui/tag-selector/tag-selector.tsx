"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { Tag } from "@/types/articles";
import { toast } from "@/hooks/use-toast";

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  className?: string;
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  className,
}: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка доступных тегов
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.tags.getAll({ limit: 100 });
        setAvailableTags(response.data.tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить теги",
          variant: "destructive",
        });
      }
    };

    fetchTags();
  }, []);

  const addTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId: number) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) return;

    setIsLoading(true);
    try {
      const tagData = {
        name: newTagName,
        slug: newTagName
          .toLowerCase()
          .replace(/[^a-zа-я0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim(),
        color: "#6B7280",
      };

      const response = await api.tags.create(tagData);
      const newTag = response.data;

      setAvailableTags([...availableTags, newTag]);
      addTag(newTag);
      setNewTagName("");
      setIsCreatingTag(false);

      toast({
        title: "Успешно",
        description: "Тег создан",
      });
    } catch (error) {
      console.error("Error creating tag:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать тег",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unselectedTags = availableTags.filter(
    (tag) => !selectedTags.find((selected) => selected.id === tag.id)
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Выбранные теги */}
      <div>
        <label className="text-sm font-medium mb-2 block">Выбранные теги</label>
        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
          {selectedTags.length > 0 ? (
            selectedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="flex items-center gap-1"
                style={{
                  backgroundColor: tag.color + "20",
                  borderColor: tag.color,
                }}
              >
                {tag.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeTag(tag.id)}
                />
              </Badge>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Теги не выбраны</p>
          )}
        </div>
      </div>

      {/* Доступные теги */}
      <div>
        <label className="text-sm font-medium mb-2 block">Доступные теги</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {unselectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              style={{ borderColor: tag.color }}
              onClick={() => addTag(tag)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {tag.name}
            </Badge>
          ))}
        </div>

        {/* Создание нового тега */}
        {isCreatingTag ? (
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Название нового тега"
              onKeyPress={(e) => e.key === "Enter" && createNewTag()}
              disabled={isLoading}
            />
            <Button onClick={createNewTag} size="sm" disabled={isLoading}>
              {isLoading ? "..." : "Создать"}
            </Button>
            <Button
              onClick={() => {
                setIsCreatingTag(false);
                setNewTagName("");
              }}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              Отмена
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsCreatingTag(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать новый тег
          </Button>
        )}
      </div>
    </div>
  );
}
