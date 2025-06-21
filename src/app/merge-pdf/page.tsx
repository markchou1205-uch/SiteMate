
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import Sortable from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Combine, Download, ArrowLeft, PlusCircle, FilePlus } from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageObject {
  id: string;
  sourceCanvas: HTMLCanvasElement;
  fileName: string;
}

const PageThumbnail = React.memo(({ pageObj, index, isSelected, onClick }: { pageObj: PageObject; index: number; isSelected: boolean; onClick: (id: string) => void; }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const previewCanvas = canvasRef.current;
      const ctx = previewCanvas.getContext('2d');
      if (!ctx) return;

      const sourceCanvas = pageObj.sourceCanvas;
      const aspectRatio = sourceCanvas.width / sourceCanvas.height;
      const displayWidth = 150;
      previewCanvas.width = displayWidth;
      previewCanvas.height = displayWidth / aspectRatio;
      ctx.drawImage(sourceCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
    }
  }, [pageObj.sourceCanvas]);

  return (
    <div
      className={`page-preview-wrapper p-2 border-2 rounded-lg cursor-pointer transition-all bg-card hover:border-primary ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
      data-id={pageObj.id}
      onClick={() => onClick(pageObj.id)}
    >
      <canvas ref={canvasRef} className="rounded-md shadow-md w-full h-auto"></canvas>
      <div className="text-xs text-muted-foreground mt-1 text-center truncate" title={pageObj.fileName}>
        Page {index + 1}
      </div>
    </div>
  );
});
PageThumbnail.displayName = 'PageThumbnail';


export default function MergePdfPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [isInsertConfirmOpen, setIsInsertConfirmOpen] = useState(false);
  const [pendingInsertFile, setPendingInsertFile] = useState<File | null>(null);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after'>('after');
  
  const pdfUploadRef = useRef<HTMLInputElement>(null);
  const insertPdfRef = useRef<HTMLInputElement>(null);
  const sortableContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);

  const processPdfFile = async (file: File): Promise<PageObject[]> => {
    setLoadingMessage(`Processing ${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const loadedPageObjects: PageObject[] = [];
    for (let i = 1; i <= pdfDocProxy.numPages; i++) {
      const page = await pdfDocProxy.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
      loadedPageObjects.push({ id: uuidv4(), sourceCanvas: canvas, fileName: file.name });
    }
    return loadedPageObjects;
  };
  
  const handleInitialUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    try {
      let allNewPages: PageObject[] = [];
      for (const file of Array.from(files)) {
          if (file.type.includes('pdf')) {
              const newPages = await processPdfFile(file);
              allNewPages.push(...newPages);
          }
      }
      setPageObjects(allNewPages);
      if (allNewPages.length > 0) {
        toast({ title: "PDFs Loaded", description: `${allNewPages.length} pages loaded successfully.`});
      }
    } catch (err: any) {
      toast({ title: "Failed to load PDF", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (pdfUploadRef.current) pdfUploadRef.current.value = '';
    }
  };

  const handleInsertFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file || !file.type.includes('pdf')) {
        if(file) toast({ title: "Invalid File", description: "Please select a PDF file.", variant: "destructive" });
        return;
    }

    setPendingInsertFile(file);
    if (!selectedPageId) {
      setIsInsertConfirmOpen(true);
    } else {
      proceedWithInsert(file);
    }
  };
  
  const proceedWithInsert = async (fileToInsert?: File) => {
    const file = fileToInsert || pendingInsertFile;
    if (!file) return;

    setIsLoading(true);
    try {
      const newPages = await processPdfFile(file);
      
      let insertAtIndex = pageObjects.findIndex(p => p.id === selectedPageId);
      if (insertAtIndex === -1) {
        // If no page is selected or selection is lost, append to end
        insertAtIndex = pageObjects.length;
      } else {
        if (insertPosition === 'after') {
          insertAtIndex += 1;
        }
      }
      
      setPageObjects(prev => {
        const newArray = [...prev];
        newArray.splice(insertAtIndex, 0, ...newPages);
        return newArray;
      });
      
      toast({ title: "PDF Inserted", description: `${file.name} was added to the document.` });

    } catch (err: any) {
      toast({ title: "Failed to insert PDF", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setPendingInsertFile(null);
      setIsInsertConfirmOpen(false);
      setSelectedPageId(null);
      if (insertPdfRef.current) insertPdfRef.current.value = '';
    }
  };
  
  const handleDownload = async () => {
    if (pageObjects.length === 0) {
        toast({ title: "No pages to download", variant: "destructive" });
        return;
    }
    setIsDownloading(true);
    try {
        const pdfDocOut = await PDFLibDocument.create();
        for (const pageObj of pageObjects) {
            const { sourceCanvas } = pageObj;
            const pngImage = await pdfDocOut.embedPng(sourceCanvas.toDataURL('image/png'));
            const pdfPage = pdfDocOut.addPage([sourceCanvas.width, sourceCanvas.height]);
            pdfPage.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: sourceCanvas.width,
                height: sourceCanvas.height,
            });
        }
        
        const pdfBytes = await pdfDocOut.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DocuPilot_merged.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Download Successful", description: "Merged PDF has been downloaded." });

    } catch (err: any) {
        toast({ title: "Download Failed", description: err.message, variant: "destructive" });
    } finally {
        setIsDownloading(false);
    }
  };
  
  // Setup SortableJS
  useEffect(() => {
    if (sortableContainerRef.current && !sortableInstanceRef.current) {
        sortableInstanceRef.current = Sortable.create(sortableContainerRef.current, {
            animation: 150,
            ghostClass: 'opacity-50',
            onEnd: (evt) => {
                if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
                setPageObjects(prev => {
                    const newArray = Array.from(prev);
                    const [movedItem] = newArray.splice(evt.oldIndex!, 1);
                    newArray.splice(evt.newIndex!, 0, movedItem);
                    return newArray;
                });
            }
        });
    }

    return () => {
      if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
      }
    };
  }, [pageObjects.length]); // Re-init if page count changes


  return (
    <div className="flex flex-col h-screen bg-background">
      {(isLoading || isDownloading) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">{isLoading ? loadingMessage : "Generating merged PDF..."}</p>
        </div>
      )}

      <AlertDialog open={isInsertConfirmOpen} onOpenChange={setIsInsertConfirmOpen}>
        <AlertDialogContent>
          <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>Confirm Insert Position</ShadAlertDialogTitle>
            <AlertDialogDescription>
              No page is selected. The new PDF will be appended to the end of the document. Do you want to continue?
            </AlertDialogDescription>
          </ShadAlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingInsertFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => proceedWithInsert()}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="p-4 border-b bg-card flex-shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-primary">Merge PDF Files</h1>
            <p className="text-sm text-muted-foreground">Combine multiple PDFs into one document and reorder pages.</p>
          </div>
        </div>
        {pageObjects.length > 0 && (
            <Button onClick={handleDownload} disabled={isDownloading}>
                <Download className="mr-2 h-4 w-4" />
                Download Merged PDF
            </Button>
        )}
      </header>

      <main className="flex-grow p-6 overflow-y-auto">
        {pageObjects.length === 0 ? (
          <Card 
            className="max-w-2xl mx-auto"
            onClick={() => pdfUploadRef.current?.click()}
          >
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <Combine className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Start by Uploading PDFs</CardTitle>
                <CardDescription>Select one or more PDF files to begin merging.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20">
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground text-center">Click here to select files</p>
                    <p className="text-xs text-muted-foreground mt-1">You can select multiple files</p>
                </div>
                <Input
                    type="file"
                    ref={pdfUploadRef}
                    onChange={handleInitialUpload}
                    accept="application/pdf"
                    multiple
                    className="hidden"
                />
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{pageObjects.length} pages loaded. Drag to reorder.</h2>
                <div className="flex gap-4">
                    {selectedPageId && (
                        <Card className="p-3 shadow-sm flex items-center gap-4">
                            <Label>Insert new PDF:</Label>
                             <RadioGroup value={insertPosition} onValueChange={(v: 'before'|'after') => setInsertPosition(v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="before" id="r-before" />
                                    <Label htmlFor="r-before">Before selected</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="after" id="r-after" />
                                    <Label htmlFor="r-after">After selected</Label>
                                </div>
                            </RadioGroup>
                        </Card>
                    )}
                    <Button variant="outline" onClick={() => insertPdfRef.current?.click()}>
                        <FilePlus className="mr-2 h-4 w-4" /> Add another PDF
                    </Button>
                     <Input
                        type="file"
                        ref={insertPdfRef}
                        onChange={handleInsertFileSelected}
                        accept="application/pdf"
                        className="hidden"
                    />
                </div>
            </div>
            <div ref={sortableContainerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg">
                {pageObjects.map((page, index) => (
                    <PageThumbnail 
                        key={page.id}
                        pageObj={page}
                        index={index}
                        isSelected={selectedPageId === page.id}
                        onClick={setSelectedPageId}
                    />
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
