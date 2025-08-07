
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
    LogIn, LogOut, UserCircle, ArrowRightLeft, Edit, FileUp, ListOrdered, 
    Combine, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, 
    FileMinus, Droplets, ScanText, Scissors, Sparkles, ShieldCheck, 
    Grid, PenSquare, FileSignature, Globe
} from 'lucide-react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { translations } from '@/lib/translations';

const featureTools = [
  // PDF編輯
  { key: 'editPdf', href: '/edit-pdf', icon: PenSquare, colorClasses: "text-purple-500 bg-purple-100", titleKey: "editPdfTitle", descriptionKey: "editPdfDescription", category: 'edit' },
  { key: 'mergePdf', href: '/merge-pdf', icon: Combine, colorClasses: "text-indigo-500 bg-indigo-100", titleKey: "mergePdfTitle", descriptionKey: "mergePdfDescription", category: 'edit' },
  { key: 'splitPdf', href: '/split-pdf', icon: Scissors, colorClasses: "text-red-500 bg-red-100", titleKey: "splitPdfTitle", descriptionKey: "splitPdfDescription", category: 'edit' },
  
  // PDF 安全
  { key: 'protectPdf', href: '/protect-pdf', icon: ShieldCheck, colorClasses: "text-rose-500 bg-rose-100", titleKey: "protectPdfTitle", descriptionKey: "protectPdfDescription", category: 'security' },

  // PDF轉檔 (Convert From PDF)
  { key: 'pdfToWord', href: '/pdf-to-word', icon: FileText, colorClasses: "text-blue-500 bg-blue-100", titleKey: "pdfToWordTitle", descriptionKey: "pdfToWordDescription", category: 'convertFrom' },
  { key: 'pdfToExcel', href: '/pdf-to-excel', icon: FileSpreadsheet, colorClasses: "text-green-500 bg-green-100", titleKey: "pdfToExcelTitle", descriptionKey: "pdfToExcelDescription", category: 'convertFrom' },
  { key: 'pdfToPpt', href: '/pdf-to-ppt', icon: LucidePresentation, colorClasses: "text-orange-500 bg-orange-100", titleKey: "pdfToPptTitle", descriptionKey: "pdfToPptDescription", category: 'convertFrom' },
  { key: 'pdfToJpg', href: '/pdf-to-image', icon: FileImage, colorClasses: "text-amber-600 bg-amber-100", titleKey: "pdfToJpgTitle", descriptionKey: "pdfToJpgDescription", category: 'convertFrom' },
  { key: 'pdfToOcr', href: '/pdf-to-ocr', icon: ScanText, colorClasses: "text-teal-500 bg-teal-100", titleKey: "pdfToOcrTitle", descriptionKey: "pdfToOcrDescription", category: 'convertFrom' },

  // 轉存成PDF (Convert To PDF)
  { key: 'wordToPdf', href: '/word-to-pdf', icon: FileText, colorClasses: "text-blue-600 bg-blue-100", titleKey: "wordToPdfTitle", descriptionKey: "wordToPdfDescription", category: 'convertTo' },
  { key: 'excelToPdf', href: '/excel-to-pdf', icon: FileSpreadsheet, colorClasses: "text-green-600 bg-green-100", titleKey: "excelToPdfTitle", descriptionKey: "excelToPdfDescription", category: 'convertTo' },
  { key: 'pptToPdf', href: '/ppt-to-pdf', icon: LucidePresentation, colorClasses: "text-orange-600 bg-orange-100", titleKey: "pptToPdfTitle", descriptionKey: "pptToPdfDescription", category: 'convertTo' },
  { key: 'imageToWord', href: '/image-to-word', icon: FileSignature, colorClasses: "text-cyan-500 bg-cyan-100", titleKey: "imageToWordTitle", descriptionKey: "imageToWordDescription", category: 'convertTo' },
];

const FeatureCard = ({ href, icon: Icon, title, description, colorClasses }: { href: string; icon: React.ElementType; title: string; description: string; colorClasses: string; }) => {
    const [textColor, bgColor] = colorClasses.split(' ');

    return (
      <Link href={href} className="group flex">
        <Card className="w-full overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl">
          <CardHeader className="p-0">
            <div className={cn("flex items-center justify-center p-6", bgColor)}>
              <Icon className={cn("h-12 w-12 transition-transform duration-300 group-hover:scale-110", textColor)} />
            </div>
          </CardHeader>
          <CardContent className="p-4 text-left">
            <CardTitle className="text-base font-bold text-black">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">{description}</CardDescription>
          </CardContent>
        </Card>
      </Link>
    );
};

export default function Homepage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
      { key: 'all', labelKey: 'allFunctions', icon: Grid },
      { key: 'edit', labelKey: 'pdfEditing', icon: PenSquare },
      { key: 'convertFrom', labelKey: 'convertFromPdf', icon: FileMinus },
      { key: 'convertTo', labelKey: 'convertToPdf', icon: FileUp },
      { key: 'security', labelKey: 'pdfSecurity', icon: ShieldCheck },
  ];

  const filteredTools = activeFilter === 'all'
      ? featureTools
      : featureTools.filter(tool => tool.category === activeFilter);


  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);
    }
  }, [router]);

  const updateLanguage = (lang: 'en' | 'zh') => {
    setCurrentLanguage(lang);
  };
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
    }
    setIsLoggedIn(false);
    const logoutDesc = currentLanguage === 'zh' ? "您已成功登出。" : "You have been logged out successfully.";
    toast({ title: texts.logout, description: logoutDesc });
  };
  
  const getSafeTranslation = (key: keyof (typeof texts), fallback: string) => {
    const value = texts[key];
    if (typeof value === 'string') return value;
    return fallback;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-0 border-b bg-card sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center h-20">
            <div className="flex items-center gap-6">
                <div className="cursor-pointer" onClick={() => router.push('/')}>
                    <Logo />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex gap-2">
                    <Button variant={currentLanguage === 'en' ? "secondary" : "outline"} size="sm" onClick={() => updateLanguage('en')}>English</Button>
                    <Button variant={currentLanguage === 'zh' ? "secondary" : "outline"} size="sm" onClick={() => updateLanguage('zh')}>中文</Button>
                </div>
                {isLoggedIn ? (
                    <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{getSafeTranslation('loggedInAs', 'Logged in as User')}</span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4"/> {getSafeTranslation('logout', 'Logout')}
                        </Button>
                    </div>
                ) : (
                   <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                         <span className="text-sm text-muted-foreground">{getSafeTranslation('guest', 'Guest')}</span>
                        <Link href="/login" passHref>
                            <Button variant="ghost" size="sm">
                                <LogIn className="mr-2 h-4 w-4"/> {getSafeTranslation('login', 'Login')}
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
      </header>

      <main className="flex-grow px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground flex items-center justify-center gap-x-4 flex-wrap">
              <span>{getSafeTranslation('pageTitlePart1', 'Welcome to')}</span>
              <div className="relative inline-block h-14 w-52">
                <Image
                  src="/img/wujipdflogo.png"
                  alt="WujiPDF Logo"
                  fill
                  priority
                  className="object-contain"
                  sizes="13rem"
                />
              </div>
              {texts.pageTitlePart2 && <span>{getSafeTranslation('pageTitlePart2', '文件助手')}</span>}
            </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">{getSafeTranslation('pageDescription', 'Your all-in-one solution for PDF editing and conversion. Select a tool below to get started.')}</p>
        </div>
        
        <div className="w-full md:w-[70%] mx-auto">
             <div className="mb-8">
              <div className="flex items-end -mb-px">
                {filters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-x border-t font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        isActive
                          ? "bg-background border-border text-primary border-b-transparent"
                          : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{getSafeTranslation(filter.labelKey as keyof typeof texts, filter.key)}</span>
                    </button>
                  )
                })}
              </div>
              <div className="border-t border-border pt-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredTools.map((tool) => (
                        <FeatureCard 
                            key={tool.key} 
                            title={getSafeTranslation(tool.titleKey as keyof typeof texts, tool.key)} 
                            description={getSafeTranslation(tool.descriptionKey as keyof typeof texts, tool.key)} 
                            href={tool.href} 
                            icon={tool.icon} 
                            colorClasses={tool.colorClasses} 
                        />
                    ))}
                </div>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
