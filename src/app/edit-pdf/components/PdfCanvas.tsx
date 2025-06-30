
"use client";

import React, { useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import type { fabric } from 'fabric'; // Use type import to avoid server-side execution
import { cn } from "@/lib/utils";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type ActiveTool = 'select' | 'text';

interface PdfCanvasProps {
  pdfFile: File | null;
  onTotalPages: (total: number) => void;
  onCurrentPageChange: (page: number) => void;
  zoom: number;
  rotations: { [key: number]: number };
  scrollToPage: number | null;
  onScrollComplete: () => void;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  onObjectSelected: (object: fabric.Object | null) => void;
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
  activeTool,
  setActiveTool,
  onObjectSelected,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = React.useState<pdfjsLib.PDFPageProxy[]>([]);
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
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onObjectSelected={onObjectSelected}
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
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  onObjectSelected: (object: fabric.Object | null) => void;
}

const PageRenderer = React.forwardRef<HTMLDivElement, PageRendererProps>(({ page, zoom, rotation, activeTool, setActiveTool, onObjectSelected }, ref) => {
    const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<HTMLCanvasElement>(null);
    const fabricInstanceRef = useRef<fabric.Canvas | null>(null);

    // Refs for text drawing state
    const isDrawingRef = useRef(false);
    const startPosRef = useRef<{x: number, y: number} | null>(null);
    const rectRef = useRef<fabric.Rect | null>(null);

    // Render PDF background and initialize Fabric canvas
    useEffect(() => {
        let renderTask: pdfjsLib.RenderTask | null = null;
        let fCanvas: fabric.Canvas | null = null;

        const renderAndInit = async () => {
            const { fabric } = await import('fabric');
            
            if (!pdfCanvasRef.current || !fabricCanvasRef.current) return;
            
            const pdfCanvas = pdfCanvasRef.current;
            const ctx = pdfCanvas.getContext("2d");
            if (!ctx) return;
            
            const viewport = page.getViewport({ scale: zoom, rotation });
            pdfCanvas.width = viewport.width;
            pdfCanvas.height = viewport.height;
            
            if (fabricInstanceRef.current) {
                fabricInstanceRef.current.dispose();
            }

            fCanvas = new fabric.Canvas(fabricCanvasRef.current, {
                width: viewport.width,
                height: viewport.height,
            });
            fabricInstanceRef.current = fCanvas;
            
            const handleSelection = (e: fabric.IEvent) => onObjectSelected(e.target || null);
            const handleSelectionCleared = () => onObjectSelected(null);
            const handleDoubleClick = (e: fabric.IEvent) => {
                if (e.target && e.target.type === 'i-text') {
                    (e.target as fabric.IText).enterEditing();
                }
            };
            fCanvas.on('selection:created', handleSelection);
            fCanvas.on('selection:updated', handleSelection);
            fCanvas.on('selection:cleared', handleSelectionCleared);
            fCanvas.on('mouse:dblclick', handleDoubleClick);

            renderTask = page.render({ canvasContext: ctx, viewport });
            await renderTask.promise.catch(err => {
                if (err.name !== 'RenderingCancelled') console.error("Page render error:", err);
            });
        };
        
        renderAndInit();

        return () => {
            renderTask?.cancel();
            if (fabricInstanceRef.current) {
                fabricInstanceRef.current.dispose();
                fabricInstanceRef.current = null;
            }
        };
    }, [page, zoom, rotation, onObjectSelected]);


    // --- STABLE MOUSE HANDLERS for text drawing ---
    const handleTextMouseDown = useCallback(async (o: fabric.IEvent) => {
        const fCanvas = fabricInstanceRef.current;
        if (!fCanvas || !o.pointer) return;

        isDrawingRef.current = true;
        startPosRef.current = { x: o.pointer.x, y: o.pointer.y };
        
        const { fabric } = await import('fabric');
        const rect = new fabric.Rect({
            left: startPosRef.current.x,
            top: startPosRef.current.y,
            width: 0,
            height: 0,
            stroke: 'blue',
            strokeDashArray: [5, 5],
            fill: 'transparent',
            selectable: false,
            evented: false,
        });
        rectRef.current = rect;
        fCanvas.add(rect);
    }, []);

    const handleTextMouseMove = useCallback((o: fabric.IEvent) => {
        const fCanvas = fabricInstanceRef.current;
        if (!isDrawingRef.current || !startPosRef.current || !o.pointer || !rectRef.current || !fCanvas) return;
        
        rectRef.current.set({ 
            width: o.pointer.x - startPosRef.current.x, 
            height: o.pointer.y - startPosRef.current.y 
        });
        fCanvas.renderAll();
    }, []);

    const handleTextMouseUp = useCallback(async (o: fabric.IEvent) => {
        const fCanvas = fabricInstanceRef.current;
        if (!isDrawingRef.current || !startPosRef.current || !o.pointer || !fCanvas) return;

        isDrawingRef.current = false;
        
        if (rectRef.current) {
            fCanvas.remove(rectRef.current);
            rectRef.current = null;
        }
        
        const endPos = o.pointer;
        const width = Math.abs(startPosRef.current.x - endPos.x);

        if (width < 5) {
            startPosRef.current = null;
            setActiveTool('select');
            return;
        }
        
        const { fabric } = await import('fabric');
        const text = new fabric.IText('輸入文字...', {
            left: Math.min(startPosRef.current.x, endPos.x),
            top: Math.min(startPosRef.current.y, endPos.y),
            width: width,
            fontSize: 20,
            fill: '#000000',
        });
        
        fCanvas.add(text);
        fCanvas.setActiveObject(text);
        text.enterEditing();
        
        startPosRef.current = null;
        setActiveTool('select');
    }, [setActiveTool]);


    // Handle tool changes
    useEffect(() => {
        const fCanvas = fabricInstanceRef.current;
        if (!fCanvas) return;

        // Turn off all drawing listeners first to prevent duplicates
        fCanvas.off('mouse:down', handleTextMouseDown);
        fCanvas.off('mouse:move', handleTextMouseMove);
        fCanvas.off('mouse:up', handleTextMouseUp);

        if (activeTool === 'text') {
            fCanvas.defaultCursor = 'crosshair';
            fCanvas.selection = false;
            fCanvas.on('mouse:down', handleTextMouseDown);
            fCanvas.on('mouse:move', handleTextMouseMove);
            fCanvas.on('mouse:up', handleTextMouseUp);
        } else { // 'select' mode
            fCanvas.defaultCursor = 'default';
            fCanvas.selection = true;
        }
        
        return () => {
            if (fCanvas) {
                fCanvas.off('mouse:down', handleTextMouseDown);
                fCanvas.off('mouse:move', handleTextMouseMove);
                fCanvas.off('mouse:up', handleTextMouseUp);
            }
        };
    }, [activeTool, handleTextMouseDown, handleTextMouseMove, handleTextMouseUp]);


    return (
        <div ref={ref} data-page-number={page.pageNumber} className="relative mb-4 bg-background shadow-md">
            <canvas ref={pdfCanvasRef} />
            <div className="absolute top-0 left-0 w-full h-full">
                <canvas ref={fabricCanvasRef} />
            </div>
        </div>
    );
});
PageRenderer.displayName = 'PageRenderer';

export default PdfCanvas;
