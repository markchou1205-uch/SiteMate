"use client";

import React, { useRef, useState } from "react";
import PdfCanvas from "./PdfCanvas";
import Sidebar from "./Sidebar";
import type { Canvas } from "fabric";

const PdfEditor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<"select" | "text" | "draw" | "rect">("select");
  const [color, setColor] = useState("#000000"); // 修正為合法顏色格式
  const canvasRef = useRef<Canvas | null>(null);
  const [updatedPages, setUpdatedPages] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    setCurrentPage(1);
  };

  const handleDeletePage = (page: number) => {
    const updated = updatedPages.filter((_, index) => index !== page - 1);
    setUpdatedPages(updated);
  };

  const handleSaveEdits = (dataUrl: string, page: number) => {
    const newPages = [...updatedPages];
    newPages[page - 1] = dataUrl;
    setUpdatedPages(newPages);
  };

  return (
    <div className="flex w-full h-screen">
      <div className="w-[120px]">
        <Sidebar
          pdfFile={pdfFile}
          currentPage={currentPage}
          onPageClick={setCurrentPage}
        />
      </div>

      <div className="flex-1 p-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" />

        <div className="mb-4 flex gap-2 items-center">
          <button onClick={() => setToolMode("select")}>選取</button>
          <button onClick={() => setToolMode("text")}>文字</button>
          <button onClick={() => setToolMode("draw")}>手繪</button>
          <button onClick={() => setToolMode("rect")}>矩形</button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="選擇顏色"
          />
        </div>

        {pdfFile && (
          <>
            <PdfCanvas
              pdfFile={pdfFile}
              currentPage={currentPage}
              onTotalPages={setTotalPages}
              toolMode={toolMode}
              color={color}
              canvasRef={canvasRef}
              onDeletePage={handleDeletePage}
              onSaveEdits={handleSaveEdits}
              onUpdatePdf={setUpdatedPages}
            />

            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                上一頁
              </button>
              <span>第 {currentPage} / {totalPages} 頁</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
              >
                下一頁
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PdfEditor;
