
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { fabric } from "fabric";
import { v4 as uuidv4 } from 'uuid';
import type { Tool } from "./Toolbar";

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
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fabricCanvasRefs = useRef<fabric.Canvas[]>([]);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const textDrawing = useRef<{
    isDrawing: boolean;
    startX: number;
    startY: number;
    rect: fabric.Rect | null;
  }>({ isDrawing: false, startX: 0, startY: 0, rect: null });

  // Load PDF document
  useEffect(() => {
    if (!pdfFile) {
      fabricCanvasRefs.current.forEach(canvas => canvas.dispose());
      fabricCanvasRefs.current = [];
      pageRefs.current = [];
      if (containerRef.current) containerRef.current.innerHTML = "";
      setPdfDoc(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      try {
        const doc = await pdfjsLib.getDocument({ data }).promise;
        setPdfDoc(doc);
        onTotalPages(doc.numPages);
      } catch (error) {
        console.error("Error loading PDF document:", error);
      }
    };
    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile, onTotalPages]);
  
  const addFabricEventListeners = useCallback((canvas: fabric.Canvas) => {
    canvas.on('mouse:down', (o) => {
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

    // This bypasses fabric's event system for the wheel event and attaches a native listener.
    // This prevents fabric from blocking the scroll event that the parent container needs.
    const wheelHandler = (e: WheelEvent) => {
        if (containerRef.current) {
            containerRef.current.scrollTop += e.deltaY;
            // Prevent the default browser action (like page zoom or navigating back/forward)
            e.preventDefault();
        }
    };
    
    if (canvas.upperCanvasEl) {
        // We use { passive: false } to signal that we might call preventDefault().
        canvas.upperCanvasEl.addEventListener('wheel', wheelHandler, { passive: false });
    }

  }, [toolMode, color, setActiveObject, setIsTextEditing]);

  // Render all pages and set up observers
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topVisiblePage = visibleEntries[0];
          const pageNum = Number((topVisiblePage.target as HTMLElement).dataset.pageNumber);
          if (pageNum) onCurrentPageChange(pageNum);
        }
      },
      { root: containerRef.current, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    
    // Cleanup old canvases
    fabricCanvasRefs.current.forEach(canvas => canvas.dispose());
    fabricCanvasRefs.current = [];
    pageRefs.current = [];
    if(containerRef.current) containerRef.current.innerHTML = "";

    const renderAllPages = async () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth - 32;

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const rotation = rotations[pageNum] || 0;
        
        const unrotatedViewport = page.getViewport({ scale: 1 });
        const scaleToFit = availableWidth / unrotatedViewport.width;
        const viewport = page.getViewport({ scale: scaleToFit * zoom, rotation });
        
        const pageContainer = document.createElement("div");
        pageContainer.className = "relative mb-4 bg-background shadow-md";
        pageContainer.dataset.pageNumber = String(pageNum);

        const pdfCanvasEl = document.createElement("canvas");
        const fabricCanvasEl = document.createElement("canvas");
        fabricCanvasEl.className = "absolute top-0 left-0";
        
        pageContainer.append(pdfCanvasEl, fabricCanvasEl);
        containerRef.current.appendChild(pageContainer);
        
        pdfCanvasEl.width = viewport.width;
        pdfCanvasEl.height = viewport.height;
        fabricCanvasEl.width = viewport.width;
        fabricCanvasEl.height = viewport.height;
        
        const pdfCtx = pdfCanvasEl.getContext("2d");
        if (pdfCtx) {
            await page.render({ canvasContext: pdfCtx, viewport }).promise;
        }

        const fabricCanvas = new fabric.Canvas(fabricCanvasEl);
        
        fabricCanvasRefs.current[pageNum-1] = fabricCanvas;
        pageRefs.current[pageNum-1] = pageContainer;

        addFabricEventListeners(fabricCanvas);
        intersectionObserver.observe(pageContainer);
      }
    };
    renderAllPages();

    return () => {
      intersectionObserver.disconnect();
    };
  }, [pdfDoc, zoom, rotations, onCurrentPageChange, addFabricEventListeners]);

  // Update canvas properties when tool mode or color changes
  useEffect(() => {
    fabricCanvasRefs.current.forEach(canvas => {
      if (!canvas) return;
      canvas.selection = toolMode === 'select';
      canvas.isDrawingMode = toolMode === 'draw';
      
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = 5;
      }
      canvas.setCursor(toolMode === 'text' ? 'crosshair' : 'default');
      const upperCanvas = canvas.upperCanvasEl;
      if (upperCanvas) {
        upperCanvas.style.cursor = ""; // Reset fabric's inline cursor style
      }
    });
  }, [toolMode, color]);

  // Scroll to a specific page
  useEffect(() => {
    if (scrollToPage && pageRefs.current[scrollToPage - 1]) {
      pageRefs.current[scrollToPage - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
      onScrollComplete();
    }
  }, [scrollToPage, onScrollComplete]);

  // Panning logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (toolMode === 'move') {
      container.style.cursor = 'grab';
    } else {
      container.style.cursor = 'default';
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (toolMode !== 'move' || !containerRef.current) return;
      // Pan only when clicking on the container background, not the canvas
      if ((e.target as HTMLElement).closest('.relative.mb-4')) return;
      isPanning.current = true;
      containerRef.current.style.cursor = 'grabbing';
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop,
      };
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning.current || !containerRef.current) return;
      e.preventDefault();
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      containerRef.current.scrollTop = panStart.current.scrollTop - dy;
      containerRef.current.scrollLeft = panStart.current.scrollLeft - dx;
    };

    const handleMouseUp = () => {
      if (!isPanning.current || !containerRef.current) return;
      isPanning.current = false;
      if (toolMode === 'move') containerRef.current.style.cursor = 'grab';
    };
    
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);

    return () => {
      if (container) {
          container.removeEventListener('mousedown', handleMouseDown);
          container.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [toolMode]);

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
  }, [zoom]);


  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center overflow-auto bg-muted p-4"
    />
  );
};

export default PdfCanvas;
