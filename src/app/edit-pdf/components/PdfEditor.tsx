
"use client";

import React, { useRef, useState } from "react";
import PdfCanvas from "./PdfCanvas";
import Sidebar from "./Sidebar";
import Toolbar, { type Tool } from "./Toolbar";
import { Button } from "@/components/ui/button";

const PdfEditor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<Tool>("select");
  const [color, setColor] = useState("#000000");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    setCurrentPage(1);
    setTotalPages(0);
  };
  
  const handleDownload = () => {
    console.log("Download clicked");
  }

  return (
    <div className="flex w-full h-full bg-muted/40">
      <div className="w-[15%] flex-shrink-0 bg-card border-r">
        <Sidebar
          pdfFile={pdfFile}
          currentPage={currentPage}
          onPageClick={setCurrentPage}
          totalPages={totalPages}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-card border-b p-2">
          <Toolbar 
            currentTool={toolMode}
            setTool={setToolMode}
            color={color}
            setColor={setColor}
            onDownload={handleDownload}
          />
        </div>
        
        <div className="flex-grow flex flex-col p-4 overflow-auto">
          <div className="flex-grow bg-background rounded-lg shadow-inner overflow-hidden">
            {pdfFile ? (
              <PdfCanvas
                pdfFile={pdfFile}
                currentPage={currentPage}
                onTotalPages={setTotalPages}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10 text-center">
                  <h2 className="text-xl font-semibold mb-2">開始編輯您的 PDF</h2>
                  <p className="mb-4">從您的電腦上傳一個檔案，即可開始。</p>
                  <label className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 cursor-pointer">
                    選擇檔案
                    <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                  </label>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PdfEditor;
