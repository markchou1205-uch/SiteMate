
"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from 'fabric';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface ShapePropertyPanelProps {
  isVisible: boolean;
  onClose: () => void;
  shape: fabric.Object | null;
  onModify: () => void;
}

export default function ShapePropertyPanel({
  isVisible,
  onClose,
  shape,
  onModify,
}: ShapePropertyPanelProps) {
  const [fill, setFill] = useState('');
  const [stroke, setStroke] = useState('');
  const [strokeWidth, setStrokeWidth] = useState(0);

  useEffect(() => {
    if (shape) {
      setFill(shape.get('fill') as string || '#000000');
      setStroke(shape.get('stroke') as string || '#000000');
      setStrokeWidth(shape.get('strokeWidth') as number || 1);
    }
  }, [shape]);
  
  const handlePropertyChange = (prop: string, value: any) => {
    if (!shape) return;
    shape.set(prop, value);
    onModify();
  };

  if (!isVisible || !shape) return null;

  return (
    <Card className="absolute z-50 top-4 right-4 bg-card border p-4 rounded-lg shadow-md flex flex-col gap-4 w-64">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">屬性</h4>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fill-color">填滿顏色</Label>
        <Input
          id="fill-color"
          type="color"
          value={fill}
          onChange={(e) => {
            setFill(e.target.value);
            handlePropertyChange('fill', e.target.value);
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stroke-color">框線顏色</Label>
        <Input
          id="stroke-color"
          type="color"
          value={stroke}
          onChange={(e) => {
            setStroke(e.target.value);
            handlePropertyChange('stroke', e.target.value);
          }}
        />
      </div>
       <div className="space-y-2">
        <Label htmlFor="stroke-width">框線寬度</Label>
        <Input
          id="stroke-width"
          type="number"
          value={strokeWidth}
          onChange={(e) => {
            const width = parseInt(e.target.value, 10);
            setStrokeWidth(width);
            handlePropertyChange('strokeWidth', width);
          }}
          min="0"
        />
      </div>
    </Card>
  );
}
