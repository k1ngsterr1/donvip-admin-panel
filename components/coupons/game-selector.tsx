"use client";

import type React from "react";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ProductService, type Product } from "@/services/product-service";

// Simple mock data to use when API fails
const FALLBACK_GAMES = [
  { id: 1, name: "Counter-Strike 2" },
  { id: 2, name: "Dota 2" },
  { id: 3, name: "PUBG" },
  { id: 4, name: "Apex Legends" },
  { id: 5, name: "Fortnite" },
];

interface GameSelectorProps {
  selectedGameIds: number[];
  onChange: (gameIds: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function GameSelector({
  selectedGameIds = [],
  onChange,
  disabled = false,
  placeholder = "Выберите игры",
}: GameSelectorProps) {
  const [open, setOpen] = useState(false);

  // Use ProductService to fetch games
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const response = await ProductService.getProducts({ limit: 100 });
        return response.data;
      } catch (error) {
        console.error("Failed to fetch games:", error);
        // Return fallback data instead of throwing
        return FALLBACK_GAMES;
      }
    },
    // Prevent refetching to avoid loops
    refetchOnWindowFocus: false,
    // Use stale data if available
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use data or fallback
  const games = data || FALLBACK_GAMES;

  // Get selected games by filtering the games array
  const selectedGames = games.filter((game: any) =>
    selectedGameIds.includes(game.id)
  );

  const handleGameSelect = (gameId: number) => {
    if (selectedGameIds.includes(gameId)) {
      // Remove game if already selected
      onChange(selectedGameIds.filter((id) => id !== gameId));
    } else {
      // Add game if not selected
      onChange([...selectedGameIds, gameId]);
    }
  };

  const removeGame = (gameId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onChange(selectedGameIds.filter((id) => id !== gameId));
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : selectedGames.length > 0 ? (
              `${selectedGames.length} игр выбрано`
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Поиск игры..." />
            <CommandList>
              <CommandEmpty>Игры не найдены.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-60">
                  {games.map((game: any) => (
                    <CommandItem
                      key={game.id}
                      value={game.name}
                      onSelect={() => handleGameSelect(game.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedGameIds.includes(game.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {game.name}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected games */}
      {selectedGames.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedGames.map((game: any) => (
            <Badge key={game.id} variant="secondary" className="px-3 py-1">
              {game.name}
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={(e) => removeGame(game.id, e)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
