"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FallbackGameSelectorProps {
  selectedGameIds: number[];
  onChange: (gameIds: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

// This component is used when the API fails to load games
// It allows manual entry of game IDs as a fallback
export function FallbackGameSelector({
  selectedGameIds = [],
  onChange,
  disabled = false,
  placeholder = "Введите ID игры",
}: FallbackGameSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddGame = () => {
    const gameId = Number.parseInt(inputValue.trim(), 10);

    if (isNaN(gameId)) {
      setError("Пожалуйста, введите корректный ID игры");
      return;
    }

    if (selectedGameIds.includes(gameId)) {
      setError("Эта игра уже добавлена");
      return;
    }

    onChange([...selectedGameIds, gameId]);
    setInputValue("");
    setError(null);
  };

  const removeGame = (gameId: number) => {
    onChange(selectedGameIds.filter((id) => id !== gameId));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
          type="number"
          min="1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddGame}
          disabled={disabled || !inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {selectedGameIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedGameIds.map((gameId) => (
            <Badge key={gameId} variant="secondary" className="px-3 py-1">
              ID: {gameId}
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => removeGame(gameId)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
