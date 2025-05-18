"use client";

import { useGames } from "@/lib/hooks/use-games";
import { GameSelector } from "./game-selector";
import { FallbackGameSelector } from "./fallback-game-selector";

interface SmartGameSelectorProps {
  selectedGameIds: number[];
  onChange: (gameIds: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  maxHeight?: string;
}

export function SmartGameSelector(props: SmartGameSelectorProps) {
  const { data, isLoading, error } = useGames();

  // If there's an error or no games were loaded, use the fallback selector
  if (error || (data && data.data.length === 0 && !isLoading)) {
    return <FallbackGameSelector {...props} />;
  }

  // Otherwise use the regular game selector
  return <GameSelector {...props} />;
}
