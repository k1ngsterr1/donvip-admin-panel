"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackList } from "./feedback-list";
import { AcceptedFeedbackList } from "./accepted-feedback-list";

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Управление отзывами</h1>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="all">Все отзывы</TabsTrigger>
          <TabsTrigger value="accepted">Принятые</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FeedbackList />
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <AcceptedFeedbackList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
