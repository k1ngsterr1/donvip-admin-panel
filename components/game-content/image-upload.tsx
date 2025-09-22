"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  X,
  Image as ImageIcon,
  Check,
  AlertCircle,
  FileImage,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  type?: "description" | "instruction";
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
}

interface UploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
  filename: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  type = "description",
  label = "Изображение",
  accept = "image/*",
  maxSize = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getUploadEndpoint = () => {
    switch (type) {
      case "instruction":
        return "/game-content/upload-instruction-image";
      case "description":
      default:
        return "/game-content/upload-description-image";
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Разрешены только изображения");
      return false;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Размер файла не должен превышать ${maxSize}MB`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient.post<UploadResponse>(
        getUploadEndpoint(),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(progress);
            }
          },
        }
      );

      if (response.data.success) {
        onChange(response.data.imageUrl);
        toast({
          title: "Успешно",
          description: "Изображение загружено успешно",
        });
      } else {
        throw new Error(response.data.message || "Ошибка загрузки");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ошибка загрузки файла";
      setError(errorMessage);
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && validateFile(file)) {
      uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      {/* Current Image Display */}
      {value && !isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="relative group">
                <img
                  src={value}
                  alt="Загруженное изображение"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <Badge variant="outline" className="text-green-700">
                    Загружено
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Изображение успешно загружено
                </p>
                <p className="text-xs text-muted-foreground break-all">
                  {value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isUploading
                ? "border-blue-300 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium">Загрузка...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <FileImage className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Перетащите изображение сюда или{" "}
                    <button
                      type="button"
                      onClick={openFileDialog}
                      className="text-blue-500 hover:text-blue-600 underline"
                    >
                      выберите файл
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Поддерживаются: JPG, PNG, GIF до {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            </>
          )}

          {!value && !isUploading && (
            <>
              <Separator className="my-3" />
              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                className="w-full"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Выбрать файл
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
