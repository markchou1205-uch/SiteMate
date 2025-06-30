
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
  const [color, setColor] = useState("#000000");
  const canvasRef = useRef<Canvas | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    setCurrentPage(1);
    setTotalPages(0);
  };

  return (
    <div className="flex w-full h-screen bg-gray-100">
      <div className="w-[280px] flex-shrink-0">
        <Sidebar
          pdfFile={pdfFile}
          currentPage={currentPage}
          onPageClick={setCurrentPage}
          totalPages={totalPages}
        />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center gap-4 mb-4">
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="bg-white p-2 rounded border" />
          <button onClick={() => setToolMode("select")} className="px-4 py-2 bg-white rounded border">選取</button>
          <button onClick={() => setToolMode("text")} className="px-4 py-2 bg-white rounded border">文字</button>
          <button onClick={() => setToolMode("draw")} className="px-4 py-2 bg-white rounded border">手繪</button>
          <button onClick={() => setToolMode("rect")} className="px-4 py-2 bg-white rounded border">矩形</button>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="選擇顏色"
            className="w-10 h-10"
          />
        </div>

        <div className="flex-grow bg-gray-200 rounded-lg shadow-inner overflow-hidden">
          {pdfFile ? (
            <PdfCanvas
              pdfFile={pdfFile}
              currentPage={currentPage}
              onTotalPages={setTotalPages}
            />
          ) : (
             <div className="flex items-center justify-center h-full text-gray-500">
                請上傳一個 PDF 檔案以開始編輯
             </div>
          )}
        </div>

        {pdfFile && totalPages > 0 && (
          <div className="flex justify-center items-center mt-4 gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-white rounded border disabled:opacity-50"
            >
              上一頁
            </button>
            <span>第 {currentPage} / {totalPages} 頁</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
               className="px-4 py-2 bg-white rounded border disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfEditor;
