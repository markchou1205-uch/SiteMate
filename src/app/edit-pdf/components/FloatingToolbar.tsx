"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FloatingToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onRotate: (direction: "left" | "right") => void;
  onDelete: () => void;
  canDelete: boolean;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  zoom,
  onZoomChange,
  onRotate,
  onDelete,
  canDelete,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-4 bg-card p-2 rounded-lg shadow-lg border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))}
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <div className="w-32 flex items-center gap-2">
            <Slider
              value={[zoom]}
              onValueChange={(value) => onZoomChange(value[0])}
              min={0.1}
              max={3}
              step={0.1}
            />
            <span className="text-sm font-mono w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRotate("left")}
            title="Rotate Left"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRotate("right")}
            title="Rotate Right"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              disabled={!canDelete}
              title="Delete Current Page"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>您確定嗎？</AlertDialogTitle>
              <AlertDialogDescription>
                這個操作無法復原。這將會永久地從文件中刪除目前的頁面。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>繼續</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default FloatingToolbar;
