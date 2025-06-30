
"use client";

import React, { useState } from "react";
import { PDFDocument } from 'pdf-lib';
import PdfCanvas from "./PdfCanvas";
import Sidebar from "./Sidebar";
import Toolbar, { type Tool } from "./Toolbar";
import FloatingToolbar from "./FloatingToolbar";

const PdfEditor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<Tool>("select");
  const [color, setColor] = useState("#000000");
  
  const [zoom, setZoom] = useState(1);
  const [rotations, setRotations] = useState<{ [key: number]: number }>({});
  const [scrollToPage, setScrollToPage] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    setCurrentPage(1);
    setTotalPages(0);
    setZoom(1);
    setRotations({});
  };
  
  const handleDownload = () => {
    console.log("Download clicked");
  }

  const handleRotate = (direction: 'left' | 'right') => {
    const amount = direction === 'left' ? -90 : 90;
    setRotations(prev => {
        const currentRotation = prev[currentPage] || 0;
        const newRotation = (currentRotation + amount + 360) % 360;
        return { ...prev, [currentPage]: newRotation };
    });
  };

  const handleDeletePage = async () => {
      if (!pdfFile || totalPages <= 1) return;

      const originalName = pdfFile.name;
      const existingPdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      if (pdfDoc.getPageCount() <= 1) return;
      
      const deletedPageNum = currentPage;
      pdfDoc.removePage(deletedPageNum - 1);
      
      const newPdfBytes = await pdfDoc.save();
      const newPdfFile = new File([newPdfBytes], originalName, { type: 'application/pdf' });
      
      const newTotalPages = pdfDoc.getPageCount();

      // Re-map rotations for remaining pages
      const newRotations: { [key: number]: number } = {};
      for (let i = 1; i <= newTotalPages; i++) {
          const oldPageNum = i < deletedPageNum ? i : i + 1;
          if (rotations[oldPageNum]) {
              newRotations[i] = rotations[oldPageNum];
          }
      }
      setRotations(newRotations);
      
      setPdfFile(newPdfFile);
      
      if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
      }
      // The onTotalPages callback in PdfCanvas will update the totalPages state
  };
  
  const handlePageSelect = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setScrollToPage(pageNumber);
  };

  const handleScrollComplete = () => {
    setScrollToPage(null);
  };

  return (
    <div className="flex w-full h-full bg-muted/40">
      <div className="w-[15%] flex-shrink-0 bg-card border-r">
        <Sidebar
          pdfFile={pdfFile}
          currentPage={currentPage}
          onPageClick={handlePageSelect}
          totalPages={totalPages}
          rotations={rotations}
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
        
        <div className="flex-grow flex flex-col p-4 overflow-auto relative">
          <div className="flex-grow bg-background rounded-lg shadow-inner overflow-hidden">
            {pdfFile ? (
              <PdfCanvas
                pdfFile={pdfFile}
                onTotalPages={setTotalPages}
                onCurrentPageChange={setCurrentPage}
                zoom={zoom}
                rotations={rotations}
                scrollToPage={scrollToPage}
                onScrollComplete={handleScrollComplete}
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
          {pdfFile && (
            <FloatingToolbar
              zoom={zoom}
              onZoomChange={setZoom}
              onRotate={handleRotate}
              onDelete={handleDeletePage}
              canDelete={totalPages > 1}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default PdfEditor;
