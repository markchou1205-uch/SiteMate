
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Scissors, Download, FilePlus, LogIn, LogOut, UserCircle, MenuSquare, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, CheckSquare, Square } from 'lucide-react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";


if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const translations = {
  en: {
    pageTitle: 'Split PDF',
    pageDescription: 'Select pages to extract or delete from a PDF file.',
    startTitle: 'Start by Uploading a PDF',
    startDescription: 'Select a PDF file to begin splitting or extracting pages.',
    uploadButton: 'Click here to select a file',
    extractButton: 'Extract Selected Pages',
    deleteButton: 'Delete Selected (Keep Others)',
    downloadingMessage: 'Generating PDF...',
    pdfLoadSuccess: 'PDF Loaded',
    pdfLoadSuccessDesc: (count: number) => `${count} pages loaded successfully.`,
    pdfLoadError: 'Failed to load PDF',
    invalidFileError: 'Invalid File',
    invalidFileErrorDesc: 'Please select a PDF file.',
    noPagesError: 'No pages selected',
    downloadSuccess: 'Download Successful',
    downloadSuccessDesc: (filename: string) => `${filename} has been downloaded.`,
    downloadError: 'Download Failed',
    page: 'Page',
    appTitle: 'DocuPilot',
    loggedInAs: 'Logged in as User',
    login: 'Login',
    logout: 'Logout',
    guest: 'Guest',
    comingSoon: 'Coming Soon!',
    featureNotImplemented: 'feature is not yet implemented.',
    pdfEditMenu: 'PDF Edit',
    pdfConvertMenu: 'PDF Convert',
    mergePdf: 'Merge PDF',
    splitPdf: 'Split PDF',
    deletePdfPages: 'Delete Pages',
    extractPdfPages: 'Extract Pages',
    reorderPdfPages: 'Reorder Pages',
    addWatermark: 'Add Watermark',
    convertToPdf: 'Convert to PDF',
    convertFromPdf: 'Convert from PDF',
    wordToPdf: 'WORD to PDF',
    excelToPdf: 'EXCEL to PDF',
    pptToPdf: 'PPT to PDF',
    htmlToPdf: 'HTML to PDF',
    jpgToPdf: 'JPG to PDF',
    pdfToWord: 'PDF to WORD',
    pdfToExcel: 'PDF to EXCEL',
    pdfToPpt: 'PDF to PPT',
    pdfToHtml: 'PDF to HTML',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    pagesSelected: 'pages selected',
  },
  zh: {
    pageTitle: '拆分 PDF',
    pageDescription: '從 PDF 檔案中選取要擷取或刪除的頁面。',
    startTitle: '從上傳 PDF 開始',
    startDescription: '選擇一個 PDF 檔案以開始拆分或擷取頁面。',
    uploadButton: '點擊此處選擇檔案',
    extractButton: '擷取選取頁面',
    deleteButton: '刪除選取頁面 (保留其他)',
    downloadingMessage: '正在產生 PDF...',
    pdfLoadSuccess: 'PDF 載入成功',
    pdfLoadSuccessDesc: (count: number) => `${count} 個頁面已成功載入。`,
    pdfLoadError: '載入 PDF 失敗',
    invalidFileError: '無效檔案',
    invalidFileErrorDesc: '請選擇一個 PDF 檔案。',
    noPagesError: '尚未選取任何頁面',
    downloadSuccess: '下載成功',
    downloadSuccessDesc: (filename: string) => `${filename} 已下載。`,
    downloadError: '下載失敗',
    page: '頁',
    appTitle: 'DocuPilot 文件助手',
    loggedInAs: '已登入為使用者',
    login: '登入',
    logout: '登出',
    guest: '訪客',
    comingSoon: '即將推出！',
    featureNotImplemented: '功能尚未實現。',
    pdfEditMenu: 'PDF編輯',
    pdfConvertMenu: 'PDF轉換',
    mergePdf: '合併PDF',
    splitPdf: '拆分PDF',
    deletePdfPages: '刪除頁面',
    extractPdfPages: '擷取頁面',
    reorderPdfPages: '變換順序',
    addWatermark: '添加浮水印',
    convertToPdf: '轉換為PDF',
    convertFromPdf: '從PDF轉換',
    wordToPdf: 'WORD轉PDF',
    excelToPdf: 'EXCEL轉PDF',
    pptToPdf: 'PPT轉PDF',
    htmlToPdf: 'HTML轉PDF',
    jpgToPdf: 'JPG轉PDF',
    pdfToWord: 'PDF轉WORD',
    pdfToExcel: 'PDF轉EXCEL',
    pdfToPpt: 'PDF轉PPT',
    pdfToHtml: 'PDF to HTML',
    selectAll: '全選',
    deselectAll: '取消全選',
    pagesSelected: '頁已選取',
  },
};


interface PageObject {
  id: string;
  sourceCanvas: HTMLCanvasElement;
}

const PageThumbnail = React.memo(({ pageObj, index, isSelected, onSelect, texts }: { pageObj: PageObject; index: number; isSelected: boolean; onSelect: (id: string, selected: boolean) => void; texts: typeof translations.en }) => {
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
      onClick={() => onSelect(pageObj.id, !isSelected)}
    >
      <div className="relative">
        <canvas ref={canvasRef} className="rounded-md shadow-md w-full h-auto"></canvas>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(pageObj.id, !!checked)}
          className="absolute top-2 left-2 bg-background/50"
          aria-label={`Select page ${index + 1}`}
        />
      </div>
      <div className="text-xs text-muted-foreground mt-1 text-center">
        {texts.page} {index + 1}
      </div>
    </div>
  );
});
PageThumbnail.displayName = 'PageThumbnail';


export default function SplitPdfPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const pdfUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);
    }
  }, []);

  const updateLanguage = (lang: 'en' | 'zh') => {
    setCurrentLanguage(lang);
  };
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
    }
    setIsLoggedIn(false);
    toast({ title: texts.logout, description: currentLanguage === 'zh' ? "您已成功登出。" : "You have been logged out successfully." });
  };

  const handlePlaceholderClick = (featureName: string) => {
    toast({
        title: texts.comingSoon,
        description: `${featureName} ${texts.featureNotImplemented}`
    });
  };

  const processPdfFile = async (file: File): Promise<PageObject[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const loadedPageObjects: PageObject[] = [];
    for (let i = 1; i <= pdfDocProxy.numPages; i++) {
      const page = await pdfDocProxy.getPage(i);
      const viewport = page.getViewport({ scale: 3.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
      loadedPageObjects.push({ id: uuidv4(), sourceCanvas: canvas });
    }
    return loadedPageObjects;
  };
  
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('pdf')) {
        toast({ title: texts.invalidFileError, description: texts.invalidFileErrorDesc, variant: "destructive" });
        return;
    }
    
    setIsLoading(true);
    try {
      const newPages = await processPdfFile(file);
      setPageObjects(newPages);
      setSelectedPageIds(new Set());
      toast({ title: texts.pdfLoadSuccess, description: texts.pdfLoadSuccessDesc(newPages.length) });
    } catch (err: any) {
      toast({ title: texts.pdfLoadError, description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      if (pdfUploadRef.current) pdfUploadRef.current.value = '';
    }
  };

  const handlePageSelect = (id: string, selected: boolean) => {
    setSelectedPageIds(prev => {
        const newSet = new Set(prev);
        if (selected) {
            newSet.add(id);
        } else {
            newSet.delete(id);
        }
        return newSet;
    });
  };
  
  const handleSelectAll = () => {
    setSelectedPageIds(new Set(pageObjects.map(p => p.id)));
  };
  
  const handleDeselectAll = () => {
    setSelectedPageIds(new Set());
  };

  const handleDownload = async (mode: 'extract' | 'delete') => {
    if (selectedPageIds.size === 0) {
        toast({ title: texts.noPagesError, variant: "destructive" });
        return;
    }

    setIsDownloading(true);
    try {
        const pdfDocOut = await PDFLibDocument.create();
        
        const pagesToProcess = mode === 'extract'
            ? pageObjects.filter(p => selectedPageIds.has(p.id))
            : pageObjects.filter(p => !selectedPageIds.has(p.id));

        if (pagesToProcess.length === 0) {
            toast({ title: (mode === 'extract' ? 'No pages selected to extract' : 'Selecting all pages to delete leaves an empty document.'), variant: "destructive" });
            setIsDownloading(false);
            return;
        }
        
        for (const pageObj of pagesToProcess) {
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
        const filename = `DocuPilot_${mode === 'extract' ? 'extracted' : 'trimmed'}.pdf`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: texts.downloadSuccess, description: texts.downloadSuccessDesc(filename) });

    } catch (err: any) {
        toast({ title: texts.downloadError, description: err.message, variant: "destructive" });
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {(isLoading || isDownloading) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">{isLoading ? (texts.pdfLoadError.split(' ')[0]) : texts.downloadingMessage}</p>
        </div>
      )}

      <header className="p-0 border-b bg-card sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold text-primary flex items-center cursor-pointer" onClick={() => router.push('/')}>
                    <MenuSquare className="mr-2 h-6 w-6"/> {texts.appTitle}
                </h1>
                <Menubar className="border-none shadow-none bg-transparent">
                    <MenubarMenu>
                        <MenubarTrigger><Edit className="mr-2 h-4 w-4" />{texts.pdfEditMenu}</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => router.push('/merge-pdf')}><Combine className="mr-2 h-4 w-4" />{texts.mergePdf}</MenubarItem>
                            <MenubarItem disabled><Scissors className="mr-2 h-4 w-4" />{texts.splitPdf}</MenubarItem>
                            <MenubarItem disabled><Trash2 className="mr-2 h-4 w-4" />{texts.deletePdfPages}</MenubarItem>
                            <MenubarItem disabled><FileUp className="mr-2 h-4 w-4" />{texts.extractPdfPages}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/')}><ListOrdered className="mr-2 h-4 w-4" />{texts.reorderPdfPages}</MenubarItem>
                            <MenubarItem onClick={() => handlePlaceholderClick(texts.addWatermark)}><Droplets className="mr-2 h-4 w-4" />{texts.addWatermark}</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger><ArrowRightLeft className="mr-2 h-4 w-4" />{texts.pdfConvertMenu}</MenubarTrigger>
                        <MenubarContent>
                            <MenubarSub>
                                <MenubarSubTrigger><FilePlus className="mr-2 h-4 w-4" />{texts.convertToPdf}</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => handlePlaceholderClick(texts.wordToPdf)}><FileText className="mr-2 h-4 w-4" />{texts.wordToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => handlePlaceholderClick(texts.excelToPdf)}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.excelToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => handlePlaceholderClick(texts.pptToPdf)}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pptToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => handlePlaceholderClick(texts.htmlToPdf)}><Code className="mr-2 h-4 w-4" />{texts.htmlToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => handlePlaceholderClick(texts.jpgToPdf)}><FileImage className="mr-2 h-4 w-4" />{texts.jpgToPdf}</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSub>
                                <MenubarSubTrigger><FileMinus className="mr-2 h-4 w-4" />{texts.convertFromPdf}</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=docx')}><FileText className="mr-2 h-4 w-4" />{texts.pdfToWord}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.pdfToExcel}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=ppt')}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pdfToPpt}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=html')}><Code className="mr-2 h-4 w-4" />{texts.pdfToHtml}</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    <Button variant={currentLanguage === 'en' ? "secondary" : "outline"} size="sm" onClick={() => updateLanguage('en')}>English</Button>
                    <Button variant={currentLanguage === 'zh' ? "secondary" : "outline"} size="sm" onClick={() => updateLanguage('zh')}>中文</Button>
                </div>
                 {isLoggedIn ? (
                    <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{texts.loggedInAs}</span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4"/> {texts.logout}
                        </Button>
                    </div>
                ) : (
                   <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">{texts.guest}</span>
                        <Link href="/login" passHref>
                            <Button variant="ghost" size="sm">
                                <LogIn className="mr-2 h-4 w-4"/> {texts.login}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
      </header>

      <main className="flex-grow p-6 overflow-y-auto">
        <div className='mb-6'>
            <h1 className="text-2xl font-bold text-foreground">{texts.pageTitle}</h1>
            <p className="text-sm text-muted-foreground">{texts.pageDescription}</p>
        </div>
        {pageObjects.length === 0 ? (
          <Card 
            className="max-w-2xl mx-auto"
            onClick={() => pdfUploadRef.current?.click()}
          >
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <Scissors className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>{texts.startTitle}</CardTitle>
                <CardDescription>{texts.startDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20">
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground text-center">{texts.uploadButton}</p>
                </div>
                <Input
                    type="file"
                    ref={pdfUploadRef}
                    onChange={handlePdfUpload}
                    accept="application/pdf"
                    className="hidden"
                />
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4 p-4 bg-card rounded-lg shadow-sm border">
                <div className='flex items-center gap-4'>
                    <h2 className="text-lg font-semibold">{selectedPageIds.size} / {pageObjects.length} {texts.pagesSelected}</h2>
                    <Button variant="outline" size="sm" onClick={handleSelectAll}><CheckSquare className="mr-2 h-4 w-4" />{texts.selectAll}</Button>
                    <Button variant="outline" size="sm" onClick={handleDeselectAll}><Square className="mr-2 h-4 w-4" />{texts.deselectAll}</Button>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => handleDownload('extract')} disabled={isDownloading || selectedPageIds.size === 0}>
                        <FileUp className="mr-2 h-4 w-4" />
                        {texts.extractButton}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDownload('delete')} disabled={isDownloading || selectedPageIds.size === 0}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {texts.deleteButton}
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg">
                {pageObjects.map((page, index) => (
                    <PageThumbnail 
                        key={page.id}
                        pageObj={page}
                        index={index}
                        isSelected={selectedPageIds.has(page.id)}
                        onSelect={handlePageSelect}
                        texts={texts}
                    />
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
