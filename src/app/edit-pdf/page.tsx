// File: page.tsx
"use client";

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { Upload, Edit } from 'lucide-react';
import { Loader2 } from 'lucide-react';

import { Toolbar } from "./components/toolbar";
import PropertyPanel from "./components/PropertyPanel";
import InteractivePdfCanvas from "./components/InteractivePdfCanvas";
import PageThumbnailList from "./components/PageThumbnailList";
import ZoomControls from "./components/ZoomControls";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Page() {
  const [isEditingText, setIsEditingText] = useState(false);
  const [selectedTextStyle, setSelectedTextStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
    color: "#000000",
  });

  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [docVersion, setDocVersion] = useState(0);
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);

  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [pageObjects, setPageObjects] = useState<any[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pageToDeleteIndex, setPageToDeleteIndex] = useState<number | null>(null);
  const [insertPdfAtIndex, setInsertPdfAtIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertPdfFileInputRef = useRef<HTMLInputElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const handleTextEditStart = useCallback(() => setIsEditingText(true), []);
  const handleTextEditEnd = useCallback(() => setIsEditingText(false), []);

  const handleStyleChange = useCallback((styleUpdate: Partial<typeof selectedTextStyle>) => {
    setSelectedTextStyle((prev) => ({ ...prev, ...styleUpdate }));
  }, []);

  const handleZoomIn = useCallback(() => setScale((s) => Math.min(s + 0.2, 3)), []);
  const handleZoomOut = useCallback(() => setScale((s) => Math.max(s - 0.2, 0.2)), []);

  const handleRotateActivePage = useCallback(async (direction: 'left' | 'right') => {
    if (!pdfDoc || currentPage < 1) return;
    const pageIndex = currentPage - 1;

    const newDoc = await pdfDoc.copy();
    const page = newDoc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    const rotationAmount = direction === 'right' ? 90 : -90;
    page.setRotation(degrees((currentRotation + rotationAmount + 360) % 360));
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
  }, [pdfDoc, currentPage]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer);
        setPdfDoc(doc);
        setNumPages(doc.getPageCount());
        setCurrentPage(1);
        setScale(1);
        setDocVersion(v => v + 1);
      } catch (error) {
        console.error("Failed to load PDF", error);
      } finally {
        setIsLoading(false);
      }
    }
     if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleDownload = useCallback(async () => {
    if (!pdfDoc) return;
    setIsLoading(true);
    try {
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "edited.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF", error);
    } finally {
      setIsLoading(false);
    }
  }, [pdfDoc]);

  const updateThumbnails = useCallback(async () => {
    if (!pdfDoc) {
      setPageThumbnails([]);
      return;
    }
    setIsLoading(true);
    const thumbs: string[] = [];
    try {
      const pdfBytes = await pdfDoc.save();
      const pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;

      for (let i = 1; i <= pdfJsDoc.numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        thumbs.push(canvas.toDataURL());
      }
      setPageThumbnails(thumbs);
    } catch (error) {
       console.error("Failed to update thumbnails", error);
    } finally {
      setIsLoading(false);
    }
  }, [pdfDoc]);

  useEffect(() => {
    updateThumbnails();
  }, [docVersion, pdfDoc, updateThumbnails]);

  const handlePageClick = useCallback((pageNumber: number) => {
    const pageElement = document.getElementById(`pdf-page-${pageNumber}`);
    pageElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

 const onAddBlankPage = useCallback(async (index: number) => {
    if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    const pageToCopyDim = newDoc.getPage(index > 0 ? index - 1 : 0);
    const { width, height } = pageToCopyDim.getSize();
    newDoc.insertPage(index, [width, height]);
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
  }, [pdfDoc]);

  const onDeletePage = useCallback((index: number) => {
    setPageToDeleteIndex(index);
    setIsDeleteConfirmOpen(true);
  }, []);

  const confirmDeletePage = useCallback(async () => {
    if (pageToDeleteIndex === null || !pdfDoc || pdfDoc.getPageCount() <= 1) {
        setIsDeleteConfirmOpen(false);
        return;
    };
    const newDoc = await pdfDoc.copy();
    newDoc.removePage(pageToDeleteIndex);
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
    setIsDeleteConfirmOpen(false);
    setPageToDeleteIndex(null);
  }, [pdfDoc, pageToDeleteIndex]);

  const onRotatePage = useCallback(async (index: number) => {
     if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    const page = newDoc.getPage(index);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + 90) % 360));
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
  }, [pdfDoc]);
  
  const onReorderPages = useCallback(async (oldIndex: number, newIndex: number) => {
    if (!pdfDoc) return;

    const pageCount = pdfDoc.getPageCount();
    const indices = Array.from({ length: pageCount }, (_, i) => i);

    const [movedIndex] = indices.splice(oldIndex, 1);
    indices.splice(newIndex, 0, movedIndex);

    const newDoc = await PDFDocument.create();
    const pagesToCopy = await newDoc.copyPages(pdfDoc, indices);
    pagesToCopy.forEach(page => {
        newDoc.addPage(page);
    });
    
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
  }, [pdfDoc]);

  const handlePrepareInsertPdf = useCallback((index: number) => {
    setInsertPdfAtIndex(index);
    insertPdfFileInputRef.current?.click();
  }, []);
  
  const onInsertPdfSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pdfDoc) return;

    setIsLoading(true);
    try {
        const newPdfBytes = await file.arrayBuffer();
        const newPdfToInsert = await PDFDocument.load(newPdfBytes);
        
        const newDoc = await pdfDoc.copy();
        const indicesToCopy = newPdfToInsert.getPageIndices();
        const copiedPages = await newDoc.copyPages(newPdfToInsert, indicesToCopy);

        copiedPages.forEach((page, i) => {
            newDoc.insertPage(insertPdfAtIndex + i, page);
        });
        
        setPdfDoc(newDoc);
        setDocVersion(v => v + 1);
    } catch (error) {
        console.error("Failed to insert PDF", error);
    } finally {
        setIsLoading(false);
        if (e.target) e.target.value = '';
    }
  }, [pdfDoc, insertPdfAtIndex]);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container || !pdfLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.id.split('-')[2]);
            if (!isNaN(pageNum)) {
              setCurrentPage(pageNum);
              return; 
            }
          }
        }
      },
      { root: container, threshold: 0.4 }
    );

    const pageElements = Array.from(container.querySelectorAll('div[id^="pdf-page-"]'));
    pageElements.forEach(el => observer.observe(el));

    return () => {
      pageElements.forEach(el => observer.unobserve(el));
    };
  }, [pdfLoaded, docVersion, scale]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">Processing...</p>
        </div>
      )}
      
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要刪除此頁面嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="flex-shrink-0 border-b shadow-sm bg-card z-30">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <Edit className="h-6 w-6"/>
                PDF Editor Pro
            </h1>
            {pdfDoc && (
                 <Toolbar 
                    selectedTextObject={!!selectedObjectId}
                    style={selectedTextStyle}
                    onTextStyleChange={handleStyleChange}
                    onNewFile={triggerFileUpload}
                    onUpload={triggerFileUpload}
                    onDownload={handleDownload}
                 />
            )}
        </div>
      </header>
      
      <main className="flex-grow flex overflow-hidden">
        {!pdfDoc ? (
             <div className="flex-grow flex items-center justify-center p-6">
              <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <Edit className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>Professional PDF Editor</CardTitle>
                  <CardDescription>Upload a file to start editing, signing, and organizing.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                    onClick={triggerFileUpload}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground text-center">Click or drag a file to upload</p>
                    <p className="text-xs text-muted-foreground mt-2">PDF files only</p>
                  </div>
                </CardContent>
              </Card>
            </div>
        ) : (
            <>
                <aside className="w-[15%] h-full border-r overflow-y-auto bg-gray-100 flex-shrink-0">
                    <PageThumbnailList
                        key={docVersion}
                        thumbnails={pageThumbnails}
                        currentPage={currentPage}
                        onPageClick={handlePageClick}
                        onAddBlankPage={onAddBlankPage}
                        onDeletePage={onDeletePage}
                        onRotatePage={onRotatePage}
                        onReorderPages={onReorderPages}
                        onPrepareInsertPdf={handlePrepareInsertPdf}
                    />
                </aside>
                
                <div ref={mainContainerRef} className="flex-grow h-full overflow-auto bg-muted relative">
                    <InteractivePdfCanvas
                        pdfDoc={pdfDoc}
                        docVersion={docVersion}
                        setNumPages={setNumPages}
                        scale={scale}
                        onTextEditStart={handleTextEditStart}
                        onTextEditEnd={handleTextEditEnd}
                        selectedStyle={selectedTextStyle}
                        selectedObjectId={selectedObjectId}
                        setSelectedObjectId={setSelectedObjectId}
                        pageObjects={pageObjects}
                        setPageObjects={setPageObjects}
                        setPdfLoaded={setPdfLoaded}
                    />

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
                        <ZoomControls 
                            scale={scale} 
                            onZoomIn={handleZoomIn} 
                            onZoomOut={handleZoomOut}
                            onRotateLeft={() => handleRotateActivePage('left')}
                            onRotateRight={() => handleRotateActivePage('right')}
                        />
                    </div>

                    <PropertyPanel
                        isVisible={isEditingText}
                        onClose={handleTextEditEnd}
                        currentStyle={selectedTextStyle}
                        onStyleChange={handleStyleChange}
                    />
                </div>
            </>
        )}
      </main>

      <input 
        type="file" 
        id="pdf-upload" 
        ref={fileInputRef}
        className="hidden" 
        onChange={handleFileChange} 
        accept="application/pdf" 
      />
      <input
        type="file"
        ref={insertPdfFileInputRef}
        className="hidden"
        accept="application/pdf"
        onChange={onInsertPdfSelected}
      />
    </div>
  );
}
