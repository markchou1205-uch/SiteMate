
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
  onTextEditStart: () => void;
  onTextEditEnd: () => void;
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
  onTextEditStart,
  onTextEditEnd,
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
  const drawingState = useRef<{ isDrawing: boolean; origX: number; origY: number; shape: fabric.Object | null }>({
    isDrawing: false,
    origX: 0,
    origY: 0,
    shape: null,
  });

  useEffect(() => {
    if (!pdfDoc) {
        if(containerRef.current) containerRef.current.innerHTML = "";
        setLocalCanvases([]);
        return;
    };
    
    let canvasesToSet: (fabric.Canvas | null)[] = [];

    const renderPdf = async () => {
      setPdfLoaded(false);
      
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
    localCanvases.forEach((canvas, index) => {
        if (!canvas) return;

        canvas.isDrawingMode = drawingTool === 'freedraw';
        canvas.selection = !drawingTool;
        canvas.defaultCursor = drawingTool ? 'crosshair' : 'default';
        canvas.forEachObject(obj => {
            obj.selectable = !drawingTool;
            obj.evented = !drawingTool;
        });

        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
        

        if (drawingTool && drawingTool !== 'freedraw') {
            const handleMouseDown = (o: fabric.IEvent) => {
                const currentCanvas = localCanvases[index];
                if (!currentCanvas || !o.e) return;

                drawingState.current.isDrawing = true;
                const pointer = currentCanvas.getPointer(o.e);
                drawingState.current.origX = pointer.x;
                drawingState.current.origY = pointer.y;

                let shape;
                const commonProps = {
                    left: pointer.x,
                    top: pointer.y,
                    originX: 'left',
                    originY: 'top',
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
                    default:
                        return;
                }
                
                drawingState.current.shape = shape;
                currentCanvas.add(shape);
            };

            const handleMouseMove = (o: fabric.IEvent) => {
                if (!drawingState.current.isDrawing || !drawingState.current.shape || !o.e) return;

                const currentCanvas = localCanvases[index];
                if (!currentCanvas) return;

                const pointer = currentCanvas.getPointer(o.e);
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
                
                currentCanvas.renderAll();
            };

            const handleMouseUp = () => {
                if (!drawingState.current.isDrawing) return;

                const currentCanvas = localCanvases[index];
                if (!currentCanvas || !drawingState.current.shape) {
                    setDrawingTool(null);
                    return;
                }
                
                const { shape } = drawingState.current;
                shape.setCoords();

                const minSize = 5;
                const width = shape.getScaledWidth();
                const height = shape.getScaledHeight();

                if (width < minSize && height < minSize) {
                    currentCanvas.remove(shape);
                } else {
                    shape.set({ selectable: true, evented: true });
                    onUpdateFabricObject(index, currentCanvas);
                }
                
                drawingState.current = { isDrawing: false, origX: 0, origY: 0, shape: null };
                currentCanvas.renderAll();
                setDrawingTool(null);
            };

            canvas.on('mouse:down', handleMouseDown);
            canvas.on('mouse:move', handleMouseMove);
            canvas.on('mouse:up', handleMouseUp);
        }

        canvas.renderAll();
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
