
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import Sortable from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Combine, Download, FilePlus, LogIn, LogOut, UserCircle, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Scissors, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, ShieldCheck } from 'lucide-react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import Logo from '@/components/ui/Logo';
import { translations } from '@/lib/translations';
import LoadingState from '@/components/ui/LoadingState';
import SuccessState from '@/components/ui/SuccessState';


interface DocumentObject {
  id: string;
  fileName: string;
  thumbnailUrl: string;
  pdfBytes: ArrayBuffer;
  pageCount: number;
}

const DocumentThumbnail = React.memo(({ doc, onRemove, texts }: { doc: DocumentObject; onRemove: (id: string) => void; texts: (typeof translations)['zh']}) => {
  return (
    <div
      className="page-preview-wrapper relative flex flex-col p-2 border-2 rounded-lg bg-card transition-all group cursor-move w-40"
      data-id={doc.id}
    >
      <div className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button variant="destructive" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onRemove(doc.id); }}>
          <Trash2 className="h-4 w-4" />
           <span className="sr-only">Remove {doc.fileName}</span>
        </Button>
      </div>
      <div className="w-full aspect-[1/1.414] bg-white rounded-md shadow-md overflow-hidden flex items-center justify-center">
        <img src={doc.thumbnailUrl} className="w-full h-full object-contain" alt={`Preview of ${doc.fileName}`} />
      </div>
      <div className="w-full mt-1 text-center">
        <p className="text-xs font-medium text-foreground truncate" title={doc.fileName}>
            {doc.fileName}
        </p>
        <p className="text-xs text-muted-foreground">
            {doc.pageCount} {texts.pageUnit}
        </p>
      </div>
    </div>
  );
});
DocumentThumbnail.displayName = 'DocumentThumbnail';


export default function MergePdfClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [documents, setDocuments] = useState<DocumentObject[]>([]);
  
  const [viewState, setViewState] = useState<'idle' | 'processing' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initialUploadRef = useRef<HTMLInputElement>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const sortableContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);

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
  
  const resetPage = () => {
      setViewState('idle');
      setProgress(0);
      setLoadingMessage('');
      setSuccessMessage('');
      setDocuments([]);
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
    setViewState(documents.length > 0 ? 'idle' : 'idle'); // Stay on page if there are other docs
    toast({ title: texts.pdfInsertError, description: message, variant: "destructive" });
  };

  const convertFileToPdf = async (file: File): Promise<ArrayBuffer> => {
    handleStartLoading(texts.convertingMessage(file.name));
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`https://pdfsolution.dpdns.org/convert_single_to_pdf`, { method: 'POST', body: formData });
    
    if (!response.ok) {
        throw new Error(`Failed to convert file. Status: ${response.status}`);
    }
    
    return await response.arrayBuffer();
  };

  const addFileAsDocument = async (file: File) => {
    handleStartLoading(texts.loadingOpeningFile(file.name));

    try {
        let pdfBytes: ArrayBuffer;
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
        
        const sizeLimit = (isLoggedIn ? 5 : 3) * 1024 * 1024;
        if (file.size > sizeLimit) {
            throw new Error(texts.fileTooLargeError(isLoggedIn ? 5 : 3));
        }

        if (isPdf) {
            pdfBytes = await file.arrayBuffer();
        } else {
            pdfBytes = await convertFileToPdf(file);
        }

        const { pdfjsLib } = await import('@/lib/pdf-worker');
        const pdfDocProxy = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        const page = await pdfDocProxy.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
        }

        const newDocument: DocumentObject = {
            id: uuidv4(),
            fileName: file.name,
            thumbnailUrl: canvas.toDataURL(),
            pdfBytes: pdfBytes,
            pageCount: pdfDocProxy.numPages,
        };
        
        setDocuments(prev => [...prev, newDocument]);
        setViewState('idle');
        toast({ title: texts.pdfInsertSuccess, description: texts.pdfInsertSuccessDesc(file.name) });

    } catch (err: any) {
        handleError(err.message);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;
      for (const file of Array.from(files)) {
          await addFileAsDocument(file);
      }
      if(event.target) event.target.value = ''; // Reset file input
  };
  
  const handleRemoveDocument = (id: string) => {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
  };
  
  const handleDownload = async () => {
    if (documents.length === 0) {
        toast({ title: texts.noPagesError, variant: "destructive" });
        return;
    }

    handleStartLoading(texts.loadingMergingFile);

    try {
        const pdfDocOut = await PDFLibDocument.create();
        for (const doc of documents) {
            const pdfToMerge = await PDFLibDocument.load(doc.pdfBytes);
            const copiedPages = await pdfDocOut.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
            copiedPages.forEach((page) => pdfDocOut.addPage(page));
        }
        
        const pdfBytes = await pdfDocOut.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = 'WujiPDF_merged.pdf';
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
  
  useEffect(() => {
    if (sortableContainerRef.current) {
        sortableInstanceRef.current?.destroy();
        sortableInstanceRef.current = Sortable.create(sortableContainerRef.current, {
            animation: 150,
            ghostClass: 'opacity-50',
            onEnd: (evt) => {
                if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
                setDocuments(prev => {
                    const newArray = Array.from(prev);
                    const [movedItem] = newArray.splice(evt.oldIndex!, 1);
                    newArray.splice(evt.newIndex!, 0, movedItem);
                    return newArray;
                });
            }
        });
    }
  }, [documents.length]);

  const renderContent = () => {
    switch (viewState) {
        case 'processing':
            return <LoadingState message={loadingMessage} progress={progress} />;
        case 'success':
            return <SuccessState message={successMessage} onGoHome={() => router.push('/')} onStartNew={resetPage} texts={texts} />;
        case 'idle':
        default:
            return documents.length === 0 ? (
                <Card 
                    className="w-full max-w-2xl"
                    onClick={() => initialUploadRef.current?.click()}
                >
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                            <Combine className="h-10 w-10 text-primary" />
                        </div>
                        <CardTitle>{texts.mergePdfTitle}</CardTitle>
                        <CardDescription>{texts.mergePdfDescription}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20">
                            <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="text-md text-muted-foreground text-center">{texts.uploadButton}</p>
                            <p className="text-xs text-muted-foreground mt-1">{texts.uploadHint(isLoggedIn)}</p>
                        </div>
                        <Input
                            type="file"
                            ref={initialUploadRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.html,.htm,image/*"
                            multiple
                            className="hidden"
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="w-full max-w-7xl">
                    <div ref={sortableContainerRef} className="flex flex-wrap items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        {documents.map((doc) => (
                            <DocumentThumbnail 
                                key={doc.id}
                                doc={doc}
                                onRemove={handleRemoveDocument}
                                texts={texts}
                            />
                        ))}
                        <div 
                            className="flex flex-col items-center justify-center p-2 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-card hover:border-primary w-40 aspect-[1/1.414]"
                            onClick={() => addFileRef.current?.click()}
                        >
                            <FilePlus className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-center text-muted-foreground">{texts.addAnotherPdf}</p>
                            <p className="text-xs text-muted-foreground/80 text-center mt-1 px-1">{texts.addFileTypesHint}</p>
                        </div>
                        <Input
                            type="file"
                            ref={addFileRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.html,.htm,image/*"
                            multiple
                            className="hidden"
                        />
                    </div>
                </div>
            );
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-0 border-b bg-card sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                    <Logo />
                </div>
                <Menubar className="border-none shadow-none bg-transparent">
                    <MenubarMenu>
                        <MenubarTrigger><Edit className="mr-2 h-4 w-4" />{texts.pdfEditing}</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem onClick={() => router.push('/merge-pdf')} disabled><Combine className="mr-2 h-4 w-4" />{texts.mergePdfTitle}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/split-pdf')}><Scissors className="mr-2 h-4 w-4" />{texts.splitPdfTitle}</MenubarItem>
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
                 {documents.length > 0 && viewState === 'idle' && (
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        {texts.mergePdfTitle}
                    </Button>
                )}
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

      <main className="flex-grow p-6 overflow-y-auto flex flex-col items-center justify-center">
        {renderContent()}
      </main>
    </div>
  )
}
