"use client";

import { useEffect, useRef } from "react";
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
  const fabricCanvasRefs = useRef<(fabric.Canvas | null)[]>([]);
  const drawingState = useRef<{ isDrawing: boolean; origX: number; origY: number; shape: fabric.Object | null }>({
    isDrawing: false,
    origX: 0,
    origY: 0,
    shape: null,
  });

  useEffect(() => {
    if (!pdfDoc) {
        if(containerRef.current) containerRef.current.innerHTML = "";
        return;
    };
    
    let canvases: (fabric.Canvas | null)[] = [];

    const renderPdf = async () => {
      setPdfLoaded(false);
      
      const pdfBytes = await pdfDoc.save();
      const typedarray = new Uint8Array(pdfBytes);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
      setNumPages(pdf.numPages);

      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = ""; 
      fabricCanvasRefs.current = [];

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
        
        canvases[pageNum - 1] = fabricCanvas;
      }
      
      fabricCanvasRefs.current = canvases;
      setFabricCanvases(canvases);
      setPdfLoaded(true);
    };

    renderPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, docVersion, scale]);

  useEffect(() => {
    fabricCanvasRefs.current.forEach(canvas => {
        if (!canvas) return;
        
        canvas.isDrawingMode = drawingTool === 'freedraw';
        canvas.defaultCursor = drawingTool ? 'crosshair' : 'default';
        canvas.selection = !drawingTool;
        canvas.forEachObject(obj => obj.selectable = !drawingTool);

        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
        
        if (drawingTool && drawingTool !== 'freedraw') {
            const handleMouseDown = (o: fabric.IEvent) => {
                const pointer = canvas.getPointer(o.e);
                drawingState.current = { isDrawing: true, origX: pointer.x, origY: pointer.y, shape: null };
                
                let shape;
                const commonProps = { 
                    left: pointer.x, 
                    top: pointer.y, 
                    width: 0, 
                    height: 0, 
                    fill: 'transparent', 
                    stroke: 'black', 
                    strokeWidth: 2,
                    originX: 'left',
                    originY: 'top'
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
                canvas.add(shape);
            };

            const handleMouseMove = (o: fabric.IEvent) => {
                if (!drawingState.current.isDrawing || !drawingState.current.shape) return;
                const pointer = canvas.getPointer(o.e);
                const { origX, origY, shape } = drawingState.current;

                if (shape.type === 'circle') {
                    const radius = Math.sqrt(Math.pow(pointer.x - origX, 2) + Math.pow(pointer.y - origY, 2)) / 2;
                    shape.set({ 
                        radius: radius, 
                        left: origX + (pointer.x - origX) / 2,
                        top: origY + (pointer.y - origY) / 2,
                        originX: 'center',
                        originY: 'center',
                     });
                } else {
                    const width = Math.abs(origX - pointer.x);
                    const height = Math.abs(origY - pointer.y);
                    shape.set({ 
                        width, 
                        height, 
                        left: Math.min(pointer.x, origX), 
                        top: Math.min(pointer.y, origY) 
                    });
                }
                canvas.renderAll();
            };

            const handleMouseUp = () => {
                if (drawingState.current.isDrawing && drawingState.current.shape) {
                    const { shape } = drawingState.current;
                    if (shape.type === 'circle') {
                        shape.set({
                            originX: 'left',
                            originY: 'top'
                        });
                    }
                    onUpdateFabricObject(fabricCanvasRefs.current.indexOf(canvas), canvas);
                }
                drawingState.current = { isDrawing: false, origX: 0, origY: 0, shape: null };
                setDrawingTool(null);
            };

            canvas.on('mouse:down', handleMouseDown);
            canvas.on('mouse:move', handleMouseMove);
            canvas.on('mouse:up', handleMouseUp);
        }
    });
  }, [drawingTool, onUpdateFabricObject, setDrawingTool]);

  return (
    <div className="relative w-full h-full p-4">
      <div ref={containerRef} className="flex flex-col items-center" />
    </div>
  );
}
