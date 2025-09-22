"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Languages, CheckCircle, AlertCircle } from "lucide-react";
import { SupportedLanguage } from "@/types/game-content-dto";

interface LanguageToggleProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  hasTranslation?: boolean;
  className?: string;
}

export function LanguageToggle({
  currentLanguage,
  onLanguageChange,
  hasTranslation = false,
  className = "",
}: LanguageToggleProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Translation Status */}
      <div className="flex items-center space-x-2">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Переводы:</span>
        {hasTranslation ? (
          <Badge variant="secondary" className="text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Доступны
          </Badge>
        ) : (
          <Badge variant="outline" className="text-orange-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Не заполнены
          </Badge>
        )}
      </div>

      {/* Language Selector */}
      <div className="flex items-center space-x-1 bg-muted rounded-md p-1">
        <Button
          type="button"
          variant={currentLanguage === "ru" ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange("ru")}
          className="h-8 px-3"
        >
          <Globe className="h-3 w-3 mr-1" />
          RU
        </Button>
        <Button
          type="button"
          variant={currentLanguage === "en" ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange("en")}
          className="h-8 px-3"
        >
          <Globe className="h-3 w-3 mr-1" />
          EN
        </Button>
      </div>
    </div>
  );
}
