
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, LogOut, UserCircle, MenuSquare, ArrowRightLeft, Edit, FileUp, ListOrdered, Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Scissors, Sparkles, Star, FilePlus } from 'lucide-react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";

const translations = {
  en: {
    pageTitle: 'Welcome to DocuPilot',
    pageDescription: 'Your all-in-one solution for PDF editing and conversion. Select a tool below to get started.',
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
    
    editPdfDesc: 'Edit text, images, and links in your PDF document.',
    mergePdfDesc: 'Combine multiple PDF files into a single document.',
    splitPdfDesc: 'Extract or delete pages from your PDF file.',
    proModeDesc: 'Batch convert multiple PDFs to your desired format at once.',
    pdfToWordDesc: 'Convert PDFs to editable Word documents.',
    pdfToExcelDesc: 'Extract data from PDFs into Excel spreadsheets.',
    pdfToPptDesc: 'Turn PDFs into PowerPoint presentations.',
    pdfToJpgDesc: 'Save each page of your PDF as a separate image.',
  },
  zh: {
    pageTitle: '歡迎使用 DocuPilot 文件助手',
    pageDescription: '您的一站式 PDF 編輯與轉換解決方案。請從下方選擇一個工具開始。',
    appTitle: 'DocuPilot 文件助手',
    loggedInAs: '已登入為使用者',
    login: '登入',
    logout: '登出',
    guest: '訪客',
    comingSoon: '即將推出！',
    featureNotImplemented: '功能尚未實現。',
    pdfEditMenu: 'PDF 編輯',
    pdfConvertMenu: 'PDF 轉換',
    mergePdf: '合併 PDF',
    splitPdf: '拆分 PDF',
    deletePdfPages: '刪除頁面',
    extractPdfPages: '擷取頁面',
    reorderPdfPages: '變換順序',
    addWatermark: '添加浮水印',
    convertToPdf: '轉換為 PDF',
    convertFromPdf: '從 PDF 轉換',
    wordToPdf: 'WORD 轉 PDF',
    excelToPdf: 'EXCEL 轉 PDF',
    pptToPdf: 'PPT 轉 PDF',
    htmlToPdf: 'HTML 轉 PDF',
    jpgToPdf: 'JPG 轉 PDF',
    pdfToWord: 'PDF 轉 WORD',
    pdfToExcel: 'PDF 轉 EXCEL',
    pdfToPpt: 'PDF 轉 PPT',
    pdfToHtml: 'PDF 轉 HTML',
    pdfToJpg: 'PDF 轉圖片',
    pdfToOcr: 'PDF 光學掃描(OCR)',
    proMode: '專業模式',

    editPdfDesc: '編輯您 PDF 文件中的文字、圖片和連結。',
    mergePdfDesc: '將多個 PDF 檔案合併為一份單獨的文件。',
    splitPdfDesc: '從您的 PDF 檔案中擷取或刪除頁面。',
    proModeDesc: '一次性將多個 PDF 批次轉換為您想要的格式。',
    pdfToWordDesc: '將 PDF 轉換為可編輯的 Word 文件。',
    pdfToExcelDesc: '將 PDF 中的數據提取到 Excel 試算表中。',
    pdfToPptDesc: '將 PDF 變成 PowerPoint 簡報。',
    pdfToJpgDesc: '將 PDF 的每一頁儲存為獨立的圖片檔案。',
  },
};

const features = [
    { key: 'editPdf', titleKey: 'pdfEditMenu', descriptionKey: 'editPdfDesc', icon: Edit, href: '/edit-pdf' },
    { key: 'proConvert', titleKey: 'proMode', descriptionKey: 'proModeDesc', icon: Sparkles, href: '/pro-convert', isPro: true },
    { key: 'merge', titleKey: 'mergePdf', descriptionKey: 'mergePdfDesc', icon: Combine, href: '/merge-pdf' },
    { key: 'split', titleKey: 'splitPdf', descriptionKey: 'splitPdfDesc', icon: Scissors, href: '/split-pdf' },
    { key: 'pdfToWord', titleKey: 'pdfToWord', descriptionKey: 'pdfToWordDesc', icon: FileText, href: '/pdf-to-word' },
    { key: 'pdfToExcel', titleKey: 'pdfToExcel', descriptionKey: 'pdfToExcelDesc', icon: FileSpreadsheet, href: '/pdf-to-excel' },
    { key: 'pdfToPpt', titleKey: 'pdfToPpt', descriptionKey: 'pdfToPptDesc', icon: LucidePresentation, href: '/pdf-to-ppt' },
    { key: 'pdfToJpg', titleKey: 'pdfToJpg', descriptionKey: 'pdfToJpgDesc', icon: FileImage, href: '/pdf-to-image' },
];

export default function Homepage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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
                        <MenubarTrigger onClick={() => router.push('/pro-convert')} className="text-primary hover:text-primary focus:text-primary">
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

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{texts.pageTitle}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{texts.pageDescription}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link href={feature.href} key={feature.key} passHref>
              <Card className="h-full flex flex-col hover:shadow-lg hover:border-primary transition-all duration-200 cursor-pointer group">
                <CardHeader className="flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    {feature.isPro && (
                      <div className="flex items-center gap-1 text-xs font-semibold bg-yellow-400/20 text-yellow-600 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3" /> PRO
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <CardTitle className="text-lg font-semibold mb-2">{texts[feature.titleKey as keyof typeof texts]}</CardTitle>
                  <CardDescription className="flex-grow">{texts[feature.descriptionKey as keyof typeof texts]}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
