"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WysiwygEditor } from "@/components/ui/wysiwyg-editor/wysiwyg-editor";
import { TagSelector } from "@/components/ui/tag-selector/tag-selector";
import { ArrowLeft, Save, Eye, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { Tag } from "@/types/articles";

interface CreateArticleForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
}

export default function CreateArticlePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<CreateArticleForm>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image: "",
    meta_title: "",
    meta_description: "",
    is_published: false,
  });

  // Автоматическое создание slug из заголовка
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-zа-я0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim(),
    }));
  };

  // Обработка загрузки изображения
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Удаление изображения
  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, featured_image: "" }));
  };

  // Сохранение статьи
  const handleSave = async (publish: boolean = false) => {
    setIsLoading(true);

    try {
      let featuredImageUrl = formData.featured_image;

      // Загружаем изображение, если оно выбрано
      if (featuredImage) {
        const imageResponse = await api.articles.uploadFeaturedImage(
          featuredImage
        );
        featuredImageUrl = imageResponse.data.url;
      }

      const articleData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        featured_image: featuredImageUrl,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        is_published: publish,
        tag_ids: selectedTags.map((tag) => tag.id),
      };

      await api.articles.create(articleData);

      toast({
        title: publish ? "Статья опубликована" : "Статья сохранена",
        description: publish
          ? "Статья успешно опубликована и доступна для чтения"
          : "Статья сохранена как черновик",
      });

      router.push("/dashboard/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить статью",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Создать статью</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isLoading || !formData.title}
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить черновик
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isLoading || !formData.title || !formData.content}
          >
            <Eye className="h-4 w-4 mr-2" />
            Опубликовать
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основной контент */}
        <div className="lg:col-span-2 space-y-6">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Введите заголовок статьи"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL (slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="url-statii"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Краткое описание</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  placeholder="Краткое описание статьи для превью"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Контент */}
          <Card>
            <CardHeader>
              <CardTitle>Содержание статьи</CardTitle>
            </CardHeader>
            <CardContent>
              <WysiwygEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Начните писать статью..."
                height="400px"
              />
            </CardContent>
          </Card>

          {/* SEO настройки */}
          <Card>
            <CardHeader>
              <CardTitle>SEO настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meta_title: e.target.value,
                    }))
                  }
                  placeholder="SEO заголовок"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      meta_description: e.target.value,
                    }))
                  }
                  placeholder="SEO описание"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Статус публикации */}
          <Card>
            <CardHeader>
              <CardTitle>Публикация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_published: checked }))
                  }
                />
                <Label htmlFor="is_published">
                  {formData.is_published ? "Опубликовано" : "Черновик"}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Главное изображение */}
          <Card>
            <CardHeader>
              <CardTitle>Главное изображение</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Загрузите главное изображение
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="featured-image"
                  />
                  <Label
                    htmlFor="featured-image"
                    className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Выбрать файл
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Теги */}
          <Card>
            <CardHeader>
              <CardTitle>Теги</CardTitle>
            </CardHeader>
            <CardContent>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
