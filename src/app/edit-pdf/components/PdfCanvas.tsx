
"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

interface PdfCanvasProps {
  pdfFile: File | null;
  currentPage: number;
  onTotalPages: (total: number) => void;
  toolMode: string;
  color: string;
  canvasRef?: React.MutableRefObject<fabric.Canvas | null>;
  onDeletePage: (page: number) => void;
  onSaveEdits: (dataUrl: string, page: number) => void;
  onUpdatePdf?: (updatedPages: string[]) => void;
  imageToInsert?: HTMLImageElement | null;
}

const PdfCanvas: React.FC<PdfCanvasProps> = ({
  pdfFile,
  currentPage,
  onTotalPages,
  toolMode,
  color,
  canvasRef,
  onDeletePage,
  onSaveEdits,
  onUpdatePdf,
  imageToInsert,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [scale, setScale] = useState(1.5);
  const [rotation, setRotation] = useState(0);
  const [renderedPages, setRenderedPages] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  useEffect(() => {
    if (!pdfFile) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const doc = await pdfjsLib.getDocument({ data }).promise;
      setPdfDoc(doc);
      onTotalPages(doc.numPages);
    };
    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile, onTotalPages]);

  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;
    const renderPage = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale, rotation });

      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d")!;
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      containerRef.current.innerHTML = "";
      const fabricCanvasEl = document.createElement("canvas");
      fabricCanvasEl.width = viewport.width;
      fabricCanvasEl.height = viewport.height;
      containerRef.current.appendChild(fabricCanvasEl);

      const fabricCanvas = new fabric.Canvas(fabricCanvasEl, {
        selection: true,
        backgroundColor: "#ffffff",
      });
      if (canvasRef) canvasRef.current = fabricCanvas;

      const dataURL = tempCanvas.toDataURL();
      fabric.Image.fromURL(dataURL, (bgInstance) => {
        bgInstance.set({ selectable: false, evented: false });
        fabricCanvas.setBackgroundImage(bgInstance, fabricCanvas.renderAll.bind(fabricCanvas));
      });

      let isDragging = false;
      let startX = 0,
        startY = 0;
      let drawingObject: fabric.Object | null = null; 

      fabricCanvas.on("mouse:down", (e) => {
        if (toolMode === "select") return;
        const pointer = fabricCanvas.getPointer(e.e);
        startX = pointer.x;
        startY = pointer.y;

        if (toolMode === "draw") {
          fabricCanvas.isDrawingMode = true;
          fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas); 
          fabricCanvas.freeDrawingBrush.color = color;
          fabricCanvas.freeDrawingBrush.width = 2;
          return;
        }

        isDragging = true;

        if (toolMode === "text") {
          drawingObject = new fabric.Textbox("輸入文字", {
            left: startX,
            top: startY,
            width: 1,
            height: 1,
            fontSize: 20,
            fill: color,
          });
        } else if (toolMode === "rect") {
          drawingObject = new fabric.Rect({
            left: startX,
            top: startY,
            width: 1,
            height: 1,
            stroke: color,
            strokeWidth: 2,
            fill: "transparent",
          });
        } else if (toolMode === "image" && imageToInsert) {
          const img = new fabric.Image(imageToInsert, {
            left: startX,
            top: startY,
            scaleX: 0.3,
            scaleY: 0.3,
          });
          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          return;
        }

        if (drawingObject) {
          fabricCanvas.add(drawingObject);
        }
      });

      fabricCanvas.on("mouse:move", (e) => {
        if (!isDragging || !drawingObject) return;
        const pointer = fabricCanvas.getPointer(e.e);
        const width = pointer.x - startX;
        const height = pointer.y - startY;
        drawingObject.set({ width: Math.abs(width), height: Math.abs(height) });
        if (width < 0) drawingObject.set({ left: pointer.x });
        if (height < 0) drawingObject.set({ top: pointer.y });
        drawingObject.setCoords();
        fabricCanvas.renderAll();
      });

      fabricCanvas.on("mouse:up", () => {
        isDragging = false;
        drawingObject = null;
        fabricCanvas.isDrawingMode = false;
      });

      fabricCanvas.on("mouse:dblclick", (e) => {
        if (e.target && e.target.type === "textbox") {
          (e.target as fabric.Textbox).enterEditing(); 
        }
      });

      const saveSnapshot = () => {
        const json = fabricCanvas.toJSON();
        setHistory((prev) => [...prev, JSON.stringify(json)]);
        setRedoStack([]);
      };

      fabricCanvas.on("object:added", saveSnapshot);
      fabricCanvas.on("object:modified", saveSnapshot);
      fabricCanvas.on("object:removed", saveSnapshot);

      const resultUrl = fabricCanvas.toDataURL({ format: "png", multiplier: 1 });
      const updated = [...renderedPages];
      updated[currentPage - 1] = resultUrl;
      setRenderedPages(updated);
      onUpdatePdf?.(updated);
    };

    renderPage();
  }, [pdfDoc, currentPage, scale, rotation, toolMode, color, imageToInsert, canvasRef, onUpdatePdf, renderedPages]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="flex justify-center items-center p-4 bg-gray-200 min-h-[600px] overflow-auto"
      />
    </div>
  );
};

export default PdfCanvas;
