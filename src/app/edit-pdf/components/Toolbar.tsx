
"use client";

import React from "react";
import { MousePointer, Type, Pen, Square, Circle, Triangle, Download, Palette, LayoutGrid, PanelLeft, Hand, Shapes } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const shapeTools: Tool[] = ['draw', 'rect', 'circle', 'triangle'];
  const isShapeToolActive = shapeTools.includes(currentTool);

  return (
    <div className="flex flex-wrap gap-4 p-2 items-center justify-between w-full h-auto">
      <div className="flex items-center gap-4">
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value: ViewMode) => { if(value) setViewMode(value); }}
          className="gap-1"
        >
          <ToggleGroupItem value="edit" aria-label="Edit document" className="flex flex-col h-auto p-2 gap-1">
            <PanelLeft className="h-5 w-5" />
            <span className="text-xs whitespace-nowrap">編輯文件</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="reorder" aria-label="Reorder pages" className="flex flex-col h-auto p-2 gap-1">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs whitespace-nowrap">調整順序</span>
          </ToggleGroupItem>
        </ToggleGroup>

        {isEditMode && (
          <>
            <Separator orientation="vertical" className="h-14" />
            <ToggleGroup 
              type="single" 
              value={isShapeToolActive ? undefined : currentTool} 
              onValueChange={(value: Tool) => { if(value) setTool(value); }}
              className="gap-2"
            >
              <ToggleGroupItem value="select" aria-label="Select tool" className="flex flex-col h-auto p-2 gap-1">
                <MousePointer className="h-5 w-5" />
                <span className="text-xs whitespace-nowrap">選取</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="move" aria-label="Move tool" className="flex flex-col h-auto p-2 gap-1">
                <Hand className="h-5 w-5" />
                <span className="text-xs whitespace-nowrap">移動</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="text" aria-label="Text tool" className="flex flex-col h-auto p-2 gap-1">
                <Type className="h-5 w-5" />
                <span className="text-xs whitespace-nowrap">文字</span>
              </ToggleGroupItem>
            </ToggleGroup>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={isShapeToolActive ? 'secondary' : 'outline'} className="flex flex-col h-auto p-2 gap-1" style={{height: 'auto'}}>
                   <Shapes className="h-5 w-5" />
                   <span className="text-xs whitespace-nowrap">插入圖形</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setTool('draw')}>
                  <Pen className="mr-2 h-4 w-4" />
                  <span>手繪</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTool('rect')}>
                  <Square className="mr-2 h-4 w-4" />
                  <span>矩形</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTool('circle')}>
                  <Circle className="mr-2 h-4 w-4" />
                  <span>圓形</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setTool('triangle')}>
                  <Triangle className="mr-2 h-4 w-4" />
                  <span>三角形</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Separator orientation="vertical" className="h-14" />
            
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
         <Button onClick={onDownload} variant="destructive">
          <Download className="mr-2 h-4 w-4" />
          下載 PDF
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
