"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { Article, ArticlesResponse } from "@/types/articles";
import { toast } from "@/hooks/use-toast";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchArticles = async (page = 1, search = "") => {
    setLoading(true);
    try {
      // Временная заглушка для тестирования
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

      let response;

      if (search) {
        response = await api.articles.search(search, { page, limit: 10 });
      } else {
        response = await api.articles.getAll({ page, limit: 10 });
      }

      const data = response.data;
      console.log("API Response:", data);

      // Защита от undefined и неправильного формата данных
      if (data && data.data && Array.isArray(data.data)) {
        setArticles(data.data);
        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 10,
          total: data.pagination?.total || 0,
          pages: data.pagination?.totalPages || 0,
        });
      } else {
        console.warn("Invalid articles data format:", data);
        setArticles([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
        toast({
          title: "Предупреждение",
          description: "Получен неправильный формат данных от сервера",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      setArticles([]); // Устанавливаем пустой массив при ошибке
      setPagination({ page: 1, limit: 10, total: 0, pages: 0 });

      // Более детальная обработка ошибок
      if (error?.response) {
        toast({
          title: "Ошибка сервера",
          description: `HTTP ${error.response.status}: ${
            error.response.data?.message || "Не удалось загрузить статьи"
          }`,
          variant: "destructive",
        });
      } else if (error?.request) {
        toast({
          title: "Ошибка соединения",
          description:
            "Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:6001",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ошибка",
          description: error?.message || "Не удалось загрузить статьи",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage, searchQuery);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchArticles(1, searchQuery);
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту статью?")) {
      return;
    }

    try {
      await api.articles.delete(id);

      toast({
        title: "Успешно",
        description: "Статья удалена",
      });

      fetchArticles(currentPage, searchQuery);
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить статью",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Управление статьями</h1>
          <Link href="/dashboard/articles/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать статью
            </Button>
          </Link>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск статей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Поиск
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : articles && articles.length > 0 ? (
        <>
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {article.title}
                      </CardTitle>
                      {article.excerpt && (
                        <p className="text-sm text-gray-600 mb-2">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {article.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            style={{
                              backgroundColor: tag.color || "#3B82F6",
                              color: "white",
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>Создано: {formatDate(article.created_at)}</div>
                        <div>Обновлено: {formatDate(article.updated_at)}</div>
                        {article.author && (
                          <div>
                            Автор: {article.author.first_name}{" "}
                            {article.author.last_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge
                        variant={article.is_published ? "default" : "secondary"}
                      >
                        {article.is_published ? "Опубликована" : "Черновик"}
                      </Badge>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/articles/${article.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteArticle(article.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {article.featured_image && (
                  <CardContent>
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded"
                    />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Предыдущая
              </Button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                disabled={currentPage === pagination.pages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Следующая
              </Button>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            Показано {articles.length} из {pagination.total} статей
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Edit className="mx-auto h-12 w-12 mb-2 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Нет статей</h3>
            <p className="text-sm">
              {searchQuery
                ? `По запросу "${searchQuery}" ничего не найдено`
                : "Начните создавать статьи для вашего сайта"}
            </p>
          </div>
          {!searchQuery && (
            <Link href="/dashboard/articles/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Создать первую статью
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
