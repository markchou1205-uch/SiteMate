
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
  const observerRef = useRef<IntersectionObserver | null>(null);

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

  // Render all pages into the container
  useEffect(() => {
    if (!pdfDoc || !containerRef.current || !pdfFile) return;

    const renderAllPages = async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";
      pageRefs.current = [];

      // Use a fixed width for consistent scaling calculation
      const availableWidth = containerRef.current.clientWidth - 32; // Subtract padding

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
        pageRefs.current[pageNum - 1] = pageContainer;

        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    };

    renderAllPages();
  }, [pdfDoc, zoom, rotations, pdfFile]);

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

  // Observe pages to track the current one
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!containerRef.current || pageRefs.current.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
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
        rootMargin: "-40% 0px -40% 0px", // Use a central band for detection
        threshold: 0,
      }
    );

    pageRefs.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [pdfDoc, onCurrentPageChange]); // Reruns when the document/pages are set up

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center overflow-auto bg-muted p-4"
    />
  );
};

export default PdfCanvas;
