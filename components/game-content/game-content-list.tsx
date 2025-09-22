"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
  GamepadIcon,
  TrendingUp,
  Star,
} from "lucide-react";
import { GameContentService } from "@/services/game-content-service";
import { GameContentForm } from "./game-content-form";
import { GameContent } from "@/types/game-content-dto";

interface GameListItem {
  gameId: string;
  gameName: string;
  description: string;
  instruction?: {
    headerText: string;
    steps: Array<{ id: string; text: string; highlight?: string }>;
    images: Array<{
      id: string;
      src: string;
      alt: string;
      width?: number;
      height?: number;
    }>;
  };
  reviews?: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    verified: boolean;
    date: string;
  }>;
  faq?: Array<{ id: string; question: string; answer: string }>;
  totalReviews?: number;
  averageRating?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export function GameContentList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGame, setEditingGame] = useState<GameContent | null>(null);
  const [deletingGameId, setDeletingGameId] = useState<string | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const queryClient = useQueryClient();

  // Fetch games data
  const { data, isLoading, error } = useQuery({
    queryKey: ["gameContent"],
    queryFn: () => GameContentService.getAllGames(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (gameId: string) =>
      GameContentService.deleteGameContent(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameContent"] });
      toast({
        title: "Успешно",
        description: "Игровой контент удален",
      });
      setDeletingGameId(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить игровой контент",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (gameIds: string[]) =>
      GameContentService.bulkDeleteGames(gameIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["gameContent"] });
      toast({
        title: "Успешно",
        description: `Удалено ${result.deletedCount} игр`,
      });
      setSelectedGames([]);
      setShowBulkActions(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить игры",
        variant: "destructive",
      });
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ gameId, active }: { gameId: string; active: boolean }) =>
      GameContentService.toggleGameStatus(gameId, active),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["gameContent"] });
      toast({
        title: "Успешно",
        description: result.message,
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус игры",
        variant: "destructive",
      });
    },
  });

  // Transform data to GameListItem
  const games: GameListItem[] = data?.games || [];
  const totalGames = games.length;

  // Filter games based on search term
  const filteredGames = games.filter(
    (game) =>
      game.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.gameId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (game: GameListItem) => {
    // Перенаправляем на новую страницу редактирования с поддержкой двух языков
    router.push(`/dashboard/game-content/${game.gameId}/edit`);
  };

  const handleDelete = (gameId: string) => {
    setDeletingGameId(gameId);
  };

  const confirmDelete = () => {
    if (deletingGameId) {
      deleteMutation.mutate(deletingGameId);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["gameContent"] });
    setShowCreateDialog(false);
    setEditingGame(null);
  };

  // Selection handlers
  const handleSelectGame = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSelectAll = () => {
    if (selectedGames.length === filteredGames.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(filteredGames.map((game) => game.gameId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedGames.length === 0) return;
    bulkDeleteMutation.mutate(selectedGames);
  };

  const handleToggleStatus = (gameId: string, currentActive: boolean) => {
    toggleStatusMutation.mutate({ gameId, active: !currentActive });
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Ошибка загрузки данных: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего игр</CardTitle>
            <GamepadIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGames}</div>
            <p className="text-xs text-muted-foreground">игровых контентов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              С инструкциями
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                games.filter(
                  (game) => (game.instruction?.steps?.length || 0) > 0
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">имеют инструкции</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отзывы</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {games.reduce((sum, game) => sum + (game.totalReviews || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">всего отзывов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {games.reduce((sum, game) => sum + (game.faq?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">вопросов и ответов</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Игровой контент</CardTitle>
              <CardDescription>
                Управление игровым контентом и инструкциями
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push("/dashboard/game-content/create")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить контент для игры
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Bulk Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, ID или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedGames.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">
                  Выбрано: {selectedGames.length} игр
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteMutation.isPending}
                  >
                    {bulkDeleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Удалить выбранные
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedGames([])}
                  >
                    Отменить выбор
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedGames.length === filteredGames.length &&
                        filteredGames.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID игры</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Инструкции</TableHead>
                  <TableHead>Отзывы</TableHead>
                  <TableHead>FAQ</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p>Загрузка...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredGames.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <GamepadIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? "Игры не найдены"
                          : "Игровой контент отсутствует"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGames.map((game) => (
                    <TableRow key={game.gameId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedGames.includes(game.gameId)}
                          onCheckedChange={() => handleSelectGame(game.gameId)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline">{game.gameId}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {game.gameName}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate" title={game.description}>
                          {game.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              (game.instruction?.steps?.length || 0) > 0
                                ? "default"
                                : "secondary"
                            }
                          >
                            {game.instruction?.steps?.length || 0} шагов
                          </Badge>
                          {(game.instruction?.images?.length || 0) > 0 && (
                            <Badge variant="outline">
                              {game.instruction?.images?.length || 0}{" "}
                              изображений
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Star className="h-3 w-3" />
                            {game.totalReviews || 0}
                          </Badge>
                          {(game.averageRating || 0) > 0 && (
                            <span className="text-sm text-muted-foreground">
                              ({game.averageRating?.toFixed(1)})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {game.faq?.length || 0} вопросов
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleStatus(game.gameId, !game.isActive)
                          }
                          className="p-0"
                        >
                          <Badge
                            variant={game.isActive ? "default" : "secondary"}
                            className="cursor-pointer"
                          >
                            {game.isActive ? "Активная" : "Неактивная"}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(game)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(game.gameId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Добавить контент для игры</DialogTitle>
            <DialogDescription>
              Выберите игру и добавьте для неё инструкции и контент
            </DialogDescription>
          </DialogHeader>
          <GameContentForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingGame} onOpenChange={() => setEditingGame(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Редактировать игровой контент</DialogTitle>
            <DialogDescription>
              Изменить информацию и инструкции для игры
            </DialogDescription>
          </DialogHeader>
          {editingGame && (
            <GameContentForm
              gameContent={editingGame}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingGameId}
        onOpenChange={() => setDeletingGameId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить игровой контент?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Игровой контент и все связанные с
              ним инструкции будут удалены навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
