
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
    LogIn, LogOut, UserCircle, MenuSquare, ArrowRightLeft, Edit, FileUp, ListOrdered, 
    Trash2, Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, 
    FileMinus, Droplets, ScanText, Scissors, Sparkles, LayoutTemplate
} from 'lucide-react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";

const translations = {
  en: {
    pageTitle: 'Welcome to Pdf Solution',
    pageDescription: 'Your all-in-one solution for PDF editing and conversion. Select a tool below to get started.',
    appTitle: 'Pdf Solution',
    loggedInAs: 'Logged in as User',
    login: 'Login',
    logout: 'Logout',
    guest: 'Guest',
    comingSoon: 'Coming Soon!',
    featureNotImplemented: 'feature is not yet implemented.',
    pdfEditMenu: 'PDF Editing Tools',
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
    htmlToPdf: 'HTML to HTML',
    jpgToPdf: 'JPG to Image',
    pdfToWord: 'PDF to WORD',
    pdfToExcel: 'PDF to EXCEL',
    pdfToPpt: 'PDF to PPT',
    pdfToHtml: 'PDF to HTML',
    pdfToJpg: 'PDF to Image',
    pdfToOcr: 'PDF with OCR',
    proMode: 'Professional Mode',
    proModeDescription: 'All-in-one editor with batch processing and more.',
  },
  zh: {
    pageTitle: '歡迎使用 Pdf Solution 文件助手',
    pageDescription: '您的一站式 PDF 編輯與轉換解決方案。請從下方選擇一個工具開始。',
    appTitle: 'Pdf Solution',
    loggedInAs: '已登入為使用者',
    login: '登入',
    logout: '登出',
    guest: '訪客',
    comingSoon: '即將推出！',
    featureNotImplemented: '功能尚未實現。',
    pdfEditMenu: 'PDF 編輯工具',
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
    proModeDescription: '整合所有編輯、轉換與批次處理功能。',
  },
};

const pdfEditingTools = [
    { key: 'mergePdf', titleKey: 'mergePdf', href: '/merge-pdf', icon: Combine },
    { key: 'splitPdf', titleKey: 'splitPdf', href: '/split-pdf', icon: Scissors },
    { key: 'deletePdfPages', titleKey: 'deletePdfPages', href: '/split-pdf', icon: Trash2 },
    { key: 'extractPdfPages', titleKey: 'extractPdfPages', href: '/split-pdf', icon: FileUp },
    { key: 'reorderPdfPages', titleKey: 'reorderPdfPages', href: '/edit-pdf', icon: ListOrdered },
    { key: 'addWatermark', titleKey: 'addWatermark', href: '/edit-pdf', icon: Droplets },
];

const convertFromPdfTools = [
    { key: 'pdfToWord', titleKey: 'pdfToWord', href: '/pdf-to-word', icon: FileText },
    { key: 'pdfToExcel', titleKey: 'pdfToExcel', href: '/pdf-to-excel', icon: FileSpreadsheet },
    { key: 'pdfToPpt', titleKey: 'pdfToPpt', href: '/pdf-to-ppt', icon: LucidePresentation },
    { key: 'pdfToHtml', titleKey: 'pdfToHtml', href: '/pdf-to-html', icon: Code },
    { key: 'pdfToJpg', titleKey: 'pdfToJpg', href: '/pdf-to-image', icon: FileImage },
    { key: 'pdfToOcr', titleKey: 'pdfToOcr', href: '/pdf-to-ocr', icon: ScanText },
];

const convertToPdfTools = [
    { key: 'wordToPdf', titleKey: 'wordToPdf', href: '/word-to-pdf', icon: FileText },
    { key: 'excelToPdf', titleKey: 'excelToPdf', href: '/excel-to-pdf', icon: FileSpreadsheet },
    { key: 'pptToPdf', titleKey: 'pptToPdf', href: '/ppt-to-pdf', icon: LucidePresentation },
    { key: 'htmlToPdf', titleKey: 'htmlToPdf', href: '/html-to-pdf', icon: Code },
    { key: 'jpgToPdf', titleKey: 'jpgToPdf', href: '/jpg-to-pdf', icon: FileImage },
];

const FeatureIcon = ({ href, icon: Icon, titleKey }: { href: string; icon: React.ElementType; titleKey: string; }) => {
    const texts = translations['zh']; // Or use dynamic language state
    const title = texts[titleKey as keyof typeof texts];
    const content = (
      <div 
        className="flex flex-col items-center justify-center p-2 space-y-2 rounded-lg hover:bg-accent/10 transition-colors h-24 group"
      >
        <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-xs text-center text-muted-foreground group-hover:text-primary-dark font-medium">{title}</span>
      </div>
    );
  
    return <Link href={href}>{content}</Link>;
};

const ProModeFeature = ({ texts }: { texts: typeof translations.en }) => {
  const proIcons = [
    { icon: Combine, pos: "top-0 left-1/2 -translate-x-1/2" },
    { icon: FileText, pos: "top-5 right-1" },
    { icon: FileImage, pos: "bottom-5 right-1" },
    { icon: Scissors, pos: "bottom-0 left-1/2 -translate-x-1/2" },
    { icon: ListOrdered, pos: "bottom-5 left-1" },
    { icon: Droplets, pos: "top-5 left-1" },
  ];

  return (
    <Link href="/edit-pdf" className="flex flex-col items-center text-center group">
      <div className="relative w-36 h-36 flex items-center justify-center mt-4">
        <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-full animate-spin [animation-duration:20s]"></div>
        <LayoutTemplate className="w-20 h-20 text-primary transition-transform group-hover:scale-105 duration-300" />

        {proIcons.map(({ icon: Icon, pos }, index) => (
          <div key={index} className={`absolute ${pos} p-1 bg-card rounded-full shadow-lg border`}>
             <Icon className="w-5 h-5 text-muted-foreground transition-transform group-hover:text-primary" />
          </div>
        ))}
      </div>
      <h3 className="text-lg font-semibold mt-4 text-foreground">{texts.proMode}</h3>
      <p className="text-sm text-center text-muted-foreground mt-1 max-w-xs">
        {texts.proModeDescription}
      </p>
    </Link>
  );
};


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
                                    <MenubarItem onClick={() => router.push('/jpg-to-pdf')}><FileImage className="mr-2 h-4 w-4" />{texts.jpgToPdf}</MenubarItem>
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

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{texts.pageTitle}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{texts.pageDescription}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {/* Left Column: PDF Editing Tools */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-6 text-foreground">{texts.pdfEditMenu}</h2>
            <div className="grid grid-cols-3 gap-y-6 gap-x-4 w-full">
              {pdfEditingTools.map(({ key, ...tool }) => <FeatureIcon key={key} {...tool} />)}
            </div>
          </div>

          {/* Middle-Left Column: Convert from PDF */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-6 text-foreground">{texts.convertFromPdf}</h2>
            <div className="grid grid-cols-3 gap-y-6 gap-x-4 w-full">
              {convertFromPdfTools.map(({ key, ...tool }) => <FeatureIcon key={key} {...tool} />)}
            </div>
          </div>

          {/* Middle-Right Column: Convert to PDF */}
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-6 text-foreground">{texts.convertToPdf}</h2>
            <div className="grid grid-cols-3 gap-y-6 gap-x-4 w-full">
              {convertToPdfTools.map(({ key, ...tool }) => <FeatureIcon key={key} {...tool} />)}
            </div>
          </div>
          
          {/* Rightmost Column: Pro Mode */}
          <div className="flex flex-col items-center lg:border-l-2 lg:border-dashed lg:border-primary/30 lg:pl-8 sm:col-span-2 lg:col-span-1">
             <h2 className="text-xl font-semibold mb-2 text-primary">{texts.proMode}</h2>
             <ProModeFeature texts={texts} />
          </div>
        </div>
      </main>
    </div>
  );
}
