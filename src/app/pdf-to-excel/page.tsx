
"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Scissors, Download, FilePlus, LogIn, LogOut, UserCircle, MenuSquare, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText } from 'lucide-react';
import { cn } from '@/lib/utils';

const translations = {
  en: {
    pageTitle: 'Batch PDF Converter',
    pageDescription: 'Convert multiple PDFs to various formats like Word, Excel, and more.',
    startTitle: 'Upload PDFs to Convert',
    startDescription: 'Select PDF files and choose the output format.',
    uploadButton: 'Click or drag files here to upload',
    selectFormatLabel: 'Choose output format:',
    convertButton: 'Upload and Convert',
    convertingMessage: 'Processing...',
    conversionSuccess: 'Batch Conversion Complete',
    conversionSuccessDesc: (success: number, failed: number) => `${success} file(s) succeeded, ${failed} file(s) failed. Your download will start in a new tab.`,
    conversionError: 'Conversion failed',
    conversionErrorDesc: 'Please check the files or server status.',
    timeoutErrorDesc: 'The request timed out. Please check your network or try again.',
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
    jpgToPdf: 'PDF to Image',
    pdfToWord: 'PDF to WORD',
    pdfToExcel: 'PDF to EXCEL',
    pdfToPpt: 'PDF to PPT',
    pdfToHtml: 'PDF to HTML',
    pdfToJpg: 'PDF to Image',
    pdfToOcr: 'PDF with OCR',
    selectedFiles: 'Selected Files',
    noFilesSelected: 'No files selected yet.',
    noFileSelected: 'Please select one or more files to convert.',
    invalidFileError: 'Invalid Files Detected',
    invalidFileErrorDesc: 'Some files were not valid PDFs and were ignored.',
  },
  zh: {
    pageTitle: 'PDF 多檔批次轉換',
    pageDescription: '將多個 PDF 檔案批次轉換為 Word、Excel 等多種格式。',
    startTitle: '上傳 PDF 以進行轉換',
    startDescription: '選擇多個 PDF 檔案並選擇輸出格式。',
    uploadButton: '點擊或拖曳檔案到此處以上傳',
    selectFormatLabel: '選擇輸出格式：',
    convertButton: '上傳並轉換',
    convertingMessage: '處理中...',
    conversionSuccess: '批次轉換完成',
    conversionSuccessDesc: (success: number, failed: number) => `${success} 個檔案成功，${failed} 個檔案失敗。下載將在新分頁開始。`,
    conversionError: '轉換失敗',
    conversionErrorDesc: '請檢查檔案或伺服器狀態。',
    timeoutErrorDesc: '請求逾時。請檢查您的網路連線或再試一次。',
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
    pdfToHtml: 'PDF轉HTML',
    pdfToJpg: 'PDF轉圖片',
    pdfToOcr: 'PDF光學掃描(OCR)',
    selectedFiles: '已選檔案',
    noFilesSelected: '尚未選取任何檔案。',
    noFileSelected: '請選取一個或多個要轉換的檔案。',
    invalidFileError: '偵測到無效檔案',
    invalidFileErrorDesc: '部分非 PDF 檔案已被忽略。',
  },
};

const formatOptions = [
  { value: 'word', labelKey: 'pdfToWord', icon: FileText, extension: 'docx' },
  { value: 'excel', labelKey: 'pdfToExcel', icon: FileSpreadsheet, extension: 'xlsx' },
  { value: 'ppt', labelKey: 'pdfToPpt', icon: LucidePresentation, extension: 'pptx' },
  { value: 'html', labelKey: 'pdfToHtml', icon: Code, extension: 'html' },
  { value: 'image', labelKey: 'pdfToJpg', icon: FileImage, extension: 'zip' },
  { value: 'ocr', labelKey: 'pdfToOcr', icon: ScanText, extension: 'txt' },
];

function PdfConverterContent() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("excel");
  const [isLoading, setIsLoading] = useState(false);
  
  const fileUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);
    }
  }, []);

  useEffect(() => {
    const formatFromUrl = searchParams.get('format');
    if (formatFromUrl && formatOptions.some(opt => opt.value === formatFromUrl)) {
      setFormat(formatFromUrl);
    }
  }, [searchParams]);

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

  const isPdf = (file: File) => {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const validFiles = Array.from(files).filter(isPdf);
        if (validFiles.length !== files.length) {
            toast({ title: texts.invalidFileError, description: texts.invalidFileErrorDesc, variant: 'destructive' });
        }
        setSelectedFiles(validFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
        toast({ title: texts.conversionError, description: texts.noFileSelected, variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('file', file);
    });
    formData.append('format', format);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch("https://pdfsolution.dpdns.org:5001/batch-upload", {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(String(result.error || texts.conversionErrorDesc));
      }

      const fullDownloadUrl = `https://pdfsolution.dpdns.org:5001${result.download_url}`;
      window.open(fullDownloadUrl, '_blank');

      const successCount = result.results.filter((r: any) => r.status === 'success').length;
      const failedCount = result.results.length - successCount;
      
      toast({ 
        title: texts.conversionSuccess,
        description: texts.conversionSuccessDesc(successCount, failedCount)
      });

      setSelectedFiles([]);
      if(fileUploadRef.current) fileUploadRef.current.value = '';

    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("PDF Conversion Fetch Error:", err);
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
                            <MenubarItem onClick={() => router.push('/split-pdf')}><Trash2 className="mr-2 h-4 w-4" />{texts.deletePdfPages}</MenubarItem>
                            <MenubarItem onClick={() => router.push('/split-pdf')}><FileUp className="mr-2 h-4 w-4" />{texts.extractPdfPages}</MenubarItem>
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
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=word')}><FileText className="mr-2 h-4 w-4" />{texts.pdfToWord}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.pdfToExcel}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=ppt')}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pdfToPpt}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=html')}><Code className="mr-2 h-4 w-4" />{texts.pdfToHtml}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=image')}><FileImage className="mr-2 h-4 w-4" />{texts.pdfToJpg}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel?format=ocr')}><ScanText className="mr-2 h-4 w-4" />{texts.pdfToOcr}</MenubarItem>
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

      <main className="flex-grow p-6 overflow-y-auto flex items-center justify-center">
          <Card className="max-w-2xl w-full mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <ArrowRightLeft className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>{texts.startTitle}</CardTitle>
                <CardDescription>{texts.pageDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div 
                  className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                  onClick={() => fileUploadRef.current?.click()}
                >
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground text-center">
                      {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : texts.uploadButton}
                    </p>
                    <Input
                        type="file"
                        ref={fileUploadRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        required
                        multiple
                        className="hidden"
                    />
                </div>
                
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        <Label>{texts.selectedFiles} ({selectedFiles.length})</Label>
                        <ScrollArea className="h-32 w-full rounded-md border p-2">
                            <ul className="space-y-1">
                                {selectedFiles.map((file, index) => (
                                <li key={index} className="text-sm text-muted-foreground truncate flex items-center justify-between">
                                    <span>{file.name}</span>
                                </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                )}


                <div className="space-y-2">
                  <Label htmlFor="format-select">{texts.selectFormatLabel}</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format-select">
                        <SelectValue placeholder="Select a format" />
                    </SelectTrigger>
                    <SelectContent>
                        {formatOptions.map(opt => {
                             const Icon = opt.icon;
                             return (
                                <SelectItem key={opt.value} value={opt.value}>
                                    <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span>{texts[opt.labelKey as keyof typeof texts]}</span>
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                  </Select>
                </div>


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

export default function PdfConverterPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PdfConverterContent />
        </Suspense>
    );
}

    