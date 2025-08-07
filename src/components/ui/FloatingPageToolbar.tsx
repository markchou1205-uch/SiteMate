
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ZoomIn, ZoomOut, RotateCw, Trash2, ChevronsRight, PanelBottomClose, PlusCircle, File, FilePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingPageToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onDelete: () => void;
  onInsertBlankPage: () => void;
}

const FloatingPageToolbar: React.FC<FloatingPageToolbarProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onRotate,
  onDelete,
  onInsertBlankPage,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const isSidebarVisible = true; // This should be a prop in a real app

  return (
    <TooltipProvider>
      <div
        className={cn(
          'fixed bottom-6 z-50 transition-all duration-300 ease-in-out',
          'left-1/2 -translate-x-1/2',
          {
            'md:left-[calc(50%+(9rem/2))]': isSidebarVisible && !isMinimized,
            'left-auto right-6 -translate-x-0 md:left-auto': isMinimized,
          }
        )}
      >
        {isMinimized ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-12 w-12 shadow-lg"
                onClick={() => setIsMinimized(false)}
              >
                <PanelBottomClose className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="mb-2">
              <p>Expand Toolbar</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardContent className="p-2 flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onZoomOut}>
                    <ZoomOut />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom Out</p>
                </TooltipContent>
              </Tooltip>

              <div className="text-sm font-semibold w-16 text-center tabular-nums">
                {Math.round(scale * 100)}%
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onZoomIn}>
                    <ZoomIn />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>

              <div className="border-l h-6 mx-1" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onRotate}>
                    <RotateCw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rotate Page</p>
                </TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <PlusCircle />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Insert Page</p>
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent side="top" align="center" className="mb-2">
                    <DropdownMenuItem onClick={onInsertBlankPage}>
                        <File className="mr-2 h-4 w-4" />
                        <span>Insert Blank Page</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                         <FilePlus className="mr-2 h-4 w-4" />
                        <span>Insert File (Coming Soon)</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
                    <Trash2 />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Page</p>
                </TooltipContent>
              </Tooltip>
              
               <div className="border-l h-6 mx-1" />
               
               <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
                    <ChevronsRight />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Minimize</p>
                </TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FloatingPageToolbar;
