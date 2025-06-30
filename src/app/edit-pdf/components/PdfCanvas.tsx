
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface PdfCanvasProps {
  pdfFile: File | null;
  onTotalPages: (total: number) => void;
  onCurrentPageChange: (page: number) => void;
  zoom: number;
  rotations: { [key: number]: number };
  scrollToPage: number | null;
  onScrollComplete: () => void;
}

const PdfCanvas: React.FC<PdfCanvasProps> = ({
  pdfFile,
  onTotalPages,
  onCurrentPageChange,
  zoom,
  rotations,
  scrollToPage,
  onScrollComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  // Load PDF document from file
  useEffect(() => {
    if (!pdfFile) {
      setPdfDoc(null);
      pageRefs.current = [];
      if (containerRef.current) containerRef.current.innerHTML = "";
      return;
    }
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

  // Render all pages and set up IntersectionObserver
  useEffect(() => {
    if (!pdfDoc || !containerRef.current || !pdfFile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Find the page that is most visible at the top of the container
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topVisiblePage = visibleEntries[0];
          const pageNum = Number((topVisiblePage.target as HTMLElement).dataset.pageNumber);
          if (pageNum) {
            onCurrentPageChange(pageNum);
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: "-50% 0px -50% 0px", // A horizontal line at the center
        threshold: 0,
      }
    );

    const renderAllPages = async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = ""; // Clear previous renders
      const newPageRefs: (HTMLDivElement | null)[] = [];

      const availableWidth = containerRef.current.clientWidth - 32;

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const rotation = rotations[pageNum] || 0;
        
        const unrotatedViewport = page.getViewport({ scale: 1 });
        const scaleToFit = availableWidth / unrotatedViewport.width;
        const viewport = page.getViewport({ scale: scaleToFit * zoom, rotation });

        const pageContainer = document.createElement("div");
        pageContainer.className = "mb-4 bg-background shadow-md";
        pageContainer.dataset.pageNumber = String(pageNum);
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        pageContainer.appendChild(canvas);
        containerRef.current.appendChild(pageContainer);
        newPageRefs[pageNum - 1] = pageContainer;

        // Observe the new page container
        observer.observe(pageContainer);
        
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
      pageRefs.current = newPageRefs;
    };

    renderAllPages();

    return () => {
      observer.disconnect();
    };
  }, [pdfDoc, zoom, rotations, pdfFile, onCurrentPageChange]);

  // Scroll to a specific page when requested
  useEffect(() => {
    if (scrollToPage && pageRefs.current[scrollToPage - 1]) {
      pageRefs.current[scrollToPage - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      onScrollComplete();
    }
  }, [scrollToPage, onScrollComplete]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center overflow-auto bg-muted p-4"
    />
  );
};

export default PdfCanvas;
