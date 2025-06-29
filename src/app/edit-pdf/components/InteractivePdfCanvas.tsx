
"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from 'fabric';
import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type DrawingTool = 'circle' | 'rect' | 'triangle' | 'freedraw' | null;

interface InteractivePdfCanvasProps {
  pdfDoc: any;
  docVersion: number;
  scale: number;
  setPdfLoaded: (loaded: boolean) => void;
  setNumPages: (num: number) => void;
  fabricObjects: string[];
  onUpdateFabricObject: (index: number, canvas: fabric.Canvas) => void;
  setFabricCanvases: (canvases: (fabric.Canvas | null)[]) => void;
  drawingTool: DrawingTool;
  setDrawingTool: (tool: DrawingTool) => void;
  onShapeDoubleClick: (shape: fabric.Object) => void;
}

export default function InteractivePdfCanvas({
  pdfDoc,
  docVersion,
  scale,
  setPdfLoaded,
  setNumPages,
  fabricObjects,
  onUpdateFabricObject,
  setFabricCanvases,
  drawingTool,
  setDrawingTool,
  onShapeDoubleClick,
}: InteractivePdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localCanvases, setLocalCanvases] = useState<(fabric.Canvas | null)[]>([]);
  
  const drawingState = useRef<{
    isDrawing: boolean;
    origX: number;
    origY: number;
    shape: fabric.Object | null;
    canvasIndex: number | null;
  }>({
    isDrawing: false,
    origX: 0,
    origY: 0,
    shape: null,
    canvasIndex: null,
  });

  useEffect(() => {
    let canvasesToSet: (fabric.Canvas | null)[] = [];

    const renderPdf = async () => {
      setPdfLoaded(false);
      if (!pdfDoc) return;
      
      const pdfBytes = await pdfDoc.save();
      const typedarray = new Uint8Array(pdfBytes);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      setNumPages(pdf.numPages);

      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = ""; 

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const pageWrapper = document.createElement("div");
        pageWrapper.id = `pdf-page-${pageNum}`;
        pageWrapper.className = "mb-4 mx-auto shadow-lg relative";
        pageWrapper.style.width = `${viewport.width}px`;
        pageWrapper.style.height = `${viewport.height}px`;

        const pdfCanvasEl = document.createElement("canvas");
        const fabricCanvasEl = document.createElement("canvas");
        
        pdfCanvasEl.width = viewport.width;
        pdfCanvasEl.height = viewport.height;
        fabricCanvasEl.id = `fabric-canvas-${pageNum}`;
        
        pageWrapper.appendChild(pdfCanvasEl);
        pageWrapper.appendChild(fabricCanvasEl);
        container.appendChild(pageWrapper);
        
        const context = pdfCanvasEl.getContext("2d");
        await page.render({ canvasContext: context!, viewport }).promise;

        const fabricCanvas = new fabric.Canvas(fabricCanvasEl, {
            width: viewport.width,
            height: viewport.height,
        });

        fabricCanvas.loadFromJSON(fabricObjects[pageNum - 1] || '{}', () => {
            fabricCanvas.renderAll();
        });
        
        fabricCanvas.on('object:modified', () => onUpdateFabricObject(pageNum - 1, fabricCanvas));
        fabricCanvas.on('object:added', () => onUpdateFabricObject(pageNum - 1, fabricCanvas));
        fabricCanvas.on('mouse:dblclick', (options) => {
            if (options.target) {
                onShapeDoubleClick(options.target);
            }
        });
        
        canvasesToSet[pageNum - 1] = fabricCanvas;
      }
      
      setLocalCanvases(canvasesToSet);
      setFabricCanvases(canvasesToSet);
      setPdfLoaded(true);
    };

    renderPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, docVersion, scale]);

  useEffect(() => {
    const handleMouseDown = (o: fabric.IEvent, canvasIndex: number) => {
        const canvas = localCanvases[canvasIndex];
        if (!canvas || !drawingTool || drawingTool === 'freedraw') return;
        
        drawingState.current.isDrawing = true;
        drawingState.current.canvasIndex = canvasIndex;
        const pointer = canvas.getPointer(o.e);
        drawingState.current.origX = pointer.x;
        drawingState.current.origY = pointer.y;

        let shape: fabric.Object;
        const commonProps = {
            left: pointer.x,
            top: pointer.y,
            originX: 'left' as 'left',
            originY: 'top' as 'top',
            width: 0,
            height: 0,
            angle: 0,
            fill: 'transparent',
            stroke: 'black',
            strokeWidth: 2,
            selectable: false,
            evented: false,
        };

        switch (drawingTool) {
            case 'rect':
                shape = new fabric.Rect(commonProps);
                break;
            case 'circle':
                shape = new fabric.Circle({ ...commonProps, radius: 0 });
                break;
            case 'triangle':
                shape = new fabric.Triangle(commonProps);
                break;
            default: return;
        }
        
        drawingState.current.shape = shape;
        canvas.add(shape);
    };

    const handleMouseMove = (o: fabric.IEvent) => {
        if (!drawingState.current.isDrawing || !drawingState.current.shape) return;

        const canvasIndex = drawingState.current.canvasIndex;
        if (canvasIndex === null) return;
        
        const canvas = localCanvases[canvasIndex];
        if (!canvas) return;

        const pointer = canvas.getPointer(o.e);
        const { origX, origY, shape } = drawingState.current;
        
        let newLeft = Math.min(pointer.x, origX);
        let newTop = Math.min(pointer.y, origY);
        let newWidth = Math.abs(origX - pointer.x);
        let newHeight = Math.abs(origY - pointer.y);

        if (shape.type === 'circle') {
            const radius = Math.max(newWidth, newHeight) / 2;
            shape.set({
                left: newLeft + newWidth / 2,
                top: newTop + newHeight / 2,
                radius: radius,
                originX: 'center',
                originY: 'center',
            });
        } else {
            shape.set({
                left: newLeft,
                top: newTop,
                width: newWidth,
                height: newHeight,
            });
        }
        
        canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
        if (!drawingState.current.isDrawing || !drawingState.current.shape) return;

        const canvasIndex = drawingState.current.canvasIndex;
        if (canvasIndex === null) return;

        const canvas = localCanvases[canvasIndex];
        if (!canvas) return;

        const { shape } = drawingState.current;
        shape.setCoords();

        const minSize = 5;
        const width = shape.getScaledWidth();
        const height = shape.getScaledHeight();

        if (width < minSize && height < minSize) {
            canvas.remove(shape);
        } else {
            shape.set({ selectable: true, evented: true });
            onUpdateFabricObject(canvasIndex, canvas);
        }
        
        drawingState.current = { isDrawing: false, origX: 0, origY: 0, shape: null, canvasIndex: null };
        canvas.requestRenderAll();
        setDrawingTool(null);
    };
    
    localCanvases.forEach((canvas, index) => {
        if (!canvas) return;

        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
        
        const isDrawingActive = drawingTool !== null;
        
        canvas.isDrawingMode = (drawingTool === 'freedraw');
        if (canvas.isDrawingMode) {
            canvas.freeDrawingBrush.width = 2;
            canvas.freeDrawingBrush.color = 'black';
        }
        
        canvas.selection = !isDrawingActive;
        canvas.defaultCursor = isDrawingActive ? 'crosshair' : 'default';
        canvas.forEachObject(obj => {
            obj.selectable = !isDrawingActive;
            obj.evented = !isDrawingActive;
        });

        if (isDrawingActive && drawingTool !== 'freedraw') {
            canvas.on('mouse:down', (o) => handleMouseDown(o, index));
            canvas.on('mouse:move', handleMouseMove);
            canvas.on('mouse:up', handleMouseUp);
        }
        canvas.requestRenderAll();
    });

    return () => {
        localCanvases.forEach(canvas => {
            if (canvas) {
                canvas.off('mouse:down');
                canvas.off('mouse:move');
                canvas.off('mouse:up');
            }
        });
    };
  }, [drawingTool, localCanvases, onUpdateFabricObject, setDrawingTool]);

  return (
    <div className="relative w-full h-full p-4">
      <div ref={containerRef} className="flex flex-col items-center" />
    </div>
  );
}
