
"use client";

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Tool, EditableObject, ShapeObject, Point } from '../lib/types';

interface UseInteractionManagerProps {
  addObject: (obj: EditableObject) => void;
  updateObject: (obj: EditableObject) => void;
  scale: number;
}

export function useInteractionManager({ addObject, updateObject, scale }: UseInteractionManagerProps) {
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingShape, setCurrentDrawingShape] = useState<ShapeObject | null>(null);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLDivElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const point = getCanvasCoordinates(e);
    
    // Deselect if clicking on canvas background
    if (e.target === e.currentTarget) {
        setSelectedObjectId(null);
    }

    if (selectedTool.startsWith('shape-')) {
      setIsDrawing(true);
      const newShape: ShapeObject = {
        id: uuidv4(),
        type: 'shape',
        pageNumber: 1, // This should be determined based on which page is clicked
        shapeType: selectedTool.split('-')[1] as any,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color: '#000000',
        strokeWidth: 2,
      };
      setCurrentDrawingShape(newShape);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentDrawingShape) return;
    const point = getCanvasCoordinates(e);

    const newWidth = point.x - currentDrawingShape.x;
    const newHeight = point.y - currentDrawingShape.y;

    setCurrentDrawingShape(prev => prev ? { ...prev, width: newWidth, height: newHeight } : null);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing && currentDrawingShape) {
      addObject(currentDrawingShape);
    }
    setIsDrawing(false);
    setCurrentDrawingShape(null);
  };
  
  return {
    selectedTool,
    setSelectedTool,
    selectedObjectId,
    setSelectedObjectId,
    isDrawing,
    currentDrawingShape,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  };
}
