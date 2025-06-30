
"use client";

import React from "react";
import { MousePointer, Type, Pen, Square, Circle, Triangle, Download, Palette, LayoutGrid, PanelLeft, Hand } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type Tool = "select" | "move" | "text" | "draw" | "rect" | "circle" | "triangle";
type ViewMode = 'edit' | 'reorder';

const colors = ["#000000", "#ef4444", "#22c55e", "#3b82f6", "#f97316", "#a855f7"];

interface ToolbarProps {
  currentTool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  onDownload: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setTool,
  color,
  setColor,
  onDownload,
  viewMode,
  setViewMode
}) => {
  const isEditMode = viewMode === 'edit';

  return (
    <div className="flex flex-wrap gap-4 p-1 items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value: ViewMode) => { if(value) setViewMode(value); }}
          className="gap-1"
        >
          <ToggleGroupItem value="edit" aria-label="Edit document" title="編輯文件">
            <PanelLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="reorder" aria-label="Reorder pages" title="調整順序">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {isEditMode && (
          <>
            <Separator orientation="vertical" className="h-8" />
            <ToggleGroup 
              type="single" 
              value={currentTool} 
              onValueChange={(value: Tool) => { if(value) setTool(value); }}
              className="gap-1"
            >
              <ToggleGroupItem value="select" aria-label="Select tool" title="選取">
                <MousePointer className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="move" aria-label="Move tool" title="移動">
                <Hand className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="text" aria-label="Text tool" title="文字">
                <Type className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="draw" aria-label="Drawing tool" title="手繪">
                <Pen className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="rect" aria-label="Rectangle tool" title="矩形">
                <Square className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="circle" aria-label="Circle tool" title="圓形">
                <Circle className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="triangle" aria-label="Triangle tool" title="三角形">
                <Triangle className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Separator orientation="vertical" className="h-8" />
            
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${color === c ? 'border-primary ring-2 ring-primary' : 'border-card'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
              <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 p-0 border-none rounded-full cursor-pointer appearance-none bg-transparent"
                  style={{backgroundColor: 'transparent'}}
                />
            </div>
          </>
        )}
      </div>

      <div>
         <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          下載 PDF
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
