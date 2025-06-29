// File: page.tsx

"use client";

import { degrees } from 'pdf-lib';
import { useEffect, useRef, useState, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

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
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const handleStyleChange = (styleUpdate: Partial<typeof selectedTextStyle>) => {
    setSelectedTextStyle((prev) => ({ ...prev, ...styleUpdate }));
  };

  const handleClickCanvas = () => {
    setIsEditingText(false);
    setSelectedObjectId(null);
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.2));
  const handleRotateRight = () => setRotation((r) => (r + 90) % 360);
  const handleRotateLeft = () => setRotation((r) => (r - 90 + 360) % 360);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer);
        setPdfDoc(doc);
        setNumPages(doc.getPageCount());
        setRotation(0);
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
  };

  const updateThumbnails = useCallback(async () => {
    if (!pdfDoc) return;
    setIsLoading(true);
    const thumbs: string[] = [];
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
    setIsLoading(false);
  }, [pdfDoc]);

  useEffect(() => {
    updateThumbnails();
  }, [docVersion, pdfDoc, updateThumbnails]);


  const handleAddBlankPage = async (pageIndex: number) => {
    if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    const newPage = newDoc.insertPage(pageIndex);
    const { width, height } = newPage.getSize();
    const helveticaFont = await newDoc.embedFont(StandardFonts.Helvetica);
    newPage.drawText('This is a new blank page.', {
      x: 50,
      y: height - 50,
      font: helveticaFont,
      size: 24,
      color: rgb(0, 0, 0),
    });
    setPdfDoc(newDoc);
    setNumPages(newDoc.getPageCount());
    setDocVersion(v => v + 1);
    toast({ title: "Page Added", description: "A blank page has been inserted." });
  };

  const handleDeletePage = async (pageIndex: number) => {
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
  };
  
  const handleRotatePage = async (pageIndex: number) => {
    if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    const page = newDoc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + 90) % 360));
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
    toast({ title: "Page Rotated", description: `Page ${pageIndex + 1} has been rotated.` });
  };
   
  const handleReorderPages = async (oldIndex: number, newIndex: number) => {
    if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    const [page] = await newDoc.copyPages(pdfDoc, [oldIndex]);
    newDoc.removePage(oldIndex > newIndex ? oldIndex + 1 : oldIndex);
    newDoc.insertPage(newIndex, page);
    
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
    toast({ title: "Page Moved", description: `Page ${oldIndex + 1} moved to position ${newIndex + 1}.` });
  };

  const handleDownload = async () => {
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
  };

  const handlePageClick = (pageNumber: number) => {
    const pageElement = document.getElementById(`pdf-page-${pageNumber}`);
    pageElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrentPage(pageNumber);
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
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
          onNewFile={() => document.getElementById('pdf-upload')?.click()}
          onUpload={() => document.getElementById('pdf-upload')?.click()}
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
            rotation={rotation}
            onTextEditStart={() => setIsEditingText(true)}
            onTextEditEnd={() => setIsEditingText(false)}
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
              onRotateLeft={handleRotateLeft}
              onRotateRight={handleRotateRight}
            />
          </div>
        )}

        <PropertyPanel
          isVisible={isEditingText}
          onClose={() => setIsEditingText(false)}
          currentStyle={selectedTextStyle}
          onStyleChange={handleStyleChange}
        />
      </div>
    </div>
  );
}
