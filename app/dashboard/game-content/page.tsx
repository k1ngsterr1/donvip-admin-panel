import { Metadata } from "next";
import { GameContentList } from "@/components/game-content";

export const metadata: Metadata = {
  title: "Игровой контент",
  description: "Управление игровым контентом, инструкциями и обзорами",
};

export default function GameContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Игровой контент</h1>
        <p className="text-muted-foreground">
          Управляйте играми, инструкциями, обзорами и FAQ
        </p>
      </div>

      <GameContentList />
    </div>
  );
}
