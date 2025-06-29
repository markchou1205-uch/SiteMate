
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
  setNumPages,
  setSelectedObjectId, // Changed from selectedTextRange
}: InteractivePdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [selectedTextRange, setSelectedTextRange] = useState<Range | null>(null);
  const [currentStyle, setCurrentStyle] = useState({ bold: false, italic: false, underline: false, color: "#000000" });

  useEffect(() => {
    if (!pdfFile) return;

    const renderPdf = async () => {
      const reader = new FileReader();
      reader.onload = async () => {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        setNumPages(pdf.numPages);

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement("canvas");
          canvas.className = "mb-4 border mx-auto";
          const context = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const renderContext = { canvasContext: context, viewport };
          await page.render(renderContext).promise;

          const textContent = await page.getTextContent();
          const textLayer = document.createElement("div");
          textLayer.className = "textLayer absolute top-0 left-0 text-black select-text";
          textLayer.style.width = `${viewport.width}px`;
          textLayer.style.height = `${viewport.height}px`;

          pdfjsLib.renderTextLayer({
            textContent,
            container: textLayer,
            viewport,
            textDivs: [],
          });

          const wrapper = document.createElement("div");
          wrapper.className = "relative";
          wrapper.appendChild(canvas);
          wrapper.appendChild(textLayer);

          container.appendChild(wrapper);
        }
      };
      reader.readAsArrayBuffer(pdfFile);
    };

    renderPdf();
  }, [pdfFile, setNumPages]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const range = selection.getRangeAt(0);
        setSelectedTextRange(range);
        setShowStylePanel(true);
      } else {
        setSelectedTextRange(null);
        setShowStylePanel(false);
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

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
    <div className="relative w-full h-full">
      <div ref={containerRef} className="overflow-auto max-h-[calc(100vh-100px)]" />
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
