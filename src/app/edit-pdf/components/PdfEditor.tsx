
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PDFDocument } from 'pdf-lib';
import PdfCanvas from "./PdfCanvas";
import Sidebar from "./Sidebar";
import Toolbar, { type Tool } from "./Toolbar";
import FloatingToolbar from "./FloatingToolbar";
import ReorderView from "./ReorderView";

type ViewMode = 'edit' | 'reorder';

const PdfEditor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [toolMode, setToolMode] = useState<Tool>("select");
  const [color, setColor] = useState("#000000");
  
  const [zoom, setZoom] = useState(1);
  const [rotations, setRotations] = useState<{ [key: number]: number }>({});
  const [scrollToPage, setScrollToPage] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);

  const generateThumbnails = useCallback(async (file: File) => {
    if (!file) {
      setThumbnails([]);
      return;
    }
    setIsLoadingThumbnails(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const pdfjsLib = await import("pdfjs-dist/build/pdf");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

          const pdf = await pdfjsLib.getDocument({ data }).promise;
          const thumbs: string[] = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageRotations = rotations[i] || 0;
            
            const originalViewport = page.getViewport({ scale: 1, rotation: pageRotations });
            const fixedWidth = 150;
            const viewport = page.getViewport({ scale: fixedWidth / originalViewport.width, rotation: pageRotations });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: ctx, viewport }).promise;
            thumbs.push(canvas.toDataURL());
          }
          setThumbnails(thumbs);
        } catch (error) {
           console.error("Error processing PDF for thumbnails:", error);
           setThumbnails([]);
        } finally {
            setIsLoadingThumbnails(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Failed to read file for thumbnails:", error);
      setIsLoadingThumbnails(false);
    }
  }, [rotations]);

  useEffect(() => {
    if (pdfFile) {
      generateThumbnails(pdfFile);
    }
  }, [pdfFile, generateThumbnails]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPdfFile(file);
    setCurrentPage(1);
    setTotalPages(0);
    setZoom(1);
    setRotations({});
    setViewMode('edit');
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
  };
  
  const handlePageSelect = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setScrollToPage(pageNumber);
  };

  const handleScrollComplete = () => {
    setScrollToPage(null);
  };
  
  const handleInsertPdf = async (fileToInsert: File, index: number) => {
    if (!pdfFile || !fileToInsert) return;

    const existingPdfBytes = await pdfFile.arrayBuffer();
    const newPdfBytes = await fileToInsert.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const newPdfDoc = await PDFDocument.load(newPdfBytes);

    const copiedPageIndices = await pdfDoc.copyPages(newPdfDoc, newPdfDoc.getPageIndices());
    
    for (let i = 0; i < copiedPageIndices.length; i++) {
        pdfDoc.insertPage(index + i, copiedPageIndices[i]);
    }
    
    const finalPdfBytes = await pdfDoc.save();
    const newPdfFile = new File([finalPdfBytes], pdfFile.name, { type: 'application/pdf' });
    
    const newRotations: { [key: number]: number } = {};
    const numInsertedPages = newPdfDoc.getPageCount();
    for (const pageNumStr in rotations) {
        const pageNum = parseInt(pageNumStr, 10);
        if (pageNum <= index) {
            newRotations[pageNum] = rotations[pageNum];
        } else {
            newRotations[pageNum + numInsertedPages] = rotations[pageNum];
        }
    }
    setRotations(newRotations);
    setPdfFile(newPdfFile);
  };

  const handleInsertBlankPage = async (index: number) => {
    if (!pdfFile) return;

    const existingPdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    let pageSize: [number, number] = [595.28, 841.89];
    if (index > 0 && index <= pdfDoc.getPageCount()) {
        const prevPage = pdfDoc.getPage(index - 1);
        const { width, height } = prevPage.getSize();
        pageSize = [width, height];
    }

    pdfDoc.insertPage(index, pageSize);

    const finalPdfBytes = await pdfDoc.save();
    const newPdfFile = new File([finalPdfBytes], pdfFile.name, { type: 'application/pdf' });

    const newRotations: { [key: number]: number } = {};
    for (const pageNumStr in rotations) {
        const pageNum = parseInt(pageNumStr, 10);
        if (pageNum <= index) {
            newRotations[pageNum] = rotations[pageNum];
        } else {
            newRotations[pageNum + 1] = rotations[pageNum];
        }
    }
    setRotations(newRotations);
    setPdfFile(newPdfFile);
  };

  const handleReorderPages = async (oldIndex: number, newIndex: number) => {
    if (!pdfFile || oldIndex === newIndex) return;
  
    const existingPdfBytes = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
    const [movedPage] = await pdfDoc.copyPages(pdfDoc, [oldIndex]);
    pdfDoc.removePage(oldIndex);
    pdfDoc.insertPage(newIndex, movedPage);
  
    const finalPdfBytes = await pdfDoc.save();
    const newPdfFile = new File([finalPdfBytes], pdfFile.name, { type: 'application/pdf' });
    
    setPdfFile(newPdfFile);
  };

  const renderContent = () => {
    if (!pdfFile) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-10 text-center">
          <h2 className="text-xl font-semibold mb-2">開始編輯您的 PDF</h2>
          <p className="mb-4">從您的電腦上傳一個檔案，即可開始。</p>
          <label className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 cursor-pointer">
            選擇檔案
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      );
    }

    if (viewMode === 'reorder') {
      return <ReorderView thumbnails={thumbnails} onReorder={handleReorderPages} />;
    }

    return (
      <div className="flex w-full h-full">
        <div className="w-[15%] flex-shrink-0 bg-card border-r">
          <Sidebar
            currentPage={currentPage}
            onPageClick={handlePageSelect}
            onInsertPdf={handleInsertPdf}
            onInsertBlankPage={handleInsertBlankPage}
            thumbnails={thumbnails}
            isLoading={isLoadingThumbnails}
          />
        </div>
        <div className="flex-grow flex flex-col relative">
          <div className="flex-grow bg-background shadow-inner overflow-hidden">
            <PdfCanvas
              pdfFile={pdfFile}
              onTotalPages={setTotalPages}
              onCurrentPageChange={setCurrentPage}
              zoom={zoom}
              rotations={rotations}
              scrollToPage={scrollToPage}
              onScrollComplete={handleScrollComplete}
            />
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
    );
  };


  return (
    <div className="w-full h-full flex flex-col bg-muted/40">
      <div className="bg-card border-b p-2">
        <Toolbar 
          currentTool={toolMode}
          setTool={setToolMode}
          color={color}
          setColor={setColor}
          onDownload={handleDownload}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>
      <div className="flex-grow overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default PdfEditor;
