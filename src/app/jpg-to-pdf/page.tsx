
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { Loader2, Upload, Scissors, Download, FilePlus, LogIn, LogOut, UserCircle, MenuSquare, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle } from "@/components/ui/alert-dialog";

const translations = {
  en: {
    pageTitle: 'Image to PDF',
    pageDescription: 'Convert your JPG, PNG, and other images into a single PDF file.',
    startTitle: 'Upload Image Files to Convert to PDF',
    startDescription: 'Select one or more image files to begin.',
    uploadButton: 'Click or drag files here to upload',
    convertButton: 'Convert to PDF',
    convertingMessage: 'Processing...',
    conversionSuccess: 'Conversion Complete',
    conversionSuccessDesc: (filename: string) => `${filename} has been downloaded successfully.`,
    conversionError: 'Conversion failed',
    timeoutErrorDesc: 'The request timed out. Please try again.',
    appTitle: 'Pdf Solution',
    loggedInAs: 'Logged in as User',
    login: 'Login',
    logout: 'Logout',
    guest: 'Guest',
    noFilesSelected: 'Please select at least one file to convert.',
    invalidFileError: 'Invalid File Detected',
    invalidFileErrorDesc: (filename: string) => `File "${filename}" is not a valid image file.`,
    proMode: 'Professional Mode',
    cancel: 'Cancel',
    confirm: 'Confirm',
    convertLimitTitle: 'Conversion Limit Reached',
    convertLimitDescription: 'Your free conversion for today has been used. Register to get 3 conversions daily.',
    filesSelected: 'files selected',
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
    jpgToPdf: 'JPG to Image',
    pdfToWord: 'PDF to WORD',
    pdfToExcel: 'PDF to EXCEL',
    pdfToPpt: 'PDF to PPT',
    pdfToHtml: 'PDF to HTML',
    pdfToJpg: 'PDF to Image',
    pdfToOcr: 'PDF with OCR',
  },
  zh: {
    pageTitle: '圖片轉 PDF',
    pageDescription: '將您的 JPG、PNG 等圖片檔案轉換為單一 PDF 檔案。',
    startTitle: '上傳圖片檔案以轉換為 PDF',
    startDescription: '選擇一個或多個圖片檔案以開始。',
    uploadButton: '點擊或拖曳檔案到此處以上傳',
    convertButton: '轉換為 PDF',
    convertingMessage: '處理中...',
    conversionSuccess: '轉換完成',
    conversionSuccessDesc: (filename: string) => `${filename} 已成功下載。`,
    conversionError: '轉換失敗',
    timeoutErrorDesc: '請求逾時，請再試一次。',
    appTitle: 'Pdf Solution',
    loggedInAs: '已登入為使用者',
    login: '登入',
    logout: '登出',
    guest: '訪客',
    noFilesSelected: '請至少選擇一個要轉換的檔案。',
    invalidFileError: '偵測到無效檔案',
    invalidFileErrorDesc: (filename: string) => `檔案 "${filename}" 不是有效的圖片檔案。`,
    proMode: '專業模式',
    cancel: '取消',
    confirm: '確認',
    convertLimitTitle: '轉檔次數已用完',
    convertLimitDescription: '您今日的免費轉檔次數已用完，註冊即可獲得每日 3 次轉換。',
    filesSelected: '個檔案已選取',
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
    pdfToHtml: 'PDF轉HTML',
    pdfToJpg: 'PDF轉圖片',
    pdfToOcr: 'PDF光學掃描(OCR)',
  },
};

const FilePreview = ({ file, onRemove }: { file: File, onRemove: (fileName: string) => void }) => (
    <div className="flex items-center gap-2 p-2 border rounded-md text-sm bg-muted/50">
        <FileImage className="h-5 w-5 text-primary flex-shrink-0" />
        <span className="flex-grow min-w-0 truncate">{file.name}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => onRemove(file.name)}>
            <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
    </div>
);

export default function JpgToPdfPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [guestLimitModalContent, setGuestLimitModalContent] = useState({ title: '', description: '' });
  
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const format = 'pdf'; // Hardcoded format

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
    const files = event.target.files;
    if (files) {
        const validFiles: File[] = [];
        Array.from(files).forEach(file => {
            const fileType = file.type;
            if (fileType.startsWith('image/')) {
                validFiles.push(file);
            } else {
                toast({ title: texts.invalidFileError, description: texts.invalidFileErrorDesc(file.name), variant: 'destructive' });
            }
        });
        setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };
  
  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
        toast({ title: texts.conversionError, description: texts.noFilesSelected, variant: 'destructive'});
        return;
    }
    
    if (!checkAndDecrementQuota()) {
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("files[]", file);
    });
    formData.append("format", format);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch("http://pdfsolution.dpdns.org:5001/upload", {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `Conversion failed with status: ${response.status}`;
        try {
            const error = await response.json();
            errorMessage = String(error.error || "An unknown server error occurred.");
        } catch (e) {
            errorMessage = `An unexpected server error occurred: ${response.statusText} (${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      const resBlob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFilename = 'result.pdf';

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

      toast({ 
        title: texts.conversionSuccess,
        description: texts.conversionSuccessDesc(downloadFilename)
      });
      setSelectedFiles([]);
      if(fileUploadRef.current) fileUploadRef.current.value = '';

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
          toast({ title: texts.conversionError, description: texts.timeoutErrorDesc, variant: "destructive" });
      } else {
          toast({ title: texts.conversionError, description: err.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">{texts.convertingMessage}</p>
        </div>
      )}
      
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
                            <MenubarItem onClick={() => router.push('/split-pdf')}><Scissors className="mr-2 h-4 w-4" />{texts.splitPdf}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/edit-pdf')}><ListOrdered className="mr-2 h-4 w-4" />{texts.reorderPdfPages}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/edit-pdf')}><Droplets className="mr-2 h-4 w-4" />{texts.addWatermark}</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger><ArrowRightLeft className="mr-2 h-4 w-4" />{texts.pdfConvertMenu}</MenubarTrigger>
                        <MenubarContent>
                            <MenubarSub>
                                <MenubarSubTrigger><FileUp className="mr-2 h-4 w-4" />{texts.convertToPdf}</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => router.push('/word-to-pdf')}><FileText className="mr-2 h-4 w-4" />{texts.wordToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/excel-to-pdf')}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.excelToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/ppt-to-pdf')}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pptToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/html-to-pdf')}><Code className="mr-2 h-4 w-4" />{texts.htmlToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/jpg-to-pdf')} disabled><FileImage className="mr-2 h-4 w-4" />{texts.jpgToPdf}</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSub>
                                <MenubarSubTrigger><FileMinus className="mr-2 h-4 w-4" />{texts.convertFromPdf}</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => router.push('/pdf-to-word')}><FileText className="mr-2 h-4 w-4" />{texts.pdfToWord}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.pdfToExcel}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-ppt')}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pdfToPpt}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-html')}><Code className="mr-2 h-4 w-4" />{texts.pdfToHtml}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-image')}><FileImage className="mr-2 h-4 w-4" />{texts.pdfToJpg}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-ocr')}><ScanText className="mr-2 h-4 w-4" />{texts.pdfToOcr}</MenubarItem>
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
          <Card className="max-w-2xl w-full mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <FileImage className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>{texts.pageTitle}</CardTitle>
                <CardDescription>{texts.startDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div 
                  className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                  onClick={() => fileUploadRef.current?.click()}
                >
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground text-center">
                      {selectedFiles.length === 0 ? texts.uploadButton : `${selectedFiles.length} ${texts.filesSelected}`}
                    </p>
                    <Input
                        type="file"
                        ref={fileUploadRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                </div>

                {selectedFiles.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                        {selectedFiles.map(file => (
                            <FilePreview key={file.name} file={file} onRemove={removeFile} />
                        ))}
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || selectedFiles.length === 0}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {texts.convertButton}
                </Button>
              </form>
            </CardContent>
          </Card>
      </main>
    </div>
  )
}
