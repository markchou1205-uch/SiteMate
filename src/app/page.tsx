
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy as PDFDocumentProxyType } from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb, degrees, grayscale } from 'pdf-lib';
import Sortable from 'sortablejs';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, RotateCw, X, Trash2, Download, Upload, Info, Shuffle, Search, Edit3, Droplet, LogIn, LogOut, UserCircle, FileText, FileType, FileDigit, Lock, MenuSquare, Columns, ShieldCheck, FilePlus, ListOrdered } from 'lucide-react';

import { storage, functions as firebaseFunctions, app as firebaseApp } from '@/lib/firebase'; // Firebase SDK
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';


if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const translations = {
    en: {
        pageTitle: 'DocuPilot',
        uploadLabel: 'Select PDF file to edit:',
        deletePages: 'Delete Selected Pages',
        downloadPdf: 'Download Edited PDF',
        downloadTxt: 'Download as TXT',
        convertToWord: 'Convert to Word',
        convertingToWord: 'Converting to Word...',
        insertAreaTitle: 'Select PDF to Insert',
        insertOptionsTitle: 'Insertion Options',
        insertBeforeLabel: 'Insert before selected page',
        insertAfterLabel: 'Insert after selected page',
        instSelect: 'Click page to select/deselect.',
        instDrag: 'Drag pages to reorder.',
        instZoom: 'Double click page to zoom.',
        modalCloseButton: 'Close',
        rotateLeft: 'Rotate Left 90°',
        rotateRight: 'Rotate Right 90°',
        resetRotation: 'Reset Rotation',
        generatingFile: 'Generating file, please wait…',
        extractingText: 'Extracting text, please wait...',
        loadError: 'Failed to load PDF',
        downloadError: 'Failed to download PDF',
        txtDownloadError: 'Failed to download TXT',
        wordConvertError: 'Failed to convert to Word',
        pdfCoMethodNotFoundError: 'PDF.co Error: "Method Not Found" or API key issue. Please verify your PDF.co API Key is correct and the API endpoint in the Cloud Function is valid. Check PDF.co documentation.',
        wordConvertLimitTitle: 'Conversion Limit Reached',
        wordConvertLimitDescription: 'Guests can convert one PDF to Word per day. Please log in for unlimited conversions.',
        wordConvertSuccess: 'Conversion successful!',
        downloadWordFile: 'Click here to download Word file',
        insertError: 'Failed to insert PDF',
        insertConfirmTitle: 'Confirm Insert Position',
        insertConfirmDescription: 'No page is selected. The new PDF will be inserted at the end of the current document. Continue?',
        confirm: 'Confirm',
        cancel: 'Cancel',
        noteInputPlaceholder: 'Add a temporary note (not saved with PDF)',
        pageManagement: 'Page Management',
        tools: 'Page Actions & Instructions',
        fileOperations: 'File Operations',
        watermarkSectionTitle: 'Watermark',
        watermarkInputPlaceholder: 'Enter watermark text',
        pageNumberingSectionTitle: 'Page Numbering',
        enablePageNumbering: 'Enable Page Numbering',
        pageNumberPosition: 'Position',
        pageNumberStart: 'Start Number',
        pageNumberFontSize: 'Font Size',
        pageNumberMargin: 'Margin (pt)',
        pageNumberFormat: 'Format ({page}, {total})',
        pageNumberFormatPlaceholder: '{page} / {total}',
        protectPdfSectionTitle: 'Protect PDF',
        enablePdfProtection: 'Enable PDF Protection',
        pdfPassword: 'Password',
        pdfPasswordPlaceholder: 'Enter password',
        page: 'Page',
        uploadPdfFirstShort: 'Upload a PDF to start editing.',
        uploadPdfFirst: 'Please upload a PDF first to enable editing features.',
        noPagesToDownload: 'No pages to download.',
        noPdfToExtractText: 'No PDF loaded to extract text from.',
        noPdfToConvert: 'No PDF loaded to convert.',
        noPageSelected: 'No page selected.',
        loadingPdf: 'Loading PDF...',
        insertingPdf: 'Inserting PDF...',
        previewOf: 'Preview of Page',
        dropFileHere: 'Drop PDF file here or click to upload',
        dropInsertFileHere: 'Drop PDF here or click to select for insertion',
        downloadLimitTitle: 'Download Limit Reached',
        downloadLimitDescription: 'You have reached your daily download limit (3 downloads). Please log in or upgrade for unlimited downloads.',
        loggedInAs: 'Logged in as User',
        login: 'Login',
        logout: 'Logout',
        guest: 'Guest',
        firebaseNotConfigured: `Firebase Frontend SDK is not fully configured. Please ensure all Firebase environment variables (%MISSING_KEYS%) are correctly set and propagated to the client. This might require checking build logs or App Hosting settings.`,
        firebaseSdkInitError: "Firebase SDK could not be initialized properly (services like Storage or Functions might be unavailable). 'Convert to Word' and other Firebase features might be disabled. Check browser console for details from firebase.ts.",
        zoomDialogDescription: 'View a larger preview of the selected page. You can rotate the page or add temporary notes here.',
        bottomLeft: 'Bottom Left',
        bottomCenter: 'Bottom Center',
        bottomRight: 'Bottom Right',
        topLeft: 'Top Left',
        topCenter: 'Top Center',
        topRight: 'Top Right',
        pdfEditingTools: 'PDF Tools',
        downloadAndConvertTitle: 'Download & Convert',
        startEditingYourPdf: 'Start Editing Your PDF',
        pagesLoaded: 'pages loaded.',
        pageSelected: 'page selected.',
        featureEdit: 'Edit',
        featureMerge: 'Merge',
        featurePageNum: 'Page #',
        featureProtect: 'Protect',
        featureConvert: 'Convert',
        uploadNewPdf: 'Upload New PDF',
        accordionPageOrg: 'Page Organization',
        accordionDocEnhanceProtect: 'Document Enhancements & Protection',
        pageActions: 'Page Actions',
    },
    zh: {
        pageTitle: 'DocuPilot 文件助手',
        uploadLabel: '選擇要編輯的 PDF 檔案：',
        deletePages: '刪除選取的頁面',
        downloadPdf: '下載編輯後 PDF',
        downloadTxt: '下載為 TXT 檔案',
        convertToWord: '轉換為 Word',
        convertingToWord: '正在轉換為 Word...',
        insertAreaTitle: '選擇要插入的 PDF',
        insertOptionsTitle: '插入選項',
        insertBeforeLabel: '插入此頁之前',
        insertAfterLabel: '插入此頁之後',
        instSelect: '點選頁面以選取/取消。',
        instDrag: '拖曳頁面以調整順序。',
        instZoom: '雙擊頁面以放大預覽。',
        modalCloseButton: '關閉',
        rotateLeft: '向左旋轉90°',
        rotateRight: '向右旋轉90°',
        resetRotation: '重置旋轉',
        generatingFile: '正在產生檔案，請稍候…',
        extractingText: '正在提取文字，請稍候...',
        loadError: '載入 PDF 失敗',
        downloadError: '下載 PDF 失敗',
        txtDownloadError: '下載 TXT 失敗',
        wordConvertError: '轉換 Word 失敗',
        pdfCoMethodNotFoundError: 'PDF.co 錯誤：「方法未找到」或 API 金鑰問題。請確認您的 PDF.co API 金鑰是否正確，以及 Cloud Function 中的 API 端點是否有效。請查閱 PDF.co 文件。',
        wordConvertLimitTitle: '已達轉換上限',
        wordConvertLimitDescription: '訪客每日僅可轉換一份 PDF 至 Word。請登入以享受無限轉換次數。',
        wordConvertSuccess: '轉換成功！',
        downloadWordFile: '點此下載 Word 檔案',
        insertError: '插入 PDF 失敗',
        insertConfirmTitle: '確認插入位置',
        insertConfirmDescription: '尚未選取頁面。新 PDF 將插入到文件的末尾。是否繼續？',
        confirm: '確認',
        cancel: '取消',
        noteInputPlaceholder: '新增臨時筆記（不會儲存於 PDF）',
        pageManagement: '頁面管理',
        tools: '頁面操作與說明',
        fileOperations: '檔案操作',
        watermarkSectionTitle: '浮水印',
        watermarkInputPlaceholder: '輸入浮水印文字',
        pageNumberingSectionTitle: '頁碼',
        enablePageNumbering: '啟用頁碼',
        pageNumberPosition: '位置',
        pageNumberStart: '起始號碼',
        pageNumberFontSize: '字體大小',
        pageNumberMargin: '邊距 (pt)',
        pageNumberFormat: '格式 ({page}, {total})',
        pageNumberFormatPlaceholder: '{page} / {total}',
        protectPdfSectionTitle: '保護 PDF',
        enablePdfProtection: '啟用 PDF 保護',
        pdfPassword: '密碼',
        pdfPasswordPlaceholder: '輸入密碼',
        page: '頁',
        uploadPdfFirstShort: '上傳 PDF 以開始編輯。',
        uploadPdfFirst: '請先上傳 PDF 檔案以使用編輯功能。',
        noPagesToDownload: '沒有可下載的頁面。',
        noPdfToExtractText: '未載入 PDF 以提取文字。',
        noPdfToConvert: '未載入 PDF 以進行轉換。',
        noPageSelected: '未選取任何頁面。',
        loadingPdf: '正在載入 PDF...',
        insertingPdf: '正在插入 PDF...',
        previewOf: '預覽頁面',
        dropFileHere: '拖放 PDF 檔案至此或點擊上傳',
        dropInsertFileHere: '拖放 PDF 至此或點擊選擇以插入',
        downloadLimitTitle: '已達下載上限',
        downloadLimitDescription: '您已達到每日下載上限（3次）。請登入或升級以享受無限下載。',
        loggedInAs: '已登入為使用者',
        login: '登入',
        logout: '登出',
        guest: '訪客',
        firebaseNotConfigured: `Firebase 前端 SDK 設定不完整。請確保所有 Firebase 環境變數 (NEXT_PUBLIC_FIREBASE_API_KEY 等) 都已在您的 .env 檔案中設定。缺少：%MISSING_KEYS%`,
        firebaseSdkInitError: "Firebase SDK 未能正確初始化 (Storage 或 Functions 等服務可能無法使用)。'轉換為 Word' 及其他 Firebase 功能可能被禁用。請檢查瀏覽器控制台來自 firebase.ts 的詳細資訊。",
        zoomDialogDescription: '查看所選頁面的放大預覽。您可以在此旋轉頁面或新增臨時筆記。',
        bottomLeft: '左下',
        bottomCenter: '中下',
        bottomRight: '右下',
        topLeft: '左上',
        topCenter: '中上',
        topRight: '右上',
        pdfEditingTools: 'PDF 工具',
        downloadAndConvertTitle: '下載与轉換',
        startEditingYourPdf: '開始編輯您的 PDF',
        pagesLoaded: '頁已載入。',
        pageSelected: '頁已選取。',
        featureEdit: '編輯',
        featureMerge: '合併',
        featurePageNum: '頁碼',
        featureProtect: '保護',
        featureConvert: '轉換',
        uploadNewPdf: '上傳新 PDF',
        accordionPageOrg: '頁面組織',
        accordionDocEnhanceProtect: '文件增強與保護',
        pageActions: '頁面操作',
    }
};

const DAILY_DOWNLOAD_LIMIT = 3;
const DAILY_WORD_CONVERSION_LIMIT = 1;

type PageNumberPosition = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right';

export default function PdfEditorHomepage() {
  const router = useRouter();
  const { toast } = useToast();

  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [zoomedPageData, setZoomedPageData] = useState<{ canvas: HTMLCanvasElement, index: number } | null>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after'>('before');
  const [isInsertConfirmOpen, setIsInsertConfirmOpen] = useState(false);
  const [pendingInsertFile, setPendingInsertFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pdfDocumentProxy, setPdfDocumentProxy] = useState<PDFDocumentProxyType | null>(null);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);

  const [isConvertingToWord, setIsConvertingToWord] = useState(false);
  const [wordFileUrl, setWordFileUrl] = useState<string | null>(null);
  const [wordConversionError, setWordConversionError] = useState<string | null>(null);
  const [showWordLimitModal, setShowWordLimitModal] = useState(false);

  const [isFirebaseSystemReady, setIsFirebaseSystemReady] = useState(false);
  const [firebaseConfigWarning, setFirebaseConfigWarning] = useState('');

  const [pageNumberingConfig, setPageNumberingConfig] = useState({
    enabled: false,
    position: 'bottom-center' as PageNumberPosition,
    start: 1,
    fontSize: 12,
    margin: 20,
    format: '{page} / {total}',
  });

  const [pdfProtectionConfig, setPdfProtectionConfig] = useState({
    enabled: false,
    password: '',
  });

  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);


  useEffect(() => {
    console.log("[Page.tsx useEffect] STARTING Firebase readiness check...");
    console.log("[Page.tsx useEffect] Current language:", currentLanguage);

    const sdkServicesInitialized = !!firebaseApp && !!storage && !!firebaseFunctions;
    console.log("[Page.tsx useEffect] Imported firebaseApp from '@/lib/firebase':", firebaseApp ? firebaseApp.constructor.name : firebaseApp);
    console.log("[Page.tsx useEffect] Imported storage from '@/lib/firebase':", storage ? storage.constructor.name : storage);
    console.log("[Page.tsx useEffect] Imported firebaseFunctions from '@/lib/firebase':", firebaseFunctions ? firebaseFunctions.constructor.name : firebaseFunctions);
    console.log("[Page.tsx useEffect] sdkServicesInitialized (app, storage, functions from firebase.ts are truthy):", sdkServicesInitialized);

    if (sdkServicesInitialized) {
        setIsFirebaseSystemReady(true);
        setFirebaseConfigWarning('');
        console.log("[Page.tsx useEffect] Firebase system is READY because services from firebase.ts are initialized.");
    } else {
        setIsFirebaseSystemReady(false);
        let warningMsg = texts?.firebaseSdkInitError || "Firebase SDK services (app, storage, functions) NOT initialized.";

        if (!firebaseApp) console.warn("[Page.tsx useEffect] firebaseApp from 'firebase.ts' is falsy or undefined.");
        if (!storage) console.warn("[Page.tsx useEffect] storage from 'firebase.ts' is falsy or undefined.");
        if (!firebaseFunctions) console.warn("[Page.tsx useEffect] firebaseFunctions from 'firebase.ts' is falsy or undefined.");

        setFirebaseConfigWarning(warningMsg);
        console.warn(`[Page.tsx useEffect] Firebase system is NOT ready. Warning message set: ${warningMsg}`);
    }
    console.log("[Page.tsx useEffect] ENDING Firebase readiness check.");
  }, [currentLanguage, texts]);


  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);


  const previewContainerRef = useRef<HTMLDivElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfUploadRef = useRef<HTMLInputElement>(null);
  const insertPdfRef = useRef<HTMLInputElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);

      const today = new Date().toISOString().split('T')[0];
      let downloadInfoString = localStorage.getItem('DocuPilotDownloadInfo');
      if (downloadInfoString) {
        let downloadInfo = JSON.parse(downloadInfoString);
        if (downloadInfo.date !== today) {
          localStorage.removeItem('DocuPilotDownloadInfo');
        }
      }
      let wordConversionInfoString = localStorage.getItem('DocuPilotWordConversionInfo');
      if (wordConversionInfoString) {
        let wordInfo = JSON.parse(wordConversionInfoString);
        if (wordInfo.date !== today) {
            localStorage.removeItem('DocuPilotWordConversionInfo');
        }
      }
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
    toast({ title: texts.logout, description: "您已成功登出。", });
  };

  const renderPagePreviews = useCallback(() => {
    if (!previewContainerRef.current) return;

    if (sortableInstanceRef.current) {
      sortableInstanceRef.current.destroy();
      sortableInstanceRef.current = null;
    }

    previewContainerRef.current.innerHTML = '';

    pages.forEach((pageCanvas, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = `page-preview-wrapper p-2 border-2 rounded-lg cursor-pointer transition-all bg-card hover:border-primary ${selectedPages.has(index) ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`;
      wrapper.dataset.index = index.toString();

      const previewDisplayCanvas = document.createElement('canvas');
      const previewCtx = previewDisplayCanvas.getContext('2d');
      if (!previewCtx) return;

      const aspectRatio = pageCanvas.width / pageCanvas.height;
      const displayWidth = 120;
      const displayHeight = displayWidth / aspectRatio;

      previewDisplayCanvas.width = pageCanvas.width;
      previewDisplayCanvas.height = pageCanvas.height;
      previewCtx.drawImage(pageCanvas, 0, 0);

      previewDisplayCanvas.style.width = `${displayWidth}px`;
      previewDisplayCanvas.style.height = `${displayHeight}px`;
      previewDisplayCanvas.className = "rounded-md shadow-md";

      const pageNumberDiv = document.createElement('div');
      pageNumberDiv.className = "text-xs text-muted-foreground mt-1 text-center";
      pageNumberDiv.textContent = `${texts.page} ${index + 1}`;

      wrapper.appendChild(previewDisplayCanvas);
      wrapper.appendChild(pageNumberDiv);

      wrapper.addEventListener('click', () => {
        const newSelectedPages = new Set<number>();
        if (!selectedPages.has(index)) {
            newSelectedPages.add(index);
        }
        setSelectedPages(newSelectedPages);
      });

      wrapper.addEventListener('dblclick', () => {
        setZoomedPageData({ canvas: pageCanvas, index });
        setCurrentRotation(0); // Reset rotation when opening
        setIsZoomModalOpen(true);
      });
      previewContainerRef.current?.appendChild(wrapper);
    });

    if (pages.length > 0 && previewContainerRef.current) {
      sortableInstanceRef.current = Sortable.create(previewContainerRef.current, {
        animation: 150,
        ghostClass: 'opacity-50',
        chosenClass: 'shadow-2xl',
        dragClass: 'opacity-75',
        onEnd: (evt) => {
          if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
          const reorderedPages = Array.from(pages);
          const [movedItem] = reorderedPages.splice(evt.oldIndex, 1);
          reorderedPages.splice(evt.newIndex, 0, movedItem);
          setPages(reorderedPages);

          const newSelected = new Set<number>();
          if (selectedPages.has(evt.oldIndex)) {
            newSelected.add(evt.newIndex);
          }
          setSelectedPages(newSelected);
        }
      });
    }
  }, [pages, selectedPages, texts.page]);


  useEffect(() => {
    renderPagePreviews();
  }, [pages, selectedPages, renderPagePreviews]);


 useEffect(() => {
    if (isZoomModalOpen && zoomedPageData && zoomCanvasRef.current) {
      const canvas = zoomCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sourceCanvas = zoomedPageData.canvas;
      const baseWidth = sourceCanvas.width;
      const baseHeight = sourceCanvas.height;
      
      // Set canvas drawing surface size
      if (currentRotation % 180 !== 0) {
        canvas.width = baseHeight; // Swapped for 90/270 deg rotation
        canvas.height = baseWidth;  
      } else {
        canvas.width = baseWidth; 
        canvas.height = baseHeight;
      }
      
      // Apply transformations and draw
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear with new dimensions
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((currentRotation * Math.PI) / 180);
      // Draw source centered on its own dimensions
      ctx.drawImage(sourceCanvas, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
      ctx.restore();
    }
  }, [isZoomModalOpen, zoomedPageData, currentRotation]);

  const processPdfFile = async (file: File): Promise<{ canvases: HTMLCanvasElement[], docProxy: PDFDocumentProxyType }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocProxy = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    }).promise;

    const numPages = pdfDocProxy.numPages;
    const loadedCanvases: HTMLCanvasElement[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocProxy.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Render at 1.5x for better quality
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue; // Should not happen
      await page.render({ canvasContext: ctx, viewport }).promise;
      loadedCanvases.push(canvas);
    }
    return { canvases: loadedCanvases, docProxy: pdfDocProxy };
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            file = event.dataTransfer.files[0];
            event.dataTransfer.clearData();
        }
    } else {
        file = event.target.files?.[0] || null;
    }

    if (!file || !file.type.includes('pdf')) {
        if (file) toast({ title: texts.loadError, description: "無效的檔案類型。請上傳 PDF。", variant: "destructive" });
        return;
    }
    setUploadedPdfFile(file); // Store the original uploaded file
    setWordFileUrl(null);
    setWordConversionError(null);

    setIsLoading(true);
    setLoadingMessage(texts.loadingPdf);
    try {
      const { canvases, docProxy } = await processPdfFile(file);
      setPages(canvases);
      setPdfDocumentProxy(docProxy); // Store the PDFDocumentProxy
      setSelectedPages(new Set()); // Clear selected pages on new upload
    } catch (err: any) {
      toast({ title: texts.loadError, description: err.message, variant: "destructive" });
      setPdfDocumentProxy(null);
      setUploadedPdfFile(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (pdfUploadRef.current) pdfUploadRef.current.value = ''; // Reset file input
    }
  };

  const handleDeletePages = () => {
    if (selectedPages.size === 0) {
      toast({ title: texts.pageManagement, description: texts.noPageSelected, variant: "destructive" });
      return;
    }
    const newPages = pages.filter((_, idx) => !selectedPages.has(idx));
    setPages(newPages);
    setSelectedPages(new Set()); // Clear selection
    if (newPages.length === 0) { // If all pages are deleted
        setPdfDocumentProxy(null);
        setUploadedPdfFile(null);
    }
    toast({ title: texts.pageManagement, description: "選取的頁面已刪除。", });
  };

  const handleDownloadPdf = async () => {
    if (pages.length === 0) {
      toast({ title: texts.downloadPdf, description: texts.noPagesToDownload, variant: "destructive" });
      return;
    }

    if (!isLoggedIn && typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      let downloadInfoString = localStorage.getItem('DocuPilotDownloadInfo');
      let downloadInfo = downloadInfoString ? JSON.parse(downloadInfoString) : { count: 0, date: today };

      if (downloadInfo.date !== today) {
        downloadInfo = { count: 0, date: today };
      }

      if (downloadInfo.count >= DAILY_DOWNLOAD_LIMIT) {
        setShowPaymentModal(true);
        return;
      }
      downloadInfo.count++;
      localStorage.setItem('DocuPilotDownloadInfo', JSON.stringify(downloadInfo));
    }

    setIsDownloading(true);
    setLoadingMessage(texts.generatingFile);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate short delay
      const pdfDocOut = await PDFLibDocument.create();
      const helveticaFont = await pdfDocOut.embedFont(StandardFonts.Helvetica);

      for (let canvas of pages) {
        const imgDataUrl = canvas.toDataURL('image/png'); // Use PNG for better quality than JPEG for sharp text/lines
        const pngImage = await pdfDocOut.embedPng(imgDataUrl);
        const page = pdfDocOut.addPage([canvas.width, canvas.height]);
        page.drawImage(pngImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });
      }

      const pdfLibPages = pdfDocOut.getPages();

      if (pageNumberingConfig.enabled) {
        const font = await pdfDocOut.embedFont(StandardFonts.Helvetica); // Could be configurable
        for (let i = 0; i < pdfLibPages.length; i++) {
          const pdfLibPage = pdfLibPages[i];
          const { width, height } = pdfLibPage.getSize();
          const currentPageNum = i + pageNumberingConfig.start;
          const totalNumPages = pdfLibPages.length;
          
          let text = pageNumberingConfig.format
            .replace('{page}', currentPageNum.toString())
            .replace('{total}', totalNumPages.toString());

          const textSize = pageNumberingConfig.fontSize;
          const textWidth = font.widthOfTextAtSize(text, textSize);
          const textHeight = font.heightAtSize(textSize); // Approximation
          const margin = pageNumberingConfig.margin;

          let x, y;
          switch (pageNumberingConfig.position) {
            case 'top-left': x = margin; y = height - margin - textHeight; break;
            case 'top-center': x = width / 2 - textWidth / 2; y = height - margin - textHeight; break;
            case 'top-right': x = width - margin - textWidth; y = height - margin - textHeight; break;
            case 'bottom-left': x = margin; y = margin; break;
            case 'bottom-center': x = width / 2 - textWidth / 2; y = margin; break;
            case 'bottom-right': x = width - margin - textWidth; y = margin; break;
            default: x = width / 2 - textWidth / 2; y = margin; // Default to bottom-center
          }
          pdfLibPage.drawText(text, { x, y, font, size: textSize, color: grayscale(0) }); // Black color
        }
      }
      
      if (watermarkText.trim() !== '') {
          const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, 50);
          const textHeight = helveticaFont.heightAtSize(50); // For centering
          pdfLibPages.forEach(page => {
            const { width: pageWidth, height: pageHeight } = page.getSize();
            page.drawText(watermarkText, {
                x: pageWidth / 2 - textWidth / 2,
                y: pageHeight / 2 - textHeight / 4, // Adjust Y for better visual center
                font: helveticaFont,
                size: 50,
                color: rgb(0.75, 0.75, 0.75), // Light grey
                opacity: 0.3, // Semi-transparent
                rotate: degrees(45), // Diagonal watermark
            });
          });
      }

      if (pdfProtectionConfig.enabled && pdfProtectionConfig.password) {
        await pdfDocOut.encrypt({
          userPassword: pdfProtectionConfig.password,
          ownerPassword: pdfProtectionConfig.password, // Or a different owner password
          permissions: {}, // Define permissions if needed
        });
      }

      const pdfBytes = await pdfDocOut.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DocuPilot_edited.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: texts.downloadPdf, description: "PDF 下載成功！" });
    } catch (err: any) {
      console.error("Download PDF error:", err);
      toast({ title: texts.downloadError, description: err.message, variant: "destructive" });
    } finally {
      setIsDownloading(false);
      setLoadingMessage('');
    }
  };

  const handleDownloadTxt = async () => {
    if (!pdfDocumentProxy) {
      toast({ title: texts.txtDownloadError, description: texts.noPdfToExtractText, variant: "destructive" });
      return;
    }

     if (!isLoggedIn && typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      let downloadInfoString = localStorage.getItem('DocuPilotDownloadInfo');
      let downloadInfo = downloadInfoString ? JSON.parse(downloadInfoString) : { count: 0, date: today };

      if (downloadInfo.date !== today) {
        downloadInfo = { count: 0, date: today };
      }

      if (downloadInfo.count >= DAILY_DOWNLOAD_LIMIT) {
        setShowPaymentModal(true);
        return;
      }
      downloadInfo.count++;
      localStorage.setItem('DocuPilotDownloadInfo', JSON.stringify(downloadInfo));
    }

    setIsExtractingText(true);
    setLoadingMessage(texts.extractingText);
    try {
      let fullText = '';
      for (let i = 1; i <= pdfDocumentProxy.numPages; i++) {
        const page = await pdfDocumentProxy.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n'; // Add double newline for page separation
      }

      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DocuPilot_extracted_text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: texts.downloadTxt, description: "文字提取並下載成功！" });

    } catch (err: any) {
      toast({ title: texts.txtDownloadError, description: err.message, variant: "destructive" });
    } finally {
      setIsExtractingText(false);
      setLoadingMessage('');
    }
  };


  const handleInsertPdfFileSelected = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            file = event.dataTransfer.files[0];
            event.dataTransfer.clearData();
        }
    } else {
        file = event.target.files?.[0] || null;
    }

    if (!file || !file.type.includes('pdf')) {
        if(file) toast({ title: texts.insertError, description: "無效的檔案類型。請上傳 PDF。", variant: "destructive" });
        return;
    }

    setPendingInsertFile(file);
    if (pages.length > 0 && selectedPages.size === 0) { // If PDF loaded but no page selected
        setIsInsertConfirmOpen(true);
    } else {
        proceedWithInsert(file);
    }
  };

  const proceedWithInsert = async (fileToInsert?: File) => {
    const file = fileToInsert || pendingInsertFile;
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage(texts.insertingPdf);
    try {
      const { canvases: insertCanvases } = await processPdfFile(file);
      let insertIdx = pages.length; // Default to end
      if (selectedPages.size > 0) {
        const firstSelected = Math.min(...Array.from(selectedPages));
        insertIdx = insertPosition === 'before' ? firstSelected : firstSelected + 1;
      }

      const newPages = [...pages];
      newPages.splice(insertIdx, 0, ...insertCanvases);
      setPages(newPages);

      // Select the first of the newly inserted pages for immediate feedback
      const newSelected = new Set<number>();
      if (insertCanvases.length > 0) {
        newSelected.add(insertIdx);
      }
      setSelectedPages(newSelected);

      toast({ title: texts.insertAreaTitle, description: "PDF 插入成功。", });

    } catch (err: any) {
      toast({ title: texts.insertError, description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setPendingInsertFile(null);
      if (insertPdfRef.current) insertPdfRef.current.value = ''; // Reset file input
    }
  };

 const handleConvertToWord = async () => {
    if (!uploadedPdfFile) {
      toast({ title: texts.wordConvertError, description: texts.noPdfToConvert, variant: "destructive" });
      return;
    }

    if (!isFirebaseSystemReady || !storage || !firebaseFunctions) {
        toast({ title: texts.wordConvertError, description: firebaseConfigWarning || (currentLanguage === 'zh' ? translations.zh.firebaseSdkInitError : translations.en.firebaseSdkInitError), variant: "destructive" });
        return;
    }

    setWordFileUrl(null);
    setWordConversionError(null);

    if (!isLoggedIn && typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      let wordConversionInfoString = localStorage.getItem('DocuPilotWordConversionInfo');
      let wordConversionInfo = wordConversionInfoString ? JSON.parse(wordConversionInfoString) : { count: 0, date: today };

      if (wordConversionInfo.date !== today) {
        wordConversionInfo = { count: 0, date: today };
      }

      if (wordConversionInfo.count >= DAILY_WORD_CONVERSION_LIMIT) {
        setShowWordLimitModal(true);
        return;
      }
    }

    setIsConvertingToWord(true);
    setLoadingMessage(texts.convertingToWord);

    try {
      const fileName = `uploads/${new Date().getTime()}_${uploadedPdfFile.name}`;
      const fileStorageRef = storageRef(storage, fileName);
      await uploadBytes(fileStorageRef, uploadedPdfFile);
      const pdfStorageUrl = await getDownloadURL(fileStorageRef);

      // Ensure your Firebase project ID is correct here
      const functionUrl = `https://us-central1-sitemate-otkpt.cloudfunctions.net/convertPdfToWord`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl: pdfStorageUrl }),
      });

      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json(); // Try to parse as JSON first
        } catch (e) {
            // If JSON parsing fails, it might be plain text or HTML error
            const errorText = await response.text();
            errorData = { detail: errorText || response.statusText }; // Fallback
        }
        
        let displayErrorDataForLog: any = errorData;
        if (errorData && typeof errorData === 'object' && Object.keys(errorData).length === 0 && errorData.constructor === Object) {
            // Handle case where errorData is an empty object {}
            displayErrorDataForLog = "[Empty JSON Object from function]";
        }
        console.error("Firebase Function HTTP Error Response:", displayErrorDataForLog, `(Status: ${response.status})`);

        const detailMessage = errorData?.detail || errorData?.error || `HTTP error! status: ${response.status}`;
        let toastDescription = detailMessage;
        if (typeof detailMessage === 'string' && (detailMessage.toLowerCase().includes("method not found") || detailMessage.toLowerCase().includes("api key not configured") || detailMessage.toLowerCase().includes("please provide your api key")) ) { 
             toastDescription = texts.pdfCoMethodNotFoundError;
        }
        throw new Error(detailMessage); // Throw an error to be caught by the catch block
      }

      const result = await response.json();

      if (!result.wordUrl) {
        console.error("Firebase Function did not return a wordUrl:", result);
        throw new Error("Firebase Function did not return a Word file URL.");
      }

      setWordFileUrl(result.wordUrl);
      toast({ title: texts.wordConvertSuccess, description: texts.downloadWordFile });

      // Update conversion count for guests
      if (!isLoggedIn && typeof window !== 'undefined') {
        const today = new Date().toISOString().split('T')[0];
        let wordConversionInfoString = localStorage.getItem('DocuPilotWordConversionInfo');
        let wordConversionInfo = wordConversionInfoString ? JSON.parse(wordConversionInfoString) : { count: 0, date: today };
        if (wordConversionInfo.date !== today) { wordConversionInfo = { count: 0, date: today };}
        wordConversionInfo.count++;
        localStorage.setItem('DocuPilotWordConversionInfo', JSON.stringify(wordConversionInfo));
      }

    } catch (error: any) {
      console.error("Word conversion error in frontend:", error);
      let errMsg = error.message || (currentLanguage === 'zh' ? "未知錯誤" : "Unknown error");
      
      // Check if the error message indicates an API key issue specifically
      if (typeof errMsg === 'string' && (errMsg.toLowerCase().includes("method not found") || errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("please provide your api key") )) {
        errMsg = texts.pdfCoMethodNotFoundError;
      } else if (errMsg.toLowerCase().includes("pdf.co api key is not correctly hardcoded")) { // Specific check for your backend's message
        errMsg = (currentLanguage === 'zh' ? "後端 API 金鑰設定錯誤，請聯絡管理員。" : "Backend API Key configuration error. Please contact administrator.");
      }


      setWordConversionError(`${texts.wordConvertError}: ${errMsg}`);
      toast({ title: texts.wordConvertError, description: errMsg, variant: "destructive" });
    } finally {
      setIsConvertingToWord(false);
      setLoadingMessage('');
    }
  };

  const commonDragEvents = {
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('border-primary', 'bg-primary/10');
    },
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-primary', 'bg-primary/10');
    },
    onDrop: (e: React.DragEvent<HTMLDivElement>, handler: (event: React.DragEvent<HTMLDivElement>) => void) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-primary', 'bg-primary/10');
        handler(e);
    }
  };

  const pageNumberPositions: {value: PageNumberPosition, labelKey: keyof typeof texts}[] = [
    { value: 'bottom-center', labelKey: 'bottomCenter'},
    { value: 'bottom-left', labelKey: 'bottomLeft'},
    { value: 'bottom-right', labelKey: 'bottomRight'},
    { value: 'top-center', labelKey: 'topCenter'},
    { value: 'top-left', labelKey: 'topLeft'},
    { value: 'top-right', labelKey: 'topRight'},
  ];

  const headerFeatures = [
    { icon: Edit3, labelKey: 'featureEdit' as keyof typeof texts },
    { icon: Columns, labelKey: 'featureMerge' as keyof typeof texts },
    { icon: ListOrdered, labelKey: 'featurePageNum' as keyof typeof texts },
    { icon: ShieldCheck, labelKey: 'featureProtect' as keyof typeof texts },
    { icon: FileType, labelKey: 'featureConvert' as keyof typeof texts },
  ];

  const closeZoomModal = () => {
    setIsZoomModalOpen(false);
    setZoomedPageData(null); // Clear data when closing
    setCurrentRotation(0); // Reset rotation
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {(isLoading || isDownloading || isExtractingText || isConvertingToWord) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">
            {isLoading ? loadingMessage :
             isConvertingToWord ? texts.convertingToWord :
             isDownloading ? texts.generatingFile : texts.extractingText}
          </p>
        </div>
      )}

      {isZoomModalOpen && zoomedPageData && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-label={`${texts.previewOf} ${texts.page} ${zoomedPageData.index + 1}`}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeZoomModal}></div>
          <div className="relative bg-card text-card-foreground shadow-2xl rounded-lg w-[90vw] max-w-3xl h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground" id="zoom-modal-title">
                {texts.previewOf} {texts.page} {zoomedPageData.index + 1}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeZoomModal} aria-label={texts.modalCloseButton}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-auto p-4 bg-muted/40">
              <canvas 
                ref={zoomCanvasRef} 
                className="shadow-lg"
                style={{ willReadFrequently: true } as any} 
              ></canvas>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex flex-col md:flex-row items-center gap-2 justify-between">
              <Input 
                type="text" 
                placeholder={texts.noteInputPlaceholder} 
                className="flex-grow md:max-w-xs" 
                aria-label={texts.noteInputPlaceholder}
              />
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                  <Button variant="outline" onClick={() => setCurrentRotation((r) => (r - 90 + 360) % 360)}><RotateCcw className="mr-2 h-4 w-4" /> {texts.rotateLeft}</Button>
                  <Button variant="outline" onClick={() => setCurrentRotation((r) => (r + 90) % 360)}><RotateCw className="mr-2 h-4 w-4" /> {texts.rotateRight}</Button>
                  <Button variant="outline" onClick={() => setCurrentRotation(0)}><X className="mr-2 h-4 w-4" /> {texts.resetRotation}</Button>
              </div>
            </div>
          </div>
        </div>
      )}


      <AlertDialog open={isInsertConfirmOpen} onOpenChange={setIsInsertConfirmOpen}>
        <AlertDialogContent>
          <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{texts.insertConfirmTitle}</ShadAlertDialogTitle>
            <AlertDialogDescription>
              {texts.insertConfirmDescription}
            </AlertDialogDescription>
          </ShadAlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingInsertFile(null)}>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => proceedWithInsert()}>{texts.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <AlertDialogContent>
            <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{texts.downloadLimitTitle}</ShadAlertDialogTitle>
            <AlertDialogDescription>
                {texts.downloadLimitDescription}
            </AlertDialogDescription>
            </ShadAlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>{texts.login}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showWordLimitModal} onOpenChange={setShowWordLimitModal}>
        <AlertDialogContent>
            <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{texts.wordConvertLimitTitle}</ShadAlertDialogTitle>
            <AlertDialogDescription>
                {texts.wordConvertLimitDescription}
            </AlertDialogDescription>
            </ShadAlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>{texts.login}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="p-4 border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary flex items-center">
              <MenuSquare className="mr-2 h-6 w-6"/> {texts.pageTitle}
            </h1>
            <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              {headerFeatures.map(feature => (
                <div key={feature.labelKey} className="flex items-center gap-1">
                  <feature.icon className="h-4 w-4 text-primary/80" />
                  <span>{texts[feature.labelKey]}</span>
                </div>
              ))}
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

      <div className="container mx-auto p-4 md:p-6">
        {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
              <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="text-center">
                  <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
                  <CardTitle className="text-2xl font-bold">{texts.startEditingYourPdf}</CardTitle>
                  <CardDescription>{texts.uploadLabel}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                    onClick={() => pdfUploadRef.current?.click()}
                    onDragOver={commonDragEvents.onDragOver}
                    onDragLeave={commonDragEvents.onDragLeave}
                    onDrop={(e) => commonDragEvents.onDrop(e, (ev) => handlePdfUpload(ev as any))}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground text-center">{texts.dropFileHere}</p>
                  </div>
                  <Input
                    type="file"
                    id="pdfUploadInput"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    ref={pdfUploadRef}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8"> {/* Left column for PDF preview (70% width) */}
                    <Card className="shadow-lg min-h-[calc(100vh-20rem)] md:min-h-[calc(100vh-18rem)]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center text-xl"><Shuffle className="mr-2 h-5 w-5 text-primary" /> {texts.pageManagement}</CardTitle>
                                <CardDescription> {pages.length} {pages.length === 1 ? texts.page.toLowerCase() : (currentLanguage === 'zh' ? texts.pagesLoaded.replace('頁已載入。', '頁') : texts.pagesLoaded.replace('pages loaded.', 'page(s)'))} {currentLanguage === 'zh' ? '已載入' : 'loaded'}. {selectedPages.size > 0 ? `${texts.page} ${Array.from(selectedPages)[0]+1} ${currentLanguage === 'zh' ? texts.pageSelected.replace('頁已選取。','') : texts.pageSelected.replace('page selected.','')}` : ''} </CardDescription>
                            </div>
                            <Button
                                onClick={handleDeletePages}
                                variant="destructive"
                                size="sm"
                                disabled={selectedPages.size === 0 || pages.length === 0}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> {texts.deletePages}
                            </Button>
                        </CardHeader>
                        <CardContent>
                        <div
                          id="previewContainer"
                          ref={previewContainerRef}
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1 bg-muted/20 rounded-md min-h-[200px]"
                        >
                          {/* Page previews will be rendered here by renderPagePreviews */}
                        </div>
                         <div className="mt-4 text-sm text-muted-foreground space-y-1">
                            <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> {texts.instSelect}</p>
                            <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> {texts.instDrag}</p>
                            <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> {texts.instZoom}</p>
                        </div>
                      </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-4 space-y-6"> {/* Right column for tools (30% width) */}
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg"><FilePlus className="mr-2 h-5 w-5 text-primary" /> {texts.insertAreaTitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div
                              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer"
                              onClick={() => insertPdfRef.current?.click()}
                              onDragOver={commonDragEvents.onDragOver}
                              onDragLeave={commonDragEvents.onDragLeave}
                              onDrop={(e) => commonDragEvents.onDrop(e, (ev) => handleInsertPdfFileSelected(ev as any))}
                            >
                              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground text-center">{texts.dropInsertFileHere}</p>
                            </div>
                          <Input
                              type="file"
                              id="insertPdfInput"
                              accept="application/pdf"
                              onChange={handleInsertPdfFileSelected}
                              ref={insertPdfRef}
                              className="hidden"
                          />
                        </div>
                        <RadioGroup value={insertPosition} onValueChange={(value: 'before' | 'after') => setInsertPosition(value)} disabled={selectedPages.size === 0}>
                          <Label className="font-medium mb-1 block">{texts.insertOptionsTitle}</Label>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="before" id="r-before" />
                            <Label htmlFor="r-before" className="font-normal">{texts.insertBeforeLabel}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="after" id="r-after" />
                            <Label htmlFor="r-after" className="font-normal">{texts.insertAfterLabel}</Label>
                          </div>
                        </RadioGroup>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl"><Download className="mr-2 h-5 w-5 text-primary" /> {texts.downloadAndConvertTitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button onClick={handleDownloadPdf} disabled={pages.length === 0 || isDownloading} className="w-full">
                              {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                              {texts.downloadPdf}
                            </Button>
                            <Button onClick={handleDownloadTxt} disabled={!pdfDocumentProxy || isExtractingText} className="w-full">
                              {isExtractingText ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                              {texts.downloadTxt}
                            </Button>
                            <Button
                                onClick={handleConvertToWord}
                                disabled={!uploadedPdfFile || isConvertingToWord || !isFirebaseSystemReady}
                                className="w-full sm:col-span-2"
                                title={!isFirebaseSystemReady ? firebaseConfigWarning : ""}
                            >
                                {isConvertingToWord ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileType className="mr-2 h-4 w-4" />}
                                {texts.convertToWord}
                            </Button>
                        </div>

                        {wordFileUrl && (
                            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
                                <p>
                                {texts.wordConvertSuccess}{' '}
                                <a href={wordFileUrl} download target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-green-800">
                                    {texts.downloadWordFile}
                                </a>
                                </p>
                            </div>
                        )}
                        {wordConversionError && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                <p>{wordConversionError}</p>
                            </div>
                        )}
                        {!isFirebaseSystemReady && firebaseConfigWarning && (
                            <p className="text-xs text-amber-600 mt-2">
                              {firebaseConfigWarning}
                            </p>
                        )}
                      </CardContent>
                    </Card>

                    <Accordion type="single" collapsible defaultValue="doc-enhance" className="w-full">
                        <Card className="shadow-lg">
                            <AccordionItem value="doc-enhance" className="border-b-0">
                                <AccordionTrigger className="p-6 hover:no-underline">
                                    <CardTitle className="flex items-center text-xl"><ListOrdered className="mr-2 h-5 w-5 text-primary" /> {texts.accordionDocEnhanceProtect}</CardTitle>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 space-y-6">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center text-lg"><FileDigit className="mr-2 h-5 w-5 text-primary" /> {texts.pageNumberingSectionTitle}</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                          <Switch id="enablePageNumbering" checked={pageNumberingConfig.enabled} onCheckedChange={(checked) => setPageNumberingConfig(prev => ({...prev, enabled: checked}))} />
                                          <Label htmlFor="enablePageNumbering">{texts.enablePageNumbering}</Label>
                                        </div>
                                        {pageNumberingConfig.enabled && (
                                          <>
                                            <div>
                                              <Label htmlFor="pn-position">{texts.pageNumberPosition}</Label>
                                              <Select value={pageNumberingConfig.position} onValueChange={(value: PageNumberPosition) => setPageNumberingConfig(prev => ({...prev, position: value}))}>
                                                <SelectTrigger id="pn-position"><SelectValue placeholder={texts.pageNumberPosition} /></SelectTrigger>
                                                <SelectContent>
                                                  {pageNumberPositions.map(pos => <SelectItem key={pos.value} value={pos.value}>{texts[pos.labelKey]}</SelectItem>)}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div><Label htmlFor="pn-start">{texts.pageNumberStart}</Label><Input id="pn-start" type="number" value={pageNumberingConfig.start} onChange={(e) => setPageNumberingConfig(prev => ({...prev, start: parseInt(e.target.value,10) || 1}))} min="1" /></div>
                                            <div><Label htmlFor="pn-fontSize">{texts.pageNumberFontSize}</Label><Input id="pn-fontSize" type="number" value={pageNumberingConfig.fontSize} onChange={(e) => setPageNumberingConfig(prev => ({...prev, fontSize: parseInt(e.target.value,10) || 12}))} min="6" /></div>
                                            <div><Label htmlFor="pn-margin">{texts.pageNumberMargin}</Label><Input id="pn-margin" type="number" value={pageNumberingConfig.margin} onChange={(e) => setPageNumberingConfig(prev => ({...prev, margin: parseInt(e.target.value,10) || 20}))} min="0" /></div>
                                            <div><Label htmlFor="pn-format">{texts.pageNumberFormat}</Label><Input id="pn-format" type="text" value={pageNumberingConfig.format} placeholder={texts.pageNumberFormatPlaceholder} onChange={(e) => setPageNumberingConfig(prev => ({...prev, format: e.target.value}))} /></div>
                                          </>
                                        )}
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center text-lg"><Droplet className="mr-2 h-5 w-5 text-primary" /> {texts.watermarkSectionTitle}</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <Label htmlFor="watermarkInput" className="mb-2 block text-sm font-medium">{texts.watermarkInputPlaceholder}</Label>
                                        <Input
                                          id="watermarkInput"
                                          type="text"
                                          placeholder={texts.watermarkInputPlaceholder}
                                          value={watermarkText}
                                          onChange={(e) => setWatermarkText(e.target.value)}
                                        />
                                      </CardContent>
                                    </Card>
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="flex items-center text-lg"><Lock className="mr-2 h-5 w-5 text-primary" /> {texts.protectPdfSectionTitle}</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                          <Switch id="enablePdfProtection" checked={pdfProtectionConfig.enabled} onCheckedChange={(checked) => setPdfProtectionConfig(prev => ({...prev, enabled: checked}))} />
                                          <Label htmlFor="enablePdfProtection">{texts.enablePdfProtection}</Label>
                                        </div>
                                        {pdfProtectionConfig.enabled && (
                                          <div>
                                            <Label htmlFor="pdf-password">{texts.pdfPassword}</Label>
                                            <Input id="pdf-password" type="password" placeholder={texts.pdfPasswordPlaceholder} value={pdfProtectionConfig.password} onChange={(e) => setPdfProtectionConfig(prev => ({...prev, password: e.target.value}))} />
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    </Accordion>
                </div>
            </div>
          )}
      </div>
    </div>
  );
}
