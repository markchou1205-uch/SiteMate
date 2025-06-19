
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import Sortable from 'sortablejs';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, RotateCw, X, Languages, Trash2, Download, Upload, Info, Shuffle, Search, Edit3 } from 'lucide-react';

// Set workerSrc for pdf.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const translations = {
    en: {
        pageTitle: 'PDF Page Editor',
        uploadLabel: 'Select PDF file to edit:',
        deletePages: 'Delete Selected',
        downloadPdf: 'Download Edited',
        insertAreaTitle: 'Insert PDF',
        insertOptionsTitle: 'Insertion Options',
        insertBeforeLabel: 'Insert before selected page',
        insertAfterLabel: 'Insert after selected page',
        selectFileToInsert: 'Select PDF to insert:',
        instSelect: 'Click page to select/deselect.',
        instDrag: 'Drag pages to reorder.',
        instZoom: 'Double click page to zoom.',
        modalCloseButton: 'Close',
        rotateLeft: 'Rotate Left 90°',
        rotateRight: 'Rotate Right 90°',
        resetRotation: 'Reset Rotation',
        generatingFile: 'Generating file, please wait…',
        loadError: 'Failed to load PDF',
        downloadError: 'Failed to download PDF',
        insertError: 'Failed to insert PDF',
        insertConfirmTitle: 'Confirm Insert Position',
        insertConfirmDescription: 'No page is selected. The new PDF will be inserted at the end of the current document. Continue?',
        confirm: 'Confirm',
        cancel: 'Cancel',
        noteInputPlaceholder: 'Add a temporary note (not saved with PDF)',
        pageManagement: 'Page Management',
        tools: 'Tools',
        fileOperations: 'File Operations',
        viewOptions: 'View Options',
        page: 'Page',
        uploadPdfFirst: 'Please upload a PDF first to enable this feature.',
        noPagesToDownload: 'No pages to download.',
        noPageSelected: 'No page selected.',
        loadingPdf: 'Loading PDF...',
        insertingPdf: 'Inserting PDF...',
        previewOf: 'Preview of Page',
        dropFileHere: 'Drop PDF file here or click to upload',
        dropInsertFileHere: 'Drop PDF here or click to select for insertion',
    },
    zh: {
        pageTitle: 'PDF 頁面編輯工具',
        uploadLabel: '選擇要編輯的 PDF 檔案：',
        deletePages: '刪除選取',
        downloadPdf: '下載編輯後檔案',
        insertAreaTitle: '插入 PDF',
        insertOptionsTitle: '插入選項',
        insertBeforeLabel: '插入此頁之前',
        insertAfterLabel: '插入此頁之後',
        selectFileToInsert: '選擇要插入的 PDF：',
        instSelect: '點選頁面以選取/取消。',
        instDrag: '拖曳頁面以調整順序。',
        instZoom: '雙擊頁面以放大預覽。',
        modalCloseButton: '關閉',
        rotateLeft: '向左旋轉90°',
        rotateRight: '向右旋轉90°',
        resetRotation: '重置旋轉',
        generatingFile: '正在產生檔案，請稍候…',
        loadError: '載入 PDF 失敗',
        downloadError: '下載 PDF 失敗',
        insertError: '插入 PDF 失敗',
        insertConfirmTitle: '確認插入位置',
        insertConfirmDescription: '尚未選取頁面。新 PDF 將插入到文件的末尾。是否繼續？',
        confirm: '確認',
        cancel: '取消',
        noteInputPlaceholder: '新增臨時筆記（不會儲存於 PDF）',
        pageManagement: '頁面管理',
        tools: '工具',
        fileOperations: '檔案操作',
        viewOptions: '檢視選項',
        page: '頁',
        uploadPdfFirst: '請先上傳 PDF 檔案以使用此功能。',
        noPagesToDownload: '沒有可下載的頁面。',
        noPageSelected: '未選取任何頁面。',
        loadingPdf: '正在載入 PDF...',
        insertingPdf: '正在插入 PDF...',
        previewOf: '預覽頁面',
        dropFileHere: '拖放 PDF 檔案至此或點擊上傳',
        dropInsertFileHere: '拖放 PDF 至此或點擊選擇以插入',
    }
};

export default function PdfEditorPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [zoomedPageData, setZoomedPageData] = useState<{ canvas: HTMLCanvasElement, index: number } | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('en');
  const [texts, setTexts] = useState(translations.en);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after'>('before');
  const [isInsertConfirmOpen, setIsInsertConfirmOpen] = useState(false);
  const [pendingInsertFile, setPendingInsertFile] = useState<File | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfUploadRef = useRef<HTMLInputElement>(null);
  const insertPdfRef = useRef<HTMLInputElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') !== 'true') {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    setTexts(translations[currentLanguage]);
  }, [currentLanguage]);

  const updateLanguage = (lang: 'en' | 'zh') => {
    setCurrentLanguage(lang);
  };

  const renderPagePreviews = useCallback(() => {
    if (!previewContainerRef.current) return;

    if (sortableInstanceRef.current) {
      sortableInstanceRef.current.destroy();
      sortableInstanceRef.current = null;
    }
    
    previewContainerRef.current.innerHTML = ''; 

    pages.forEach((pageCanvas, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = `page-preview-wrapper p-2 border-2 rounded-lg cursor-pointer transition-all bg-card hover:border-primary ${selectedPages.has(index) ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`;
      wrapper.dataset.index = index.toString();

      const previewDisplayCanvas = document.createElement('canvas');
      const previewCtx = previewDisplayCanvas.getContext('2d');
      if (!previewCtx) return;

      const aspectRatio = pageCanvas.width / pageCanvas.height;
      const displayWidth = 120; // Fixed width for previews
      const displayHeight = displayWidth / aspectRatio;

      previewDisplayCanvas.width = pageCanvas.width; // Use original canvas for drawing source
      previewDisplayCanvas.height = pageCanvas.height;
      previewCtx.drawImage(pageCanvas, 0, 0);
      
      previewDisplayCanvas.style.width = `${displayWidth}px`;
      previewDisplayCanvas.style.height = `${displayHeight}px`;
      previewDisplayCanvas.className = "rounded-md shadow-md";
      
      const pageNumberDiv = document.createElement('div');
      pageNumberDiv.className = "text-xs text-muted-foreground mt-1 text-center";
      pageNumberDiv.textContent = `${texts.page} ${index + 1}`;

      wrapper.appendChild(previewDisplayCanvas);
      wrapper.appendChild(pageNumberDiv);

      wrapper.addEventListener('click', () => {
        const newSelectedPages = new Set<number>(); // Single selection
        if (!selectedPages.has(index)) {
            newSelectedPages.add(index);
        }
        setSelectedPages(newSelectedPages);
      });

      wrapper.addEventListener('dblclick', () => {
        setZoomedPageData({ canvas: pageCanvas, index });
        setCurrentRotation(0);
      });
      previewContainerRef.current?.appendChild(wrapper);
    });

    if (pages.length > 0 && previewContainerRef.current) {
      sortableInstanceRef.current = Sortable.create(previewContainerRef.current, {
        animation: 150,
        ghostClass: 'opacity-50',
        chosenClass: 'ring-2 ring-offset-2 ring-primary',
        dragClass: 'opacity-75',
        onEnd: (evt) => {
          if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
          const reorderedPages = Array.from(pages);
          const [movedItem] = reorderedPages.splice(evt.oldIndex, 1);
          reorderedPages.splice(evt.newIndex, 0, movedItem);
          setPages(reorderedPages);
          // Update selection if the moved item was selected
          if (selectedPages.has(evt.oldIndex)) {
            const newSelected = new Set<number>();
            newSelected.add(evt.newIndex);
            setSelectedPages(newSelected);
          } else {
            setSelectedPages(new Set()); // Clear selection if a non-selected item is moved, or adjust as needed
          }
        }
      });
    }
  }, [pages, selectedPages, texts.page]);


  useEffect(() => {
    renderPagePreviews();
  }, [pages, selectedPages, renderPagePreviews]);


  useEffect(() => {
    if (zoomedPageData && zoomCanvasRef.current) {
      const canvas = zoomCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sourceCanvas = zoomedPageData.canvas;
      const baseWidth = sourceCanvas.width;
      const baseHeight = sourceCanvas.height;
      
      // Maintain aspect ratio within modal
      const modalContentWidth = canvas.parentElement?.clientWidth || 800;
      const modalContentHeight = window.innerHeight * 0.7; // 70vh approx

      let scaleX = modalContentWidth / baseWidth;
      let scaleY = modalContentHeight / baseHeight;
      
      if (currentRotation % 180 !== 0) { // if rotated to landscape from portrait or vice-versa
        scaleX = modalContentWidth / baseHeight;
        scaleY = modalContentHeight / baseWidth;
      }
      
      const currentScale = Math.min(scaleX, scaleY, 2); // Cap scale at 2x original

      let displayWidth = baseWidth * currentScale;
      let displayHeight = baseHeight * currentScale;

      canvas.width = currentRotation % 180 === 0 ? displayWidth : displayHeight;
      canvas.height = currentRotation % 180 === 0 ? displayHeight : displayWidth;
      
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((currentRotation * Math.PI) / 180);
      ctx.drawImage(
        sourceCanvas,
        -displayWidth / 2,
        -displayHeight / 2,
        displayWidth,
        displayHeight
      );
      ctx.restore();
    }
  }, [zoomedPageData, currentRotation]);

  const processPdfFile = async (file: File): Promise<HTMLCanvasElement[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocProxy = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    }).promise;
    
    const numPages = pdfDocProxy.numPages;
    const loadedCanvases: HTMLCanvasElement[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocProxy.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Render at decent quality
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      await page.render({ canvasContext: ctx, viewport }).promise;
      loadedCanvases.push(canvas);
    }
    return loadedCanvases;
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in event) { // Drag event
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            file = event.dataTransfer.files[0];
            event.dataTransfer.clearData();
        }
    } else { // Change event
        file = event.target.files?.[0] || null;
    }

    if (!file || !file.type.includes('pdf')) {
        if (file) toast({ title: texts.loadError, description: "Invalid file type. Please upload a PDF.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setLoadingMessage(texts.loadingPdf);
    try {
      const loadedCanvases = await processPdfFile(file);
      setPages(loadedCanvases);
      setSelectedPages(new Set());
    } catch (err: any) {
      toast({ title: texts.loadError, description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (pdfUploadRef.current) pdfUploadRef.current.value = '';
    }
  };

  const handleDeletePages = () => {
    if (selectedPages.size === 0) {
      toast({ title: texts.pageManagement, description: texts.noPageSelected, variant: "destructive" });
      return;
    }
    const newPages = pages.filter((_, idx) => !selectedPages.has(idx));
    setPages(newPages);
    setSelectedPages(new Set());
    toast({ title: texts.pageManagement, description: "Selected page(s) deleted." });
  };

  const handleDownloadPdf = async () => {
    if (pages.length === 0) {
      toast({ title: texts.downloadPdf, description: texts.noPagesToDownload, variant: "destructive" });
      return;
    }
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); 
      const pdfDocOut = await PDFLibDocument.create();
      for (let canvas of pages) {
        const imgDataUrl = canvas.toDataURL('image/png'); // Consider image/jpeg for smaller size if quality allows
        const pngImage = await pdfDocOut.embedPng(imgDataUrl);
        const page = pdfDocOut.addPage([canvas.width, canvas.height]);
        page.drawImage(pngImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });
      }
      const pdfBytes = await pdfDocOut.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited_document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: texts.downloadPdf, description: "PDF downloaded successfully!" });
    } catch (err: any) {
      toast({ title: texts.downloadError, description: err.message, variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInsertPdfFileSelected = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in event) { // Drag event
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            file = event.dataTransfer.files[0];
            event.dataTransfer.clearData();
        }
    } else { // Change event
        file = event.target.files?.[0] || null;
    }
    
    if (!file || !file.type.includes('pdf')) {
        if(file) toast({ title: texts.insertError, description: "Invalid file type. Please upload a PDF.", variant: "destructive" });
        return;
    }

    setPendingInsertFile(file);
    if (pages.length > 0 && selectedPages.size === 0) {
        setIsInsertConfirmOpen(true);
    } else {
        proceedWithInsert(file);
    }
  };

  const proceedWithInsert = async (fileToInsert?: File) => {
    const file = fileToInsert || pendingInsertFile;
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage(texts.insertingPdf);
    try {
      const insertCanvases = await processPdfFile(file);
      let insertIdx = pages.length; // Default to end
      if (selectedPages.size > 0) {
        const firstSelected = Math.min(...Array.from(selectedPages));
        insertIdx = insertPosition === 'before' ? firstSelected : firstSelected + 1;
      }
      
      const newPages = [...pages];
      newPages.splice(insertIdx, 0, ...insertCanvases);
      setPages(newPages);
      // Optionally, select the first inserted page
      const newSelected = new Set<number>();
      newSelected.add(insertIdx);
      setSelectedPages(newSelected);

      toast({ title: texts.insertAreaTitle, description: "PDF inserted successfully." });

    } catch (err: any) {
      toast({ title: texts.insertError, description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setPendingInsertFile(null);
      if (insertPdfRef.current) insertPdfRef.current.value = '';
    }
  };
  
  const commonDragEvents = {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('border-primary', 'bg-primary/10');
    },
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-primary', 'bg-primary/10');
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Overlay for Loading and Downloading */}
      {(isLoading || isDownloading) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">
            {isLoading ? loadingMessage : texts.generatingFile}
          </p>
        </div>
      )}

      {/* Zoom Modal */}
      <Dialog open={!!zoomedPageData} onOpenChange={(isOpen) => !isOpen && setZoomedPageData(null)}>
        <DialogContent className="max-w-3xl w-[90vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{texts.previewOf} {zoomedPageData ? `${texts.page} ${zoomedPageData.index + 1}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-auto flex items-center justify-center p-4 bg-muted/40">
            <canvas ref={zoomCanvasRef} style={{ willReadFrequently: true } as any} className="max-w-full max-h-full object-contain shadow-lg"></canvas>
          </div>
          <div className="p-4 border-t">
            <Input type="text" placeholder={texts.noteInputPlaceholder} className="mb-4" />
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                <Button variant="outline" onClick={() => setCurrentRotation((r) => (r - 90 + 360) % 360)}><RotateCcw className="mr-2 h-4 w-4" /> {texts.rotateLeft}</Button>
                <Button variant="outline" onClick={() => setCurrentRotation((r) => (r + 90) % 360)}><RotateCw className="mr-2 h-4 w-4" /> {texts.rotateRight}</Button>
                <Button variant="outline" onClick={() => setCurrentRotation(0)}><X className="mr-2 h-4 w-4" /> {texts.resetRotation}</Button>
            </div>
            <DialogClose asChild>
                <Button variant="outline" className="w-full">{texts.modalCloseButton}</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insert Confirmation Dialog */}
      <AlertDialog open={isInsertConfirmOpen} onOpenChange={setIsInsertConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{texts.insertConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {texts.insertConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingInsertFile(null)}>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => proceedWithInsert()}>{texts.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b">
          <h1 className="text-3xl font-bold text-primary mb-2 sm:mb-0">{texts.pageTitle}</h1>
          <div className="flex gap-2">
            <Button variant={currentLanguage === 'en' ? "secondary" : "outline"} size="sm" onClick={() => updateLanguage('en')}>English</Button>
            <Button variant={currentLanguage === 'zh' ? "secondary" : "outline"} size="sm" onClick={() => updateLanguage('zh')}>中文</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="md:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl"><Upload className="mr-2 h-5 w-5 text-primary" /> {texts.fileOperations}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pdfUploadInput" className="mb-2 block cursor-pointer text-sm font-medium">{texts.uploadLabel}</Label>
                  <div 
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors"
                    onClick={() => pdfUploadRef.current?.click()}
                    onDrop={handlePdfUpload}
                    {...commonDragEvents}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">{texts.dropFileHere}</p>
                  </div>
                  <Input 
                    type="file" 
                    id="pdfUploadInput" 
                    accept="application/pdf" 
                    onChange={handlePdfUpload} 
                    ref={pdfUploadRef} 
                    className="hidden"
                  />
                </div>
                <Button onClick={handleDownloadPdf} disabled={pages.length === 0 || isDownloading} className="w-full">
                  {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {texts.downloadPdf}
                </Button>
              </CardContent>
            </Card>

            {pages.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl"><Edit3 className="mr-2 h-5 w-5 text-primary" /> {texts.insertAreaTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="insertPdfInput" className="mb-2 block cursor-pointer text-sm font-medium">{texts.selectFileToInsert}</Label>
                     <div 
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors"
                        onClick={() => insertPdfRef.current?.click()}
                        onDrop={handleInsertPdfFileSelected}
                        {...commonDragEvents}
                      >
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">{texts.dropInsertFileHere}</p>
                      </div>
                    <Input 
                        type="file" 
                        id="insertPdfInput" 
                        accept="application/pdf" 
                        onChange={handleInsertPdfFileSelected} 
                        ref={insertPdfRef} 
                        className="hidden"
                    />
                  </div>
                  <RadioGroup value={insertPosition} onValueChange={(value: 'before' | 'after') => setInsertPosition(value)} disabled={selectedPages.size === 0}>
                    <Label className="font-medium mb-1 block">{texts.insertOptionsTitle}</Label>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="before" id="r-before" />
                      <Label htmlFor="r-before" className="font-normal">{texts.insertBeforeLabel}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="after" id="r-after" />
                      <Label htmlFor="r-after" className="font-normal">{texts.insertAfterLabel}</Label>
                    </div>
                  </RadioGroup>
                   <p className="text-xs text-muted-foreground">{selectedPages.size === 0 && pages.length > 0 ? texts.insertConfirmDescription.split('.')[0] + '.' : ''}</p>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl"><Info className="mr-2 h-5 w-5 text-primary" /> {texts.tools}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{texts.instSelect}</p>
                    <p className="text-sm text-muted-foreground">{texts.instDrag}</p>
                    <p className="text-sm text-muted-foreground">{texts.instZoom}</p>
                     <Button onClick={handleDeletePages} variant="destructive" disabled={selectedPages.size === 0 || pages.length === 0} className="w-full mt-2">
                        <Trash2 className="mr-2 h-4 w-4" /> {texts.deletePages}
                    </Button>
                </CardContent>
            </Card>
          </div>

          {/* Preview Area Column */}
          <div className="md:col-span-2">
            {pages.length > 0 ? (
              <Card className="shadow-lg min-h-[60vh]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl"><Shuffle className="mr-2 h-5 w-5 text-primary" /> {texts.pageManagement}</CardTitle>
                  <CardDescription> {pages.length} {pages.length === 1 ? texts.page.toLowerCase() : texts.page.toLowerCase() + 's'} loaded. {selectedPages.size > 0 ? `${texts.page} ${Array.from(selectedPages)[0]+1} selected.` : ''} </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    id="previewContainer" 
                    ref={previewContainerRef} 
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1 bg-muted/20 rounded-md min-h-[200px]"
                  >
                    {/* Previews are rendered by renderPagePreviews */}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg min-h-[60vh] flex flex-col items-center justify-center bg-muted/30">
                <CardContent className="text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground">{texts.pageTitle}</p>
                  <p className="text-muted-foreground">{texts.uploadPdfFirst.replace('this feature', 'editing')}</p>
                  <Button onClick={() => pdfUploadRef.current?.click()} className="mt-4">
                    <Upload className="mr-2 h-4 w-4"/> {texts.uploadLabel.split(':')[0]}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
