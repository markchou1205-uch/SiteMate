
// components/PageThumbnailList.tsx

import React, { useEffect, useRef } from "react";
import Sortable from 'sortablejs';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilePlus2, RotateCw, Trash2, File, FilePlus } from "lucide-react";

interface PageThumbnailListProps {
  thumbnails: string[];
  currentPage: number;
  onPageClick: (pageNumber: number) => void;
  onAddBlankPage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onRotatePage: (index: number) => void;
  onReorderPages: (oldIndex: number, newIndex: number) => void;
  onPrepareInsertPdf: (position: 'start' | 'before' | 'after' | 'end', index?: number) => void;
}

const PageThumbnailList: React.FC<PageThumbnailListProps> = ({
  thumbnails,
  currentPage,
  onPageClick,
  onAddBlankPage,
  onDeletePage,
  onRotatePage,
  onReorderPages,
  onPrepareInsertPdf,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (listRef.current) {
      const sortable = Sortable.create(listRef.current, {
        animation: 150,
        ghostClass: 'opacity-50',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            onReorderPages(evt.oldIndex, evt.newIndex);
          }
        },
      });
      return () => sortable.destroy();
    }
  }, [onReorderPages]);

  useEffect(() => {
    if (currentPage > 0 && thumbnailRefs.current[currentPage - 1]) {
      thumbnailRefs.current[currentPage - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentPage]);

  return (
    <TooltipProvider>
      <ScrollArea className="h-full">
        <div ref={listRef} className="flex flex-col gap-4 p-2">
          {thumbnails.map((thumbnail, i) => (
            <div key={i} ref={el => thumbnailRefs.current[i] = el} className="flex flex-col gap-1 items-center" data-id={i}>
              <Button
                variant="outline"
                className={cn(
                  "w-full flex flex-col items-center h-auto p-1",
                  currentPage === i + 1 && "border-2 border-primary"
                )}
                onClick={() => onPageClick(i + 1)}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={`Page ${i + 1}`}
                    className="w-full object-contain"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    Loading...
                  </div>
                )}
                 <p className="text-xs mt-1">{i + 1}</p>
              </Button>

              <div className="flex gap-1 text-xs">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <FilePlus2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>插入頁面</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onAddBlankPage(i + 1)}>
                      <File className="mr-2 h-4 w-4" />
                      <span>插入空白頁</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPrepareInsertPdf('after', i)}>
                      <FilePlus className="mr-2 h-4 w-4" />
                      <span>插入PDF</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onRotatePage(i)}>
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>旋轉</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDeletePage(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>刪除</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
};

export default PageThumbnailList;
