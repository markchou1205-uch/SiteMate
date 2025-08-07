
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, Scissors, Download, LogIn, LogOut, UserCircle, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, CheckSquare, Square, ScanText, Sparkles, ShieldCheck, Loader2, AlertTriangle } from 'lucide-react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle } from "@/components/ui/alert-dialog";
import Logo from '@/components/ui/Logo';
import { translations } from '@/lib/translations';
import LoadingState from '@/components/ui/LoadingState';
import SuccessState from '@/components/ui/SuccessState';
import { pdfjsLib } from '@/lib/pdf-worker';
import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';

interface PageObject {
  id: string;
  pdfPageProxy: PDFPageProxy;
  originalIndex: number;
  thumbnailUrl?: string | 'error';
}

type ViewState = 'idle' | 'processing' | 'success';

const MAX_CONCURRENT_RENDERS = 4; // Limit concurrent rendering tasks

const PageThumbnail = React.memo(({ pageObj, index, isSelected, onSelect, itemRef, texts }: { pageObj: PageObject; index: number; isSelected: boolean; onSelect: (id: string, selected: boolean) => void; itemRef: React.Ref<HTMLDivElement>; texts: (typeof translations)['zh'] }) => {
  return (
    <div
      ref={itemRef}
      data-page-id={pageObj.id}
      className={`page-preview-wrapper p-2 border-2 rounded-lg cursor-pointer transition-all bg-card hover:border-primary ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
      onClick={() => onSelect(pageObj.id, !isSelected)}
    >
      <div className="relative aspect-[1/1.414] w-full">
        {pageObj.thumbnailUrl && pageObj.thumbnailUrl !== 'error' ? (
          <img src={pageObj.thumbnailUrl} alt={`${texts.page} ${index + 1}`} className="w-full h-full object-contain rounded-md shadow-md bg-white" />
        ) : pageObj.thumbnailUrl === 'error' ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-destructive/10 text-destructive rounded-md">
            <AlertTriangle className="h-6 w-6" />
            <p className="text-xs mt-1">{texts.errorState}</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
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

export default function SplitPdfClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [guestLimitModalContent, setGuestLimitModalContent] = useState({ title: '', description: '' });
  
  const pdfUploadRef = useRef<HTMLInputElement>(null);
  
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  // State for rendering queue
  const [renderQueue, setRenderQueue] = useState<string[]>([]);
  const [renderingPages, setRenderingPages] = useState<Set<string>>(new Set());

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

  const checkAndDecrementQuota = useCallback((quotaType: 'daily' | 'convert'): boolean => {
      if (isLoggedIn || typeof window === 'undefined') {
        return true; 
      }
      
      const key = quotaType === 'daily' ? 'pdfDailyCount' : 'pdfConvertCount';
      const limit = quotaType === 'daily' ? 5 : 1;
      let currentCount = parseInt(localStorage.getItem(key) || String(limit), 10);

      if (isNaN(currentCount)) currentCount = limit;

      if (currentCount <= 0) {
        setGuestLimitModalContent({
          title: texts.dailyLimitTitle,
          description: texts.dailyLimitDescription,
        });
        setIsGuestLimitModalOpen(true);
        return false;
      }

      localStorage.setItem(key, String(currentCount - 1));
      return true;
  }, [isLoggedIn, texts, setGuestLimitModalContent, setIsGuestLimitModalOpen]);
  
  const resetPage = () => {
      setViewState('idle');
      setProgress(0);
      setLoadingMessage('');
      setSuccessMessage('');
      setSelectedPdfFile(null);
      setPageObjects([]);
      setSelectedPageIds(new Set());
      setRenderQueue([]);
      setRenderingPages(new Set());
      if (pdfUploadRef.current) pdfUploadRef.current.value = '';
  };

  const handleStartLoading = (message: string) => {
      setLoadingMessage(message);
      setViewState('processing');
      setProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
          setProgress(prev => {
              if (prev >= 95) {
                  if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                  return prev;
              }
              return prev + 5;
          });
      }, 200);
  };

  const handleSuccess = (message: string) => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setProgress(100);
      setTimeout(() => {
          setSuccessMessage(message);
          setViewState('success');
      }, 300);
  };

  const handleError = (message: string) => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setViewState('idle');
      toast({ title: texts.pdfLoadError, description: message, variant: 'destructive' });
  };

  const processPdfFile = async (file: File): Promise<PageObject[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocProxy = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const loadedPageObjects: PageObject[] = [];
    for (let i = 1; i <= pdfDocProxy.numPages; i++) {
      const page = await pdfDocProxy.getPage(i);
      loadedPageObjects.push({
        id: uuidv4(),
        pdfPageProxy: page,
        originalIndex: i - 1,
      });
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
    
    resetPage();
    setSelectedPdfFile(file);
    handleStartLoading(texts.loadingOpeningFile(file.name));

    try {
      const newPages = await processPdfFile(file);
      setPageObjects(newPages);
      setRenderQueue(newPages.slice(0, 12).map(p => p.id));
      setViewState('idle');
      toast({ title: texts.pdfLoadSuccess, description: texts.pdfLoadSuccessDesc(newPages.length) });
    } catch (err: any) {
      handleError(err.message);
    }
  };

  const renderPageThumbnail = useCallback(async (pageToRender: PageObject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const page = pageToRender.pdfPageProxy;
      const viewport = page.getViewport({ scale: 0.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const thumbnailUrl = canvas.toDataURL();
      
      setPageObjects(prevPages => 
        prevPages.map(p => p.id === pageToRender.id ? { ...p, thumbnailUrl } : p)
      );
    } catch (error) {
      console.error(`Failed to render thumbnail for page ${pageToRender.originalIndex + 1}:`, error);
      setPageObjects(prevPages => 
        prevPages.map(p => p.id === pageToRender.id ? { ...p, thumbnailUrl: 'error' } : p)
      );
    } finally {
      setRenderingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageToRender.id);
        return newSet;
      });
    }
  }, []);

  useEffect(() => {
    const processQueue = () => {
      if (renderQueue.length > 0 && renderingPages.size < MAX_CONCURRENT_RENDERS) {
        const nextPageId = renderQueue[0];
        const pageToRender = pageObjects.find(p => p.id === nextPageId);
        
        if (pageToRender && !pageToRender.thumbnailUrl) {
          setRenderQueue(prev => prev.slice(1));
          setRenderingPages(prev => new Set(prev).add(nextPageId));
          renderPageThumbnail(pageToRender);
        } else if (pageToRender) {
          // Already rendered or is rendering, skip
          setRenderQueue(prev => prev.slice(1));
        }
      }
    };
    const intervalId = setInterval(processQueue, 100); // Check queue periodically
    return () => clearInterval(intervalId);
  }, [renderQueue, renderingPages, pageObjects, renderPageThumbnail]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || pageObjects.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageId = entry.target.getAttribute('data-page-id');
            const page = pageObjects.find(p => p.id === pageId);
            if (pageId && page && !page.thumbnailUrl && !renderQueue.includes(pageId) && !renderingPages.has(pageId)) {
                setRenderQueue(prev => [...prev, pageId]);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '500px 0px', // Load images well before they enter the viewport
      }
    );

    const currentItemRefs = itemRefs.current;
    currentItemRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      currentItemRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [pageObjects, renderQueue, renderingPages]);

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
        toast({ title: texts.noPagesSelected, variant: "destructive" });
        return;
    }

    if (!selectedPdfFile) {
        handleError("Original PDF file not found.");
        return;
    }
    
    if (!checkAndDecrementQuota('daily')) {
        return;
    }

    handleStartLoading(texts.loadingSplittingFile);
    try {
      const indicesToKeep = pageObjects
        .filter(p => mode === 'extract' ? selectedPageIds.has(p.id) : !selectedPageIds.has(p.id))
        .map(p => p.originalIndex);

      if (indicesToKeep.length === 0) {
        handleError(mode === 'extract' ? 'No pages selected to extract.' : 'Selecting all pages to delete leaves an empty document.');
        return;
      }
      
      const existingPdfBytes = await selectedPdfFile.arrayBuffer();
      let pdfDoc;

      try {
        // First attempt: load without ignoring encryption for better parsing of standard files.
        pdfDoc = await PDFLibDocument.load(existingPdfBytes);
      } catch (e: any) {
        // If it fails with an encryption error, retry with the flag.
        if (e.message.includes('encrypted')) {
          pdfDoc = await PDFLibDocument.load(existingPdfBytes, { ignoreEncryption: true });
        } else {
          // If it's a different error, re-throw it.
          throw e;
        }
      }

      const newPdfDoc = await PDFLibDocument.create();
      
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, indicesToKeep);
      copiedPages.forEach(page => newPdfDoc.addPage(page));
      
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `WujiPDF_${mode === 'extract' ? 'extracted' : 'trimmed'}.pdf`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      handleSuccess(texts.conversionSuccessDesc(filename));

    } catch (err: any) {
        handleError(err.message);
    }
  };

  const renderContent = () => {
    switch (viewState) {
        case 'processing':
            return <LoadingState message={loadingMessage} progress={progress} />;
        case 'success':
            return <SuccessState message={successMessage} onGoHome={() => router.push('/')} onStartNew={resetPage} texts={texts} />;
        case 'idle':
        default:
          return pageObjects.length === 0 ? (
            <Card 
              className="w-full max-w-2xl"
              onClick={() => pdfUploadRef.current?.click()}
            >
              <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                      <Scissors className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>{texts.splitPdfTitle}</CardTitle>
                  <CardDescription>{texts.splitPdfDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20">
                      <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-md text-muted-foreground text-center">{texts.uploadButton}</p>
                      <p className="text-xs text-muted-foreground mt-1">{texts.uploadHint(isLoggedIn)}</p>
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
            <div className="w-full max-w-7xl">
              <div className="flex justify-between items-center mb-4 p-4 bg-card rounded-lg shadow-sm border">
                  <div className='flex items-center gap-4'>
                      <h2 className="text-lg font-semibold">{selectedPageIds.size} / {pageObjects.length} {texts.pagesSelected}</h2>
                      <Button variant="outline" size="sm" onClick={handleSelectAll}><CheckSquare className="mr-2 h-4 w-4" />{texts.selectAll}</Button>
                      <Button variant="outline" size="sm" onClick={handleDeselectAll}><Square className="mr-2 h-4 w-4" />{texts.deselectAll}</Button>
                  </div>
                  <div className="flex gap-4">
                      <Button onClick={() => handleDownload('extract')} disabled={selectedPageIds.size === 0}>
                          <FileUp className="mr-2 h-4 w-4" />
                          {texts.extractButton}
                      </Button>
                      <Button variant="destructive" onClick={() => handleDownload('delete')} disabled={selectedPageIds.size === 0}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {texts.deleteButton}
                      </Button>
                  </div>
              </div>
              <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg">
                  {pageObjects.map((page, index) => (
                      <PageThumbnail 
                          key={page.id}
                          pageObj={page}
                          index={index}
                          isSelected={selectedPageIds.has(page.id)}
                          onSelect={handlePageSelect}
                          itemRef={el => {
                            if (el) itemRefs.current.set(page.id, el);
                            else itemRefs.current.delete(page.id);
                          }}
                          texts={texts}
                      />
                  ))}
              </div>
            </div>
          );
    }
  };


  return (
    <div className="flex flex-col h-screen bg-background">
      <AlertDialog open={isGuestLimitModalOpen} onOpenChange={setIsGuestLimitModalOpen}>
        <AlertDialogContent>
            <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{guestLimitModalContent.title}</ShadAlertDialogTitle>
            <AlertDialogDescription>
                {guestLimitModalContent.description}
            </AlertDialogDescription>
            </ShadAlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>{texts.login}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="p-0 border-b bg-card sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
                 <div className="cursor-pointer" onClick={() => router.push('/')}>
                    <Logo />
                </div>
                <Menubar className="border-none shadow-none bg-transparent">
                    <MenubarMenu>
                        <MenubarTrigger><Edit className="mr-2 h-4 w-4" />{texts.pdfEditing}</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => router.push('/merge-pdf')}><Combine className="mr-2 h-4 w-4" />{texts.mergePdfTitle}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/split-pdf')} disabled><Scissors className="mr-2 h-4 w-4" />{texts.splitPdfTitle}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/edit-pdf')}><ListOrdered className="mr-2 h-4 w-4" />{texts.reorderPdfPages}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/edit-pdf')}><Droplets className="mr-2 h-4 w-4" />{texts.addWatermarkTitle}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/protect-pdf')}><ShieldCheck className="mr-2 h-4 w-4" />{texts.protectPdfTitle}</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger><ArrowRightLeft className="mr-2 h-4 w-4" />{texts.pdfConversion}</MenubarTrigger>
                        <MenubarContent>
                            <MenubarSub>
                                <MenubarSubTrigger><FileUp className="mr-2 h-4 w-4" />{texts.convertToPdf}</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => router.push('/word-to-pdf')}><FileText className="mr-2 h-4 w-4" />{texts.wordToPdfTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/excel-to-pdf')}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.excelToPdfTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/ppt-to-pdf')}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pptToPdfTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/html-to-pdf')}><Code className="mr-2 h-4 w-4" />{texts.htmlToPdfTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/image-to-word')}><FileImage className="mr-2 h-4 w-4" />{texts.imageToWordTitle}</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSub>
                                <MenubarSubTrigger><FileMinus className="mr-2 h-4 w-4" />{texts.convertFromPdf}</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => router.push('/pdf-to-word')}><FileText className="mr-2 h-4 w-4" />{texts.pdfToWordTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.pdfToExcelTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-ppt')}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pdfToPptTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-html')}><Code className="mr-2 h-4 w-4" />{texts.pdfToHtmlTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-image')}><FileImage className="mr-2 h-4 w-4" />{texts.pdfToJpgTitle}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-ocr')}><ScanText className="mr-2 h-4 w-4" />{texts.pdfToOcrTitle}</MenubarItem>
                                     <MenubarItem onClick={() => router.push('/pdf-to-pdfa')}><ShieldCheck className="mr-2 h-4 w-4" />{texts.pdfToPdfaTitle}</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger onClick={() => router.push('/edit-pdf')} className="text-primary hover:text-primary focus:text-primary ring-1 ring-primary/50">
                            <Sparkles className="mr-2 h-4 w-4" />
                            {texts.proMode}
                        </MenubarTrigger>
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

      <main className="flex-grow p-6 overflow-y-auto flex flex-col items-center">
        {renderContent()}
      </main>
    </div>
  )
}
