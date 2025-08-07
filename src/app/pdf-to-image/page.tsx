
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { Upload, Scissors, Download, FilePlus, LogIn, LogOut, UserCircle, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, ShieldCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Logo from '@/components/ui/Logo';
import { translations } from '@/lib/translations';
import LoadingState from '@/components/ui/LoadingState';
import SuccessState from '@/components/ui/SuccessState';


const supportedFormats = ['jpg', 'png', 'webp', 'tiff', 'bmp'];

type ViewState = 'idle' | 'loading' | 'success';


export default function PdfToImagePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageFormat, setImageFormat] = useState('jpg');
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [guestLimitModalContent, setGuestLimitModalContent] = useState({ title: '', description: '' });
  
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const [viewState, setViewState] = useState<ViewState>('idle');
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);
      
      const today = new Date().toISOString().split('T')[0];
      const lastUsed = localStorage.getItem('pdfLastUsed');
      if (lastUsed !== today) {
        localStorage.setItem('pdfDailyCount', '5');
        localStorage.setItem('pdfConvertCount', '1');
        localStorage.setItem('pdfLastUsed', today);
      }
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
  
  const checkAndDecrementQuota = useCallback((): boolean => {
      if (isLoggedIn || typeof window === 'undefined') {
        return true;
      }
      const today = new Date().toISOString().split('T')[0];
      const lastUsed = localStorage.getItem('pdfLastUsed');
      if (lastUsed !== today) {
        localStorage.setItem('pdfDailyCount', '5');
        localStorage.setItem('pdfConvertCount', '1');
        localStorage.setItem('pdfLastUsed', today);
      }
      const key = 'pdfConvertCount';
      let currentCount = parseInt(localStorage.getItem(key) || '1', 10);
      if (isNaN(currentCount)) {
          currentCount = 1;
      }
      if (currentCount <= 0) {
        setGuestLimitModalContent({
          title: texts.convertLimitTitle,
          description: texts.convertLimitDescription
        });
        setIsGuestLimitModalOpen(true);
        return false;
      }
      localStorage.setItem(key, String(currentCount - 1));
      return true;
  }, [isLoggedIn, texts]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setSelectedFile(file);
      } else {
        toast({ title: texts.invalidFileError, description: texts.invalidFileErrorDesc, variant: 'destructive' });
        setSelectedFile(null);
      }
    }
  };
  
  const resetPage = () => {
    setViewState('idle');
    setProgress(0);
    setLoadingMessage('');
    setSuccessMessage('');
    setSelectedFile(null);
    if (fileUploadRef.current) fileUploadRef.current.value = '';
  };

  const handleStartLoading = (message: string) => {
    setLoadingMessage(message);
    setViewState('loading');
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
    resetPage();
    toast({ title: texts.conversionError, description: message, variant: "destructive" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
        toast({ title: texts.noFileSelected, variant: 'destructive'});
        return;
    }
    
    if (!checkAndDecrementQuota()) {
      return;
    }

    handleStartLoading(texts.convertingMessage(selectedFile.name));
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("target_format", imageFormat);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch("https://pdfsolution.dpdns.org/api/pdf-to-image", {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const clonedResponse = response.clone();
        let errorMessage = `Conversion failed with status: ${response.status}`;
        try {
            const error = await clonedResponse.json();
            errorMessage = String(error.detail || error.error || "An unknown server error occurred.");
        } catch (e) {
             try {
                const errorText = await clonedResponse.text();
                errorMessage = `Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`;
             } catch (textError) {
                errorMessage = `Server returned an unreadable error with status: ${response.status}`;
             }
        }
        throw new Error(errorMessage);
      }
      
      const resBlob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFilename = 'result.zip';

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
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      handleSuccess(texts.conversionSuccessDesc(downloadFilename));

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
          handleError(texts.timeoutErrorDesc);
      } else {
          handleError(err.message);
      }
    }
  };
  
  const renderContent = () => {
    switch(viewState) {
        case 'loading':
            return <LoadingState message={loadingMessage} progress={progress} />;
        case 'success':
            return <SuccessState message={successMessage} onGoHome={() => router.push('/')} onStartNew={resetPage} texts={texts} />;
        case 'idle':
        default:
            return (
              <Card className="max-w-2xl w-full mx-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <FileImage className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>{texts.pdfToJpgTitle}</CardTitle>
                    <CardDescription>{texts.pdfToJpgDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div 
                      className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                      onClick={() => fileUploadRef.current?.click()}
                    >
                        <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-md text-muted-foreground text-center">
                          {selectedFile ? selectedFile.name : texts.uploadButton}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{texts.uploadHint(isLoggedIn)}</p>
                        <Input
                            type="file"
                            ref={fileUploadRef}
                            onChange={handleFileChange}
                            accept="application/pdf,.pdf"
                            required
                            className="hidden"
                        />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image-format">{texts.targetFormat}</Label>
                      <Select value={imageFormat} onValueChange={setImageFormat}>
                          <SelectTrigger id="image-format" className="w-full">
                              <SelectValue placeholder={texts.selectFormat} />
                          </SelectTrigger>
                          <SelectContent>
                              {supportedFormats.map(f => (
                                  <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={!selectedFile}>
                      <Download className="mr-2 h-4 w-4" />
                      {texts.convertButton}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
    }
  }


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
                                    <MenubarItem onClick={() => router.push('/pdf-to-image')} disabled><FileImage className="mr-2 h-4 w-4" />{texts.pdfToJpgTitle}</MenubarItem>
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

      <main className="flex-grow p-6 overflow-y-auto flex items-center justify-center">
          {renderContent()}
      </main>
    </div>
  )
}
