import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfCanvasProps {
  pdfFile: File | null;
  scale: number;
  onDocumentLoadSuccess: (numPages: number) => void;
}

export default function PdfCanvas({ pdfFile, scale, onDocumentLoadSuccess }: PdfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

      onDocumentLoadSuccess(pdf.numPages);

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context!,
        viewport,
      };

      await page.render(renderContext).promise;
    };

    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile, scale]);

  return <canvas ref={canvasRef} className="border mx-auto" />;
}
