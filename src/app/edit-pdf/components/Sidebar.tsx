
"use client";

import React, { useEffect, useState } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  pdfFile: File | null;
  currentPage: number;
  onPageClick: (pageNum: number) => void;
  totalPages: number;
  rotations: { [key: number]: number };
}

const Sidebar: React.FC<SidebarProps> = ({ pdfFile, currentPage, onPageClick, totalPages, rotations }) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!pdfFile) {
        setThumbnails([]);
        return;
    };
    
    setIsLoading(true);

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
        const viewport = page.getViewport({ scale: 1.0, rotation });

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
            <div className="space-y-4">
              {thumbnails.map((src, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg cursor-pointer transition-all overflow-hidden shadow-sm ${
                    currentPage === index + 1 ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => onPageClick(index + 1)}
                >
                  <img src={src} alt={`Page ${index + 1}`} className="w-full block" />
                  <div className="text-center text-sm py-1 bg-muted/50 text-muted-foreground">p. {index + 1}</div>
                </div>
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
