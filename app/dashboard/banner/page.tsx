"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BannerForm } from "@/components/banners/banner-form";
import { Banner } from "@/components/banners/banner.types";
import { BannerList } from "@/components/banners/banner-list";

// Create a query client instance with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

function BannersPageContent() {
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

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBanner(null);
    // Invalidate queries to refresh the banner list
    queryClient.invalidateQueries({ queryKey: ["banners"] });
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
            banner={editingBanner}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        ) : (
          <BannerList onEdit={handleEditBanner} />
        )}
      </div>
    </div>
  );
}

export default function BannersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BannersPageContent />
    </QueryClientProvider>
  );
}
