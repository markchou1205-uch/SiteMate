
"use client";

import React, { useEffect, useRef } from "react";
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

    // Handle tool changes
    useEffect(() => {
        const fCanvas = fabricInstanceRef.current;
        if (!fCanvas) return;

        const getFabric = () => import('fabric').then(m => m.fabric);
        
        let cleanupFunc = () => {};

        const setupTool = async () => {
            fCanvas.off('mouse:down');
            fCanvas.off('mouse:move');
            fCanvas.off('mouse:up');

            if (activeTool === 'select') {
                fCanvas.defaultCursor = 'default';
                fCanvas.selection = true;
            } else if (activeTool === 'text') {
                const fabric = await getFabric();
                fCanvas.defaultCursor = 'crosshair';
                fCanvas.selection = false;
                
                let isDrawing = false;
                let startPos: {x: number, y: number} | null = null;
                let rect: fabric.Rect | null = null;

                const onMouseDown = (o: fabric.IEvent) => {
                    if (!o.pointer) return;
                    isDrawing = true;
                    startPos = { x: o.pointer.x, y: o.pointer.y };
                    rect = new fabric.Rect({
                        left: startPos.x, top: startPos.y, width: 0, height: 0,
                        stroke: 'blue', strokeDashArray: [5, 5], fill: 'transparent',
                    });
                    fCanvas.add(rect);
                };

                const onMouseMove = (o: fabric.IEvent) => {
                    if (!isDrawing || !startPos || !o.pointer || !rect) return;
                    rect.set({ width: o.pointer.x - startPos.x, height: o.pointer.y - startPos.y });
                    fCanvas.renderAll();
                };

                const onMouseUp = (o: fabric.IEvent) => {
                    if (!isDrawing || !startPos || !o.pointer || !rect) return;
                    isDrawing = false;
                    const endPos = o.pointer;
                    fCanvas.remove(rect);
                    
                    const text = new fabric.IText('輸入文字...', {
                        left: Math.min(startPos.x, endPos.x), top: Math.min(startPos.y, endPos.y),
                        width: Math.abs(startPos.x - endPos.x), fontSize: 20, fill: '#000000',
                    });
                    
                    fCanvas.add(text);
                    fCanvas.setActiveObject(text);
                    text.enterEditing();
                    fCanvas.defaultCursor = 'default';
                    setActiveTool('select');
                };

                fCanvas.on('mouse:down', onMouseDown);
                fCanvas.on('mouse:move', onMouseMove);
                fCanvas.on('mouse:up', onMouseUp);

                cleanupFunc = () => {
                    fCanvas.off('mouse:down', onMouseDown);
                    fCanvas.off('mouse:move', onMouseMove);
                    fCanvas.off('mouse:up', onMouseUp);
                };
            }
        };

        setupTool();
        return cleanupFunc;
        
    }, [activeTool, setActiveTool]);


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
