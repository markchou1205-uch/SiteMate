
"use client";

import React, { useEffect, useState, useRef } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileUp, File as FileIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  pdfFile: File | null;
  currentPage: number;
  onPageClick: (pageNum: number) => void;
  totalPages: number;
  rotations: { [key: number]: number };
  onInsertPdf: (file: File, index: number) => void;
  onInsertBlankPage: (index: number) => void;
}

interface InsertionPointProps {
  index: number;
  onInsertPdf: (file: File, index: number) => void;
  onInsertBlankPage: (index: number) => void;
}

const InsertionPoint: React.FC<InsertionPointProps> = ({ index, onInsertPdf, onInsertBlankPage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onInsertPdf(file, index);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <div className="flex justify-center items-center my-1 group/insertion">
      <div className="w-full h-px bg-border group-hover/insertion:bg-primary transition-colors" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full -mx-3 z-10 bg-card group-hover/insertion:bg-primary group-hover/insertion:text-primary-foreground">
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">Insert page at index {index}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            <FileUp className="mr-2 h-4 w-4" />
            <span>插入 PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onInsertBlankPage(index)}>
            <FileIcon className="mr-2 h-4 w-4" />
            <span>插入空白頁</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="w-full h-px bg-border group-hover/insertion:bg-primary transition-colors" />
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  pdfFile,
  currentPage,
  onPageClick,
  totalPages,
  rotations,
  onInsertPdf,
  onInsertBlankPage
}) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!pdfFile) {
        setThumbnails([]);
        return;
    };
    
    setIsLoading(true);
    thumbnailRefs.current = [];

    const reader = new FileReader();
    reader.onload = async () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const thumbs: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const rotation = rotations[i] || 0;
        
        const originalViewport = page.getViewport({ scale: 1, rotation });
        const fixedWidth = 150;
        const viewport = page.getViewport({ scale: fixedWidth / originalViewport.width, rotation });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push(canvas.toDataURL());
      }

      setThumbnails(thumbs);
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile, rotations]);

  useEffect(() => {
    if (thumbnailRefs.current[currentPage - 1]) {
      thumbnailRefs.current[currentPage - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentPage]);

  return (
    <div className="h-full flex flex-col">
       <CardHeader>
        <CardTitle>文件預覽</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : thumbnails.length > 0 ? (
            <div className="space-y-2">
              <InsertionPoint index={0} onInsertPdf={onInsertPdf} onInsertBlankPage={onInsertBlankPage} />
              {thumbnails.map((src, index) => (
                <React.Fragment key={index}>
                  <div
                    ref={(el) => (thumbnailRefs.current[index] = el)}
                    className={`border-2 rounded-lg cursor-pointer transition-all overflow-hidden shadow-sm ${
                      currentPage === index + 1 ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => onPageClick(index + 1)}
                  >
                    <img src={src} alt={`Page ${index + 1}`} className="w-full block" />
                    <div className="text-center text-sm py-1 bg-muted/50 text-muted-foreground">p. {index + 1}</div>
                  </div>
                  <InsertionPoint index={index + 1} onInsertPdf={onInsertPdf} onInsertBlankPage={onInsertBlankPage} />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground mt-4 text-sm">
              請從主面板上傳檔案
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
