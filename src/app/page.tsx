
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy as PDFDocumentProxyType } from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import Sortable from 'sortablejs';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, RotateCw, X, Trash2, Download, Upload, Info, Shuffle, Search, Edit3, Droplet, LogIn, LogOut, UserCircle, FileText, FileType } from 'lucide-react';

import { storage, functions as firebaseFunctions } from '@/lib/firebase'; // Firebase SDK for storage and functions
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';


if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

// 確保這裡的鍵名與 .env 檔案中的完全一致
const firebaseConfigKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY', // 使用 I
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let initialMissingFirebaseKeysText = '';
if (typeof process !== 'undefined' && process.env) {
    const missingKeys = firebaseConfigKeys.filter(key => {
        const envVar = process.env[key];
        return !envVar || envVar.trim() === '';
    });
    if (missingKeys.length > 0) {
        initialMissingFirebaseKeysText = missingKeys.join(', ');
    }
}


const translations = {
    en: {
        pageTitle: 'DocuPilot',
        uploadLabel: 'Select PDF file to edit:',
        deletePages: 'Delete Selected',
        downloadPdf: 'Download Edited PDF',
        downloadTxt: 'Download as TXT',
        convertToWord: 'Convert to Word',
        convertingToWord: 'Converting to Word...',
        insertAreaTitle: 'Insert PDF',
        insertOptionsTitle: 'Insertion Options',
        insertBeforeLabel: 'Insert before selected page',
        insertAfterLabel: 'Insert after selected page',
        selectFileToInsert: 'Select PDF to insert:',
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
        tools: 'Tools',
        fileOperations: 'File Operations',
        watermarkSectionTitle: 'Watermark',
        watermarkInputPlaceholder: 'Enter watermark text',
        page: 'Page',
        uploadPdfFirst: 'Please upload a PDF first to enable this feature.',
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
        firebaseNotConfigured: `Firebase Frontend SDK is not fully configured. Please ensure all Firebase environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, etc.) are set in your .env file. Missing: ${initialMissingFirebaseKeysText || 'Please check configuration.'}`
    },
    zh: {
        pageTitle: 'DocuPilot 文件助手',
        uploadLabel: '選擇要編輯的 PDF 檔案：',
        deletePages: '刪除選取',
        downloadPdf: '下載編輯後 PDF',
        downloadTxt: '下載為 TXT 檔案',
        convertToWord: '轉換為 Word',
        convertingToWord: '正在轉換為 Word...',
        insertAreaTitle: '插入 PDF',
        insertOptionsTitle: '插入選項',
        insertBeforeLabel: '插入此頁之前',
        insertAfterLabel: '插入此頁之後',
        selectFileToInsert: '選擇要插入的 PDF：',
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
        tools: '工具',
        fileOperations: '檔案操作',
        watermarkSectionTitle: '浮水印',
        watermarkInputPlaceholder: '輸入浮水印文字',
        page: '頁',
        uploadPdfFirst: '請先上傳 PDF 檔案以使用此功能。',
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
        firebaseNotConfigured: `Firebase 前端 SDK 設定不完整。請確保所有 Firebase 環境變數 (NEXT_PUBLIC_FIREBASE_API_KEY 等) 都已在您的 .env 檔案中設定。缺少：${initialMissingFirebaseKeysText || '請檢查設定。'}`
    }
};

const DAILY_DOWNLOAD_LIMIT = 3;
const DAILY_WORD_CONVERSION_LIMIT = 1;


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
  
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);
  const [firebaseMissingKeysMessage, setFirebaseMissingKeysMessage] = useState(initialMissingFirebaseKeysText);


  useEffect(() => {
    let missingKeysFound: string[] = [];
    if (typeof window !== 'undefined') {
        missingKeysFound = firebaseConfigKeys.filter(key => {
            const envVar = process.env[key];
            return !envVar || envVar.trim() === '';
        });
    }
    
    const configured = missingKeysFound.length === 0;
    setIsFirebaseConfigured(configured);

    const currentMissingKeysText = missingKeysFound.join(', ');
    setFirebaseMissingKeysMessage(currentMissingKeysText);

  }, []); // 初始檢查


  useEffect(() => {
    // 更新語言相關的文本，特別是 firebaseNotConfigured 訊息
     const messageKey = isFirebaseConfigured ? '' : (firebaseMissingKeysMessage || 'Please check configuration.');
     const missingText = isFirebaseConfigured ? '' : `缺少：${messageKey}`;

    setTexts(prev => ({
        ...translations[currentLanguage],
        firebaseNotConfigured: currentLanguage === 'zh' ? 
            `Firebase 前端 SDK 設定不完整。請確保所有 Firebase 環境變數 (NEXT_PUBLIC_FIREBASE_API_KEY 等) 都已在您的 .env 檔案中設定。${missingText}` :
            `Firebase Frontend SDK is not fully configured. Please ensure all Firebase environment variables (NEXT_PUBLIC_FIREBASE_API_KEY, etc.) are set in your .env file. ${isFirebaseConfigured ? '' : `Missing: ${messageKey}`}`
    }));
  }, [currentLanguage, isFirebaseConfigured, firebaseMissingKeysMessage]);


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
    toast({ title: texts.logout, description: "您已成功登出。" });
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
        setCurrentRotation(0);
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
    if (zoomedPageData && zoomCanvasRef.current) {
      const canvas = zoomCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sourceCanvas = zoomedPageData.canvas;
      const baseWidth = sourceCanvas.width;
      const baseHeight = sourceCanvas.height;

      const modalContentElement = canvas.parentElement?.parentElement;
      const modalContentWidth = modalContentElement?.clientWidth ? modalContentElement.clientWidth - 64 : 800 - 64;
      const modalContentHeight = window.innerHeight * 0.7;


      let scaleX = modalContentWidth / baseWidth;
      let scaleY = modalContentHeight / baseHeight;

      if (currentRotation % 180 !== 0) {
        scaleX = modalContentWidth / baseHeight;
        scaleY = modalContentHeight / baseWidth;
      }

      const currentScale = Math.min(scaleX, scaleY, 2);

      let displayWidth = baseWidth * currentScale;
      let displayHeight = baseHeight * currentScale;

      canvas.width = currentRotation % 180 === 0 ? displayWidth : displayHeight;
      canvas.height = currentRotation % 180 === 0 ? displayHeight : displayWidth;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((currentRotation * Math.PI) / 180);
      ctx.drawImage(
        sourceCanvas,
        -displayWidth / 2,
        -displayHeight / 2,
        displayWidth,
        displayHeight
      );
      ctx.restore();
    }
  }, [zoomedPageData, currentRotation]);

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
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
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
    setUploadedPdfFile(file);
    setWordFileUrl(null);
    setWordConversionError(null);

    setIsLoading(true);
    setLoadingMessage(texts.loadingPdf);
    try {
      const { canvases, docProxy } = await processPdfFile(file);
      setPages(canvases);
      setPdfDocumentProxy(docProxy);
      setSelectedPages(new Set());
    } catch (err: any) {
      toast({ title: texts.loadError, description: err.message, variant: "destructive" });
      setPdfDocumentProxy(null);
      setUploadedPdfFile(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (pdfUploadRef.current) pdfUploadRef.current.value = '';
    }
  };

  const handleDeletePages = () => {
    if (selectedPages.size === 0) {
      toast({ title: texts.pageManagement, description: texts.noPageSelected, variant: "destructive" });
      return;
    }
    const newPages = pages.filter((_, idx) => !selectedPages.has(idx));
    setPages(newPages);
    setSelectedPages(new Set());
    if (newPages.length === 0) {
        setPdfDocumentProxy(null);
        setUploadedPdfFile(null);
    }
    toast({ title: texts.pageManagement, description: "選取的頁面已刪除。" });
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
      await new Promise(resolve => setTimeout(resolve, 100));
      const pdfDocOut = await PDFLibDocument.create();
      const helveticaFont = await pdfDocOut.embedFont(StandardFonts.Helvetica);

      for (let canvas of pages) {
        const imgDataUrl = canvas.toDataURL('image/png');
        const pngImage = await pdfDocOut.embedPng(imgDataUrl);
        const page = pdfDocOut.addPage([canvas.width, canvas.height]);
        page.drawImage(pngImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });

        if (watermarkText.trim() !== '') {
            const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, 50);
            const textHeight = helveticaFont.heightAtSize(50);
            const { width: pageWidth, height: pageHeight } = page.getSize();

            page.drawText(watermarkText, {
                x: pageWidth / 2 - textWidth / 2,
                y: pageHeight / 2 - textHeight / 4,
                font: helveticaFont,
                size: 50,
                color: rgb(0.75, 0.75, 0.75),
                opacity: 0.3,
                rotate: degrees(45),
            });
        }
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
    setLoadingMessage(texts.extractingText)
    try {
      let fullText = '';
      for (let i = 1; i <= pdfDocumentProxy.numPages; i++) {
        const page = await pdfDocumentProxy.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
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
    if (pages.length > 0 && selectedPages.size === 0) {
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
      let insertIdx = pages.length;
      if (selectedPages.size > 0) {
        const firstSelected = Math.min(...Array.from(selectedPages));
        insertIdx = insertPosition === 'before' ? firstSelected : firstSelected + 1;
      }

      const newPages = [...pages];
      newPages.splice(insertIdx, 0, ...insertCanvases);
      setPages(newPages);

      const newSelected = new Set<number>();
      if (insertCanvases.length > 0) {
        newSelected.add(insertIdx);
      }
      setSelectedPages(newSelected);

      toast({ title: texts.insertAreaTitle, description: "PDF 插入成功。" });

    } catch (err: any) {
      toast({ title: texts.insertError, description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setPendingInsertFile(null);
      if (insertPdfRef.current) insertPdfRef.current.value = '';
    }
  };

 const handleConvertToWord = async () => {
    if (!uploadedPdfFile) {
      toast({ title: texts.wordConvertError, description: texts.noPdfToConvert, variant: "destructive" });
      return;
    }
    if (!isFirebaseConfigured) {
        toast({ title: texts.wordConvertError, description: texts.firebaseNotConfigured, variant: "destructive" });
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
      const fileRef = storageRef(storage, fileName);
      await uploadBytes(fileRef, uploadedPdfFile);
      const pdfStorageUrl = await getDownloadURL(fileRef);

      // 您的 Firebase Function URL
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
            errorData = await response.json(); 
        } catch (e) {
            const errorText = await response.text();
            errorData = { detail: errorText || response.statusText };
        }
        console.error("Firebase Function HTTP Error Response:", errorData);
        const detailMessage = errorData.detail || errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(detailMessage);
      }

      const result = await response.json();
      
      if (!result.wordUrl) { 
        console.error("Firebase Function did not return a wordUrl:", result);
        throw new Error("Firebase Function did not return a Word file URL.");
      }

      setWordFileUrl(result.wordUrl);
      toast({ title: texts.wordConvertSuccess, description: texts.downloadWordFile });

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
      const errMsg = error.message || "未知錯誤";
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

      <Dialog open={!!zoomedPageData} onOpenChange={(isOpen) => !isOpen && setZoomedPageData(null)}>
        <DialogContent className="max-w-3xl w-[90vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{texts.previewOf} {zoomedPageData ? `${texts.page} ${zoomedPageData.index + 1}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-auto flex items-center justify-center p-4 bg-muted/40">
            <canvas ref={zoomCanvasRef} style={{ willReadFrequently: true } as any} className="max-w-full max-h-full object-contain shadow-lg"></canvas>
          </div>
          <DialogFooter className="p-4 border-t flex-col sm:flex-col md:flex-row gap-2">
            <Input type="text" placeholder={texts.noteInputPlaceholder} className="mb-2 md:mb-0 md:mr-2 flex-grow" />
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                <Button variant="outline" onClick={() => setCurrentRotation((r) => (r - 90 + 360) % 360)}><RotateCcw className="mr-2 h-4 w-4" /> {texts.rotateLeft}</Button>
                <Button variant="outline" onClick={() => setCurrentRotation((r) => (r + 90) % 360)}><RotateCw className="mr-2 h-4 w-4" /> {texts.rotateRight}</Button>
                <Button variant="outline" onClick={() => setCurrentRotation(0)}><X className="mr-2 h-4 w-4" /> {texts.resetRotation}</Button>
            </div>
            <DialogClose asChild>
                <Button variant="outline" className="w-full md:w-auto mt-2 md:mt-0">{texts.modalCloseButton}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isInsertConfirmOpen} onOpenChange={setIsInsertConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{texts.insertConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {texts.insertConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingInsertFile(null)}>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => proceedWithInsert()}>{texts.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{texts.downloadLimitTitle}</AlertDialogTitle>
            <AlertDialogDescription>
                {texts.downloadLimitDescription}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>{texts.login}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showWordLimitModal} onOpenChange={setShowWordLimitModal}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{texts.wordConvertLimitTitle}</AlertDialogTitle>
            <AlertDialogDescription>
                {texts.wordConvertLimitDescription}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>{texts.login}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="p-4 border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary flex items-center">
              <Edit3 className="mr-2 h-6 w-6"/> {texts.pageTitle}
            </h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-1 space-y-6">
            {pages.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl"><Edit3 className="mr-2 h-5 w-5 text-primary" /> {texts.insertAreaTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="insertPdfInput" className="mb-2 block cursor-pointer text-sm font-medium">{texts.selectFileToInsert}</Label>
                     <div
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer"
                        onClick={() => insertPdfRef.current?.click()}
                        {...commonDragEvents}
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
                   <p className="text-xs text-muted-foreground">{selectedPages.size === 0 && pages.length > 0 ? texts.insertConfirmDescription.split('.')[0] + '.' : ''}</p>
                </CardContent>
              </Card>
            )}

            {pages.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl"><Droplet className="mr-2 h-5 w-5 text-primary" /> {texts.watermarkSectionTitle}</CardTitle>
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
            )}

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl"><Info className="mr-2 h-5 w-5 text-primary" /> {texts.tools}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{texts.instSelect}</p>
                    <p className="text-sm text-muted-foreground">{texts.instDrag}</p>
                    <p className="text-sm text-muted-foreground">{texts.instZoom}</p>
                     <Button onClick={handleDeletePages} variant="destructive" disabled={selectedPages.size === 0 || pages.length === 0} className="w-full mt-2">
                        <Trash2 className="mr-2 h-4 w-4" /> {texts.deletePages}
                    </Button>
                </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl"><Upload className="mr-2 h-5 w-5 text-primary" /> {texts.fileOperations}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pdfUploadInput" className="mb-2 block cursor-pointer text-sm font-medium">{texts.uploadLabel}</Label>
                  <div
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer"
                    onClick={() => pdfUploadRef.current?.click()}
                    {...commonDragEvents}
                    onDrop={(e) => commonDragEvents.onDrop(e, (ev) => handlePdfUpload(ev as any))}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">{texts.dropFileHere}</p>
                  </div>
                  <Input
                    type="file"
                    id="pdfUploadInput"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    ref={pdfUploadRef}
                    className="hidden"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        disabled={!uploadedPdfFile || isConvertingToWord || !isFirebaseConfigured} 
                        className="w-full"
                        title={!isFirebaseConfigured ? texts.firebaseNotConfigured : ""}
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
                 {!isFirebaseConfigured && (
                    <p className="text-xs text-amber-600 mt-2">
                      {texts.firebaseNotConfigured}
                    </p>
                 )}
              </CardContent>
            </Card>

            {pages.length > 0 ? (
              <Card className="shadow-lg min-h-[calc(100vh-20rem)] md:min-h-[calc(100vh-18rem)]">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl"><Shuffle className="mr-2 h-5 w-5 text-primary" /> {texts.pageManagement}</CardTitle>
                  <CardDescription> {pages.length} {pages.length === 1 ? texts.page.toLowerCase() : (currentLanguage === 'zh' ? texts.page.toLowerCase() : texts.page.toLowerCase() + 's')} 加載完成。 {selectedPages.size > 0 ? `${texts.page} ${Array.from(selectedPages)[0]+1} 已選取。` : ''} </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    id="previewContainer"
                    ref={previewContainerRef}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-1 bg-muted/20 rounded-md min-h-[200px]"
                  >
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg min-h-[calc(100vh-20rem)] md:min-h-[calc(100vh-18rem)] flex flex-col items-center justify-center bg-muted/30">
                <CardContent className="text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl font-semibold text-muted-foreground">{texts.pageTitle}</p>
                  <p className="text-muted-foreground">{texts.uploadPdfFirst.replace('此功能', '編輯')}</p>
                  <Button onClick={() => pdfUploadRef.current?.click()} className="mt-4">
                    <Upload className="mr-2 h-4 w-4"/> {texts.uploadLabel.split('：')[0]}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
    

    

    