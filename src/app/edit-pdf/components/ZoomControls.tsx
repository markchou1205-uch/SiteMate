"use client";

import { Plus, Minus, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export default function ZoomControls({
  scale,
  onZoomIn,
  onZoomOut,
  onRotateLeft,
  onRotateRight,
}: ZoomControlsProps) {
  return (
    <div className="bg-white border rounded-lg shadow-md p-2 flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onZoomOut} title="縮小">
        <Minus className="w-4 h-4" />
      </Button>
      <span className="w-12 text-center text-sm">{(scale * 100).toFixed(0)}%</span>
      <Button variant="outline" size="icon" onClick={onZoomIn} title="放大">
        <Plus className="w-4 h-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1"></div>
      <Button variant="outline" size="icon" onClick={onRotateLeft} title="向左旋轉">
        <RotateCcw className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onRotateRight} title="向右旋轉">
        <RotateCw className="w-4 h-4" />
      </Button>
    </div>
  );
}
