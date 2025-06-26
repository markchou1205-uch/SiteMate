
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as ShadCnDialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FilePlus, Undo, Redo, Download, Trash2, Type, Image as ImageIcon, Square, Circle, Grid, Sparkles, MenuSquare, Edit, ArrowRightLeft, Combine, Scissors, ListOrdered, Droplets, FileUp, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, ScanText, LogIn, LogOut, UserCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, Underline } from 'lucide-react';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Helper icons
const TriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
        <polygon points="50,15 100,85 0,85" />
    </svg>
);
const ScribbleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.986L3 17.25V21h3.75l14.424-14.424zM16 7l5 5"/>
    </svg>
);


if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

// Type Definitions
interface PageObject {
  id: string;
  sourceCanvas: HTMLCanvasElement;
  rotation: number;
}
interface TextAnnotation {
  id: string; type: 'text'; pageIndex: number; text: string; topRatio: number; leftRatio: number; widthRatio: number; heightRatio: number; fontSize: number; fontFamily: string; bold: boolean; italic: boolean; underline: boolean; color: string; textAlign: 'left' | 'center' | 'right'; isUserAction?: boolean;
}
interface ImageAnnotation {
  id: string; type: 'image'; pageIndex: number; dataUrl: string; topRatio: number; leftRatio: number; widthRatio: number; heightRatio: number; aspectRatio: number; isUserAction?: boolean;
}
interface ShapeAnnotation {
  id: string; pageIndex: number; type: 'rect' | 'ellipse' | 'triangle'; topRatio: number; leftRatio: number; widthRatio: number; heightRatio: number; fillColor: string; strokeColor: string; strokeWidth: number; isUserAction?: boolean;
}
interface ScribbleAnnotation {
    id: string; type: 'scribble'; pageIndex: number; points: {xRatio: number, yRatio: number}[]; color: string; strokeWidth: number; isUserAction?: boolean;
}
interface TableAnnotation {
  id: string; type: 'table'; pageIndex: number; topRatio: number; leftRatio: number; widthRatio: number; heightRatio: number; rows: number; cols: number; cellPadding: number; strokeColor: string; strokeWidth: number; cells: string[][]; isUserAction?: boolean;
}
type Annotation = TextAnnotation | ImageAnnotation | ShapeAnnotation | ScribbleAnnotation | TableAnnotation;
interface EditorState {
    pageObjects: PageObject[];
    annotations: Annotation[];
}
type Tool = 'select' | 'pan' | 'text' | 'image' | 'shape' | 'scribble' | 'table';
type InteractionMode = 'idle' | 'selected' | 'editing' | 'drawing-shape' | 'drawing-scribble' | 'drawing-table';

const translations = {
    en: {
        pageTitle: 'PDF Editor',
        pageDescription: 'All-in-one professional PDF editing tool.',
        textAnnotationSample: 'Sample Text',
        startEditingYourPdf: 'Start Editing Your PDF',
        uploadPdfFirst: 'Please upload a PDF first to enable editing features.',
        uploadLabel: 'Select PDF',
        loadingPdf: 'Loading PDF...',
        generatingFile: 'Generating file, please wait…',
        loadError: 'Failed to load PDF',
        tableConfigTitle: 'Configure Table',
        tableConfigDescription: 'Set the number of rows and columns for your new table.',
        tableRows: 'Rows',
        tableCols: 'Columns',
        createTable: 'Create Table',
        cancel: 'Cancel',
        downloadEditedFile: 'Download',
        actionHistory: 'Action History',
        appTitle: 'Pdf Solution',
        loggedInAs: 'Logged in as User',
        login: 'Login',
        logout: 'Logout',
        guest: 'Guest',
        pdfEditMenu: 'PDF Edit',
        pdfConvertMenu: 'PDF Convert',
        mergePdf: 'Merge PDF',
        splitPdf: 'Split PDF',
        reorderPdfPages: 'Reorder Pages',
        addWatermark: 'Add Watermark',
        convertToPdf: 'Convert to PDF',
        wordToPdf: 'WORD to PDF',
        excelToPdf: 'EXCEL to PDF',
        pptToPdf: 'PPT to PDF',
        htmlToPdf: 'HTML to PDF',
        jpgToPdf: 'JPG to Image',
        convertFromPdf: 'Convert from PDF',
        pdfToWord: 'PDF to WORD',
        pdfToExcel: 'PDF to EXCEL',
        pdfToPpt: 'PDF to PPT',
        pdfToHtml: 'PDF to HTML',
        pdfToJpg: 'PDF to Image',
        pdfToOcr: 'PDF with OCR',
        proMode: 'Professional Mode',
        featureNotAvailable: 'Feature not available',
        featureNotAvailableForGuests: 'This feature is not available for guests. Please log in.'
    },
    zh: {
        pageTitle: 'PDF 編輯器',
        pageDescription: '多功能專業 PDF 編輯工具。',
        textAnnotationSample: '範例文本',
        startEditingYourPdf: '開始編輯您的 PDF',
        uploadPdfFirst: '請先上傳 PDF 檔案以使用編輯功能。',
        uploadLabel: '選擇 PDF',
        loadingPdf: '正在載入 PDF...',
        generatingFile: '正在產生檔案，請稍候…',
        loadError: '載入 PDF 失敗',
        tableConfigTitle: '設定表格',
        tableConfigDescription: '為您的新表格設定行數和列數。',
        tableRows: '行',
        tableCols: '列',
        createTable: '建立表格',
        cancel: '取消',
        downloadEditedFile: '下載',
        actionHistory: '操作歷史',
        appTitle: 'Pdf Solution',
        loggedInAs: '已登入為使用者',
        login: '登入',
        logout: '登出',
        guest: '訪客',
        pdfEditMenu: 'PDF編輯',
        pdfConvertMenu: 'PDF轉換',
        mergePdf: '合併PDF',
        splitPdf: '拆分PDF',
        reorderPdfPages: '變換順序',
        addWatermark: '添加浮水印',
        convertToPdf: '轉換為PDF',
        wordToPdf: 'WORD轉PDF',
        excelToPdf: 'EXCEL轉PDF',
        pptToPdf: 'PPT轉PDF',
        htmlToPdf: 'HTML轉PDF',
        jpgToPdf: 'JPG轉PDF',
        convertFromPdf: '從PDF轉換',
        pdfToWord: 'PDF轉WORD',
        pdfToExcel: 'PDF轉EXCEL',
        pdfToPpt: 'PDF轉PPT',
        pdfToHtml: 'PDF轉HTML',
        pdfToJpg: 'PDF轉圖片',
        pdfToOcr: 'PDF光學掃描(OCR)',
        proMode: '專業模式',
        featureNotAvailable: '功能無法使用',
        featureNotAvailableForGuests: '此功能不適用於訪客。請登入後使用。'
    }
};

export default function PdfEditorPage() {
    const router = useRouter();
    const { toast } = useToast();
  
    // Language and login state
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
    const [texts, setTexts] = useState(translations.zh);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    // Editor state
    const [isLoading, setIsLoading] = useState(false);
    const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [activePageIndex, setActivePageIndex] = useState<number | null>(0);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle');
    const [mainCanvasZoom, setMainCanvasZoom] = useState(1);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [tableConfig, setTableConfig] = useState<{rows: number, cols: number} | null>(null);
    
    // History (undo/redo)
    const [history, setHistory] = useState<EditorState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
  
    // Refs
    const fileUploadRef = useRef<HTMLInputElement>(null);
    const mainViewContainerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const downloadRef = useRef<HTMLDivElement>(null);
    const toolbarContainerRef = useRef<HTMLDivElement>(null);
    const isPanningRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const drawingStartRef = useRef<{ pageIndex: number; startX: number; startY: number; id: string; shapeType?: 'rect' | 'ellipse' | 'triangle' } | null>(null);
  
    // Derived state
    const activeAnnotation = annotations.find(a => a.id === selectedAnnotationId);
    const activeTextAnnotation = activeAnnotation?.type === 'text' ? activeAnnotation : undefined;
    const activeShapeAnnotation = activeAnnotation && ['rect', 'ellipse', 'triangle'].includes(activeAnnotation.type) ? activeAnnotation as ShapeAnnotation : undefined;
    
    // --- Effects ---
  
    useEffect(() => {
      setTexts(translations[currentLanguage] || translations.en);
    }, [currentLanguage]);
  
    useEffect(() => {
      if (typeof window !== 'undefined') {
        setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      }
    }, []);

    // Global click listener to deselect annotations
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const isClickingToolbar = toolbarContainerRef.current?.contains(e.target as Node);
            const isClickingCanvas = mainViewContainerRef.current?.contains(e.target as Node);
            const isClickingDownload = downloadRef.current?.contains(e.target as Node);

            if (!isClickingToolbar && !isClickingCanvas && !isClickingDownload) {
                setInteractionMode('idle');
                setSelectedAnnotationId(null);
                setShowDownloadOptions(false);
            }
        };
        document.addEventListener('mousedown', handleGlobalClick);
        return () => document.removeEventListener('mousedown', handleGlobalClick);
    }, []);
    
    // Set cursor style based on the active tool
    useEffect(() => {
        if (mainViewContainerRef.current) {
            let cursor = 'default';
            if (activeTool === 'pan') cursor = 'grab';
            if (['shape', 'mosaic', 'scribble', 'table'].includes(activeTool)) cursor = 'crosshair';
            mainViewContainerRef.current.style.cursor = cursor;
        }
    }, [activeTool]);

    // --- History Management ---
    const updateHistory = useCallback((newState: EditorState) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const prevState = history[newIndex];
            setPageObjects(prevState.pageObjects);
            setAnnotations(prevState.annotations);
        }
    };
    
    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const nextState = history[newIndex];
            setPageObjects(nextState.pageObjects);
            setAnnotations(nextState.annotations);
        }
    };

    const saveState = (newAnnotations: Annotation[], newPageObjects: PageObject[] = pageObjects) => {
        setAnnotations(newAnnotations);
        updateHistory({ pageObjects: newPageObjects, annotations: newAnnotations });
    };

    // --- Core Functions ---
  
    const loadPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageIndex: number): Promise<PageObject> => {
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
        }
        return { id: uuidv4(), sourceCanvas: canvas, rotation: 0 };
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      setIsLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const loadedPages = await Promise.all(
          [...Array(pdf.numPages)].map((_, i) => loadPage(pdf, i))
        );
        setPageObjects(loadedPages);
        setAnnotations([]);
        setActivePageIndex(0);
        updateHistory({ pageObjects: loadedPages, annotations: [] });
      } catch (err: any) {
        toast({ title: texts.loadError, description: err.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
        const newAnnotations = annotations.map(a => (a.id === id ? { ...a, ...updates } : a));
        saveState(newAnnotations);
    };

    // --- Annotation Actions ---
    const addAnnotation = (annotation: Annotation) => {
        const newAnnotations = [...annotations, annotation];
        saveState(newAnnotations);
        setSelectedAnnotationId(annotation.id);
    };

    const handleAddAnnotation = (type: Tool) => {
        if (activePageIndex === null) return;
        const commonProps = { pageIndex: activePageIndex, leftRatio: 0.1, topRatio: 0.1, isUserAction: true, id: uuidv4() };

        if (type === 'text') {
            addAnnotation({ ...commonProps, type, text: texts.textAnnotationSample, widthRatio: 0.3, heightRatio: 0.05, fontSize: 12, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#000000', textAlign: 'left' });
            setInteractionMode('editing');
        } else if (type === 'image') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                            const aspectRatio = img.width / img.height;
                            addAnnotation({ ...commonProps, type, dataUrl: event.target?.result as string, widthRatio: 0.2, heightRatio: 0.2 / aspectRatio, aspectRatio });
                        }
                        img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        } else if (type === 'shape' || type === 'scribble' || type === 'table') {
            setActiveTool(type);
             if (type === 'table') {
                setTableConfig({ rows: 3, cols: 3 }); 
            }
        }
    };
    
    const handleAddShapeAnnotation = (shapeType: 'rect' | 'ellipse' | 'triangle') => {
        if (activePageIndex === null) return;
        setActiveTool('shape');
        drawingStartRef.current = { pageIndex: activePageIndex, startX:0, startY:0, id: '', shapeType };
    };

    const handleDeleteAnnotation = (id: string) => {
        const newAnnotations = annotations.filter(a => a.id !== id);
        saveState(newAnnotations);
        if (selectedAnnotationId === id) {
            setSelectedAnnotationId(null);
            setInteractionMode('idle');
        }
    };
    
    // --- Mouse/Interaction Handlers ---
    const handlePanMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'pan') {
            isPanningRef.current = true;
            panStartRef.current = { x: e.clientX, y: e.clientY };
            if (mainViewContainerRef.current) mainViewContainerRef.current.style.cursor = 'grabbing';
        }
    };

    const handlePanMouseMove = (e: React.MouseEvent) => {
        if (isPanningRef.current && mainViewContainerRef.current) {
            const dx = e.clientX - panStartRef.current.x;
            const dy = e.clientY - panStartRef.current.y;
            mainViewContainerRef.current.scrollLeft -= dx;
            mainViewContainerRef.current.scrollTop -= dy;
            panStartRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handlePanMouseUpAndLeave = () => {
        isPanningRef.current = false;
        if (mainViewContainerRef.current) mainViewContainerRef.current.style.cursor = 'grab';
    };

    const handlePageMouseDown = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
        if (!['shape', 'scribble', 'table'].includes(activeTool)) return;
        
        e.stopPropagation();
        setInteractionMode(`drawing-${activeTool}` as InteractionMode);

        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;
        const id = uuidv4();
        
        const startXRatio = startX / rect.width;
        const startYRatio = startY / rect.height;

        drawingStartRef.current = { ...drawingStartRef.current, pageIndex, startX: startXRatio, startY: startYRatio, id };
        
        let newAnnotation: Annotation | null = null;
        const commonProps = { id, pageIndex, leftRatio: startXRatio, topRatio: startYRatio, widthRatio: 0, heightRatio: 0, isUserAction: true };
        
        if (activeTool === 'shape') {
            const shapeType = drawingStartRef.current?.shapeType || 'rect';
            newAnnotation = { ...commonProps, type: shapeType, fillColor: '#ffffff80', strokeColor: '#000000', strokeWidth: 2 };
        } else if (activeTool === 'scribble') {
            newAnnotation = { ...commonProps, type: 'scribble', points: [{xRatio: startXRatio, yRatio: startYRatio}], color: '#000000', strokeWidth: 2 };
        } else if (activeTool === 'table' && tableConfig) {
             newAnnotation = { ...commonProps, type: 'table', rows: tableConfig.rows, cols: tableConfig.cols, cellPadding: 2, strokeColor: '#000000', strokeWidth: 1, cells: Array(tableConfig.rows).fill([]).map(() => Array(tableConfig.cols).fill('')) };
             setTableConfig(null);
        }

        if (newAnnotation) {
            setAnnotations(prev => [...prev, newAnnotation!]);
        }
    };

    const handleMainViewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        handlePanMouseMove(e);
        if (!drawingStartRef.current) return;
        
        const { pageIndex, startX, startY, id } = drawingStartRef.current;
        const pageRef = pageRefs.current[pageIndex];
        if (!pageRef) return;
        
        const rect = pageRef.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / rect.width;
        const currentY = (e.clientY - rect.top) / rect.height;
        
        if (interactionMode === 'drawing-scribble') {
            const currentAnnotation = annotations.find(a => a.id === id) as ScribbleAnnotation;
            if(currentAnnotation) {
                const newPoints = [...currentAnnotation.points, { xRatio: currentX, yRatio: currentY }];
                updateAnnotation(id, { points: newPoints });
            }
        } else {
            const leftRatio = Math.min(startX, currentX);
            const topRatio = Math.min(startY, currentY);
            const widthRatio = Math.abs(currentX - startX);
            const heightRatio = Math.abs(currentY - startY);
            updateAnnotation(id, { leftRatio, topRatio, widthRatio, heightRatio });
        }
    };

    const handleMainViewMouseUp = () => {
        handlePanMouseUpAndLeave();
        if (drawingStartRef.current) {
            saveState(annotations); // Save state after drawing
            drawingStartRef.current = null;
            setActiveTool('select');
            setInteractionMode('idle');
        }
    };

    const handleAnnotationSelect = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedAnnotationId(id);
        setInteractionMode('selected');
        setActiveTool('select');
    };
    
    const handleTextAnnotationDoubleClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setInteractionMode('editing');
        setSelectedAnnotationId(id);
    };

    // --- Component JSX ---
    const Header = () => (
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
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger><ArrowRightLeft className="mr-2 h-4 w-4" />{texts.pdfConvertMenu}</MenubarTrigger>
                             <MenubarContent>
                                <MenubarSub>
                                    <MenubarSubTrigger><FileUp className="mr-2 h-4 w-4" />{texts.convertToPdf}</MenubarSubTrigger>
                                    <MenubarSubContent>
                                        <MenubarItem onClick={() => router.push('/word-to-pdf')}><FileText className="mr-2 h-4 w-4" />{texts.wordToPdf}</MenubarItem>
                                    </MenubarSubContent>
                                </MenubarSub>
                                <MenubarSub>
                                    <MenubarSubTrigger><FileMinus className="mr-2 h-4 w-4" />{texts.convertFromPdf}</MenubarSubTrigger>
                                    <MenubarSubContent>
                                        <MenubarItem onClick={() => router.push('/pdf-to-word')}><FileText className="mr-2 h-4 w-4" />{texts.pdfToWord}</MenubarItem>
                                    </MenubarSubContent>
                                </MenubarSub>
                            </MenubarContent>
                        </MenubarMenu>
                    </Menubar>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <Button variant={currentLanguage === 'en' ? "secondary" : "outline"} size="sm" onClick={() => setCurrentLanguage('en')}>English</Button>
                        <Button variant={currentLanguage === 'zh' ? "secondary" : "outline"} size="sm" onClick={() => setCurrentLanguage('zh')}>中文</Button>
                    </div>
                     {isLoggedIn ? (
                        <div className="flex items-center gap-2">
                            <UserCircle className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{texts.loggedInAs}</span>
                            <Button variant="outline" size="sm" onClick={() => setIsLoggedIn(false)}>
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
    );

    const PageThumbnailsPanel = () => (
        <aside className="w-64 bg-card border-r p-4 overflow-y-auto">
             <h3 className="text-lg font-semibold mb-2">Pages</h3>
             <div className="space-y-2">
                {pageObjects.map((page, index) => (
                    <div key={page.id} className={cn("p-2 border-2 rounded-md cursor-pointer", activePageIndex === index ? "border-primary" : "border-transparent")} onClick={() => setActivePageIndex(index)}>
                         <canvas
                            className="w-full h-auto rounded shadow"
                            ref={canvas => {
                                if (canvas) {
                                    const aspectRatio = page.sourceCanvas.width / page.sourceCanvas.height;
                                    canvas.width = 150;
                                    canvas.height = 150 / aspectRatio;
                                    const ctx = canvas.getContext('2d');
                                    ctx?.drawImage(page.sourceCanvas, 0, 0, canvas.width, canvas.height);
                                }
                            }}
                        />
                        <p className="text-center text-sm mt-1">Page {index + 1}</p>
                    </div>
                ))}
             </div>
        </aside>
    );

    const ActionHistoryPanel = () => (
        <aside className="w-64 bg-card border-l p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">{texts.actionHistory}</h3>
            <div className="space-y-2">
                {annotations.filter(a => a.isUserAction).map(ann => (
                    <div
                        key={ann.id}
                        className={cn("p-2 border rounded-md cursor-pointer flex justify-between items-center text-sm", selectedAnnotationId === ann.id && "bg-primary/20 border-primary")}
                        onClick={() => setSelectedAnnotationId(ann.id)}
                    >
                        <span className="truncate">{ann.type}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteAnnotation(ann.id)}}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </div>
                ))}
                {annotations.filter(a => a.isUserAction).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center p-4">No user actions recorded yet.</p>
                )}
            </div>
        </aside>
    );

    return (
        <div className="flex flex-col h-screen bg-background text-foreground font-sans">
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-white text-lg">{texts.loadingPdf}</p>
                </div>
            )}
             {isDownloading && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-white text-lg">{texts.generatingFile}</p>
                     <div className="w-64 mt-4">
                        <Progress value={downloadProgress} className="h-2" />
                    </div>
                </div>
            )}
            <Header />

            <div className="flex flex-grow overflow-hidden">
                {pageObjects.length > 0 && <PageThumbnailsPanel />}
                <main className="flex-grow flex flex-col relative">
                     <div className="p-2 border-b bg-card flex items-center justify-between gap-4 sticky top-0 z-30">
                         <div className="flex items-center gap-2">
                            <Button variant="ghost" className="h-auto p-2" onClick={() => handleAddAnnotation('text')}><Type className="h-5 w-5" /></Button>
                            <Button variant="ghost" className="h-auto p-2" onClick={() => handleAddAnnotation('image')}><ImageIcon className="h-5 w-5" /></Button>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={activeTool === 'shape' ? "secondary" : "ghost"} className="h-auto p-2"><Square className="h-5 w-5" /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-1 flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleAddShapeAnnotation('rect')}><Square className="h-5 w-5"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleAddShapeAnnotation('ellipse')}><Circle className="h-5 w-5"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleAddShapeAnnotation('triangle')}><TriangleIcon className="h-5 w-5"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => setActiveTool('scribble')}><ScribbleIcon className="h-5 w-5"/></Button>
                                </PopoverContent>
                            </Popover>
                            <Dialog open={!!tableConfig} onOpenChange={(open) => !open && setTableConfig(null)}>
                                <Button variant={activeTool === 'table' ? "secondary" : "ghost"} className="h-auto p-2" onClick={() => handleAddAnnotation('table')}><Grid className="h-5 w-5" /></Button>
                                 <DialogContent>
                                    <DialogHeader><DialogTitle>{texts.tableConfigTitle}</DialogTitle><ShadCnDialogDescription>{texts.tableConfigDescription}</ShadCnDialogDescription></DialogHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label htmlFor="rows">{texts.tableRows}</Label><Input id="rows" type="number" defaultValue={3} onChange={e => setTableConfig(p => ({...p!, rows: parseInt(e.target.value)}))} /></div>
                                        <div className="space-y-2"><Label htmlFor="cols">{texts.tableCols}</Label><Input id="cols" type="number" defaultValue={3} onChange={e => setTableConfig(p => ({...p!, cols: parseInt(e.target.value)}))} /></div>
                                    </div>
                                    <AlertDialogFooter>
                                        <Button variant="outline" onClick={() => setTableConfig(null)}>{texts.cancel}</Button>
                                        <Button onClick={() => { setActiveTool('table'); }}>{texts.createTable}</Button>
                                    </AlertDialogFooter>
                                </DialogContent>
                            </Dialog>
                         </div>
                         <div className="flex items-center gap-2">
                            <Button onClick={undo} disabled={historyIndex <= 0}><Undo className="h-4 w-4 mr-2"/>Undo</Button>
                            <Button onClick={redo} disabled={historyIndex >= history.length - 1}><Redo className="h-4 w-4 mr-2"/>Redo</Button>
                            <div ref={downloadRef} className="relative">
                                <Button onClick={() => setShowDownloadOptions(p => !p)} variant="destructive"><Download className="h-4 w-4 mr-2"/> {texts.downloadEditedFile}</Button>
                                 {showDownloadOptions && (
                                    <Card className="absolute top-full right-0 mt-2 w-48 p-2 z-50">
                                        <Button variant="ghost" className="w-full justify-start">PDF</Button>
                                        <Button variant="ghost" className="w-full justify-start">Word</Button>
                                        <Button variant="ghost" className="w-full justify-start">Image</Button>
                                    </Card>
                                )}
                            </div>
                         </div>
                    </div>
                     <div ref={toolbarContainerRef} className="absolute top-16 left-1/2 -translate-x-1/2 z-40">
                        {activeTextAnnotation && interactionMode === 'editing' && (
                            <Card className="p-2 flex items-center gap-1 shadow-lg text-toolbar">
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="outline" className="w-8 h-8 p-1" style={{backgroundColor: activeTextAnnotation.color}}/></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Input type="color" value={activeTextAnnotation.color} onChange={(e) => updateAnnotation(activeTextAnnotation.id, { color: e.target.value })} /></PopoverContent>
                                </Popover>
                                <Input type="number" value={activeTextAnnotation.fontSize} onChange={e => updateAnnotation(activeTextAnnotation.id, { fontSize: parseInt(e.target.value)})} className="w-16"/>
                                <Toggle pressed={activeTextAnnotation.bold} onPressedChange={v => updateAnnotation(activeTextAnnotation.id, { bold: v})}><Bold className="h-4 w-4"/></Toggle>
                                <Toggle pressed={activeTextAnnotation.italic} onPressedChange={v => updateAnnotation(activeTextAnnotation.id, { italic: v})}><Italic className="h-4 w-4"/></Toggle>
                                <Toggle pressed={activeTextAnnotation.underline} onPressedChange={v => updateAnnotation(activeTextAnnotation.id, { underline: v})}><Underline className="h-4 w-4"/></Toggle>
                            </Card>
                        )}
                        {activeShapeAnnotation && (
                             <Card className="p-2 flex items-center gap-1 shadow-lg shape-toolbar">
                                <Label>Fill:</Label><Input type="color" value={activeShapeAnnotation.fillColor} onChange={e => updateAnnotation(activeShapeAnnotation.id, { fillColor: e.target.value})} className="w-8 h-8 p-1"/>
                                <Label>Stroke:</Label><Input type="color" value={activeShapeAnnotation.strokeColor} onChange={e => updateAnnotation(activeShapeAnnotation.id, { strokeColor: e.target.value})} className="w-8 h-8 p-1"/>
                                <Label>Width:</Label><Input type="number" min={1} value={activeShapeAnnotation.strokeWidth} onChange={e => updateAnnotation(activeShapeAnnotation.id, { strokeWidth: parseInt(e.target.value)})} className="w-16"/>
                            </Card>
                        )}
                    </div>

                    <div ref={mainViewContainerRef} className="flex-grow bg-muted/30 overflow-auto flex flex-col items-center p-4 space-y-4" onMouseDown={handlePanMouseDown} onMouseMove={handleMainViewMouseMove} onMouseUp={handleMainViewMouseUp} >
                        {pageObjects.length > 0 ? pageObjects.filter((_, i) => i === activePageIndex).map((page, index) => (
                             <div
                                key={page.id}
                                ref={el => pageRefs.current[activePageIndex] = el}
                                className="relative bg-white shadow-lg"
                                style={{ width: page.sourceCanvas.width * mainCanvasZoom, height: page.sourceCanvas.height * mainCanvasZoom }}
                                onMouseDown={(e) => handlePageMouseDown(e, activePageIndex)}
                             >
                                <canvas
                                    className="absolute inset-0 w-full h-full"
                                    style={{ transform: `rotate(${page.rotation}deg)`}}
                                    ref={canvas => {
                                        if (canvas) {
                                            canvas.width = page.sourceCanvas.width;
                                            canvas.height = page.sourceCanvas.height;
                                            const ctx = canvas.getContext('2d');
                                            ctx?.drawImage(page.sourceCanvas, 0, 0);
                                        }
                                    }}
                                />
                                {annotations.filter(a => a.pageIndex === activePageIndex).map(ann => {
                                    switch(ann.type) {
                                        case 'text': return <div key={ann.id} style={{position:'absolute', left: `${ann.leftRatio*100}%`, top: `${ann.topRatio*100}%`, width:`${ann.widthRatio*100}%`, height:`${ann.heightRatio*100}%`}} onDoubleClick={(e) => handleTextAnnotationDoubleClick(e, ann.id)} onMouseDown={e => { handleAnnotationSelect(e, ann.id); }}><Textarea defaultValue={(ann as TextAnnotation).text} readOnly={interactionMode !== 'editing' || selectedAnnotationId !== ann.id} className="bg-transparent border-2 border-dashed border-transparent hover:border-primary focus:border-primary w-full h-full p-0 resize-none" style={{color: (ann as TextAnnotation).color, fontSize: `${(ann as TextAnnotation).fontSize * mainCanvasZoom}px`, cursor: 'move'}} onChange={(e) => updateAnnotation(ann.id, {text: e.target.value})}/></div>;
                                        case 'image': return <img key={ann.id} src={(ann as ImageAnnotation).dataUrl} alt="user upload" style={{position:'absolute', left: `${ann.leftRatio*100}%`, top: `${ann.topRatio*100}%`, width:`${ann.widthRatio*100}%`, height:`${ann.heightRatio*100}%`, border:'2px dashed transparent', userSelect: 'none'}} onMouseDown={e => { handleAnnotationSelect(e, ann.id); }} className="hover:border-primary"/>;
                                        case 'rect':
                                        case 'ellipse':
                                        case 'triangle':
                                             return <div key={ann.id} style={{position:'absolute', left: `${ann.leftRatio*100}%`, top: `${ann.topRatio*100}%`, width:`${ann.widthRatio*100}%`, height:`${ann.heightRatio*100}%`, backgroundColor: (ann as ShapeAnnotation).fillColor, border: `${(ann as ShapeAnnotation).strokeWidth}px solid ${(ann as ShapeAnnotation).strokeColor}`, borderRadius: ann.type === 'ellipse' ? '50%' : 0, userSelect: 'none' }} onMouseDown={e => { handleAnnotationSelect(e, ann.id); }}/>;
                                        case 'scribble':
                                            // Implement scribble rendering with SVG/Canvas
                                            return null;
                                        default: return null;
                                    }
                                })}
                             </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                                <h2 className="text-2xl font-bold">{texts.startEditingYourPdf}</h2>
                                <p className="text-muted-foreground">{texts.uploadPdfFirst}</p>
                                <Button className="mt-4" onClick={() => fileUploadRef.current?.click()}>
                                    <FilePlus className="mr-2 h-4 w-4" /> {texts.uploadLabel}
                                </Button>
                                <input type="file" ref={fileUploadRef} onChange={handlePdfUpload} accept="application/pdf" className="hidden" />
                            </div>
                        )}
                    </div>
                </main>
                {pageObjects.length > 0 && <ActionHistoryPanel />}
            </div>
        </div>
    );
}

