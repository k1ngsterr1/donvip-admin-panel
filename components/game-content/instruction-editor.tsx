"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Image } from "lucide-react";
import {
  GameInstructionDto,
  InstructionStepDto,
  InstructionImageDto,
  SupportedLanguage,
} from "@/types/game-content-dto";
import { ImageUpload } from "./image-upload";

interface InstructionEditorProps {
  instruction?: GameInstructionDto;
  currentLanguage: SupportedLanguage;
  onChange: (instruction: GameInstructionDto) => void;
}

export function InstructionEditor({
  instruction,
  currentLanguage,
  onChange,
}: InstructionEditorProps) {
  const [newStep, setNewStep] = useState<Partial<InstructionStepDto>>({
    id: "",
    text: "",
    text_en: "",
    highlight: "",
    highlight_en: "",
  });

  const [newImage, setNewImage] = useState<Partial<InstructionImageDto>>({
    id: "",
    src: "",
    alt: "",
    alt_en: "",
    width: undefined,
    height: undefined,
  });

  const updateInstruction = (updates: Partial<GameInstructionDto>) => {
    onChange({
      headerText: instruction?.headerText || "",
      headerText_en: instruction?.headerText_en,
      steps: instruction?.steps || [],
      images: instruction?.images || [],
      ...updates,
    });
  };

  const addStep = () => {
    if (!newStep.id || !newStep.text) return;

    const step: InstructionStepDto = {
      id: newStep.id,
      text: newStep.text,
      text_en: newStep.text_en,
      highlight: newStep.highlight,
      highlight_en: newStep.highlight_en,
    };

    updateInstruction({
      steps: [...(instruction?.steps || []), step],
    });

    setNewStep({
      id: "",
      text: "",
      text_en: "",
      highlight: "",
      highlight_en: "",
    });
  };

  const removeStep = (stepId: string) => {
    updateInstruction({
      steps: instruction?.steps?.filter((step) => step.id !== stepId) || [],
    });
  };

  const updateStep = (stepId: string, updates: Partial<InstructionStepDto>) => {
    updateInstruction({
      steps:
        instruction?.steps?.map((step) =>
          step.id === stepId ? { ...step, ...updates } : step
        ) || [],
    });
  };

  const addImage = () => {
    if (!newImage.id || !newImage.src || !newImage.alt) return;

    const image: InstructionImageDto = {
      id: newImage.id,
      src: newImage.src,
      alt: newImage.alt,
      alt_en: newImage.alt_en,
      width: newImage.width,
      height: newImage.height,
    };

    updateInstruction({
      images: [...(instruction?.images || []), image],
    });

    setNewImage({
      id: "",
      src: "",
      alt: "",
      alt_en: "",
      width: undefined,
      height: undefined,
    });
  };

  const removeImage = (imageId: string) => {
    updateInstruction({
      images: instruction?.images?.filter((img) => img.id !== imageId) || [],
    });
  };

  const updateImage = (
    imageId: string,
    updates: Partial<InstructionImageDto>
  ) => {
    updateInstruction({
      images:
        instruction?.images?.map((img) =>
          img.id === imageId ? { ...img, ...updates } : img
        ) || [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Text */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Заголовок инструкции
            <Badge variant={currentLanguage === "ru" ? "default" : "secondary"}>
              {currentLanguage === "ru" ? "RU" : "EN"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="headerText">
              Заголовок {currentLanguage === "en" && "(English)"}
            </Label>
            <Input
              id="headerText"
              value={
                currentLanguage === "ru"
                  ? instruction?.headerText || ""
                  : instruction?.headerText_en || ""
              }
              onChange={(e) =>
                updateInstruction({
                  [currentLanguage === "ru" ? "headerText" : "headerText_en"]:
                    e.target.value,
                })
              }
              placeholder={
                currentLanguage === "ru"
                  ? "Введите заголовок инструкции"
                  : "Enter instruction header"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Шаги инструкции</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Steps */}
          {instruction?.steps?.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">Шаг {index + 1}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ID: {step.id}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeStep(step.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Текст шага (RU)</Label>
                  <Textarea
                    value={step.text}
                    onChange={(e) =>
                      updateStep(step.id, { text: e.target.value })
                    }
                    placeholder="Введите текст шага"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Текст шага (EN)</Label>
                  <Textarea
                    value={step.text_en || ""}
                    onChange={(e) =>
                      updateStep(step.id, { text_en: e.target.value })
                    }
                    placeholder="Enter step text"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Выделение (RU)</Label>
                  <Input
                    value={step.highlight || ""}
                    onChange={(e) =>
                      updateStep(step.id, { highlight: e.target.value })
                    }
                    placeholder="Текст для выделения"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Выделение (EN)</Label>
                  <Input
                    value={step.highlight_en || ""}
                    onChange={(e) =>
                      updateStep(step.id, { highlight_en: e.target.value })
                    }
                    placeholder="Text to highlight"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add New Step */}
          <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Добавить новый шаг
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID шага</Label>
                <Input
                  value={newStep.id}
                  onChange={(e) =>
                    setNewStep({ ...newStep, id: e.target.value })
                  }
                  placeholder="step-1"
                />
              </div>

              <div></div>

              <div className="space-y-2">
                <Label>Текст шага (RU)</Label>
                <Textarea
                  value={newStep.text}
                  onChange={(e) =>
                    setNewStep({ ...newStep, text: e.target.value })
                  }
                  placeholder="Введите текст шага"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Текст шага (EN)</Label>
                <Textarea
                  value={newStep.text_en || ""}
                  onChange={(e) =>
                    setNewStep({ ...newStep, text_en: e.target.value })
                  }
                  placeholder="Enter step text"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Выделение (RU)</Label>
                <Input
                  value={newStep.highlight || ""}
                  onChange={(e) =>
                    setNewStep({ ...newStep, highlight: e.target.value })
                  }
                  placeholder="Текст для выделения"
                />
              </div>

              <div className="space-y-2">
                <Label>Выделение (EN)</Label>
                <Input
                  value={newStep.highlight_en || ""}
                  onChange={(e) =>
                    setNewStep({ ...newStep, highlight_en: e.target.value })
                  }
                  placeholder="Text to highlight"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={addStep}
              disabled={!newStep.id || !newStep.text}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить шаг
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Изображения инструкций</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Images */}
          {instruction?.images?.map((image) => (
            <div key={image.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    ID: {image.id}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL изображения</Label>
                  <Input
                    value={image.src}
                    onChange={(e) =>
                      updateImage(image.id, { src: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alt текст (RU)</Label>
                  <Input
                    value={image.alt}
                    onChange={(e) =>
                      updateImage(image.id, { alt: e.target.value })
                    }
                    placeholder="Описание изображения"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ширина (px)</Label>
                  <Input
                    type="number"
                    value={image.width || ""}
                    onChange={(e) =>
                      updateImage(image.id, {
                        width: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="400"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Alt текст (EN)</Label>
                  <Input
                    value={image.alt_en || ""}
                    onChange={(e) =>
                      updateImage(image.id, { alt_en: e.target.value })
                    }
                    placeholder="Image description"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Высота (px)</Label>
                  <Input
                    type="number"
                    value={image.height || ""}
                    onChange={(e) =>
                      updateImage(image.id, {
                        height: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="200"
                  />
                </div>
              </div>

              {image.src && (
                <div className="mt-2">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="max-w-xs rounded-md border"
                    style={{
                      width: image.width || "auto",
                      height: image.height || "auto",
                    }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add New Image */}
          <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">
              Добавить новое изображение
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID изображения</Label>
                <Input
                  value={newImage.id}
                  onChange={(e) =>
                    setNewImage({ ...newImage, id: e.target.value })
                  }
                  placeholder="instruction-image-1"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <ImageUpload
                  value={newImage.src || ""}
                  onChange={(url) => setNewImage({ ...newImage, src: url })}
                  type="instruction"
                  label="Изображение для инструкции"
                />
              </div>

              <div className="space-y-2">
                <Label>Alt текст (RU)</Label>
                <Input
                  value={newImage.alt}
                  onChange={(e) =>
                    setNewImage({ ...newImage, alt: e.target.value })
                  }
                  placeholder="Описание изображения"
                />
              </div>

              <div className="space-y-2">
                <Label>Alt текст (EN)</Label>
                <Input
                  value={newImage.alt_en || ""}
                  onChange={(e) =>
                    setNewImage({ ...newImage, alt_en: e.target.value })
                  }
                  placeholder="Image description"
                />
              </div>

              <div className="space-y-2">
                <Label>Ширина (px)</Label>
                <Input
                  type="number"
                  value={newImage.width || ""}
                  onChange={(e) =>
                    setNewImage({
                      ...newImage,
                      width: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="400"
                />
              </div>

              <div className="space-y-2">
                <Label>Высота (px)</Label>
                <Input
                  type="number"
                  value={newImage.height || ""}
                  onChange={(e) =>
                    setNewImage({
                      ...newImage,
                      height: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="200"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={addImage}
              disabled={!newImage.id || !newImage.src || !newImage.alt}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить изображение
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
