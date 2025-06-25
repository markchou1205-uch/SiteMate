
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { Loader2, Upload, Scissors, Download, FilePlus, LogIn, LogOut, UserCircle, MenuSquare, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, XCircle, Star } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';

const MAX_BATCH_FILES = 10;
const MAX_TOTAL_SIZE_MB = 50;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

type UploadStatus = {
    status: 'waiting' | 'uploading' | 'converting' | 'done' | 'error';
    progress: number;
    error?: string;
};

const translations = {
  en: {
    pageTitle: 'Word to PDF',
    pageDescription: 'Convert your Word documents into standard PDF files.',
    startTitle: 'Upload Word File to Convert to PDF',
    startDescription: 'Select a Word file (.doc, .docx) to begin.',
    uploadButton: 'Click or drag file(s) here',
    uploadHint: (isLoggedIn: boolean) => `Max file size: ${isLoggedIn ? '5MB' : '3MB'}. Single file only.`,
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
    noFileSelected: 'Please select a file to convert.',
    invalidFileError: 'Invalid File Detected',
    invalidFileErrorDesc: (filename: string) => `File "${filename}" is not a valid Word document.`,
    fileTooLargeError: (limit: number) => `File is too large. The maximum size for your account is ${limit}MB.`,
    proMode: 'Professional Mode',
    cancel: 'Cancel',
    confirm: 'Confirm',
    convertLimitTitle: 'Conversion Limit Reached',
    convertLimitDescription: 'Your free conversion for today has been used. Register to get 3 conversions daily.',
    filesSelected: 'file(s) selected',
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
    upgradePromptTitle: "Tired of one-by-one? Files too large?",
    upgradePromptDescription: "Try our 'Batch Convert' and 'Extended File Size' services to save your precious time!",
    enableBatchMode: "Increase file size limit or batch convert",
    batchModalTitle: "Upgrade to Batch Conversion",
    batchModalDescription: "Process up to 10 files at once and unlock premium features. Choose a plan to get started.",
    upgrade: "Upgrade Now",
    featureNotAvailable: "Feature Not Available",
    featureNotAvailableForGuests: "This feature is not available for guest users. Please log in to use it.",
    tooManyFiles: 'You can only select up to 10 files at a time.',
    totalSizeExceeded: (size: number) => `Total file size cannot exceed ${size}MB.`,
    status_waiting: 'Waiting',
    status_uploading: 'Uploading...',
    status_converting: 'Converting...',
    status_done: 'Done!',
    status_error: 'Error',
    planInfo: (files: number, size: number) => `Your current plan allows you to upload ${files} files at once, with a total size of up to ${size}MB.`,
    usageInfo: (files: number, size: string, remainingFiles: number, remainingSize: string) => `You have selected ${files} file(s), with a total size of ${size}MB. (You can still upload ${remainingFiles} more files or ${remainingSize}MB).`
  },
  zh: {
    pageTitle: 'Word 轉 PDF',
    pageDescription: '將您的 Word 文件轉換為標準的 PDF 檔案。',
    startTitle: '上傳 Word 檔案以轉換為 PDF',
    startDescription: '選擇一個 Word 檔案（.doc, .docx）以開始。',
    uploadButton: '點擊或拖曳檔案到此處',
    uploadHint: (isLoggedIn: boolean) => `檔案大小上限：${isLoggedIn ? '5MB' : '3MB'}。僅限單一檔案。`,
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
    noFileSelected: '請選擇一個要轉換的檔案。',
    invalidFileError: '偵測到無效檔案',
    invalidFileErrorDesc: (filename: string) => `檔案 "${filename}" 不是有效的 Word 文件。`,
    fileTooLargeError: (limit: number) => `檔案過大。您的帳戶目前上限為 ${limit}MB。`,
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
    upgradePromptTitle: "一件一件傳很麻煩嗎？文件太大嗎？",
    upgradePromptDescription: "來試試「批次轉檔」及「擴充檔案」服務來節省您的寶貴時間！",
    enableBatchMode: "提升檔案大小限制或批次轉檔",
    batchModalTitle: "升級至批次轉換",
    batchModalDescription: "一次處理最多 10 個檔案並解鎖高階功能。選擇一個方案立即開始。",
    upgrade: "立即升級",
    featureNotAvailable: "功能無法使用",
    featureNotAvailableForGuests: "此功能不適用於訪客。請登入後使用。",
    tooManyFiles: '一次最多只能選擇 10 個檔案。',
    totalSizeExceeded: (size: number) => `總檔案大小不能超過 ${size}MB。`,
    status_waiting: '等待中',
    status_uploading: '上傳中...',
    status_converting: '轉換中...',
    status_done: '完成！',
    status_error: '錯誤',
    planInfo: (files: number, size: number) => `您加購的方案為：同時上傳 ${files} 份文件，大小總計不超過 ${size}MB。`,
    usageInfo: (files: number, size: string, remainingFiles: number, remainingSize: string) => `目前您已選擇 ${files} 份文件，大小總計 ${size}MB (尚可上傳 ${remainingFiles} 份文件或 ${remainingSize}MB)`
  },
};

export default function WordToPdfPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [guestLimitModalContent, setGuestLimitModalContent] = useState({ title: '', description: '' });
  
  // Batch Conversion State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<{ [fileName: string]: UploadStatus }>({});
  const [batchTotalSize, setBatchTotalSize] = useState(0);

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const batchFileUploadRef = useRef<HTMLInputElement>(null);
  const format = 'pdf';

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
      const total = batchFiles.reduce((acc, file) => acc + file.size, 0);
      setBatchTotalSize(total);
  }, [batchFiles]);

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
      if (isLoggedIn) return true;

      const key = 'pdfConvertCount';
      let currentCount = parseInt(localStorage.getItem(key) || '1', 10);
      if (isNaN(currentCount)) currentCount = 1;

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
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        if (!(fileType === 'application/msword' || 
              fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
              fileName.endsWith('.doc') || fileName.endsWith('.docx'))) {
            toast({ title: texts.invalidFileError, description: texts.invalidFileErrorDesc(file.name), variant: 'destructive' });
            return;
        }

        const sizeLimit = isLoggedIn ? 5 * 1024 * 1024 : 3 * 1024 * 1024;
        if (file.size > sizeLimit) {
            toast({ title: texts.fileTooLargeError(isLoggedIn ? 5 : 3), variant: 'destructive'});
            return;
        }

        setSelectedFile(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
        toast({ title: texts.conversionError, description: texts.noFilesSelected, variant: 'destructive'});
        return;
    }
    
    if (!checkAndDecrementQuota()) {
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("format", format);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch("https://pdfsolution.dpdns.org/convert_to_pdf", {
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
            errorMessage = String(error.error || "An unknown server error occurred.");
        } catch (e) {
             const errorText = await response.text();
             errorMessage = `Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`;
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
      } else if (resBlob.type === 'application/zip') {
        downloadFilename = 'converted_files.zip';
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
      setSelectedFile(null);
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

  const handleBatchFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    if (newFiles.length === 0) return;

    const allFiles = [...batchFiles, ...newFiles];
    const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);

    if (allFiles.length > MAX_BATCH_FILES) {
        toast({ title: texts.tooManyFiles, variant: 'destructive' });
        return;
    }
    
    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
        toast({ title: texts.totalSizeExceeded(MAX_TOTAL_SIZE_MB), variant: 'destructive' });
        return;
    }

    setBatchFiles(allFiles);

    const newStatuses: { [fileName: string]: UploadStatus } = {};
    allFiles.forEach(file => {
        newStatuses[file.name] = uploadStatuses[file.name] || { status: 'waiting', progress: 0 };
    });
    setUploadStatuses(newStatuses);
  };
  
  const removeBatchFile = (fileName: string) => {
    setBatchFiles(prev => prev.filter(f => f.name !== fileName));
    setUploadStatuses(prev => {
        const newStatuses = {...prev};
        delete newStatuses[fileName];
        return newStatuses;
    });
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchFiles.length === 0) {
        toast({ title: texts.conversionError, description: texts.noFilesSelected, variant: 'destructive'});
        return;
    }
    
    setIsConverting(true);
    setUploadStatuses(prev => {
      const newStatuses: { [fileName: string]: UploadStatus } = {};
      batchFiles.forEach(file => {
          newStatuses[file.name] = { status: 'converting', progress: 50 };
      });
      return newStatuses;
    });

    const formData = new FormData();
    let endpoint = "";

    if (batchFiles.length === 1) {
      formData.append("file", batchFiles[0]);
      endpoint = "https://pdfsolution.dpdns.org/convert_to_pdf";
    } else {
      batchFiles.forEach(file => {
        formData.append("file", file);
      });
      endpoint = "https://pdfsolution.dpdns.org/batch-upload";
    }
    formData.append("format", format);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(endpoint, {
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
            errorMessage = String(error.error || "An unknown server error occurred.");
        } catch (jsonError) {
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
      let downloadFilename = 'converted_files.zip';
      
      const url = window.URL.createObjectURL(resBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setUploadStatuses(prev => {
        const newStatuses: { [fileName: string]: UploadStatus } = {};
        batchFiles.forEach(file => {
            newStatuses[file.name] = { status: 'done', progress: 100 };
        });
        return newStatuses;
      });
      toast({ title: texts.conversionSuccess, description: texts.conversionSuccessDesc(downloadFilename)});
      setBatchFiles([]);

    } catch (err: any) {
      clearTimeout(timeoutId);
      setUploadStatuses(prev => {
        const newStatuses: { [fileName: string]: UploadStatus } = {};
        batchFiles.forEach(file => {
            newStatuses[file.name] = { status: 'error', progress: 0, error: err.message };
        });
        return newStatuses;
      });
      toast({ title: texts.conversionError, description: err.message, variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  const totalSizeMB = (batchTotalSize / (1024 * 1024)).toFixed(2);
  const remainingFiles = MAX_BATCH_FILES - batchFiles.length;
  const remainingMB = Math.max(0, (MAX_TOTAL_SIZE_BYTES - batchTotalSize) / (1024 * 1024));

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
      
      <AlertDialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
        <AlertDialogContent className="max-w-2xl">
            <ShadAlertDialogHeader>
                <ShadAlertDialogTitle>{texts.batchModalTitle}</ShadAlertDialogTitle>
                <AlertDialogDescription>{texts.batchModalDescription}</AlertDialogDescription>
            </ShadAlertDialogHeader>
            <form onSubmit={handleBatchSubmit} className="space-y-4">
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md space-y-1">
                    <p>{texts.planInfo(MAX_BATCH_FILES, MAX_TOTAL_SIZE_MB)}</p>
                    <p>{texts.usageInfo(batchFiles.length, totalSizeMB, remainingFiles, remainingMB.toFixed(2))}</p>
                </div>
                <div 
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                onClick={() => batchFileUploadRef.current?.click()}
                >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Click or drag up to {MAX_BATCH_FILES} files here
                    </p>
                    <Input
                        type="file"
                        ref={batchFileUploadRef}
                        onChange={handleBatchFileChange}
                        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        multiple
                        className="hidden"
                    />
                </div>
                {batchFiles.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {batchFiles.map(file => (
                            <div key={file.name} className="flex items-center gap-2 p-1.5 border rounded-md text-xs">
                                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                <div className="flex-grow min-w-0">
                                    <p className="font-medium truncate">{file.name}</p>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span>{texts[`status_${uploadStatuses[file.name]?.status}` as keyof typeof texts] || texts.status_waiting}</span>
                                        {uploadStatuses[file.name]?.status === 'error' && (
                                            <span className="text-destructive truncate" title={uploadStatuses[file.name]?.error}>- {uploadStatuses[file.name]?.error}</span>
                                        )}
                                    </div>
                                    <Progress value={uploadStatuses[file.name]?.progress || 0} className="h-1 mt-1" />
                                </div>
                                <Button variant="ghost" size="icon" className="h-5 w-5 flex-shrink-0" onClick={() => removeBatchFile(file.name)} disabled={isConverting}>
                                    <XCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                 <Button type="submit" className="w-full" disabled={isConverting || batchFiles.length === 0}>
                    {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {texts.convertButton}
                </Button>
            </form>
            <AlertDialogFooter className="mt-4">
                <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
                <AlertDialogAction>{texts.upgrade}</AlertDialogAction>
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
                                    <MenubarItem onClick={() => router.push('/word-to-pdf')} disabled><FileText className="mr-2 h-4 w-4" />{texts.wordToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/excel-to-pdf')}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.excelToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/ppt-to-pdf')}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pptToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/html-to-pdf')}><Code className="mr-2 h-4 w-4" />{texts.htmlToPdf}</MenubarItem>
                                    <MenubarItem onClick={() => {toast({title: texts.featureNotAvailable, description: texts.featureNotAvailableForGuests})}}><FileImage className="mr-2 h-4 w-4" />{texts.jpgToPdf}</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSub>
                                <MenubarSubTrigger><FileMinus className="mr-2 h-4 w-4" />{texts.convertFromPdf}</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem onClick={() => router.push('/pdf-to-word')}><FileText className="mr-2 h-4 w-4" />{texts.pdfToWord}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.pdfToExcel}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-ppt')}><LucidePresentation className="mr-2 h-4 w-4" />{texts.pdfToPpt}</MenubarItem>
                                    <MenubarItem onClick={() => router.push('/pdf-to-html')}><Code className="mr-2 h-4 w-4" />{texts.pdfToHtml}</MenubarItem>
                                    <MenubarItem onClick={() => toast({title: texts.featureNotAvailable, description: texts.featureNotAvailableForGuests})}><FileImage className="mr-2 h-4 w-4" />{texts.pdfToJpg}</MenubarItem>
                                    <MenubarItem onClick={() => { if(isLoggedIn) router.push('/pdf-to-ocr'); else toast({title: texts.featureNotAvailable, description: texts.featureNotAvailableForGuests})}}><ScanText className="mr-2 h-4 w-4" />{texts.pdfToOcr}</MenubarItem>
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
        <div className="w-full max-w-4xl space-y-8">
            <Card className="w-full">
              <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                      <FileUp className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle>{texts.pageTitle}</CardTitle>
                  <CardDescription>{texts.startDescription}</CardDescription>
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
                      <p className="text-xs text-muted-foreground mt-2">{texts.uploadHint(isLoggedIn)}</p>
                      <Input
                          type="file"
                          ref={fileUploadRef}
                          onChange={handleFileChange}
                          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          multiple={false}
                          className="hidden"
                      />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || !selectedFile}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {texts.convertButton}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="w-full border-destructive/20 bg-destructive/5">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                            <Star className="text-yellow-500" />
                            {texts.upgradePromptTitle}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {texts.upgradePromptDescription}
                        </CardDescription>
                    </div>
                    <Button 
                        onClick={() => {
                          if (!isLoggedIn) {
                            toast({title: texts.featureNotAvailable, description: texts.featureNotAvailableForGuests, variant: 'destructive'});
                            return;
                          }
                          setIsBatchModalOpen(true)
                        }} 
                        variant="destructive" 
                        size="lg" 
                        className="shrink-0"
                    >
                        <span className="flex items-baseline gap-1.5 font-normal">
                            <span className="text-base font-semibold">提升檔案大小限制</span>
                            <span className="text-sm">或</span>
                            <span className="text-base font-semibold">批次轉檔</span>
                        </span>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  )
}
