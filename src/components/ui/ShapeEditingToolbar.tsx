
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import type { ShapeObject } from '@/app/edit-pdf-v1/lib/types';


interface ShapeEditingToolbarProps {
  shape: ShapeObject | null;
  onUpdate: (update: Partial<ShapeObject> & { id: string }) => void;
}


const ShapeEditingToolbar: React.FC<ShapeEditingToolbarProps> = ({
  shape,
  onUpdate,
}) => {
  if (!shape) return null;
  
  const handleUpdate = (key: keyof ShapeObject, value: any) => {
    onUpdate({ id: shape.id, [key]: value });
  };
  
  return (
    <div
      className="shape-editing-toolbar flex items-center gap-2 p-2 bg-card border rounded-lg shadow-xl"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()} 
    >
      <Popover>
          <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                  <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: shape.color }} />
              </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
              <Input
                  type="color"
                  value={shape.color}
                  onChange={(e) => handleUpdate('color', e.target.value)}
                  className="w-12 h-12 p-0 border-none cursor-pointer"
              />
          </PopoverContent>
      </Popover>

      <Popover>
          <PopoverTrigger asChild>
              <Button variant="ghost" className="h-9 px-3">
                  {shape.strokeWidth}px
              </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
              <Input
                  type="range"
                  min="1"
                  max="20"
                  value={shape.strokeWidth}
                  onChange={(e) => handleUpdate('strokeWidth', parseInt(e.target.value, 10))}
              />
          </PopoverContent>
      </Popover>

    </div>
  );
};

export default ShapeEditingToolbar;
