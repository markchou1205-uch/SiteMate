
"use client";

import React from "react";
import { Download, LayoutGrid, PanelLeft } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

type ViewMode = 'edit' | 'reorder';

interface ToolbarProps {
  onDownload: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onDownload,
  viewMode,
  setViewMode
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
