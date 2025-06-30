
"use client";

import React, { useEffect, useRef, useState } from "react";

interface PdfCanvasProps {
  pdfFile: File | null;
  currentPage: number;
  onTotalPages: (total: number) => void;
  zoom: number;
  rotation: number;
}

const PdfCanvas: React.FC<PdfCanvasProps> = ({
  pdfFile,
  currentPage,
  onTotalPages,
  zoom,
  rotation,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

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
    if (!pdfDoc || !containerRef.current || !pdfFile) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        
        const containerWidth = containerRef.current!.clientWidth;
        // Use an unrotated viewport to calculate the scale to fit width,
        // so that rotation doesn't alter the zoom.
        const unrotatedViewport = page.getViewport({ scale: 1, rotation: 0 });
        const scaleToFit = containerWidth / unrotatedViewport.width;
        
        const viewport = page.getViewport({ scale: scaleToFit * zoom, rotation: rotation });

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
  }, [pdfDoc, currentPage, zoom, rotation, pdfFile]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex justify-center items-start overflow-auto bg-muted"
    />
  );
};

export default PdfCanvas;
