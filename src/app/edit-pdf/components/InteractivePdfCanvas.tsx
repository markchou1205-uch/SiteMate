
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
    let isMounted = true;

    const renderPdf = async () => {
      setPdfLoaded(false);
      if (!pdfDoc) return;
      
      const pdfBytes = await pdfDoc.save();
      const typedarray = new Uint8Array(pdfBytes);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      
      if (!isMounted) return;
      setNumPages(pdf.numPages);

      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = ""; 

      const newCanvases: (fabric.Canvas | null)[] = [];
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
        fabricCanvasEl.className = "absolute top-0 left-0";
        
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
        
        newCanvases[pageNum - 1] = fabricCanvas;
      }
      
      if (isMounted) {
        localCanvases.forEach(canvas => canvas?.dispose());
        setLocalCanvases(newCanvases);
        setFabricCanvases(newCanvases);
        setPdfLoaded(true);
      }
    };

    renderPdf();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, docVersion, scale]);

  useEffect(() => {
    const isDrawingActive = drawingTool !== null;

    const handleMouseDown = (o: fabric.IEvent) => {
      if (!drawingTool || drawingTool === 'freedraw') return;
      const canvas = o.target?.canvas;
      if (!canvas) return;

      drawingState.current.isDrawing = true;
      const pointer = canvas.getPointer(o.e);
      drawingState.current.origX = pointer.x;
      drawingState.current.origY = pointer.y;

      const canvasIndex = localCanvases.findIndex(c => c === canvas);
      if (canvasIndex === -1) return;
      drawingState.current.canvasIndex = canvasIndex;
      
      let shape: fabric.Object;
      const commonProps = {
          left: pointer.x,
          top: pointer.y,
          originX: 'left' as const,
          originY: 'top' as const,
          width: 0,
          height: 0,
          angle: 0,
          fill: 'transparent',
          stroke: 'black',
          strokeWidth: 2,
          selectable: true,
          evented: true,
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
      
      if (shape instanceof fabric.Circle) {
           const radius = Math.sqrt(Math.pow(pointer.x - origX, 2) + Math.pow(pointer.y - origY, 2)) / 2;
           shape.set({
              left: origX,
              top: origY,
              radius: radius,
              originX: 'center',
              originY: 'center'
          });
      } else {
          shape.set({
              left: Math.min(pointer.x, origX),
              top: Math.min(pointer.y, origY),
              width: Math.abs(origX - pointer.x),
              height: Math.abs(origY - pointer.y),
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
      canvas.off('path:created');
      
      canvas.isDrawingMode = (drawingTool === 'freedraw');
      canvas.selection = !isDrawingActive;
      canvas.defaultCursor = isDrawingActive ? 'crosshair' : 'default';
      canvas.skipTargetFind = isDrawingActive;

      canvas.forEachObject(obj => {
          obj.selectable = !isDrawingActive;
          obj.evented = !isDrawingActive;
      });

      if (drawingTool === 'freedraw') {
          canvas.freeDrawingBrush.width = 2;
          canvas.freeDrawingBrush.color = 'black';
          canvas.on('path:created', () => onUpdateFabricObject(index, canvas));
      } else if (isDrawingActive) {
          canvas.on('mouse:down', handleMouseDown);
          canvas.on('mouse:move', handleMouseMove);
          canvas.on('mouse:up', handleMouseUp);
      }
      
      canvas.requestRenderAll();
    });

    return () => {
      localCanvases.forEach((canvas) => {
          if (canvas) {
              canvas.off('mouse:down');
              canvas.off('mouse:move');
              canvas.off('mouse:up');
              canvas.off('path:created');
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
