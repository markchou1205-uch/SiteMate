"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import PropertyPanel from "./PropertyPanel";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface InteractivePdfCanvasProps {
  pdfFile: File | null;
  currentPage: number;
  scale: number;
  rotation: number;
  onTextEditStart: () => void;
  onTextEditEnd: () => void;
  selectedStyle: any;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  pageObjects: any[];
  setPageObjects: (objects: any[]) => void;
  setPdfLoaded: (loaded: boolean) => void;
  setNumPages: (num: number) => void;
}

export default function InteractivePdfCanvas({
  pdfFile,
  scale,
  rotation,
  onTextEditStart,
  onTextEditEnd,
  setPdfLoaded,
  setNumPages,
}: InteractivePdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [selectedTextRange, setSelectedTextRange] = useState<Range | null>(null);
  const [currentStyle, setCurrentStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
    color: "#000000",
  });

  useEffect(() => {
    if (!pdfFile) return;

    const renderPdf = async () => {
      setPdfLoaded(false);
      const reader = new FileReader();
      reader.onload = async () => {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        setNumPages(pdf.numPages);

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = ""; // Clear previous renders

        // Loop to render all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale, rotation });
          
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (!context) continue;

          // For crisp rendering on high-DPI screens
          const outputScale = window.devicePixelRatio || 1;

          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          
          canvas.className = "mb-4 border mx-auto shadow-lg";
          
          const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

          const renderContext = { 
            canvasContext: context, 
            viewport,
            transform,
          };
          
          await page.render(renderContext).promise;
          container.appendChild(canvas);
        }
        
        setPdfLoaded(true);
      };
      reader.readAsArrayBuffer(pdfFile);
    };

    renderPdf();
  }, [pdfFile, scale, rotation, setNumPages, setPdfLoaded]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const range = selection.getRangeAt(0);
        setSelectedTextRange(range);
        setShowStylePanel(true);
        onTextEditStart();
      } else {
        setSelectedTextRange(null);
        setShowStylePanel(false);
        onTextEditEnd();
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [onTextEditStart, onTextEditEnd]);

  const applyStyle = (style: { bold?: boolean; italic?: boolean; underline?: boolean; color?: string }) => {
    if (!selectedTextRange) return;

    const span = document.createElement("span");
    if (style.bold) span.style.fontWeight = "bold";
    if (style.italic) span.style.fontStyle = "italic";
    if (style.underline) span.style.textDecoration = "underline";
    if (style.color) span.style.color = style.color;

    span.textContent = selectedTextRange.toString();
    selectedTextRange.deleteContents();
    selectedTextRange.insertNode(span);
    setShowStylePanel(false);
  };

  return (
    <div className="relative w-full h-full p-4">
      <div ref={containerRef} className="flex flex-col items-center" />
      <PropertyPanel
        isVisible={showStylePanel}
        onClose={() => setShowStylePanel(false)}
        onStyleChange={(style) => {
          setCurrentStyle({ ...currentStyle, ...style });
          applyStyle(style);
        }}
        currentStyle={currentStyle}
      />
    </div>
  );
}
