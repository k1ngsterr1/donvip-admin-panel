//@ts-nocheck
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BannerForm } from "@/components/banners/banner-form";
import { Banner } from "@/services/banner-service";
import { BannerList } from "@/components/banners/banner-list";

const queryClient = new QueryClient();

export default function BannersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const handleAddBanner = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Управление баннерами
            </h1>
            <p className="text-muted-foreground mt-2">
              Управляйте баннерами на веб-сайте
            </p>
          </div>
          <Button onClick={handleAddBanner} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Добавить баннер
          </Button>
        </div>

        {showForm ? (
          <BannerForm
            banner={editingBanner as any}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        ) : (
          <BannerList onEdit={handleEditBanner} />
        )}
      </div>
    </div>
  );
}
