
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { Loader2, Upload, Scissors, Download, FilePlus, LogIn, LogOut, UserCircle, MenuSquare, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, File, XCircle } from 'lucide-react';

const translations = {
  en: {
    pageTitle: 'Pro Mode: Batch PDF Conversion',
    pageDescription: 'Convert up to 5 PDF files at once to your desired format.',
    selectFormat: 'Select Target Format',
    uploadAreaTitle: 'Upload PDF Files',
    uploadButton: 'Click or drag up to 5 files here',
    convertButton: 'Convert All Files',
    convertingMessage: 'Converting...',
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
    pptToPdf: 'PPT to PPT',
    htmlToPdf: 'HTML to HTML',
    jpgToPdf: 'JPG to Image',
    pdfToWord: 'PDF to WORD',
    pdfToExcel: 'PDF to EXCEL',
    pdfToPpt: 'PDF to PPT',
    pdfToHtml: 'PDF to HTML',
    pdfToJpg: 'PDF to Image',
    pdfToOcr: 'PDF with OCR',
    proMode: 'Pro Mode',
    noFilesSelected: 'Please select files to convert.',
    tooManyFiles: 'You can only select up to 5 files at a time.',
    invalidFileError: 'Some files were not valid PDFs and were removed.',
    conversionError: 'Conversion failed',
    status_waiting: 'Waiting',
    status_uploading: 'Uploading...',
    status_converting: 'Converting...',
    status_done: 'Done!',
    status_error: 'Error',
  },
  zh: {
    pageTitle: '專業模式：PDF 批次轉換',
    pageDescription: '一次最多可將 5 個 PDF 檔案轉換為您想要的格式。',
    selectFormat: '選擇目標格式',
    uploadAreaTitle: '上傳 PDF 檔案',
    uploadButton: '點擊或拖曳最多 5 個檔案到此處',
    convertButton: '轉換所有檔案',
    convertingMessage: '轉換中...',
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
    proMode: '專業模式',
    noFilesSelected: '請選擇要轉換的檔案。',
    tooManyFiles: '一次最多只能選擇 5 個檔案。',
    invalidFileError: '部分檔案不是有效的 PDF，已被移除。',
    conversionError: '轉換失敗',
    status_waiting: '等待中',
    status_uploading: '上傳中...',
    status_converting: '轉換中...',
    status_done: '完成！',
    status_error: '錯誤',
  },
};

const formatOptions = [
  { value: 'word', labelKey: 'pdfToWord' },
  { value: 'excel', labelKey: 'pdfToExcel' },
  { value: 'ppt', labelKey: 'pdfToPpt' },
  { value: 'html', labelKey: 'pdfToHtml' },
  { value: 'image', labelKey: 'pdfToJpg' },
  { value: 'ocr', labelKey: 'pdfToOcr' },
];

const MAX_FILES = 5;

type UploadStatus = {
    status: 'waiting' | 'uploading' | 'converting' | 'done' | 'error';
    progress: number;
    error?: string;
};

export default function ProConvertPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('word');
  const [isConverting, setIsConverting] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<{ [fileName: string]: UploadStatus }>({});

  const fileUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);

  const updateLanguage = (lang: 'en' | 'zh') => setCurrentLanguage(lang);
  
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (files.length > MAX_FILES) {
        toast({ title: texts.tooManyFiles, variant: 'destructive' });
        return;
    }

    const validFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    if (validFiles.length !== files.length) {
        toast({ title: texts.invalidFileError, variant: 'destructive' });
    }

    setSelectedFiles(validFiles);
    const initialStatuses: { [fileName: string]: UploadStatus } = {};
    validFiles.forEach(file => {
        initialStatuses[file.name] = { status: 'waiting', progress: 0 };
    });
    setUploadStatuses(initialStatuses);
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadStatuses(prev => {
        const newStatuses = {...prev};
        delete newStatuses[fileName];
        return newStatuses;
    });
  };
  
  const convertSingleFile = async (file: File) => {
      setUploadStatuses(prev => ({ ...prev, [file.name]: { status: 'uploading', progress: 25 } }));
      
      const formData = new FormData();
      const blob = new Blob([file], { type: 'application/pdf' });
      formData.append("file", blob, file.name);
      formData.append("format", targetFormat);

      try {
          const response = await fetch("https://pdfsolution.dpdns.org/upload", {
              method: 'POST',
              body: formData,
          });

          setUploadStatuses(prev => ({ ...prev, [file.name]: { status: 'converting', progress: 75 } }));

          if (!response.ok) {
              const error = await response.json();
              throw new Error(String(error.error || "Conversion failed."));
          }

          const resBlob = await response.blob();
          const contentDisposition = response.headers.get('Content-Disposition');
          let downloadFilename = file.name.replace(/\.pdf$/i, `.${targetFormat}`);
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
          
          setUploadStatuses(prev => ({ ...prev, [file.name]: { status: 'done', progress: 100 } }));

      } catch (err: any) {
          setUploadStatuses(prev => ({ ...prev, [file.name]: { status: 'error', progress: 0, error: err.message } }));
          toast({ title: `${file.name}: ${texts.conversionError}`, description: err.message, variant: "destructive" });
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
        toast({ title: texts.conversionError, description: texts.noFilesSelected, variant: 'destructive'});
        return;
    }

    setIsConverting(true);
    await Promise.all(selectedFiles.map(file => convertSingleFile(file)));
    setIsConverting(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
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
                            <MenubarItem onClick={() => router.push('/edit-pdf')}><ListOrdered className="mr-2 h-4 w-4" />{texts.reorderPdfPages}</MenubarItem>
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
                        <MenubarTrigger onClick={() => router.push('/pro-convert')} className="text-primary hover:text-primary focus:text-primary ring-1 ring-primary/50">
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

      <main className="flex-grow p-6 overflow-y-auto flex items-start justify-center">
          <Card className="max-w-4xl w-full mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>{texts.pageTitle}</CardTitle>
                <CardDescription>{texts.pageDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-1">
                        <label htmlFor="targetFormat" className="text-sm font-medium text-muted-foreground">{texts.selectFormat}</label>
                        <Select value={targetFormat} onValueChange={setTargetFormat} required>
                            <SelectTrigger id="targetFormat" className="mt-1">
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                {formatOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {texts[opt.labelKey as keyof typeof texts]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">{texts.uploadAreaTitle}</label>
                        <div 
                          className="mt-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                          onClick={() => fileUploadRef.current?.click()}
                        >
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground text-center">
                              {texts.uploadButton}
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
                    </div>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Selected Files:</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {selectedFiles.map(file => (
                                <div key={file.name} className="flex items-center gap-3 p-2 border rounded-md">
                                    <File className="h-5 w-5 text-primary flex-shrink-0" />
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{texts[`status_${uploadStatuses[file.name]?.status}` as keyof typeof texts] || texts.status_waiting}</span>
                                            {uploadStatuses[file.name]?.status === 'error' && (
                                                <span className="text-destructive truncate" title={uploadStatuses[file.name]?.error}>- {uploadStatuses[file.name]?.error}</span>
                                            )}
                                        </div>
                                        <Progress value={uploadStatuses[file.name]?.progress || 0} className="h-1.5 mt-1" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removeFile(file.name)} disabled={isConverting}>
                                        <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isConverting || selectedFiles.length === 0}>
                  {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {texts.convertButton}
                </Button>
              </form>
            </CardContent>
          </Card>
      </main>
    </div>
  )
}
