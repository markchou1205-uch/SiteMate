"use client";

import React, { useRef, useState } from "react";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import PdfCanvas from "./PdfCanvas";
import { exportCanvasAsPdf } from "../utils/PdfExporter";
import { fabric } from "fabric";

type Tool = "select" | "text" | "draw" | "rect";

const PdfEditor: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [toolMode, setToolMode] = useState<Tool>("select");
  const [color, setColor] = useState<string>("#000000");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fabricCanvasRef = useRef<fabric.Canvas | null>(null); // 儲存當前頁 canvas

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setCurrentPage(1);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* 工具列（含下載） */}
      <Toolbar
        currentTool={toolMode}
        setTool={setToolMode}
        color={color}
        setColor={setColor}
        onExport={() => {
        if (fabricCanvasRef.current) {
           exportCanvasAsPdf(fabricCanvasRef.current);
        } else {
           alert("尚未載入畫布！");
        }
  }}
/>

      {/* 上傳與頁碼控制列 */}
      <div className="flex items-center gap-4 p-2 bg-white border-b">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        <div className="ml-auto flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            上一頁
          </button>
          <span>第 {currentPage} / {totalPages} 頁</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            下一頁
          </button>
        </div>
      </div>

      {/* 主編輯區 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側縮圖 */}
        <Sidebar
          pdfFile={pdfFile}
          currentPage={currentPage}
          onPageClick={setCurrentPage}
        />

        {/* 畫布區域 */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {pdfFile ? (
            <PdfCanvas
              pdfFile={pdfFile}
              currentPage={currentPage}
              onTotalPages={setTotalPages}
              toolMode={toolMode}
              color={color}
              canvasRef={fabricCanvasRef}
            />
          ) : (
            <div className="p-4 text-gray-500 text-center">請先上傳 PDF</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfEditor;
