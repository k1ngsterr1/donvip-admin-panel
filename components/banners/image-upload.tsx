"use client";

import type React from "react";

import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { bannerService } from "@/services/banner-service";

interface ImageUploadProps {
  bannerId: number;
  type: "pc" | "mobile";
  onUploadStart: () => void;
  onUploadComplete: () => void;
  isUploading: boolean;
  className?: string;
}

export function ImageUpload({
  bannerId,
  type,
  onUploadStart,
  onUploadComplete,
  isUploading,
  className,
}: ImageUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: ({
      id,
      file,
      imageType,
    }: {
      id: number;
      file: File;
      imageType: "pc" | "mobile";
    }) => bannerService.uploadImage(id, file, imageType),
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: `${
          type === "pc" ? "Изображение для ПК" : "Мобильное изображение"
        } успешно загружено`,
      });
      onUploadComplete();
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
      onUploadComplete();
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите корректный файл изображения",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер изображения должен быть менее 5МБ",
        variant: "destructive",
      });
      return;
    }

    onUploadStart();
    uploadMutation.mutate({ id: bannerId, file, imageType: type });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isUploading}
        className={cn("flex items-center gap-1", className)}
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
            Загрузка...
          </>
        ) : (
          <>
            <Camera className="h-3 w-3" />
            {type === "pc" ? "Изображение для ПК" : "Мобильное изображение"}
          </>
        )}
      </Button>
    </>
  );
}
