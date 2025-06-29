"use client";

import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

interface PdfCanvasProps {
  pdfFile: File | null;
  currentPage: number;
  onTotalPages: (total: number) => void;
  toolMode: "select" | "text" | "draw" | "rect";
  color: string;
  canvasRef?: React.MutableRefObject<fabric.Canvas | null>;
}

const PdfCanvas: React.FC<PdfCanvasProps> = ({
  pdfFile,
  currentPage,
  onTotalPages,
  toolMode,
  color,
  canvasRef,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    if (!pdfFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);

      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";
      const doc = await pdfjsLib.getDocument({ data }).promise;
      setPdfDoc(doc);
      onTotalPages(doc.numPages);
    };
    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile]);

  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvasEl = document.createElement("canvas");
      const ctx = canvasEl.getContext("2d")!;
      canvasEl.width = viewport.width;
      canvasEl.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      // 清除容器
      containerRef.current!.innerHTML = "";
      containerRef.current!.appendChild(canvasEl);

      // 初始化 fabric canvas
      const fabricCanvas = new fabric.Canvas(canvasEl, {
        selection: true,
        backgroundColor: null,
      });

      // 保留畫布參考
      if (canvasRef) {
        canvasRef.current = fabricCanvas;
      }

      // 根據工具模式綁定事件
      fabricCanvas.isDrawingMode = toolMode === "draw";
      fabricCanvas.freeDrawingBrush.color = color;

      fabricCanvas.on("mouse:down", (e) => {
        if (toolMode === "text" && e.pointer) {
          const text = new fabric.Textbox("輸入文字", {
            left: e.pointer.x,
            top: e.pointer.y,
            fontSize: 16,
            fill: color,
          });
          fabricCanvas.add(text).setActiveObject(text);
        } else if (toolMode === "rect" && e.pointer) {
          const rect = new fabric.Rect({
            left: e.pointer.x,
            top: e.pointer.y,
            width: 100,
            height: 50,
            fill: "transparent",
            stroke: color,
            strokeWidth: 2,
          });
          fabricCanvas.add(rect).setActiveObject(rect);
        }
      });

      fabricCanvas.renderAll();
    };

    renderPage();
  }, [pdfDoc, currentPage, toolMode, color]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center p-4 bg-gray-200 min-h-[600px]"
    />
  );
};

export default PdfCanvas;
