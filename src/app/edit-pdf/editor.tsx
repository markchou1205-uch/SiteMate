
"use client";

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from 'fabric';
import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

import { Upload, Edit, Download, Loader2, FilePlus, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Toolbar } from "./components/toolbar";
import PropertyPanel from "./components/PropertyPanel";
import ShapePropertyPanel from "./components/ShapePropertyPanel";
import InteractivePdfCanvas from "./components/InteractivePdfCanvas";
import PageThumbnailList from "./components/PageThumbnailList";
import ZoomControls from "./components/ZoomControls";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type DrawingTool = 'circle' | 'rect' | 'triangle' | 'freedraw' | null;
type InsertPosition = 'start' | 'end' | 'before' | 'after';

export default function Editor() {
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
  const [fabricCanvases, setFabricCanvases] = useState<(fabric.Canvas | null)[]>([]);
  const [fabricObjects, setFabricObjects] = useState<string[]>([]);

  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [drawingTool, setDrawingTool] = useState<DrawingTool>(null);
  const [isShapePanelOpen, setIsShapePanelOpen] = useState(false);
  const [activeShape, setActiveShape] = useState<fabric.Object | null>(null);

  const [scale, setScale] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pageToDeleteIndex, setPageToDeleteIndex] = useState<number | null>(null);
  const [isOpenFileConfirmOpen, setIsOpenFileConfirmOpen] = useState(false);
  const [insertPdfPosition, setInsertPdfPosition] = useState<{ position: InsertPosition, index?: number }>({ position: 'end' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const insertPdfFileInputRef = useRef<HTMLInputElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSetDrawingTool = useCallback((tool: DrawingTool) => {
    console.log('PdfEditor: Setting drawing tool to:', tool);
    setDrawingTool(tool);
  }, []);

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
        const pageCount = doc.getPageCount();
        setPdfDoc(doc);
        setNumPages(pageCount);
        setFabricObjects(new Array(pageCount).fill('{}'));
        setCurrentPage(1);
        setScale(1);
        setDocVersion(v => v + 1);
      } catch (error) {
        console.error("Failed to load PDF", error);
        toast({ variant: 'destructive', title: 'Error loading PDF', description: 'The file might be corrupt or invalid.' });
      } finally {
        setIsLoading(false);
      }
    }
     if (fileInputRef.current) fileInputRef.current.value = '';
     setIsOpenFileConfirmOpen(false);
  }, [toast]);
  
  const handleOpenFileRequest = useCallback(() => {
    if (pdfDoc) {
      setIsOpenFileConfirmOpen(true);
    } else {
      fileInputRef.current?.click();
    }
  }, [pdfDoc]);

  const confirmOpenFile = useCallback(() => {
    setPdfDoc(null);
    setPageThumbnails([]);
    setFabricObjects([]);
    setNumPages(0);
    setCurrentPage(1);
    fileInputRef.current?.click();
    setIsOpenFileConfirmOpen(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!pdfDoc) return;
    setIsLoading(true);
    try {
      const finalDoc = await pdfDoc.copy();
      for (let i = 0; i < finalDoc.getPageCount(); i++) {
        const canvas = fabricCanvases[i];
        if (canvas && !canvas.isEmpty()) {
          const page = finalDoc.getPage(i);
          const { width, height } = page.getSize();
          const pngDataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
          const pngImage = await finalDoc.embedPng(pngDataUrl);
          page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width,
            height,
          });
        }
      }
      const pdfBytes = await finalDoc.save();
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
      toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the final PDF.' });
    } finally {
      setIsLoading(false);
    }
  }, [pdfDoc, fabricCanvases, toast]);

  const handleDownloadRequest = useCallback(async (format: string) => {
    if (!pdfDoc) return;

    if (format === 'pdf') {
      await handleDownload();
      return;
    }

    setIsLoading(true);
    try {
      const pdfBytes = await pdfDoc.save();
      const file = new File([pdfBytes], 'edited.pdf', { type: 'application/pdf' });
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);
      formData.append("output_dir", "./");

      const response = await fetch("https://pdfsolution.dpdns.org/upload", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Conversion failed with status ${response.status}`);
      }

      const resBlob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFilename = `result.${format === 'word' ? 'docx' : format}`;
      if (format === 'jpg' || format === 'jpeg' || format === 'png') downloadFilename = 'result.zip';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          downloadFilename = match[1];
        }
      }

      const url = window.URL.createObjectURL(resBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Failed to convert to ${format}`, error);
      toast({ variant: 'destructive', title: `Failed to convert to ${format}`, description: 'An error occurred during conversion.' });
    } finally {
      setIsLoading(false);
    }
  }, [pdfDoc, handleDownload, toast]);


  const updateThumbnails = useCallback(async () => {
    if (!pdfDoc) {
      setPageThumbnails([]);
      return;
    }
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
    }
  }, [pdfDoc]);

  useEffect(() => {
    updateThumbnails();
  }, [docVersion, pdfDoc, updateThumbnails]);

  const handlePageClick = useCallback((pageNumber: number) => {
    const pageElement = document.getElementById(`pdf-page-${pageNumber}`);
    pageElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

 const onAddBlankPage = useCallback(async (index: number) => {
    if (!pdfDoc) return;
    const newDoc = await pdfDoc.copy();
    const pageToCopyDim = newDoc.getPage(index > 0 ? index - 1 : 0);
    const { width, height } = pageToCopyDim.getSize();
    newDoc.insertPage(index, [width, height]);
    
    setFabricObjects(currentFabricObjects => {
        const newFabricObjects = [...currentFabricObjects];
        newFabricObjects.splice(index, 0, '{}');
        return newFabricObjects;
    });

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
    
    setFabricObjects(currentFabricObjects => {
        const newFabricObjects = [...currentFabricObjects];
        newFabricObjects.splice(pageToDeleteIndex, 1);
        return newFabricObjects;
    });

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
    if (oldIndex < 0 || oldIndex >= pageCount || newIndex < 0 || newIndex >= pageCount) return;
    
    const newDoc = await PDFDocument.create();
    
    const indices = Array.from({ length: pageCount }, (_, i) => i);
    const [movedIndex] = indices.splice(oldIndex, 1);
    indices.splice(newIndex, 0, movedIndex);
    const pagesToCopy = await newDoc.copyPages(pdfDoc, indices);
    pagesToCopy.forEach(page => newDoc.addPage(page));
    
    setFabricObjects(currentFabricObjects => {
        const newFabricObjects = Array.from(currentFabricObjects);
        const [movedObject] = newFabricObjects.splice(oldIndex, 1);
        newFabricObjects.splice(newIndex, 0, movedObject);
        return newFabricObjects;
    });
    
    setPdfDoc(newDoc);
    setDocVersion(v => v + 1);
  }, [pdfDoc]);

  const handleInsertPdfRequest = useCallback((position: InsertPosition, index?: number) => {
    setInsertPdfPosition({ position, index });
    insertPdfFileInputRef.current?.click();
  }, []);
  
  const onInsertPdfSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pdfDoc) return;

    setIsLoading(true);
    try {
        const newPdfBytes = await file.arrayBuffer();
        const newPdfToInsert = await PDFDocument.load(newPdfBytes);
        
        let insertAtIndex = 0;
        switch(insertPdfPosition.position) {
            case 'start':
                insertAtIndex = 0;
                break;
            case 'before':
                insertAtIndex = insertPdfPosition.index !== undefined ? insertPdfPosition.index : 0;
                break;
            case 'after':
                insertAtIndex = insertPdfPosition.index !== undefined ? insertPdfPosition.index + 1 : pdfDoc.getPageCount();
                break;
            case 'end':
                insertAtIndex = pdfDoc.getPageCount();
                break;
        }

        const newDoc = await pdfDoc.copy();
        const indicesToCopy = newPdfToInsert.getPageIndices();
        const copiedPages = await newDoc.copyPages(newPdfToInsert, indicesToCopy);

        copiedPages.forEach((page, i) => newDoc.insertPage(insertAtIndex + i, page));
        
        const newFabricObjectsData = new Array(copiedPages.length).fill('{}');
        setFabricObjects(currentFabricObjects => {
            const newArray = [...currentFabricObjects];
            newArray.splice(insertAtIndex, 0, ...newFabricObjectsData);
            return newArray;
        });

        setPdfDoc(newDoc);
        setDocVersion(v => v + 1);
    } catch (error) {
        console.error("Failed to insert PDF", error);
        toast({ variant: 'destructive', title: 'Failed to insert PDF' });
    } finally {
        setIsLoading(false);
        if (e.target) e.target.value = '';
    }
  }, [pdfDoc, insertPdfPosition, toast]);

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
  
  const handleUpdateFabricObject = useCallback((index: number, canvas: fabric.Canvas) => {
    setFabricObjects(currentObjects => {
      const newObjects = [...currentObjects];
      newObjects[index] = JSON.stringify(canvas.toJSON());
      return newObjects;
    });
  }, []);
  
  const handleShapeDoubleClick = (object: fabric.Object) => {
      setActiveShape(object);
      setIsShapePanelOpen(true);
  };
  
  const handleCloseShapePanel = () => {
      setIsShapePanelOpen(false);
      setActiveShape(null);
  };

  const handleDeleteObject = () => {
    fabricCanvases.forEach(canvas => {
        if (canvas && canvas.getActiveObject()) {
            canvas.remove(canvas.getActiveObject()!);
            canvas.renderAll();
        }
    });
  };

  const handleAddText = () => {
    const canvas = fabricCanvases[currentPage - 1];
    if (!canvas) return;

    const textbox = new fabric.IText('請輸入文字', {
        left: 50,
        top: 50,
        fontSize: 24,
        fill: 'black',
        fontFamily: 'Arial',
        padding: 5,
    });
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    textbox.enterEditing();
    canvas.renderAll();
  }

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

      <AlertDialog open={isOpenFileConfirmOpen} onOpenChange={setIsOpenFileConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>開啟新檔案</AlertDialogTitle>
                <AlertDialogDescription>
                    將會關閉目前開啟的文件，請確認已經下載目前的文件。
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={confirmOpenFile}>確定</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <header className="flex-shrink-0 bg-card z-40">
        <div className="px-4 py-3 flex items-center">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <Edit className="h-6 w-6"/>
                PDF Editor Pro
            </h1>
        </div>
      </header>

      {pdfDoc && (
        <div className="flex-shrink-0 border-b shadow-sm bg-card z-30 sticky top-0">
            <div className="px-4 py-2">
                 <Toolbar
                    onOpenFileRequest={handleOpenFileRequest}
                    onInsertPdfRequest={handleInsertPdfRequest}
                    onDownloadRequest={handleDownloadRequest}
                    onSetDrawingTool={handleSetDrawingTool}
                    onDeleteObject={handleDeleteObject}
                    onAddText={handleAddText}
                 />
            </div>
        </div>
      )}
      
      <main className={`flex-grow flex overflow-hidden ${!pdfDoc ? 'items-center justify-center' : ''}`}>
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
                    onClick={handleOpenFileRequest}
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
                        key={`thumb-list-${docVersion}`}
                        thumbnails={pageThumbnails}
                        currentPage={currentPage}
                        onPageClick={handlePageClick}
                        onAddBlankPage={onAddBlankPage}
                        onDeletePage={onDeletePage}
                        onRotatePage={onRotatePage}
                        onReorderPages={onReorderPages}
                        onPrepareInsertPdf={handleInsertPdfRequest}
                    />
                </aside>
                
                <div className="flex-grow h-full relative">
                  <div ref={mainContainerRef} className="h-full overflow-auto bg-muted">
                      <InteractivePdfCanvas
                          pdfDoc={pdfDoc}
                          docVersion={docVersion}
                          setNumPages={setNumPages}
                          scale={scale}
                          setPdfLoaded={setPdfLoaded}
                          fabricObjects={fabricObjects}
                          onUpdateFabricObject={handleUpdateFabricObject}
                          setFabricCanvases={setFabricCanvases}
                          drawingTool={drawingTool}
                          setDrawingTool={handleSetDrawingTool}
                          onShapeDoubleClick={handleShapeDoubleClick}
                      />
                  </div>

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

                  {activeShape && (
                      <ShapePropertyPanel
                          isVisible={isShapePanelOpen}
                          onClose={handleCloseShapePanel}
                          shape={activeShape}
                          onModify={() => fabricCanvases[currentPage - 1]?.renderAll()}
                      />
                  )}
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
