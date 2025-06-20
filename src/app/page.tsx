
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy as PDFDocumentProxyType } from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb, degrees, grayscale, popGraphicsState, pushGraphicsState, translate } from 'pdf-lib';
import Sortable from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, RotateCw, X, Trash2, Download, Upload, Info, Shuffle, Search, Edit3, Droplet, LogIn, LogOut, UserCircle, FileText, FileType, FileDigit, Lock, MenuSquare, Columns, ShieldCheck, FilePlus, ListOrdered, Move, CheckSquare, Image as ImageIcon, Minimize2, Palette, FontSize } from 'lucide-react';

import { storage, functions as firebaseFunctions, app as firebaseApp } from '@/lib/firebase'; // Firebase SDK
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';


if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageObject {
  id: string;
  sourceCanvas: HTMLCanvasElement;
  rotation: number; // 0, 90, 180, 270
}

type WatermarkLegacyPosition = // Kept for translation keys if needed, but functionality changes
  | 'center'
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'diagonal-tl-br' | 'diagonal-bl-tr';


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
        instZoom: 'Double click page to zoom/edit.',
        modalCloseButton: 'Close',
        rotateLeft: 'Rotate Left 90°',
        rotateRight: 'Rotate Right 90°',
        resetRotation: 'Reset Rotation & Zoom',
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
        noteInputPlaceholder: 'Add a temporary note (not saved in PDF)',
        pageManagement: 'Page Management',
        fileOperations: 'File Operations',
        watermarkSectionTitle: 'Watermark (Drag to Position)',
        watermarkInputPlaceholder: 'Enter watermark text',
        watermarkFontSizeLabel: 'Font Size (px)',
        watermarkColorLabel: 'Color',
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
        zoomDialogDescription: 'View a larger preview of the selected page. You can rotate the page here. Use mouse wheel to zoom.',
        bottomLeft: 'Bottom Left',
        bottomCenter: 'Bottom Center',
        bottomRight: 'Bottom Right',
        middleLeft: 'Middle Left',
        middleRight: 'Middle Right',
        topLeft: 'Top Left',
        topCenter: 'Top Center',
        topRight: 'Top Right',
        pdfEditingTools: 'PDF Tools',
        downloadAndConvertTitle: 'Download & Convert',
        startEditingYourPdf: 'Start Editing Your PDF',
        pagesLoaded: 'pages loaded.',
        pageSelectedSuffix: 'selected.',
        featureEdit: 'Edit',
        featureMerge: 'Merge',
        featurePageNum: 'Page #',
        featureProtect: 'Protect',
        featureConvert: 'Convert',
        accordionDocEnhanceProtect: 'Document Enhancements & Protection',
        imageToPdfTitle: 'Image to PDF',
        selectImagesLabel: 'Select image(s):',
        dropImagesHere: 'Drop image(s) here or click to upload',
        convertToPdfButton: 'Convert to PDF',
        generatingPdfFromImages: 'Generating PDF from images...',
        imageToPdfSuccess: 'PDF generated from images successfully!',
        imageToPdfError: 'Error generating PDF from images',
        noImagesSelected: 'No images selected to convert.',
        pdfCompressionTitle: 'PDF Compression',
        selectPdfToCompressLabel: 'Select PDF to compress:',
        dropPdfToCompressHere: 'Drop PDF here or click to select for compression',
        compressPdfButton: 'Compress PDF',
        compressingPdf: 'Compressing PDF...',
        pdfCompressionSuccess: 'PDF processed successfully!',
        pdfCompressionError: 'Error processing PDF',
        pdfCompressionNote: 'Note: This uses pdf-lib to re-save the PDF. File size reduction varies. useObjectStreams:false is applied.',
        noPdfToCompress: 'No PDF selected to compress.',
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
        instZoom: '雙擊頁面以放大/編輯。',
        modalCloseButton: '關閉',
        rotateLeft: '向左旋轉90°',
        rotateRight: '向右旋轉90°',
        resetRotation: '重置旋轉與縮放',
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
        fileOperations: '檔案操作',
        watermarkSectionTitle: '浮水印 (拖曳定位)',
        watermarkInputPlaceholder: '輸入浮水印文字',
        watermarkFontSizeLabel: '字體大小 (px)',
        watermarkColorLabel: '顏色',
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
        zoomDialogDescription: '查看所選頁面的放大預覽。您可以在此旋轉頁面。使用滑鼠滾輪縮放。',
        bottomLeft: '左下',
        bottomCenter: '中下',
        bottomRight: '右下',
        middleLeft: '中左',
        middleRight: '中右',
        topLeft: '左上',
        topCenter: '中上',
        topRight: '右上',
        pdfEditingTools: 'PDF 工具',
        downloadAndConvertTitle: '下載與轉換',
        startEditingYourPdf: '開始編輯您的 PDF',
        pagesLoaded: '頁已載入。',
        pageSelectedSuffix: '已選取。',
        featureEdit: '編輯',
        featureMerge: '合併',
        featurePageNum: '頁碼',
        featureProtect: '保護',
        featureConvert: '轉換',
        accordionDocEnhanceProtect: '文件增強与保護',
        imageToPdfTitle: '圖片轉 PDF',
        selectImagesLabel: '選擇圖片檔案：',
        dropImagesHere: '拖放圖片至此或點擊上傳',
        convertToPdfButton: '轉換為 PDF',
        generatingPdfFromImages: '正在從圖片產生 PDF...',
        imageToPdfSuccess: '從圖片產生 PDF 成功！',
        imageToPdfError: '從圖片產生 PDF 時發生錯誤',
        noImagesSelected: '尚未選取要轉換的圖片。',
        pdfCompressionTitle: 'PDF 壓縮',
        selectPdfToCompressLabel: '選擇要壓縮的 PDF：',
        dropPdfToCompressHere: '拖放 PDF 至此或點擊選擇以壓縮',
        compressPdfButton: '壓縮 PDF',
        compressingPdf: '正在壓縮 PDF...',
        pdfCompressionSuccess: 'PDF 處理成功！',
        pdfCompressionError: '處理 PDF 時發生錯誤',
        pdfCompressionNote: '注意：此功能使用 pdf-lib 重新儲存 PDF。檔案大小縮減效果不一。已套用 useObjectStreams:false。',
        noPdfToCompress: '尚未選擇要壓縮的 PDF。',
    }
};

const DAILY_DOWNLOAD_LIMIT = 3;
const DAILY_WORD_CONVERSION_LIMIT = 1;

type PageNumberPosition = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right';

const pageNumberPositions: {value: PageNumberPosition, labelKey: keyof typeof translations.en}[] = [
  { value: 'bottom-center', labelKey: 'bottomCenter'},
  { value: 'bottom-left', labelKey: 'bottomLeft'},
  { value: 'bottom-right', labelKey: 'bottomRight'},
  { value: 'top-center', labelKey: 'topCenter'},
  { value: 'top-left', labelKey: 'topLeft'},
  { value: 'top-right', labelKey: 'topRight'},
];

interface WatermarkConfig {
  text: string;
  topRatio: number; // 0.0 to 1.0 for top-left corner
  leftRatio: number; // 0.0 to 1.0 for top-left corner
  fontSize: number; // in points for PDF, scaled for preview
  color: string; // e.g., 'rgba(128, 128, 128, 0.5)'
}


// Helper function to parse RGBA string to an object for pdf-lib
const parseRgbaColor = (rgbaColor: string): { r: number; g: number; b: number; alpha: number } => {
    const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
    if (match) {
        return {
            r: parseInt(match[1], 10) / 255,
            g: parseInt(match[2], 10) / 255,
            b: parseInt(match[3], 10) / 255,
            alpha: match[4] ? parseFloat(match[4]) : 1,
        };
    }
    // Fallback for hex or other color strings if needed, for now default to black
    return { r: 0, g: 0, b: 0, alpha: 0.5 }; 
};


interface PagePreviewItemProps {
  pageObj: PageObject;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  watermarkConfig: WatermarkConfig;
  onWatermarkMouseDown: (event: React.MouseEvent<HTMLElement>, previewWrapper: HTMLElement, pageIndex: number) => void;
  texts: typeof translations.en;
}

const PagePreviewItem: React.FC<PagePreviewItemProps> = React.memo(({
  pageObj, index, isSelected, onClick, onDoubleClick, watermarkConfig, onWatermarkMouseDown, texts
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const previewDisplayCanvas = canvasRef.current;
      const previewCtx = previewDisplayCanvas.getContext('2d');
      if (!previewCtx) return;

      const sourceCanvas = pageObj.sourceCanvas;
      const rotation = pageObj.rotation;
      const rad = rotation * Math.PI / 180;

      let rotatedSourceWidth, rotatedSourceHeight;
      if (rotation % 180 !== 0) {
        rotatedSourceWidth = sourceCanvas.height;
        rotatedSourceHeight = sourceCanvas.width;
      } else {
        rotatedSourceWidth = sourceCanvas.width;
        rotatedSourceHeight = sourceCanvas.height;
      }
      
      const targetAspectRatio = rotatedSourceWidth / rotatedSourceHeight;
      // Fixed width for thumbnail container, height adjusts.
      // The canvas buffer itself will be high-res, CSS scales it down.
      const cssDisplayWidth = 120; 
      const cssDisplayHeight = cssDisplayWidth / targetAspectRatio;

      previewDisplayCanvas.width = rotatedSourceWidth; 
      previewDisplayCanvas.height = rotatedSourceHeight;

      previewCtx.save();
      previewCtx.translate(previewDisplayCanvas.width / 2, previewDisplayCanvas.height / 2);
      previewCtx.rotate(rad);
      previewCtx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2, sourceCanvas.width, sourceCanvas.height);
      previewCtx.restore();
      
      previewDisplayCanvas.style.width = `${cssDisplayWidth}px`;
      previewDisplayCanvas.style.height = `${cssDisplayHeight}px`;
    }
  }, [pageObj.sourceCanvas, pageObj.rotation]);

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (wrapperRef.current) {
      // Pass the watermark div (e.currentTarget) and its parent (wrapperRef.current)
      onWatermarkMouseDown(e, wrapperRef.current, index);
    }
  };

  const previewWatermarkFontSize = Math.max(6, watermarkConfig.fontSize / (150/20)); // Scale based on typical preview width vs. font size

  return (
    <div
      ref={wrapperRef}
      className={`page-preview-wrapper p-2 border-2 rounded-lg cursor-pointer transition-all bg-card hover:border-primary ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
      data-id={pageObj.id}
      data-index={index}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ position: 'relative' }} 
    >
      <canvas ref={canvasRef} className="rounded-md shadow-md" style={{ willReadFrequently: true } as any}></canvas>
      <div className="text-xs text-muted-foreground mt-1 text-center">
        {texts.page} {index + 1}
      </div>
      {watermarkConfig.text && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            top: `${watermarkConfig.topRatio * 100}%`,
            left: `${watermarkConfig.leftRatio * 100}%`,
            cursor: 'grab',
            padding: '1px 3px',
            backgroundColor: 'rgba(220,220,220,0.4)',
            border: '1px dashed rgba(100,100,100,0.5)',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            fontSize: `${previewWatermarkFontSize}px`, 
            color: watermarkConfig.color, 
            zIndex: 10,
            willChange: 'top, left', 
          }}
          className="draggable-watermark" 
        >
          {watermarkConfig.text}
        </div>
      )}
    </div>
  );
});
PagePreviewItem.displayName = 'PagePreviewItem';


export default function PdfEditorHomepage() {
  const router = useRouter();
  const { toast } = useToast();

  const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  
  const [zoomedPageData, setZoomedPageData] = useState<{ page: PageObject, index: number } | null>(null);
  const [currentModalRotation, setCurrentModalRotation] = useState(0); 
  const [isCustomZoomModalOpen, setIsCustomZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoomScrollContainerRef = useRef<HTMLDivElement>(null);


  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after'>('before');
  const [isInsertConfirmOpen, setIsInsertConfirmOpen] = useState(false);
  const [pendingInsertFile, setPendingInsertFile] = useState<File | null>(null);
  
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    text: '',
    topRatio: 0.1, 
    leftRatio: 0.1,
    fontSize: 48, 
    color: 'rgba(128, 128, 128, 0.5)',
  });
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false);
  const dragDataRef = useRef<{
    initialMouseX: number;
    initialMouseY: number;
    initialWatermarkTopInPx: number; // Watermark's initial top in pixels relative to preview wrapper
    initialWatermarkLeftInPx: number; // Watermark's initial left in pixels relative to preview wrapper
    draggedWatermarkElement: HTMLElement; // The specific watermark div being dragged (e.target)
    previewWrapperElement: HTMLElement; // The parent .page-preview-wrapper of the dragged watermark
  } | null>(null);


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

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const pdfUploadRef = useRef<HTMLInputElement>(null);
  const insertPdfRef = useRef<HTMLInputElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);

  // State for Image to PDF feature
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const imageToPdfUploadRef = useRef<HTMLInputElement>(null);
  const [isConvertingImagesToPdf, setIsConvertingImagesToPdf] = useState(false);

  // State for PDF Compression feature
  const [pdfToCompress, setPdfToCompress] = useState<File | null>(null);
  const pdfCompressUploadRef = useRef<HTMLInputElement>(null);
  const [isCompressingPdf, setIsCompressingPdf] = useState(false);


  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);


  useEffect(() => {
    const sdkServicesInitialized = !!firebaseApp && !!storage && !!firebaseFunctions;
    if (sdkServicesInitialized) {
        setIsFirebaseSystemReady(true);
        setFirebaseConfigWarning('');
    } else {
        setIsFirebaseSystemReady(false);
        let warningMsg = texts?.firebaseSdkInitError || "Firebase SDK services (app, storage, functions) NOT initialized.";
        setFirebaseConfigWarning(warningMsg);
    }
  }, [currentLanguage, texts]);


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

  // Initialize SortableJS
  useEffect(() => {
    if (pageObjects.length > 0 && previewContainerRef.current && !sortableInstanceRef.current) {
        sortableInstanceRef.current = Sortable.create(previewContainerRef.current, {
            animation: 150,
            ghostClass: 'opacity-50',
            chosenClass: 'shadow-2xl',
            dragClass: 'opacity-75',
            onEnd: (evt) => {
                if (evt.oldIndex === undefined || evt.newIndex === undefined || evt.oldIndex === evt.newIndex) return;
                
                setPageObjects(prevPageObjects => {
                    const reorderedPageObjects = Array.from(prevPageObjects);
                    const [movedItem] = reorderedPageObjects.splice(evt.oldIndex!, 1);
                    reorderedPageObjects.splice(evt.newIndex!, 0, movedItem);
                    return reorderedPageObjects;
                });
            }
        });
    } else if (pageObjects.length === 0 && sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
    }
    // Cleanup on unmount
    return () => {
        if (sortableInstanceRef.current) {
            sortableInstanceRef.current.destroy();
            sortableInstanceRef.current = null;
        }
    };
  }, [pageObjects.length]); // Re-run if number of pages changes


  const ZOOM_SPEED = 0.1; 
  const MIN_ZOOM = 0.1;   
  const MAX_ZOOM = 5;   

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!isCustomZoomModalOpen || !zoomedPageData || !zoomScrollContainerRef.current?.contains(event.target as Node) ) return; 
    event.preventDefault(); 
    
    const zoomAmount = -event.deltaY * ZOOM_SPEED * 0.01; 
    
    setZoomLevel(prevZoomLevel => {
      let newZoomLevel = prevZoomLevel + zoomAmount;
      newZoomLevel = Math.max(MIN_ZOOM, Math.min(newZoomLevel, MAX_ZOOM)); 
      return newZoomLevel;
    });
  };

  useEffect(() => {
    if (isCustomZoomModalOpen && zoomedPageData && zoomCanvasRef.current) {
      const canvas = zoomCanvasRef.current; 
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      const sourceCanvas = zoomedPageData.page.sourceCanvas; 
      const srcWidth = sourceCanvas.width;
      const srcHeight = sourceCanvas.height;
  
      let bufferWidth, bufferHeight;
      if (currentModalRotation % 180 !== 0) { 
        bufferWidth = srcHeight * zoomLevel;
        bufferHeight = srcWidth * zoomLevel;
      } else { 
        bufferWidth = srcWidth * zoomLevel;
        bufferHeight = srcHeight * zoomLevel;
      }
      
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;
      
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(currentModalRotation * Math.PI / 180);
  
      ctx.drawImage(
        sourceCanvas,
        -canvas.width / 2, 
        -canvas.height / 2,
        canvas.width,       
        canvas.height      
      );
      
      ctx.restore(); 
    }
  }, [isCustomZoomModalOpen, zoomedPageData, currentModalRotation, zoomLevel]);


  const processPdfFile = async (file: File): Promise<{ newPageObjects: PageObject[], docProxy: PDFDocumentProxyType }> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocProxy = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`, 
      cMapPacked: true, 
    }).promise;

    const numPages = pdfDocProxy.numPages;
    const loadedPageObjects: PageObject[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocProxy.getPage(i);
      // Render at a higher resolution for better quality when zoomed or for PDF generation
      const viewport = page.getViewport({ scale: 2.0 }); 
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue; 
      await page.render({ canvasContext: ctx, viewport }).promise;
      loadedPageObjects.push({ id: uuidv4(), sourceCanvas: canvas, rotation: 0 });
    }
    return { newPageObjects: loadedPageObjects, docProxy: pdfDocProxy };
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
        if (file) toast({ title: texts.loadError, description: currentLanguage === 'zh' ? "無效的檔案類型。請上傳 PDF。" : "Invalid file type. Please upload a PDF.", variant: "destructive" });
        return;
    }
    setUploadedPdfFile(file); 
    setWordFileUrl(null); 
    setWordConversionError(null); 

    setIsLoading(true);
    setLoadingMessage(texts.loadingPdf);
    try {
      const { newPageObjects, docProxy } = await processPdfFile(file);
      setPageObjects(newPageObjects);
      setPdfDocumentProxy(docProxy); 
      setSelectedPageIds(new Set()); 
    } catch (err: any) {
      toast({ title: texts.loadError, description: err.message, variant: "destructive" });
      setPdfDocumentProxy(null);
      setUploadedPdfFile(null);
      setPageObjects([]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (pdfUploadRef.current) pdfUploadRef.current.value = ''; 
    }
  };

  const handleDeletePages = () => {
    if (selectedPageIds.size === 0) {
      toast({ title: texts.pageManagement, description: texts.noPageSelected, variant: "destructive" });
      return;
    }
    const newPages = pageObjects.filter(p => !selectedPageIds.has(p.id));
    setPageObjects(newPages);
    setSelectedPageIds(new Set()); 
    if (newPages.length === 0) { 
        setPdfDocumentProxy(null);
        setUploadedPdfFile(null);
    }
    toast({ title: texts.pageManagement, description: currentLanguage === 'zh' ? "選取的頁面已刪除。" : "Selected pages have been deleted." });
  };

  const handleDownloadPdf = async () => {
    if (pageObjects.length === 0) {
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
      const helveticaFont = await pdfDocOut.embedFont(StandardFonts.Helvetica); // Or a user-selected font

      for (const pageObj of pageObjects) {
        const { sourceCanvas, rotation } = pageObj;

        const tempRenderCanvas = document.createElement('canvas');
        const tempCtx = tempRenderCanvas.getContext('2d');
        if (!tempCtx) continue;

        const rad = rotation * Math.PI / 180;
        
        if (rotation % 180 !== 0) { // Rotated 90 or 270
          tempRenderCanvas.width = sourceCanvas.height;
          tempRenderCanvas.height = sourceCanvas.width;
        } else { // 0 or 180
          tempRenderCanvas.width = sourceCanvas.width;
          tempRenderCanvas.height = sourceCanvas.height;
        }

        tempCtx.translate(tempRenderCanvas.width / 2, tempRenderCanvas.height / 2);
        tempCtx.rotate(rad);
        tempCtx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2, sourceCanvas.width, sourceCanvas.height);
       
        const imgDataUrl = tempRenderCanvas.toDataURL('image/png'); // Consider image/jpeg for smaller size if quality allows
        const pngImage = await pdfDocOut.embedPng(imgDataUrl);
        
        const pdfLibPage = pdfDocOut.addPage([tempRenderCanvas.width, tempRenderCanvas.height]);
        pdfLibPage.drawImage(pngImage, { x: 0, y: 0, width: tempRenderCanvas.width, height: tempRenderCanvas.height });
        
        // Apply Watermark
        if (watermarkConfig.text && watermarkConfig.topRatio !== null && watermarkConfig.leftRatio !== null) {
            const { width: pageWidth, height: pageHeight } = pdfLibPage.getSize();
            const pdfWatermarkFontSize = watermarkConfig.fontSize; // Use configured font size
            const parsedColor = parseRgbaColor(watermarkConfig.color);

            const textWidth = helveticaFont.widthOfTextAtSize(watermarkConfig.text, pdfWatermarkFontSize);
            // const textHeight = helveticaFont.heightAtSize(pdfWatermarkFontSize); // Full height
            const capHeight = helveticaFont.capHeightAtSize(pdfWatermarkFontSize); // More like visual top of text

            // Assuming topRatio and leftRatio are for the top-left corner of the text block
            const wmX_pdf = watermarkConfig.leftRatio * pageWidth;
            // Y in PDF-Lib is from bottom-left. We want topRatio from top.
            const wmY_pdf = pageHeight - (watermarkConfig.topRatio * pageHeight) - capHeight;


            pdfLibPage.pushGraphicsState(); // Save current graphics state
            pdfLibPage.setOpacity(parsedColor.alpha); // Set opacity for the watermark

            pdfLibPage.drawText(watermarkConfig.text, {
                x: wmX_pdf,
                y: wmY_pdf,
                font: helveticaFont,
                size: pdfWatermarkFontSize,
                color: rgb(parsedColor.r, parsedColor.g, parsedColor.b),
                // Opacity is handled by graphics state
            });
            pdfLibPage.popGraphicsState(); // Restore graphics state
        }


        if (pageNumberingConfig.enabled) {
            const { width: pnPageWidth, height: pnPageHeight } = pdfLibPage.getSize();
            const currentPageNum = pdfDocOut.getPageCount() -1 + pageNumberingConfig.start; 
            const totalNumPages = pageObjects.length;
            
            let text = pageNumberingConfig.format
                .replace('{page}', currentPageNum.toString())
                .replace('{total}', totalNumPages.toString());

            const textSize = pageNumberingConfig.fontSize;
            const pnFont = await pdfDocOut.embedFont(StandardFonts.Helvetica);
            const textWidthNum = pnFont.widthOfTextAtSize(text, textSize);
            const pnAscent = pnFont.ascender / pnFont.unitsPerEm * textSize;

            let x, y;
            switch (pageNumberingConfig.position) {
                case 'top-left': x = pageNumberingConfig.margin; y = pnPageHeight - pageNumberingConfig.margin - pnAscent; break;
                case 'top-center': x = pnPageWidth / 2 - textWidthNum / 2; y = pnPageHeight - pageNumberingConfig.margin - pnAscent; break;
                case 'top-right': x = pnPageWidth - pageNumberingConfig.margin - textWidthNum; y = pnPageHeight - pageNumberingConfig.margin - pnAscent; break;
                case 'bottom-left': x = pageNumberingConfig.margin; y = pageNumberingConfig.margin; break; 
                case 'bottom-center': x = pnPageWidth / 2 - textWidthNum / 2; y = pageNumberingConfig.margin; break;
                case 'bottom-right': x = pnPageWidth - pageNumberingConfig.margin - textWidthNum; y = pageNumberingConfig.margin; break;
                default: x = pnPageWidth / 2 - textWidthNum / 2; y = pageNumberingConfig.margin;
            }
            pdfLibPage.drawText(text, { x, y, font: pnFont, size: textSize, color: grayscale(0) });
        }
      }
      
      if (pdfProtectionConfig.enabled && pdfProtectionConfig.password) {
        await pdfDocOut.encrypt({
          userPassword: pdfProtectionConfig.password,
          ownerPassword: pdfProtectionConfig.password, 
          permissions: {}, 
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
      toast({ title: texts.downloadPdf, description: currentLanguage === 'zh' ? "PDF 下載成功！" : "PDF downloaded successfully!" });
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
      for (let i = 0; i < pageObjects.length; i++) { 
        // Find the original page index in pdfDocumentProxy corresponding to pageObjects[i]
        // This assumes pageObjects maintain order relative to original document pages,
        // but if pages are deleted, this might need adjustment or direct use of sourceCanvases.
        // For simplicity, if pageObjects map 1:1 to initial doc, originalPageIndex = i + 1.
        // If pages can be reordered or source document structure changes, this needs a more robust mapping.
        // The current pageObjects structure only has sourceCanvas and rotation, no direct link to original page number.
        // Assuming `pdfDocumentProxy.getPage(i + 1)` refers to the *original* document's pages.
        // This might be problematic if `pageObjects` is reordered or filtered.
        // A safer approach would be to store original page number with pageObject if text extraction per displayed page is needed.
        // However, `handleDownloadTxt` seems to want to extract text from the *original uploaded PDF*.
        
        // Re-evaluating: pageObjects[i] comes from the original pdfDocumentProxy in order.
        // So, if pageObjects[0] is the first page of the PDF, its source is from pdfDocumentProxy.getPage(1).
        // This mapping should hold unless pageObjects themselves are re-ordered copies from *multiple* source PDFs.
        // For now, assume pageObjects[i] corresponds to original page i+1.
        const pdfJsPage = await pdfDocumentProxy.getPage(i + 1); // If pageObjects are from a single PDF and in order
        const textContent = await pdfJsPage.getTextContent();
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
      toast({ title: texts.downloadTxt, description: currentLanguage === 'zh' ? "文字提取並下載成功！" : "Text extracted and downloaded successfully!" });

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
        if(file) toast({ title: texts.insertError, description: currentLanguage === 'zh' ? "無效的檔案類型。請上傳 PDF。" : "Invalid file type. Please upload a PDF.", variant: "destructive" });
        return;
    }

    setPendingInsertFile(file); 
    if (pageObjects.length > 0 && selectedPageIds.size === 0) { 
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
      // Note: processPdfFile returns its own pdfDocProxy. If inserting into an existing document,
      // and features rely on the *original* pdfDocumentProxy (like text extraction), this needs thought.
      // For now, we're just adding page *objects* (canvases).
      const { newPageObjects: insertPageObjects } = await processPdfFile(file); 

      let insertAtIndex = pageObjects.length; 
      if (selectedPageIds.size > 0) {
        const firstSelectedId = Array.from(selectedPageIds)[0];
        const firstSelectedIndex = pageObjects.findIndex(p => p.id === firstSelectedId);
        if (firstSelectedIndex !== -1) {
            insertAtIndex = insertPosition === 'before' ? firstSelectedIndex : firstSelectedIndex + 1;
        }
      }

      const newCombinedPageObjects = [...pageObjects];
      newCombinedPageObjects.splice(insertAtIndex, 0, ...insertPageObjects); 
      setPageObjects(newCombinedPageObjects);

      // Select the first inserted page
      const newSelectedIds = new Set<string>();
      if (insertPageObjects.length > 0) {
        newSelectedIds.add(insertPageObjects[0].id); 
      }
      setSelectedPageIds(newSelectedIds);

      toast({ title: texts.insertAreaTitle, description: currentLanguage === 'zh' ? "PDF 插入成功。" : "PDF inserted successfully." });

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
        
        const detailMessage = errorData?.detail || errorData?.error || `HTTP error! status: ${response.status}`;
        let toastDescription = detailMessage;
        if (typeof detailMessage === 'string' && (detailMessage.toLowerCase().includes("method not found") || detailMessage.toLowerCase().includes("api key not configured") || detailMessage.toLowerCase().includes("please provide your api key")) ) { 
             toastDescription = texts.pdfCoMethodNotFoundError;
        }
        throw new Error(detailMessage); 
      }

      const result = await response.json();

      if (!result.wordUrl) {
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
      let errMsg = error.message || (currentLanguage === 'zh' ? "未知錯誤" : "Unknown error");
      
      if (typeof errMsg === 'string' && (errMsg.toLowerCase().includes("method not found") || errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("please provide your api key") )) {
        errMsg = texts.pdfCoMethodNotFoundError;
      } else if (errMsg.toLowerCase().includes("pdf.co api key is not correctly hardcoded")) {
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


  const headerFeatures = [
    { icon: Edit3, labelKey: 'featureEdit' as keyof (typeof translations.en) },
    { icon: Columns, labelKey: 'featureMerge' as keyof (typeof translations.en) },
    { icon: ListOrdered, labelKey: 'featurePageNum' as keyof (typeof translations.en) },
    { icon: ShieldCheck, labelKey: 'featureProtect' as keyof (typeof translations.en) },
    { icon: FileType, labelKey: 'featureConvert' as keyof (typeof translations.en) },
  ];

  const closeZoomModal = () => {
    if (zoomedPageData && typeof zoomedPageData.index === 'number') {
        const updatedPageObjects = pageObjects.map((pObj, idx) => {
            if (idx === zoomedPageData.index) {
                return { ...pObj, rotation: currentModalRotation };
            }
            return pObj;
        });
        setPageObjects(updatedPageObjects);
    }
    setIsCustomZoomModalOpen(false);
    setZoomedPageData(null); 
    setCurrentModalRotation(0);   
    setZoomLevel(1);         
  };

  const handleImageToPdf = async () => {
    if (!imageFiles || imageFiles.length === 0) {
      toast({ title: texts.imageToPdfError, description: texts.noImagesSelected, variant: "destructive" });
      return;
    }
    setIsConvertingImagesToPdf(true);
    setLoadingMessage(texts.generatingPdfFromImages);
    try {
      const pdfDoc = await PDFLibDocument.create();
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const imageBytes = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          console.warn(`Skipping unsupported image type: ${file.type}`);
          toast({ title: texts.imageToPdfError, description: `Unsupported image type: ${file.name}`, variant: "destructive" });
          continue;
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      if (pdfDoc.getPageCount() === 0) {
        toast({ title: texts.imageToPdfError, description: texts.noImagesSelected, variant: "destructive" });
        setIsConvertingImagesToPdf(false);
        setLoadingMessage('');
        return;
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DocuPilot_Images.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: texts.imageToPdfTitle, description: texts.imageToPdfSuccess });
    } catch (err: any) {
      console.error("Image to PDF error:", err);
      toast({ title: texts.imageToPdfError, description: err.message, variant: "destructive" });
    } finally {
      setIsConvertingImagesToPdf(false);
      setLoadingMessage('');
      setImageFiles(null);
      if(imageToPdfUploadRef.current) imageToPdfUploadRef.current.value = '';
    }
  };

  const handlePdfCompression = async () => {
    if (!pdfToCompress) {
      toast({ title: texts.pdfCompressionError, description: texts.noPdfToCompress, variant: "destructive" });
      return;
    }
    setIsCompressingPdf(true);
    setLoadingMessage(texts.compressingPdf);
    try {
      const arrayBuffer = await pdfToCompress.arrayBuffer();
      const pdfDoc = await PDFLibDocument.load(arrayBuffer);
      // Re-save with useObjectStreams: false. This is one form of "compression" pdf-lib offers.
      const pdfBytes = await pdfDoc.save({ useObjectStreams: false }); 
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfToCompress.name.replace(/\.pdf$/i, '')}_compressed.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: texts.pdfCompressionTitle, description: texts.pdfCompressionSuccess });
    } catch (err: any) {
      console.error("PDF Compression error:", err);
      toast({ title: texts.pdfCompressionError, description: err.message, variant: "destructive" });
    } finally {
      setIsCompressingPdf(false);
      setLoadingMessage('');
      setPdfToCompress(null);
      if(pdfCompressUploadRef.current) pdfCompressUploadRef.current.value = '';
    }
  };

  // Watermark Drag Logic
  const handleWatermarkMouseDown = (
    event: React.MouseEvent<HTMLElement>,
    previewWrapperElement: HTMLElement,
    // pageIndex: number // Not strictly needed if watermark config is global
  ) => {
    event.preventDefault();
    const draggedWatermarkElement = event.currentTarget as HTMLElement;
    
    setIsDraggingWatermark(true);
    draggedWatermarkElement.style.cursor = 'grabbing';

    // Calculate initial offset in pixels based on current percentage and wrapper size
    const wrapperRect = previewWrapperElement.getBoundingClientRect();
    const initialTopPx = watermarkConfig.topRatio * wrapperRect.height;
    const initialLeftPx = watermarkConfig.leftRatio * wrapperRect.width;

    dragDataRef.current = {
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialWatermarkTopInPx: initialTopPx,
      initialWatermarkLeftInPx: initialLeftPx,
      draggedElement: draggedWatermarkElement,
      previewWrapperElement: previewWrapperElement,
    };

    document.addEventListener('mousemove', handleWatermarkMouseMove);
    document.addEventListener('mouseup', handleWatermarkMouseUp);
  };

  const handleWatermarkMouseMove = useCallback((event: MouseEvent) => {
    if (!isDraggingWatermark || !dragDataRef.current) return;
    event.preventDefault();

    const { 
        initialMouseX, initialMouseY, 
        initialWatermarkTopInPx, initialWatermarkLeftInPx, 
        draggedElement, previewWrapperElement 
    } = dragDataRef.current;

    const deltaX = event.clientX - initialMouseX;
    const deltaY = event.clientY - initialMouseY;

    let newPixelTop = initialWatermarkTopInPx + deltaY;
    let newPixelLeft = initialWatermarkLeftInPx + deltaX;
    
    const wrapperRect = previewWrapperElement.getBoundingClientRect();
    const watermarkRect = draggedElement.getBoundingClientRect(); // Get live dimensions

    // Constrain within the previewWrapperElement boundaries
    newPixelTop = Math.max(0, Math.min(newPixelTop, wrapperRect.height - watermarkRect.height));
    newPixelLeft = Math.max(0, Math.min(newPixelLeft, wrapperRect.width - watermarkRect.width));

    // Update state with ratios for React to re-render all previews
    const newTopRatio = wrapperRect.height > 0 ? newPixelTop / wrapperRect.height : 0;
    const newLeftRatio = wrapperRect.width > 0 ? newPixelLeft / wrapperRect.width : 0;
    
    setWatermarkConfig(prev => ({ 
        ...prev, 
        topRatio: parseFloat(newTopRatio.toFixed(4)), // Store with some precision
        leftRatio: parseFloat(newLeftRatio.toFixed(4)) 
    }));

  }, [isDraggingWatermark]); // Only depends on isDraggingWatermark for adding/removing listener effect

  const handleWatermarkMouseUp = useCallback(() => {
    if (!isDraggingWatermark) return;

    setIsDraggingWatermark(false);
    if (dragDataRef.current && dragDataRef.current.draggedElement) {
      dragDataRef.current.draggedElement.style.cursor = 'grab';
    }
    // dragDataRef.current = null; // Keep data for potential immediate re-drag debugging

    document.removeEventListener('mousemove', handleWatermarkMouseMove);
    document.removeEventListener('mouseup', handleWatermarkMouseUp);
  }, [isDraggingWatermark, handleWatermarkMouseMove]);

  useEffect(() => {
    // Cleanup listeners if component unmounts while dragging
    return () => {
      document.removeEventListener('mousemove', handleWatermarkMouseMove);
      document.removeEventListener('mouseup', handleWatermarkMouseUp);
    };
  }, [handleWatermarkMouseMove, handleWatermarkMouseUp]);


  return (
    <div className="min-h-screen bg-background text-foreground">

      {(isLoading || isDownloading || isExtractingText || isConvertingToWord || isConvertingImagesToPdf || isCompressingPdf) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">
            {isLoading ? loadingMessage :
             isConvertingToWord ? texts.convertingToWord :
             isDownloading ? texts.generatingFile : 
             isExtractingText ? texts.extractingText : 
             isConvertingImagesToPdf ? texts.generatingPdfFromImages :
             isCompressingPdf ? texts.compressingPdf : ''}
          </p>
        </div>
      )}

      {isCustomZoomModalOpen && zoomedPageData && (
         <div 
          role="dialog" 
          aria-modal="true" 
          aria-label={`${texts.previewOf} ${texts.page} ${zoomedPageData.index + 1} (${(zoomLevel * 100).toFixed(0)}%)`}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeZoomModal} 
        >
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            aria-hidden="true"
            onClick={closeZoomModal} 
          ></div>
          <div 
            className="relative bg-card text-card-foreground shadow-2xl rounded-lg w-[90vw] max-w-4xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()} 
            role="document"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground" id="zoom-dialog-title-custom">
                 {texts.previewOf} {texts.page} {zoomedPageData.index + 1}
                 <span className="text-sm text-muted-foreground ml-2">({(zoomLevel * 100).toFixed(0)}%)</span>
              </h2>
              <Button variant="ghost" size="icon" onClick={closeZoomModal} aria-label={texts.modalCloseButton}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div
              ref={zoomScrollContainerRef}
              className="flex-grow bg-muted/40 overflow-auto p-4 flex items-center justify-center" // Added flex centering for canvas
              onWheel={handleWheel} 
              style={{ touchAction: 'none' }} // Might help with passive event listeners on some browsers
            >
              <canvas
                ref={zoomCanvasRef}
                className="shadow-lg" 
                style={{ willReadFrequently: true } as any} 
              />
            </div>
            <div className="p-4 border-t border-border flex flex-col md:flex-row items-center gap-2 justify-between">
              <Input 
                type="text" 
                placeholder={texts.noteInputPlaceholder} 
                className="flex-grow md:max-w-xs" 
                aria-label={texts.noteInputPlaceholder}
              />
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                  <Button variant="outline" onClick={() => setCurrentModalRotation((r) => (r - 90 + 360) % 360)}><RotateCcw className="mr-2 h-4 w-4" /> {texts.rotateLeft}</Button>
                  <Button variant="outline" onClick={() => setCurrentModalRotation((r) => (r + 90) % 360)}><RotateCw className="mr-2 h-4 w-4" /> {texts.rotateRight}</Button>
                  <Button variant="outline" onClick={() => { setCurrentModalRotation(0); setZoomLevel(1); }}><X className="mr-2 h-4 w-4" /> {texts.resetRotation}</Button>
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
        {pageObjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] space-y-8">
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
              
              <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> {texts.imageToPdfTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                        onClick={() => imageToPdfUploadRef.current?.click()}
                        onDragOver={commonDragEvents.onDragOver}
                        onDragLeave={commonDragEvents.onDragLeave}
                        onDrop={(e) => {
                            commonDragEvents.onDrop(e, (ev) => {
                                if (ev.dataTransfer.files) setImageFiles(ev.dataTransfer.files);
                            });
                        }}
                    >
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">{texts.dropImagesHere}</p>
                        <Input type="file" id="imageToPdfInput" accept="image/*" multiple
                            ref={imageToPdfUploadRef}
                            onChange={(e) => setImageFiles(e.target.files)}
                            className="hidden" />
                    </div>
                    {imageFiles && imageFiles.length > 0 && <p className="text-xs text-muted-foreground">{imageFiles.length} image(s) selected.</p>}
                    <Button onClick={handleImageToPdf} disabled={!imageFiles || imageFiles.length === 0 || isConvertingImagesToPdf} className="w-full">
                        {isConvertingImagesToPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {texts.convertToPdfButton}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg"><Minimize2 className="mr-2 h-5 w-5 text-primary" /> {texts.pdfCompressionTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div
                        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                        onClick={() => pdfCompressUploadRef.current?.click()}
                        onDragOver={commonDragEvents.onDragOver}
                        onDragLeave={commonDragEvents.onDragLeave}
                        onDrop={(e) => {
                            commonDragEvents.onDrop(e, (ev) => {
                                if (ev.dataTransfer.files && ev.dataTransfer.files.length > 0) setPdfToCompress(ev.dataTransfer.files[0]);
                            });
                        }}
                    >
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">{texts.dropPdfToCompressHere}</p>
                        <Input type="file" id="pdfCompressInput" accept="application/pdf"
                            ref={pdfCompressUploadRef}
                            onChange={(e) => setPdfToCompress(e.target.files ? e.target.files[0] : null)}
                            className="hidden" />
                    </div>
                     {pdfToCompress && <p className="text-xs text-muted-foreground">{pdfToCompress.name} selected.</p>}
                    <Button onClick={handlePdfCompression} disabled={!pdfToCompress || isCompressingPdf} className="w-full">
                        {isCompressingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {texts.compressPdfButton}
                    </Button>
                    <p className="text-xs text-muted-foreground">{texts.pdfCompressionNote}</p>
                  </CardContent>
                </Card>
              </div>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                <div className="md:col-span-8"> 
                    <Card className="shadow-lg min-h-[calc(100vh-20rem)] md:min-h-[calc(100vh-18rem)]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center text-xl"><Shuffle className="mr-2 h-5 w-5 text-primary" /> {texts.pageManagement}</CardTitle>
                                <CardDescription> 
                                    {pageObjects.length} {pageObjects.length === 1 ? texts.page.toLowerCase() : (currentLanguage === 'zh' ? texts.pagesLoaded.replace('頁已載入。', '頁') : texts.pagesLoaded.replace('pages loaded.', 'page(s)'))} {currentLanguage === 'zh' ? '已載入' : 'loaded'}.{' '}
                                    {selectedPageIds.size > 0 ? `${texts.page} ${pageObjects.findIndex(p => p.id === Array.from(selectedPageIds)[0]) + 1} ${texts.pageSelectedSuffix}` : ''}
                                </CardDescription>
                            </div>
                             <Button
                                onClick={handleDeletePages}
                                variant="destructive"
                                size="sm"
                                disabled={selectedPageIds.size === 0 || pageObjects.length === 0}
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
                           {pageObjects.map((pageObj, index) => (
                            <PagePreviewItem
                              key={pageObj.id}
                              pageObj={pageObj}
                              index={index}
                              isSelected={selectedPageIds.has(pageObj.id)}
                              onClick={() => {
                                const newSelectedIds = new Set<string>();
                                if (!selectedPageIds.has(pageObj.id)) {
                                    newSelectedIds.add(pageObj.id);
                                } 
                                setSelectedPageIds(newSelectedIds);
                              }}
                              onDoubleClick={() => {
                                setZoomedPageData({ page: pageObj, index });
                                setCurrentModalRotation(pageObj.rotation); 
                                setZoomLevel(1);
                                setIsCustomZoomModalOpen(true);
                              }}
                              watermarkConfig={watermarkConfig}
                              onWatermarkMouseDown={handleWatermarkMouseDown}
                              texts={texts}
                            />
                          ))}
                        </div>
                         <div className="mt-4 text-sm text-muted-foreground space-y-1">
                            <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> {texts.instSelect}</p>
                            <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> {texts.instDrag}</p>
                            <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> {texts.instZoom}</p>
                        </div>
                      </CardContent>
                    </Card>
                </div>

                
                <div className="md:col-span-4 space-y-6">
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
                        <RadioGroup value={insertPosition} onValueChange={(value: 'before' | 'after') => setInsertPosition(value)} disabled={selectedPageIds.size === 0}>
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
                            <Button onClick={handleDownloadPdf} disabled={pageObjects.length === 0 || isDownloading} className="w-full">
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
                                        <CardTitle className="flex items-center text-lg"><Droplet className="mr-2 h-5 w-5 text-primary" /> {texts.watermarkSectionTitle}</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="watermarkInput" className="mb-1 block text-sm font-medium">{texts.watermarkInputPlaceholder}</Label>
                                            <Input
                                                id="watermarkInput"
                                                type="text"
                                                placeholder={texts.watermarkInputPlaceholder}
                                                value={watermarkConfig.text}
                                                onChange={(e) => setWatermarkConfig(prev => ({...prev, text: e.target.value}))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="watermarkFontSize" className="mb-1 block text-sm font-medium">{texts.watermarkFontSizeLabel}</Label>
                                            <Input
                                                id="watermarkFontSize"
                                                type="number"
                                                value={watermarkConfig.fontSize}
                                                onChange={(e) => setWatermarkConfig(prev => ({...prev, fontSize: parseInt(e.target.value, 10) || 20}))}
                                                min="8"
                                                max="120"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="watermarkColor" className="mb-1 block text-sm font-medium">{texts.watermarkColorLabel}</Label>
                                            <Input
                                                id="watermarkColor"
                                                type="color" // Using type="color" for a color picker
                                                value={(() => { // Convert rgba to hex for color input
                                                    const parsed = parseRgbaColor(watermarkConfig.color);
                                                    const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
                                                    return `#${toHex(parsed.r)}${toHex(parsed.g)}${toHex(parsed.b)}`;
                                                })()}
                                                onChange={(e) => {
                                                    // Convert hex back to rgba for storage, keeping existing alpha
                                                    const hex = e.target.value;
                                                    const r = parseInt(hex.slice(1, 3), 16);
                                                    const g = parseInt(hex.slice(3, 5), 16);
                                                    const b = parseInt(hex.slice(5, 7), 16);
                                                    const currentAlpha = parseRgbaColor(watermarkConfig.color).alpha;
                                                    setWatermarkConfig(prev => ({...prev, color: `rgba(${r}, ${g}, ${b}, ${currentAlpha})`}));
                                                }}
                                                className="h-10" // Ensure color input is visible
                                            />
                                             <Input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.05"
                                                title={`Opacity: ${parseRgbaColor(watermarkConfig.color).alpha.toFixed(2)}`}
                                                value={parseRgbaColor(watermarkConfig.color).alpha}
                                                onChange={(e) => {
                                                    const newAlpha = parseFloat(e.target.value);
                                                    const parsed = parseRgbaColor(watermarkConfig.color);
                                                    setWatermarkConfig(prev => ({...prev, color: `rgba(${Math.round(parsed.r*255)}, ${Math.round(parsed.g*255)}, ${Math.round(parsed.b*255)}, ${newAlpha})`}));
                                                }}
                                                className="w-full mt-2 h-2"
                                            />
                                        </div>
                                      </CardContent>
                                    </Card>
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

                    
                    <Card className="shadow-lg">
                        <CardHeader>
                        <CardTitle className="flex items-center text-lg"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> {texts.imageToPdfTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <div>
                            <div
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                                onClick={() => imageToPdfUploadRef.current?.click()}
                                onDragOver={commonDragEvents.onDragOver}
                                onDragLeave={commonDragEvents.onDragLeave}
                                onDrop={(e) => {
                                    commonDragEvents.onDrop(e, (ev) => {
                                        if (ev.dataTransfer.files) setImageFiles(ev.dataTransfer.files);
                                    });
                                }}
                            >
                                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground text-center">{texts.dropImagesHere}</p>
                            </div>
                            <Input type="file" id="imageToPdfInputLoaded" accept="image/*" multiple
                                ref={imageToPdfUploadRef}
                                onChange={(e) => setImageFiles(e.target.files)}
                                className="hidden" />
                        </div>
                        {imageFiles && imageFiles.length > 0 && <p className="text-xs text-muted-foreground">{imageFiles.length} image(s) selected.</p>}
                        <Button onClick={handleImageToPdf} disabled={!imageFiles || imageFiles.length === 0 || isConvertingImagesToPdf} className="w-full">
                            {isConvertingImagesToPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {texts.convertToPdfButton}
                        </Button>
                        </CardContent>
                    </Card>

                    
                    <Card className="shadow-lg">
                        <CardHeader>
                        <CardTitle className="flex items-center text-lg"><Minimize2 className="mr-2 h-5 w-5 text-primary" /> {texts.pdfCompressionTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <div>
                            <div
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                                onClick={() => pdfCompressUploadRef.current?.click()}
                                onDragOver={commonDragEvents.onDragOver}
                                onDragLeave={commonDragEvents.onDragLeave}
                                onDrop={(e) => {
                                    commonDragEvents.onDrop(e, (ev) => {
                                        if (ev.dataTransfer.files && ev.dataTransfer.files.length > 0) setPdfToCompress(ev.dataTransfer.files[0]);
                                    });
                                }}
                            >
                                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground text-center">{texts.dropPdfToCompressHere}</p>
                            </div>
                            <Input type="file" id="pdfCompressInputLoaded" accept="application/pdf"
                                ref={pdfCompressUploadRef}
                                onChange={(e) => setPdfToCompress(e.target.files ? e.target.files[0] : null)}
                                className="hidden" />
                        </div>
                        {pdfToCompress && <p className="text-xs text-muted-foreground">{pdfToCompress.name} selected.</p>}
                        <Button onClick={handlePdfCompression} disabled={!pdfToCompress || isCompressingPdf} className="w-full">
                            {isCompressingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            {texts.compressPdfButton}
                        </Button>
                        <p className="text-xs text-muted-foreground">{texts.pdfCompressionNote}</p>
                        </CardContent>
                    </Card>

                </div>
            </div>
          )}
      </div>
    </div>
  );
}

    