
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { fabric } from "fabric";
import { v4 as uuidv4 } from 'uuid';
import type { Tool } from "./Toolbar";
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
  toolMode: Tool;
  color: string;
  activeObject: fabric.Object | null;
  setActiveObject: (obj: fabric.Object | null) => void;
  isTextEditing: boolean;
  setIsTextEditing: (obj: fabric.Object) => void;
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
  toolMode,
  color,
  setActiveObject,
  setIsTextEditing,
  className
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<pdfjsLib.PDFPageProxy[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const textDrawing = useRef<{
    isDrawing: boolean;
    startX: number;
    startY: number;
    rect: fabric.Rect | null;
  }>({ isDrawing: false, startX: 0, startY: 0, rect: null });

  // Load PDF document and pages
  useEffect(() => {
    if (!pdfFile) {
      setPdfDoc(null);
      setPages([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      try {
        const doc = await pdfjsLib.getDocument({ data }).promise;
        setPdfDoc(doc);
        onTotalPages(doc.numPages);
        const pagePromises = [];
        for (let i = 1; i <= doc.numPages; i++) {
          pagePromises.push(doc.getPage(i));
        }
        const loadedPages = await Promise.all(pagePromises);
        setPages(loadedPages);
      } catch (error) {
        console.error("Error loading PDF document:", error);
      }
    };
    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile, onTotalPages]);

  const addFabricEventListeners = useCallback((canvas: fabric.Canvas) => {
    let isPanning = false;
    let lastPosX: number;
    let lastPosY: number;

    canvas.on('mouse:down', (o) => {
        if (toolMode === 'move') {
            isPanning = true;
            canvas.selection = false;
            lastPosX = o.e.clientX;
            lastPosY = o.e.clientY;
            if (canvas.upperCanvasEl) canvas.upperCanvasEl.style.cursor = 'grabbing';
            o.e.preventDefault();
            return;
        }

        if (toolMode !== 'text' || !o.pointer) return;
        textDrawing.current.isDrawing = true;
        textDrawing.current.startX = o.pointer.x;
        textDrawing.current.startY = o.pointer.y;

        textDrawing.current.rect = new fabric.Rect({
            left: o.pointer.x,
            top: o.pointer.y,
            width: 0,
            height: 0,
            stroke: 'rgba(100, 200, 200, 0.5)',
            strokeWidth: 1,
            fill: 'rgba(100, 200, 200, 0.1)',
            selectable: false,
        });
        canvas.add(textDrawing.current.rect);
    });

    canvas.on('mouse:move', (o) => {
        if (isPanning && toolMode === 'move') {
            if (containerRef.current) {
                containerRef.current.scrollLeft -= (o.e.clientX - lastPosX);
                containerRef.current.scrollTop -= (o.e.clientY - lastPosY);
            }
            lastPosX = o.e.clientX;
            lastPosY = o.e.clientY;
            o.e.preventDefault();
            return;
        }
        
        if (!textDrawing.current.isDrawing || !o.pointer || !textDrawing.current.rect) return;
        const { startX, startY } = textDrawing.current;
        let left = startX;
        let top = startY;
        let width = o.pointer.x - startX;
        let height = o.pointer.y - startY;

        if (width < 0) { left = o.pointer.x; width = -width; }
        if (height < 0) { top = o.pointer.y; height = -height; }
        
        textDrawing.current.rect.set({ left, top, width, height });
        canvas.requestRenderAll();
    });

    canvas.on('mouse:up', (o) => {
        if (isPanning && toolMode === 'move') {
            isPanning = false;
            canvas.selection = true;
            if (canvas.upperCanvasEl) canvas.upperCanvasEl.style.cursor = 'grab';
            return;
        }

        if (!textDrawing.current.isDrawing || !o.pointer || !textDrawing.current.rect) return;
        const { left, top, width, height } = textDrawing.current.rect;
        
        canvas.remove(textDrawing.current.rect);
        textDrawing.current.isDrawing = false;
        textDrawing.current.rect = null;

        if (width > 5 && height > 5) {
            const newText = new fabric.IText('點擊編輯', {
                left: left,
                top: top,
                width: width,
                height: height,
                fill: color,
                fontSize: 20,
                fontFamily: 'Arial',
                name: `text_${uuidv4()}`
            });
            canvas.add(newText);
            canvas.setActiveObject(newText);
        }
        canvas.requestRenderAll();
    });

    canvas.on('selection:created', (e) => setActiveObject(e.selected ? e.selected[0] : null));
    canvas.on('selection:updated', (e) => setActiveObject(e.selected ? e.selected[0] : null));
    canvas.on('selection:cleared', () => setActiveObject(null));
    
    canvas.on('mouse:dblclick', (o) => {
        if (o.target && o.target.type === 'i-text') {
            setIsTextEditing(o.target);
            o.target.enterEditing();
        }
    });

  }, [toolMode, color, setActiveObject, setIsTextEditing]);

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
      { root: containerRef.current, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    pageRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      pageRefs.current.forEach(ref => {
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
  }, [scrollToPage, onScrollComplete, pages]);

  // Center canvas on zoom
  useEffect(() => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const contentWidth = containerRef.current.scrollWidth;
      if (contentWidth > containerWidth) {
          containerRef.current.scrollLeft = (contentWidth - containerWidth) / 2;
      } else {
          containerRef.current.scrollLeft = 0;
      }
  }, [zoom, pages]);


  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full flex flex-col items-center overflow-auto bg-muted p-4", className)}
      style={{
        cursor: toolMode === 'move' ? 'grab' : (toolMode === 'text' ? 'crosshair' : 'default')
      }}
    >
      {pages.map((page, index) => (
        <PageRenderer
          key={page.pageNumber}
          page={page}
          zoom={zoom}
          rotation={rotations[index + 1] || 0}
          addFabricEventListeners={addFabricEventListeners}
          toolMode={toolMode}
          color={color}
          ref={(el: HTMLDivElement) => (pageRefs.current[index] = el)}
        />
      ))}
    </div>
  );
};

interface PageRendererProps {
  page: pdfjsLib.PDFPageProxy;
  zoom: number;
  rotation: number;
  addFabricEventListeners: (canvas: fabric.Canvas) => void;
  toolMode: Tool;
  color: string;
}

const PageRenderer = React.forwardRef<HTMLDivElement, PageRendererProps>(({ page, zoom, rotation, addFabricEventListeners, toolMode, color }, ref) => {
    const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasInstance = useRef<fabric.Canvas | null>(null);

    useEffect(() => {
        const render = async () => {
            const viewport = page.getViewport({ scale: zoom, rotation });
            const pdfCanvas = pdfCanvasRef.current;
            const fabricCanvasEl = fabricCanvasRef.current;

            if (!pdfCanvas || !fabricCanvasEl) return;

            pdfCanvas.width = viewport.width;
            pdfCanvas.height = viewport.height;
            fabricCanvasEl.width = viewport.width;
            fabricCanvasEl.height = viewport.height;

            const pdfCtx = pdfCanvas.getContext("2d");
            if (pdfCtx) {
                await page.render({ canvasContext: pdfCtx, viewport }).promise;
            }

            if (!fabricCanvasInstance.current) {
                const fc = new fabric.Canvas(fabricCanvasEl);
                addFabricEventListeners(fc);
                fabricCanvasInstance.current = fc;
            }
            
            const fabricCanvas = fabricCanvasInstance.current;
            fabricCanvas.isDrawingMode = toolMode === 'draw';
            if (fabricCanvas.freeDrawingBrush) {
              fabricCanvas.freeDrawingBrush.color = color;
              fabricCanvas.freeDrawingBrush.width = 5;
            }
        };
        render();

        return () => {
            if (fabricCanvasInstance.current) {
                fabricCanvasInstance.current.dispose();
                fabricCanvasInstance.current = null;
            }
        }
    }, [page, zoom, rotation, addFabricEventListeners, toolMode, color]);

    return (
        <div ref={ref} data-page-number={page.pageNumber} className="relative mb-4 bg-background shadow-md">
            <canvas ref={pdfCanvasRef} />
            <canvas ref={fabricCanvasRef} className="absolute top-0 left-0" />
        </div>
    );
});
PageRenderer.displayName = 'PageRenderer';

export default PdfCanvas;
