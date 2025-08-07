
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Upload, Download, FileSignature, Sparkles, AlertCircle, ArrowLeft, ArrowRight, FileImage, UserCircle, LogOut, LogIn, Edit, Combine, Scissors, ListOrdered, Droplets, ShieldCheck, ArrowRightLeft, FileUp, FileText, FileSpreadsheet, LucidePresentation, Code, FileMinus, ScanText } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { translations } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";


type OutputMode = 'pdf' | 'word';

export default function ImageToWordPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>('word');
  
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: texts.invalidFileError, description: texts.invalidFileErrorDesc, variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetState = () => {
      setSelectedFile(null);
      if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setOutputMode('word');
      if (fileUploadRef.current) {
          fileUploadRef.current.value = "";
      }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
        toast({ title: texts.conversionError, description: texts.noFileSelected, variant: 'destructive'});
        return;
    }

    if (outputMode === 'word' && !isLoggedIn) {
        toast({ title: texts.proFeatureTitle, description: texts.proFeatureDesc, variant: 'destructive'});
        return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    let endpoint = '';
    if (outputMode === 'word') {
      endpoint = "https://pdfsolution.dpdns.org/ocr-image-to-word";
    } else {
      endpoint = "https://pdfsolution.dpdns.org/convert_single_to_pdf";
    }

    try {
      const response = await fetch(endpoint, { method: 'POST', body: formData });

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
            const errBody = await response.json();
            errorMessage = errBody.error || JSON.stringify(errBody);
        } catch(e) {
            errorMessage = `Conversion failed with status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const resBlob = await response.blob();
      const downloadFilename = selectedFile.name.replace(/\.[^/.]+$/, "") + (outputMode === 'word' ? '.docx' : '.pdf');
      
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
        description: (texts.conversionSuccessDesc as (filename: string) => string)(downloadFilename)
      });
      resetState();

    } catch (err: any) {
      toast({ title: texts.conversionError, description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
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
                                    <MenubarItem onClick={() => router.push('/image-to-word')} disabled><FileImage className="mr-2 h-4 w-4" />{texts.imageToWordTitle}</MenubarItem>
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
        {!selectedFile ? (
            <Card 
                className="w-full max-w-lg cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileUploadRef.current?.click()}
            >
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <FileSignature className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>{texts.imageToWordTitle}</CardTitle>
                    <CardDescription>{texts.imageToWordDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md bg-muted/50">
                        <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-md text-muted-foreground text-center">{texts.uploadButton}</p>
                         <p className="text-xs text-muted-foreground mt-1">{texts.uploadHint(isLoggedIn)}</p>
                    </div>
                    <Input
                        type="file"
                        ref={fileUploadRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                    />
                </CardContent>
            </Card>
        ) : (
            <div className="w-full max-w-5xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-card h-full">
                    {previewUrl && (
                        <div className="text-center">
                            <Image src={previewUrl} alt="Image Preview" width={400} height={565} className="max-w-full h-auto shadow-lg rounded-md border object-contain" />
                            <p className="mt-4 text-sm text-muted-foreground break-all">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{((selectedFile.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    )}
                </div>

                <div>
                    <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                           <Button variant="link" onClick={resetState} className="p-0 h-auto text-primary">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {texts.selectAnotherFile}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup value={outputMode} onValueChange={(v) => setOutputMode(v as OutputMode)} className="space-y-2">
                            <Label className="p-4 border rounded-md flex items-start gap-4 cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                <RadioGroupItem value="pdf" id="mode-pdf" className="mt-1"/>
                                <div className="grid gap-1.5 leading-normal">
                                    <p className="font-semibold">{texts.saveAsPdf}</p>
                                </div>
                            </Label>
                            <Label className="p-4 border rounded-md flex items-start gap-4 cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all">
                                <RadioGroupItem value="word" id="mode-word" className="mt-1"/>
                                <div className="grid gap-1.5 leading-normal w-full">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold">{texts.saveAsWordOcr}</p>
                                        {!isLoggedIn && <Badge className="bg-yellow-400 text-yellow-900">Pro</Badge>}
                                    </div>
                                </div>
                            </Label>
                        </RadioGroup>
                        {!isLoggedIn && outputMode === 'word' && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{texts.proFeatureTitle}</AlertTitle>
                                <AlertDescription>{texts.proFeatureDesc}</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSubmit} className="w-full text-lg py-6" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                        {texts.convertButton} <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardFooter>
                    </Card>
                </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
