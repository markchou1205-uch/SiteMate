"use client";

import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ scale, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 z-50 bg-white border rounded shadow p-2 flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onZoomOut}>
        <Minus className="w-4 h-4" />
      </Button>
      <span className="w-12 text-center text-sm">{(scale * 100).toFixed(0)}%</span>
      <Button variant="outline" size="icon" onClick={onZoomIn}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
