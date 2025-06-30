"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import { ImageUpload } from "./image-upload";
import { Banner } from "./banner.types";
import { bannerService } from "@/services/banner-service";

interface BannerListProps {
  onEdit: (banner: Banner) => void;
}

export function BannerList({ onEdit }: BannerListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingImages, setUploadingImages] = useState<
    Record<number, "pc" | "mobile" | null>
  >({});

  const {
    data: banners,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: bannerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({
        title: "Успешно",
        description: "Баннер успешно удален",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этот баннер?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageUpload = (bannerId: number, type: "pc" | "mobile") => {
    setUploadingImages((prev) => ({ ...prev, [bannerId]: type }));
  };

  const handleImageUploadComplete = (bannerId: number) => {
    setUploadingImages((prev) => ({ ...prev, [bannerId]: null }));
    queryClient.invalidateQueries({ queryKey: ["banners"] });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            Не удалось загрузить баннеры. Пожалуйста, попробуйте снова.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {banners?.map((banner: any) => (
          <Card
            key={banner.id}
            className="overflow-hidden rounded-xl border border-muted bg-background"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-primary truncate">
                  {banner.title ? (
                    <>
                      {banner.title}
                      <span className="text-xs text-muted-foreground align-top ml-2">
                        #{banner.id}
                      </span>
                    </>
                  ) : (
                    <>
                      Баннер{" "}
                      <span className="text-xs text-muted-foreground align-top">
                        #{banner.id}
                      </span>
                    </>
                  )}
                </CardTitle>
                {banner.buttonLink && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="p-1 h-7 w-7"
                  >
                    <a
                      href={banner.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Link className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* PC Image */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Изображение для ПК
                </label>
                {banner.image ? (
                  <div className="relative mt-0.5">
                    <img
                      src={banner.image || "/placeholder.svg"}
                      alt={`Баннер #${banner.id}`}
                      className="w-full h-24 object-cover rounded-md border border-muted"
                    />
                    <ImageUpload
                      bannerId={banner.id}
                      type="pc"
                      onUploadStart={() => handleImageUpload(banner.id, "pc")}
                      onUploadComplete={() =>
                        handleImageUploadComplete(banner.id)
                      }
                      isUploading={uploadingImages[banner.id] === "pc"}
                      className="absolute top-1 right-1"
                    />
                  </div>
                ) : (
                  <div className="mt-0.5 border border-dashed border-muted rounded-md p-3 text-center bg-muted/30">
                    <ImageUpload
                      bannerId={banner.id}
                      type="pc"
                      onUploadStart={() => handleImageUpload(banner.id, "pc")}
                      onUploadComplete={() =>
                        handleImageUploadComplete(banner.id)
                      }
                      isUploading={uploadingImages[banner.id] === "pc"}
                    />
                  </div>
                )}
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Мобильное изображение
                </label>
                {banner.mobileImage ? (
                  <div className="relative mt-0.5">
                    <img
                      src={banner.mobileImage || "/placeholder.svg"}
                      alt={`Баннер #${banner.id} (Мобильный)`}
                      className="w-full h-24 object-cover rounded-md border border-muted"
                    />
                    <ImageUpload
                      bannerId={banner.id}
                      type="mobile"
                      onUploadStart={() =>
                        handleImageUpload(banner.id, "mobile")
                      }
                      onUploadComplete={() =>
                        handleImageUploadComplete(banner.id)
                      }
                      isUploading={uploadingImages[banner.id] === "mobile"}
                      className="absolute top-1 right-1"
                    />
                  </div>
                ) : (
                  <div className="mt-0.5 border border-dashed border-muted rounded-md p-3 text-center bg-muted/30">
                    <ImageUpload
                      bannerId={banner.id}
                      type="mobile"
                      onUploadStart={() =>
                        handleImageUpload(banner.id, "mobile")
                      }
                      onUploadComplete={() =>
                        handleImageUploadComplete(banner.id)
                      }
                      isUploading={uploadingImages[banner.id] === "mobile"}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(banner)}
                    className="flex items-center gap-1 px-2 py-1 text-xs"
                  >
                    <Edit className="h-3 w-3" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    Удалить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banners?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">Баннеры не найдены</h3>
              <p className="text-sm">
                Начните с создания вашего первого баннера.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
