
"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PropertyPanelProps = {
  isVisible: boolean;
  onClose: () => void;
  onStyleChange: (style: { bold?: boolean; italic?: boolean; underline?: boolean; color?: string }) => void;
  currentStyle: { bold?: boolean; italic?: boolean; underline?: boolean; color?: string };
};

const colorPalette = [
  "#000000", "#FF0000", "#008000", "#0000FF",
  "#FFA500", "#800080", "#00FFFF", "#FFC0CB",
];

export default function PropertyPanel({
  isVisible,
  onClose,
  onStyleChange,
  currentStyle,
}: PropertyPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div ref={panelRef} className="absolute z-50 top-4 right-4 bg-white border p-3 rounded-lg shadow-md flex flex-col gap-3 w-64">
      <div className="flex justify-between">
        <Button
          variant={currentStyle.bold ? "default" : "outline"}
          onClick={() => onStyleChange({ bold: !currentStyle.bold })}
        >
          B
        </Button>
        <Button
          variant={currentStyle.italic ? "default" : "outline"}
          onClick={() => onStyleChange({ italic: !currentStyle.italic })}
        >
          I
        </Button>
        <Button
          variant={currentStyle.underline ? "default" : "outline"}
          onClick={() => onStyleChange({ underline: !currentStyle.underline })}
        >
          U
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {colorPalette.map((color) => (
          <button
            key={color}
            className={cn(
              "w-6 h-6 rounded-full border-2",
              currentStyle.color === color
                ? "border-primary ring-2 ring-primary"
                : "border-gray-300"
            )}
            style={{ backgroundColor: color }}
            onClick={() => onStyleChange({ color })}
          />
        ))}
      </div>
    </div>
  );
}
