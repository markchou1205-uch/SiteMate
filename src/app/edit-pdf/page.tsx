// File: page.tsx

"use client";

import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import { Loader2 } from 'lucide-react';

import { Toolbar } from "./components/toolbar";
import PropertyPanel from "./components/PropertyPanel";
import InteractivePdfCanvas from "./components/InteractivePdfCanvas";
import PageThumbnailList from "./components/PageThumbnailList";
import ZoomControls from "./components/ZoomControls";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleTextEditStart = useCallback(() => setIsEditingText(true), []);
  const handleTextEditEnd = useCallback(() => setIsEditingText(false), []);

  const handleStyleChange = useCallback((styleUpdate: Partial<typeof selectedTextStyle>) => {
    setSelectedTextStyle((prev) => ({ ...prev, ...styleUpdate }));
  }, []);

  const handleZoomIn = useCallback(() => setScale((s) => Math.min(s + 0.2, 3)), []);
  const handleZoomOut = useCallback(() => setScale((s) => Math.max(s - 0.2, 0.2)), []);

  const handleRotateActivePage = useCallback((direction: 'left' | 'right') => {
    if (!pdfDoc || currentPage < 1) return;
    const pageIndex = currentPage - 1;

    const rotate = async () => {
      const newDoc = await pdfDoc.copy();
      const page = newDoc.getPage(pageIndex);
      const currentRotation = page.getRotation().angle;
      const rotationAmount = direction === 'right' ? 90 : -90;
      page.setRotation(degrees((currentRotation + rotationAmount + 360) % 360));
      setPdfDoc(newDoc);
      setDocVersion(v => v + 1);
      toast({ title: "Page Rotated", description: `Page ${pageIndex + 1} has been rotated.` });
    };
    rotate();
  }, [pdfDoc, currentPage, toast]);

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
        toast({ title: "PDF Loaded", description: `${file.name} is ready for editing.` });
      } catch (error) {
        console.error("Failed to load PDF", error);
        toast({ title: "Error Loading PDF", description: "Could not load the selected file.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  }, [toast]);

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
       toast({ title: "Thumbnail Error", description: "Could not generate page thumbnails.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  }, [pdfDoc, toast]);

  useEffect(() => {
    updateThumbnails();
  }, [docVersion, pdfDoc, updateThumbnails]);


  const handleAddBlankPage = useCallback(async (pageIndex: number) => {
    if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    // Copy the first page to get the correct dimensions and orientation
    const [templatePage] = await newDoc.copyPages(pdfDoc, [0]);
    const newPage = newDoc.insertPage(pageIndex, templatePage);
    // Clear the copied content by drawing a white rectangle over it
    newPage.drawRectangle({
        x: 0,
        y: 0,
        width: newPage.getWidth(),
        height: newPage.getHeight(),
        color: rgb(1, 1, 1),
    });
    const helveticaFont = await newDoc.embedFont(StandardFonts.Helvetica);
    newPage.drawText('This is a new blank page.', {
      x: 50,
      y: newPage.getHeight() - 50,
      font: helveticaFont,
      size: 24,
      color: rgb(0, 0, 0),
    });
    setPdfDoc(newDoc);
    setNumPages(newDoc.getPageCount());
    setDocVersion(v => v + 1);
    toast({ title: "Page Added", description: "A blank page has been inserted." });
  }, [pdfDoc, toast]);

  const handleDeletePage = useCallback(async (pageIndex: number) => {
    if (!pdfDoc || pdfDoc.getPageCount() <= 1) {
      toast({ title: "Cannot Delete", description: "Cannot delete the last page of the document.", variant: "destructive"});
      return;
    };
    const newDoc = await pdfDoc.copy();
    newDoc.removePage(pageIndex);
    setPdfDoc(newDoc);
    setNumPages(newDoc.getPageCount());
    setDocVersion(v => v + 1);
    toast({ title: "Page Deleted", description: `Page ${pageIndex + 1} has been removed.` });
  }, [pdfDoc, toast]);
  
  const handleRotatePage = useCallback(async (pageIndex: number) => {
    if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    const page = newDoc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + 90) % 360));
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
    toast({ title: "Page Rotated", description: `Page ${pageIndex + 1} has been rotated.` });
  }, [pdfDoc, toast]);
   
  const handleReorderPages = useCallback(async (oldIndex: number, newIndex: number) => {
    if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    const [page] = await newDoc.copyPages(pdfDoc, [oldIndex]);
    newDoc.removePage(oldIndex > newIndex ? oldIndex + 1 : oldIndex);
    newDoc.insertPage(newIndex, page);
    
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
    toast({ title: "Page Moved", description: `Page ${oldIndex + 1} moved to position ${newIndex + 1}.` });
  }, [pdfDoc, toast]);

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
      toast({ title: "Download Started", description: "Your edited PDF is downloading." });
    } catch (error) {
      console.error("Failed to download PDF", error);
      toast({ title: "Download Error", description: "Could not save the PDF.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [pdfDoc, toast]);

  const handlePageClick = useCallback((pageNumber: number) => {
    const pageElement = document.getElementById(`pdf-page-${pageNumber}`);
    pageElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentPage(pageNumber);
  }, []);

  const handleNewFile = useCallback(() => {
    const uploadEl = document.getElementById('pdf-upload');
    if (uploadEl) uploadEl.click();
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
       {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">Processing...</p>
        </div>
      )}
      <header className="relative z-20 flex items-center justify-between border-b bg-secondary p-2 shadow-md">
        <Toolbar 
          selectedTextObject={!!selectedObjectId}
          style={selectedTextStyle}
          onTextStyleChange={handleStyleChange}
          onNewFile={handleNewFile}
          onUpload={handleNewFile}
          onDownload={handleDownload}
        />
      </header>
      <input type="file" id="pdf-upload" className="hidden" onChange={handleFileChange} accept="application/pdf" />

      <div className="flex flex-1 overflow-hidden">
        {pdfDoc && (
          <aside className="w-[15%] h-full border-r overflow-y-auto bg-gray-100 flex-shrink-0">
            <PageThumbnailList
              thumbnails={pageThumbnails}
              currentPage={currentPage}
              onPageClick={handlePageClick}
              onAddBlankPage={handleAddBlankPage}
              onDeletePage={handleDeletePage}
              onRotatePage={handleRotatePage}
              onReorderPages={handleReorderPages}
            />
          </aside>
        )}

        <main className={`h-full overflow-auto bg-muted flex-grow`}>
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
        </main>
        
        {pdfDoc && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
            <ZoomControls 
              scale={scale} 
              onZoomIn={handleZoomIn} 
              onZoomOut={handleZoomOut}
              onRotateLeft={() => handleRotateActivePage('left')}
              onRotateRight={() => handleRotateActivePage('right')}
            />
          </div>
        )}

        <PropertyPanel
          isVisible={isEditingText}
          onClose={handleTextEditEnd}
          currentStyle={selectedTextStyle}
          onStyleChange={handleStyleChange}
        />
      </div>
    </div>
  );
}
