
"use client";

import React, { useEffect, useState } from "react";

interface SidebarProps {
  pdfFile: File | null;
  currentPage: number;
  onPageClick: (pageNum: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ pdfFile, currentPage, onPageClick }) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  useEffect(() => {
    if (!pdfFile) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const pdf = await pdfjsLib.getDocument({ data }).promise;
      const thumbs: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push(canvas.toDataURL());
      }

      setThumbnails(thumbs);
    };

    reader.readAsArrayBuffer(pdfFile);
  }, [pdfFile]);

  return (
    <div className="w-full overflow-y-auto bg-white border-r h-full">
      {thumbnails.map((src, index) => (
        <div
          key={index}
          className={`m-2 border rounded cursor-pointer ${
            currentPage === index + 1 ? "border-blue-500" : "border-gray-300"
          }`}
          onClick={() => onPageClick(index + 1)}
        >
          <img src={src} alt={`Page ${index + 1}`} className="w-full" />
          <div className="text-center text-sm py-1">p.{index + 1}</div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
