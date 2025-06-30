
"use client";

import React, { useEffect, useRef, useState } from "react";

interface PdfCanvasProps {
  pdfFile: File | null;
  currentPage: number;
  onTotalPages: (total: number) => void;
}

const PdfCanvas: React.FC<PdfCanvasProps> = ({
  pdfFile,
  currentPage,
  onTotalPages,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const scale = 1.5; 

  useEffect(() => {
    if (!pdfFile) {
        setPdfDoc(null);
        if(containerRef.current) containerRef.current.innerHTML = "";
        return;
    };
    const reader = new FileReader();
    reader.onload = async () => {
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
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

  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        containerRef.current!.innerHTML = "";
        containerRef.current!.appendChild(canvas);

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (error) {
        console.error(`Error rendering page ${currentPage}:`, error);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex justify-center items-start p-4 overflow-auto bg-muted"
    />
  );
};

export default PdfCanvas;
