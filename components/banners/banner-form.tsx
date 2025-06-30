"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { bannerService } from "@/services/banner-service";

interface BannerFormProps {
  banner?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function BannerForm({ banner, onClose, onSuccess }: BannerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!banner;

  // Refs for file inputs
  const pcImageInputRef = useRef<HTMLInputElement>(null);
  const mobileImageInputRef = useRef<HTMLInputElement>(null);

  // State for selected files and previews
  const [pcImage, setPcImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [pcImagePreview, setPcImagePreview] = useState<string | null>(
    banner?.image || null
  );
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(
    banner?.mobileImage || null
  );

  // Loading states
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: banner?.title || "",
      buttonLink: banner?.buttonLink || "",
    },
  });

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title || "",
        buttonLink: banner.buttonLink || "",
      });
      setPcImagePreview(banner.image || null);
      setMobileImagePreview(banner.mobileImage || null);
    }
  }, [banner, reset]);

  // Handle file selection for PC image
  const handlePcImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setPcImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPcImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file selection for mobile image
  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setMobileImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setMobileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; buttonLink: string }) => {
      setIsUploading(true);
      try {
        const newBanner = await bannerService.createWithFormData({
          title: data.title,
          buttonLink: data.buttonLink,
          pcImageFile: pcImage || undefined,
          mobileImageFile: mobileImage || undefined,
        });
        return newBanner;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({
        title: "Success",
        description: "Banner created successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { title: string; buttonLink: string };
    }) => {
      setIsUploading(true);
      try {
        const updatedBanner = await bannerService.update(id, {
          title: data.title,
          buttonLink: data.buttonLink,
        });
        if (pcImage) {
          await bannerService.uploadPcImage(id, pcImage);
        }
        if (mobileImage) {
          await bannerService.uploadMobileImage(id, mobileImage);
        }
        return updatedBanner;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: { title: string; buttonLink: string }) => {
    // Validate required files for new banner
    if (!isEditing) {
      if (!pcImage) {
        toast({
          title: "Error",
          description: "PC image is required",
          variant: "destructive",
        });
        return;
      }
      if (!mobileImage) {
        toast({
          title: "Error",
          description: "Mobile image is required",
          variant: "destructive",
        });
        return;
      }
    }
    if (isEditing && banner) {
      updateMutation.mutate({ id: banner.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl">
          {isEditing ? "Отредактировать баннер" : "Добавить баннер"}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* PC Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="pcImage">
              PC Image{" "}
              {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <div className="mt-1">
              <input
                type="file"
                id="pcImage"
                ref={pcImageInputRef}
                onChange={handlePcImageChange}
                accept="image/*"
                className="hidden"
              />

              {pcImagePreview ? (
                <div className="relative mt-2 border rounded overflow-hidden">
                  <img
                    src={pcImagePreview || "/placeholder.svg"}
                    alt="PC Banner Preview"
                    className="w-full h-48 object-contain bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => pcImageInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Изменить
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => pcImageInputRef.current?.click()}
                  className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:bg-muted/5 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload PC image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="mobileImage">
              Mobile Image{" "}
              {!isEditing && <span className="text-destructive">*</span>}
            </Label>
            <div className="mt-1">
              <input
                type="file"
                id="mobileImage"
                ref={mobileImageInputRef}
                onChange={handleMobileImageChange}
                accept="image/*"
                className="hidden"
              />

              {mobileImagePreview ? (
                <div className="relative mt-2 border rounded overflow-hidden">
                  <img
                    src={mobileImagePreview || "/placeholder.svg"}
                    alt="Mobile Banner Preview"
                    className="w-full h-48 object-contain bg-gray-50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => mobileImageInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => mobileImageInputRef.current?.click()}
                  className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:bg-muted/5 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload mobile image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 2,
                  message: "Title must be at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Title must be at most 100 characters",
                },
              })}
              placeholder="Например: Летняя распродажа"
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message as string}
              </p>
            )}
          </div>

          {/* Button Link */}
          <div className="space-y-2">
            <Label htmlFor="buttonLink">
              Button Link URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="buttonLink"
              type="url"
              {...register("buttonLink", {
                required: "Button link is required",
                pattern: {
                  value:
                    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                  message: "Please enter a valid URL",
                },
              })}
              placeholder="https://example.com"
            />
            {errors.buttonLink && (
              <p className="text-sm text-destructive">
                {errors.buttonLink.message as string}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отменить
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Обновляем" : "Создаем..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Обновить баннер" : "Создать баннер"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
