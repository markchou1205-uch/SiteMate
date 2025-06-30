
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { cn } from "@/lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfCanvasProps {
  pdfFile: File | null;
  onTotalPages: (total: number) => void;
  onCurrentPageChange: (page: number) => void;
  zoom: number;
  rotations: { [key: number]: number };
  scrollToPage: number | null;
  onScrollComplete: () => void;
  className?: string;
}

const PdfCanvas: React.FC<PdfCanvasProps> = ({
  pdfFile,
  onTotalPages,
  onCurrentPageChange,
  zoom,
  rotations,
  scrollToPage,
  onScrollComplete,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState<pdfjsLib.PDFPageProxy[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load PDF document and pages
  useEffect(() => {
    if (!pdfFile) {
      setPages([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      try {
        const doc = await pdfjsLib.getDocument({ data }).promise;
        onTotalPages(doc.numPages);
        const pagePromises = Array.from({ length: doc.numPages }, (_, i) => doc.getPage(i + 1));
        const loadedPages = await Promise.all(pagePromises);
        setPages(loadedPages);
      } catch (error) {
        console.error("Error loading PDF document:", error);
      }
    };
    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile, onTotalPages]);

  // Setup Intersection Observer
  useEffect(() => {
    if (!containerRef.current || pages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
            // Find the top-most visible entry
            visibleEntries.sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
            const topMostVisible = visibleEntries[0];
            const pageNum = Number((topMostVisible.target as HTMLElement).dataset.pageNumber);
            if (pageNum) {
                onCurrentPageChange(pageNum);
            }
        }
      },
      { root: containerRef.current, rootMargin: "-50% 0px -50% 0px", threshold: 0.1 }
    );

    const currentRefs = pageRefs.current;
    currentRefs.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentRefs.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [pages, onCurrentPageChange]);


  // Scroll to a specific page
  useEffect(() => {
    if (scrollToPage && pageRefs.current[scrollToPage - 1]) {
      pageRefs.current[scrollToPage - 1]?.scrollIntoView({ behavior: "auto", block: "start" });
      onScrollComplete();
    }
  }, [scrollToPage, onScrollComplete]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full flex flex-col items-center overflow-auto bg-muted p-4", className)}
    >
      {pages.map((page, index) => (
        <PageRenderer
          key={page.pageNumber}
          page={page}
          zoom={zoom}
          rotation={rotations[index + 1] || 0}
          ref={(el: HTMLDivElement | null) => (pageRefs.current[index] = el)}
        />
      ))}
    </div>
  );
};

interface PageRendererProps {
  page: pdfjsLib.PDFPageProxy;
  zoom: number;
  rotation: number;
}

const PageRenderer = React.forwardRef<HTMLDivElement, PageRendererProps>(({ page, zoom, rotation }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let renderTask: pdfjsLib.RenderTask | null = null;
        
        const render = async () => {
            if (!canvasRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            
            const viewport = page.getViewport({ scale: zoom, rotation });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            renderTask = page.render({ canvasContext: ctx, viewport });
            try {
                await renderTask.promise;
            } catch (error: any) {
                if (error.name !== 'RenderingCancelled') {
                    console.error("Page render error:", error);
                }
            }
        };
        
        render();

        return () => {
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [page, zoom, rotation]);

    return (
        <div ref={ref} data-page-number={page.pageNumber} className="relative mb-4 bg-background shadow-md">
            <canvas ref={canvasRef} />
        </div>
    );
});
PageRenderer.displayName = 'PageRenderer';

export default PdfCanvas;
