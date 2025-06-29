// components/PageThumbnailList.tsx

import React, { useEffect, useState } from "react";
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
  numPages: number;
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
}

const PageThumbnailList: React.FC<PageThumbnailListProps> = ({
  numPages,
  currentPage,
  onSelectPage,
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    const generateThumbnails = async () => {
      const fileInput = document.getElementById(
        "pdf-upload"
      ) as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        const pdfjsLib = await import("pdfjs-dist");
        const workerSrc = await import("pdfjs-dist/build/pdf.worker.entry");
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default;

        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

        const thumbs: string[] = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          thumbs.push(canvas.toDataURL());
        }
        setThumbnails(thumbs);
      };
      reader.readAsArrayBuffer(file);
    };
    generateThumbnails();
  }, [numPages]);

  return (
    <TooltipProvider>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-4 p-2">
          {Array.from({ length: numPages }, (_, i) => (
            <div key={i + 1} className="flex flex-col gap-1 items-center">
              <Button
                key={i + 1}
                variant="outline"
                className={cn(
                  "w-full flex flex-col items-center h-auto p-1",
                  currentPage === i + 1 && "border-2 border-primary"
                )}
                onClick={() => onSelectPage(i + 1)}
              >
                {thumbnails[i] ? (
                  <img
                    src={thumbnails[i]}
                    alt={`Page ${i + 1}`}
                    className="w-full object-contain"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    產生中...
                  </div>
                )}
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
                    <DropdownMenuItem>
                      <File className="mr-2 h-4 w-4" />
                      <span>插入空白頁</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FilePlus className="mr-2 h-4 w-4" />
                      <span>插入PDF</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
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
