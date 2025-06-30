
"use client";

import React from "react";
import { Download, LayoutGrid, PanelLeft, Type, MousePointer } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

type ViewMode = 'edit' | 'reorder';
type ActiveTool = 'select' | 'text';

interface ToolbarProps {
  onDownload: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTool: ActiveTool;
  onToolChange: (tool: ActiveTool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onDownload,
  viewMode,
  setViewMode,
  activeTool,
  onToolChange
}) => {
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
        
        {viewMode === 'edit' && (
           <ToggleGroup 
              type="single" 
              value={activeTool} 
              onValueChange={(value: ActiveTool) => { if(value) onToolChange(value); }}
              className="gap-1"
            >
              <ToggleGroupItem value="select" aria-label="Select tool" className="flex flex-col h-auto p-2 gap-1">
                <MousePointer className="h-5 w-5" />
                <span className="text-xs whitespace-nowrap">選取</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="text" aria-label="Text tool" className="flex flex-col h-auto p-2 gap-1">
                <Type className="h-5 w-5" />
                <span className="text-xs whitespace-nowrap">文字</span>
              </ToggleGroupItem>
            </ToggleGroup>
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
