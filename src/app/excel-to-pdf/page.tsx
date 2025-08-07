
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { Download, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, XCircle, Star, ShieldCheck, Upload, Scissors, LogIn, LogOut, UserCircle, Edit, ArrowRightLeft } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { translations } from '@/lib/translations';
import LoadingState from '@/components/ui/LoadingState';
import SuccessState from '@/components/ui/SuccessState';


type UploadStatus = {
    status: 'waiting' | 'uploading' | 'converting' | 'done' | 'error';
    progress: number;
    error?: string;
};

type PlanDetails = {
  maxFiles: number;
  maxSizeMb: number;
  cost: number;
  name: string;
};

type ViewState = 'idle' | 'loading' | 'success';

export default function ExcelToPdfPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [guestLimitModalContent, setGuestLimitModalContent] = useState({ title: '', description: '' });
  
  // Batch & Upgrade Flow State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'A' | 'B' | 'C' | null>(null);
  const [extraMb, setExtraMb] = useState(0);
  const [finalPlanDetails, setFinalPlanDetails] = useState<PlanDetails | null>(null);

  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [currentConvertingFile, setCurrentConvertingFile] = useState('');
  const [uploadStatuses, setUploadStatuses] = useState<{ [fileName: string]: UploadStatus }>({});
  const [batchTotalSize, setBatchTotalSize] = useState(0);

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const batchFileUploadRef = useRef<HTMLInputElement>(null);
  
  // New state for loading/success views
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
        if (!(fileType === 'application/vnd.ms-excel' || 
            fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            fileName.endsWith('.xls') || fileName.endsWith('.xlsx'))) {
            toast({ title: texts.invalidFileError, description: texts.invalidFileErrorDesc, variant: 'destructive' });
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

  const resetPage = () => {
    setViewState('idle');
    setProgress(0);
    setLoadingMessage('');
    setSuccessMessage('');
    setSelectedFile(null);
    if (fileUploadRef.current) fileUploadRef.current.value = '';
    setBatchFiles([]);
    setUploadStatuses({});
    setIsConverting(false);
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch("https://pdfsolution.dpdns.org/convert_single_to_pdf", {
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
        } catch (jsonError) {
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

  const handleBatchFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!finalPlanDetails) return;
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    if (newFiles.length === 0) return;

    const allFiles = [...batchFiles, ...newFiles];
    const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);

    if (allFiles.length > finalPlanDetails.maxFiles) {
        toast({ title: texts.tooManyFiles, variant: 'destructive' });
        return;
    }
    
    if (totalSize > finalPlanDetails.maxSizeMb * 1024 * 1024) {
        toast({ title: texts.totalSizeExceeded(finalPlanDetails.maxSizeMb), variant: 'destructive' });
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
        toast({ title: texts.conversionError, description: texts.noFileSelected, variant: 'destructive'});
        return;
    }
    
    setIsConverting(true);
    setCurrentConvertingFile(batchFiles[0]?.name || '');
    setUploadStatuses(prev => {
      const newStatuses: { [fileName: string]: UploadStatus } = {};
      batchFiles.forEach(file => {
          newStatuses[file.name] = { status: 'converting', progress: 10 };
      });
      return newStatuses;
    });

    const progressInterval = setInterval(() => {
        setUploadStatuses(prev => {
            const newStatuses = {...prev};
            let allDone = true;
            Object.keys(newStatuses).forEach(fileName => {
                if (newStatuses[fileName].status === 'converting' && newStatuses[fileName].progress < 90) {
                    newStatuses[fileName].progress += 5;
                    allDone = false;
                }
            });
            if (allDone) clearInterval(progressInterval);
            return newStatuses;
        });
    }, 500);

    const cyclingInterval = setInterval(() => {
      setCurrentConvertingFile(prevFile => {
          const currentIndex = batchFiles.findIndex(f => f.name === prevFile);
          const nextIndex = (currentIndex + 1) % batchFiles.length;
          return batchFiles[nextIndex]?.name || '';
      });
    }, 2000);

    const formData = new FormData();
    batchFiles.forEach(file => {
      formData.append("file", file);
    });
    const endpoint = "https://pdfsolution.dpdns.org/convert_to_pdf";
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearInterval(progressInterval);
      clearInterval(cyclingInterval);

      if (!response.ok) {
        const clonedResponse = response.clone();
        let errorMessage = `Conversion failed with status: ${response.status}`;
        try {
            const error = await clonedResponse.json();
            errorMessage = String(error.detail || error.error || "An unknown server error occurred.");
        } catch (jsonError) {
             const errorText = await response.text();
             errorMessage = `Server error: ${response.status}. Response: ${errorText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }
      
      const resBlob = await response.blob();
      let downloadFilename = 'converted_files.zip';
      if (response.headers.get('Content-Disposition')) {
          const contentDisposition = response.headers.get('Content-Disposition');
          const match = contentDisposition?.match(/filename="?([^"]+)"?/);
          if (match && match[1]) downloadFilename = match[1];
      }
      
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
      setUploadStatuses({});
      setIsBatchModalOpen(false);

    } catch (err: any) {
      setUploadStatuses(prev => {
        const newStatuses: { [fileName: string]: UploadStatus } = {};
        batchFiles.forEach(file => {
            newStatuses[file.name] = { status: 'error', progress: 0, error: err.message };
        });
        return newStatuses;
      });
      toast({ title: texts.conversionError, description: err.message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      clearInterval(cyclingInterval);
      setIsConverting(false);
      setCurrentConvertingFile('');
    }
  };

  const handleOpenPricing = () => {
    if (!isLoggedIn) {
      toast({title: texts.featureNotAvailable, description: texts.featureNotAvailableForGuests, variant: 'destructive'});
      return;
    }
    setIsPricingModalOpen(true);
  };
  
  const handlePlanSelection = () => {
    if (!selectedPlan) return;
    let details: PlanDetails;
    if (selectedPlan === 'A') {
      details = { maxFiles: 10, maxSizeMb: 20, cost: 39, name: '方案A' };
    } else if (selectedPlan === 'B') {
       if(extraMb <= 0 || extraMb > 79) {
         toast({title: "錯誤", description: "加購容量必須介於 1MB 到 79MB 之間。"});
         return;
       }
       const totalSize = 20 + extraMb;
       details = { maxFiles: 10, maxSizeMb: totalSize, cost: 39 + (extraMb * 2), name: `方案B (+${extraMb}MB)` };
    } else { // Plan C
        toast({title: "聯絡客服", description: "選擇 C 方案請直接與客服人員聯繫。"});
        return;
    }
    setFinalPlanDetails(details);
    setIsPricingModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = () => {
    setIsPaymentModalOpen(false);
    setIsBatchModalOpen(true);
  };

  const getStatusText = (status: UploadStatus['status']): string => {
    const key = `status_${status || 'waiting'}` as keyof typeof translations.zh;
    const textOrFn = (texts as any)[key];
    if (typeof textOrFn === 'string') {
        return textOrFn;
    }
    return texts.status_waiting;
  };

  const totalBatchSizeMB = (batchTotalSize / (1024 * 1024)).toFixed(2);
  const remainingFiles = finalPlanDetails ? finalPlanDetails.maxFiles - batchFiles.length : 0;
  const remainingMB = finalPlanDetails ? Math.max(0, (finalPlanDetails.maxSizeMb * 1024 * 1024 - batchTotalSize) / (1024 * 1024)) : 0;
  
  const renderContent = () => {
    switch(viewState) {
        case 'loading':
            return <LoadingState message={loadingMessage} progress={progress} />;
        case 'success':
            return <SuccessState message={successMessage} onGoHome={() => router.push('/')} onStartNew={resetPage} texts={texts} />;
        case 'idle':
        default:
          return (
            <div className="w-full max-w-4xl space-y-8">
                <Card className="w-full">
                  <CardHeader className="text-center">
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                          <FileUp className="h-10 w-10 text-primary" />
                      </div>
                      <CardTitle>{texts.excelToPdfTitle}</CardTitle>
                      <CardDescription>{texts.excelToPdfDescription}</CardDescription>
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
                              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              multiple={false}
                              className="hidden"
                          />
                      </div>
                      <Button type="submit" className="w-full" disabled={!selectedFile}>
                        <Download className="mr-2 h-4 w-4" />
                        {texts.convertButton}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="w-full border-destructive/20 bg-destructive/5">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex flex-col items-start gap-1">
                            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                                <Star className="text-yellow-500" />
                                {texts.upgradePromptTitle}
                            </CardTitle>
                            <CardDescription>
                                {texts.upgradePromptDescription}
                            </CardDescription>
                        </div>
                        <Button onClick={handleOpenPricing} variant="destructive" size="lg" className="shrink-0">
                          <span className="text-lg font-bold">提升檔案大小限制</span>
                          <span className="mx-2">或</span>
                          <span className="text-lg font-bold">批次轉檔</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>
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

      <AlertDialog open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
        <AlertDialogContent className="max-w-2xl">
          <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>選擇您的升級方案</ShadAlertDialogTitle>
            <AlertDialogDescription>
              選擇最適合您需求的方案，即可開始批次轉檔。
            </AlertDialogDescription>
          </ShadAlertDialogHeader>
          <RadioGroup value={selectedPlan || undefined} onValueChange={(val: 'A' | 'B' | 'C') => setSelectedPlan(val)}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>方案</TableHead>
                  <TableHead>方案內容</TableHead>
                  <TableHead className="text-right">費用</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className={cn("cursor-pointer", selectedPlan === 'A' && "bg-muted")}>
                  <TableCell><RadioGroupItem value="A" id="plan-a" /></TableCell>
                  <TableCell className="font-medium">方案A</TableCell>
                  <TableCell>最多10件，檔案大小合計20MB以內</TableCell>
                  <TableCell className="text-right">39元</TableCell>
                </TableRow>
                <TableRow className={cn("cursor-pointer", selectedPlan === 'B' && "bg-muted")}>
                  <TableCell><RadioGroupItem value="B" id="plan-b" /></TableCell>
                  <TableCell className="font-medium">方案B</TableCell>
                  <TableCell>最多10件，檔案大小合計超過20MB以上</TableCell>
                  <TableCell className="text-right">每MB 2元</TableCell>
                </TableRow>
                 <TableRow className={cn("cursor-pointer", selectedPlan === 'C' && "bg-muted")}>
                  <TableCell><RadioGroupItem value="C" id="plan-c" /></TableCell>
                  <TableCell className="font-medium">方案C</TableCell>
                  <TableCell>最多10件，檔案大小合計100MB(含)以上</TableCell>
                  <TableCell className="text-right">請洽客服</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </RadioGroup>
          {selectedPlan === 'B' && (
              <div className="pt-4 space-y-2">
                <Label htmlFor="extra-mb">加購容量 (1-79MB)</Label>
                <div className="flex items-center gap-2">
                  <span>20MB +</span>
                  <Input 
                    id="extra-mb"
                    type="number"
                    value={extraMb}
                    onChange={(e) => setExtraMb(Math.max(0, Math.min(79, parseInt(e.target.value) || 0)))}
                    className="w-20"
                    max={79}
                    min={1}
                  />
                  <span>MB =</span>
                  <span className="font-bold text-lg text-primary">{39 + (extraMb * 2)}元</span>
                </div>
              </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handlePlanSelection} disabled={!selectedPlan}>送出</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <AlertDialogContent>
              <ShadAlertDialogHeader>
                  <ShadAlertDialogTitle>模擬付款</ShadAlertDialogTitle>
                   <AlertDialogDescription>
                      這是模擬的金流頁面。請確認您的方案。
                  </AlertDialogDescription>
              </ShadAlertDialogHeader>
              {finalPlanDetails && (
                  <div className="p-4 bg-muted rounded-md">
                      <p><strong>方案:</strong> {finalPlanDetails.name}</p>
                      <p><strong>費用:</strong> {finalPlanDetails.cost}元</p>
                      <p><strong>檔案上限:</strong> {finalPlanDetails.maxFiles} 件</p>
                      <p><strong>容量上限:</strong> {finalPlanDetails.maxSizeMb} MB</p>
                  </div>
              )}
              <AlertDialogFooter>
                  <AlertDialogCancel>返回</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePaymentConfirm}>確認付款</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
        <AlertDialogContent className="max-w-2xl">
            <ShadAlertDialogHeader>
                <ShadAlertDialogTitle>{texts.batchModalTitle}</ShadAlertDialogTitle>
            </ShadAlertDialogHeader>
            {isConverting ? (
               <div className="flex flex-col items-center justify-center space-y-4 my-8">
                   <LoadingState message={currentLanguage === 'zh' ? `正在進行 ${currentConvertingFile} 的轉檔作業...` : `Converting ${currentConvertingFile}...`} progress={uploadStatuses[Object.keys(uploadStatuses)[0]]?.progress || 10} />
               </div>
            ) : (
                <form onSubmit={handleBatchSubmit} className="space-y-4">
                    {finalPlanDetails && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md space-y-1">
                          <p>{texts.planInfo(finalPlanDetails.maxFiles, finalPlanDetails.maxSizeMb)}</p>
                          <p>{texts.usageInfo(batchFiles.length, totalBatchSizeMB, remainingFiles, remainingMB.toFixed(2))}</p>
                      </div>
                    )}
                    <div 
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                    onClick={() => batchFileUploadRef.current?.click()}
                    >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground text-center">
                          Click or drag up to {finalPlanDetails?.maxFiles || 10} files here
                        </p>
                        <Input
                            type="file"
                            ref={batchFileUploadRef}
                            onChange={handleBatchFileChange}
                            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            multiple
                            className="hidden"
                        />
                    </div>
                    {batchFiles.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {batchFiles.map(file => (
                                <div key={file.name} className="flex items-center gap-2 p-1.5 border rounded-md text-xs">
                                    <FileSpreadsheet className="h-4 w-4 text-primary flex-shrink-0" />
                                    <div className="flex-grow min-w-0">
                                        <p className="font-medium truncate">{file.name}</p>
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <span>{getStatusText(uploadStatuses[file.name]?.status)}</span>
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
                        <Download className="mr-2 h-4 w-4" />
                        {texts.convertButton}
                    </Button>
                </form>
            )}
            <AlertDialogFooter className="mt-4">
                <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
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
                                    <MenubarItem onClick={() => router.push('/excel-to-pdf')} disabled><FileSpreadsheet className="mr-2 h-4 w-4" />{texts.excelToPdfTitle}</MenubarItem>
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

      <main className="flex-grow p-6 overflow-y-auto flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  )
}
