
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy as PDFDocumentProxyType } from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb, degrees, grayscale, pushGraphicsState, popGraphicsState, setOpacity } from 'pdf-lib';
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
import { Loader2, RotateCcw, RotateCw, X, Trash2, Download, Upload, Info, Shuffle, Search, Edit3, Droplet, LogIn, LogOut, UserCircle, FileText, FileType, FileDigit, Lock, MenuSquare, Columns, ShieldCheck, FilePlus, ListOrdered, Move, CheckSquare, Image as ImageIcon, Minimize2, Palette, FontSize, Eye, Scissors, LayoutGrid, PanelLeft, FilePlus2, Combine, Type, ImagePlus, Link as LinkIcon, MessageSquarePlus, ZoomIn, ZoomOut, Expand } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { storage, functions as firebaseFunctions, app as firebaseApp } from '@/lib/firebase'; // Firebase SDK
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';


if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageObject {
  id: string;
  sourceCanvas: HTMLCanvasElement;
  rotation: number; // 0, 90, 180, 270
}

interface TextAnnotation {
  id: string;
  pageIndex: number;
  text: string;
  topRatio: number;
  leftRatio: number;
  fontSize: number;
  color: string;
}

const translations = {
    en: {
        pageTitle: 'DocuPilot',
        uploadLabel: 'Select PDF file to edit:',
        deletePages: 'Delete Selected Pages',
        splitPages: 'Split Selected',
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
        instZoom: 'Use mouse wheel to zoom.',
        modalCloseButton: 'Close',
        rotateLeft: 'Rotate Left 90°',
        rotateRight: 'Rotate Right 90°',
        resetRotation: 'Reset Rotation & Zoom',
        generatingFile: 'Generating file, please wait…',
        extractingText: 'Extracting text, please wait...',
        loadError: 'Failed to load PDF',
        downloadError: 'Failed to download PDF',
        splitPdfSuccess: 'Split PDF downloaded successfully!',
        splitPdfError: 'Failed to split PDF',
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
        watermarkSectionTitle: 'Watermark',
        watermarkInputPlaceholder: 'Enter watermark text',
        watermarkFontSizeLabel: 'Font Size',
        watermarkColorLabel: 'Color',
        watermarkOpacityLabel: 'Opacity',
        watermarkTypeLabel: 'Watermark Type',
        watermarkTypeText: 'Text',
        watermarkTypeImage: 'Image',
        watermarkImageLabel: 'Select Image',
        watermarkPreviewButton: 'Preview & Position Watermark',
        watermarkPreviewModalTitle: 'Preview & Position Watermark',
        watermarkPreviewInfo: 'Drag watermark to desired position. Adjust style below. This position will be applied to all pages.',
        watermarkConfirmPosition: 'Confirm Position & Style',
        noPdfForWatermarkPreview: 'Upload a PDF to preview watermark.',
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
        pagesLoaded: 'page(s) loaded',
        pageSelectedSuffix: 'selected',
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
        comingSoon: 'Coming Soon!',
        featureNotImplemented: 'feature is not yet implemented.',
        editorMode: 'Editor Mode',
        gridMode: 'Grid Mode',
        deletePageConfirmTitle: 'Delete Page?',
        deletePageConfirmDescription: 'Are you sure you want to delete this page? This action cannot be undone.',
        toolRotate: 'Rotate',
        toolDelete: 'Delete',
        toolAddBlank: 'Add Blank',
        toolMerge: 'Merge',
        toolSplit: 'Split',
        toolWatermark: 'Watermark',
        toolInsertText: 'Insert Text',
        toolInsertImage: 'Insert Image',
        toolInsertLink: 'Insert Link',
        toolInsertComment: 'Comment',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        fitToWidth: 'Fit to Width',
        fitToPage: 'Fit to Page',
        textProperties: 'Text Properties',
        textAnnotationContent: 'Text Content',
        textAnnotationSample: 'Sample Text',
    },
    zh: {
        pageTitle: 'DocuPilot 文件助手',
        uploadLabel: '選擇要編輯的 PDF 檔案：',
        deletePages: '刪除選取的頁面',
        splitPages: '拆分選定頁面',
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
        instZoom: '使用滑鼠滾輪縮放。',
        modalCloseButton: '關閉',
        rotateLeft: '向左旋轉90°',
        rotateRight: '向右旋轉90°',
        resetRotation: '重置旋轉與縮放',
        generatingFile: '正在產生檔案，請稍候…',
        extractingText: '正在提取文字，請稍候...',
        loadError: '載入 PDF 失敗',
        downloadError: '下載 PDF 失敗',
        splitPdfSuccess: 'PDF 拆分下載成功！',
        splitPdfError: '拆分 PDF 失敗',
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
        watermarkSectionTitle: '浮水印',
        watermarkInputPlaceholder: '輸入浮水印文字',
        watermarkFontSizeLabel: '字體大小',
        watermarkColorLabel: '顏色',
        watermarkOpacityLabel: '透明度',
        watermarkTypeLabel: '浮水印類型',
        watermarkTypeText: '文字',
        watermarkTypeImage: '圖片',
        watermarkImageLabel: '選擇圖片',
        watermarkPreviewButton: '預覽並定位浮水印',
        watermarkPreviewModalTitle: '預覽與定位浮水印',
        watermarkPreviewInfo: '將浮水印拖曳到目標位置。在下方調整樣式。此設定將套用於所有頁面。',
        watermarkConfirmPosition: '確認位置與樣式',
        noPdfForWatermarkPreview: '請先上傳 PDF 以預覽浮水印。',
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
        downloadAndConvertTitle: '下載与轉換',
        startEditingYourPdf: '開始編輯您的 PDF',
        pagesLoaded: '頁已載入',
        pageSelectedSuffix: '已選取',
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
        comingSoon: '即將推出！',
        featureNotImplemented: '功能尚未實現。',
        editorMode: '編輯模式',
        gridMode: '縮圖模式',
        deletePageConfirmTitle: '刪除頁面？',
        deletePageConfirmDescription: '您確定要刪除此頁面嗎？此操作無法復原。',
        toolRotate: '旋轉',
        toolDelete: '刪除',
        toolAddBlank: '新增空白',
        toolMerge: '合併',
        toolSplit: '拆分',
        toolWatermark: '浮水印',
        toolInsertText: '插入文字',
        toolInsertImage: '插入圖片',
        toolInsertLink: '插入連結',
        toolInsertComment: '註解',
        zoomIn: '放大',
        zoomOut: '縮小',
        fitToWidth: '符合頁寬',
        fitToPage: '符合頁面',
        textProperties: '文字屬性',
        textAnnotationContent: '文字内容',
        textAnnotationSample: '範例文本',
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
  type: 'text' | 'image';
  imageUrl: string | null;
  topRatio: number;
  leftRatio: number;
  fontSize: number;
  color: string;
  opacity: number;
}

interface PagePreviewItemProps {
  pageObj: PageObject;
  index: number;
  isSelected: boolean;
  onClick: (event: React.MouseEvent) => void;
  onDoubleClick: () => void;
  watermarkConfig: WatermarkConfig;
  texts: typeof translations.en;
}

const PagePreviewItem = React.memo(({
  pageObj, index, isSelected, onClick, onDoubleClick, watermarkConfig, texts
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


  const previewWatermarkFontSize = Math.max(6, watermarkConfig.fontSize / (150/15));

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

      {watermarkConfig.type === 'text' && watermarkConfig.text && (
        <div
          style={{
            position: 'absolute',
            top: `${watermarkConfig.topRatio * 100}%`,
            left: `${watermarkConfig.leftRatio * 100}%`,
            padding: '1px 3px',
            backgroundColor: 'rgba(220,220,220,0.1)',
            border: '1px dashed rgba(150,150,150,0.3)',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            fontSize: `${previewWatermarkFontSize}px`,
            color: watermarkConfig.color,
            opacity: watermarkConfig.opacity,
            zIndex: 5,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {watermarkConfig.text}
        </div>
      )}
      {watermarkConfig.type === 'image' && watermarkConfig.imageUrl && (
        <img
          src={watermarkConfig.imageUrl}
          alt="Watermark Preview"
          style={{
            position: 'absolute',
            top: `${watermarkConfig.topRatio * 100}%`,
            left: `${watermarkConfig.leftRatio * 100}%`,
            opacity: watermarkConfig.opacity,
            zIndex: 5,
            pointerEvents: 'none',
            maxWidth: '30px',
            maxHeight: '30px',
            objectFit: 'contain',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
});
PagePreviewItem.displayName = 'PagePreviewItem';

const ToolbarButton = ({ icon: Icon, label, onClick, disabled = false }: { icon: React.ElementType, label: string, onClick?: () => void, disabled?: boolean }) => (
    <Button
        variant="ghost"
        className="flex flex-col items-center justify-center h-20 w-full text-xs space-y-1"
        onClick={onClick}
        disabled={disabled}
    >
        <Icon className="h-6 w-6 text-primary" />
        <span className="text-muted-foreground">{label}</span>
    </Button>
);


export default function PdfEditorHomepage() {
  const router = useRouter();
  const { toast } = useToast();

  const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());

  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'grid'>('editor');

  const mainViewContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mainCanvasZoom, setMainCanvasZoom] = useState(1);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const [insertPosition, setInsertPosition] = useState<'before' | 'after'>('before');
  const [isInsertConfirmOpen, setIsInsertConfirmOpen] = useState(false);
  const [pendingInsertFile, setPendingInsertFile] = useState<File | null>(null);
  
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    text: '',
    type: 'text',
    imageUrl: null,
    topRatio: 0.5,
    leftRatio: 0.5,
    fontSize: 48,
    color: '#808080',
    opacity: 0.5,
  });

  const [tempWatermarkConfig, setTempWatermarkConfig] = useState<WatermarkConfig>(watermarkConfig);
  const [isWatermarkPreviewModalOpen, setIsWatermarkPreviewModalOpen] = useState(false);
  const watermarkImageUploadRef = useRef<HTMLInputElement>(null);
  const watermarkPreviewModalCanvasRef = useRef<HTMLCanvasElement>(null);

  const dragDataRef = useRef<{
    type: 'watermark' | 'annotation',
    id: string | null,
    initialMouseX: number;
    initialMouseY: number;
    initialElementLeft: number;
    initialElementTop: number;
    containerRect: DOMRect;
  } | null>(null);
  const watermarkPreviewCanvasContainerRef = useRef<HTMLDivElement>(null);

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

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pdfUploadRef = useRef<HTMLInputElement>(null);
  const insertPdfRef = useRef<HTMLInputElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);

  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const imageToPdfUploadRef = useRef<HTMLInputElement>(null);
  const [isConvertingImagesToPdf, setIsConvertingImagesToPdf] = useState(false);

  const [pdfToCompress, setPdfToCompress] = useState<File | null>(null);
  const pdfCompressUploadRef = useRef<HTMLInputElement>(null);
  const [isCompressingPdf, setIsCompressingPdf] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);

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

  const createSortableInstance = useCallback((containerRef: React.RefObject<HTMLDivElement>) => {
    if (containerRef.current && !sortableInstanceRef.current) {
        sortableInstanceRef.current = Sortable.create(containerRef.current, {
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
    }
  }, []);

  useEffect(() => {
    if (pageObjects.length > 0 && viewMode === 'editor' && thumbnailContainerRef.current) {
        createSortableInstance(thumbnailContainerRef);
    } else if (pageObjects.length > 0 && viewMode === 'grid' && mainViewContainerRef.current) {
        createSortableInstance(mainViewContainerRef);
    } else if (sortableInstanceRef.current) {
        sortableInstanceRef.current.destroy();
        sortableInstanceRef.current = null;
    }

    return () => {
        if (sortableInstanceRef.current) {
            sortableInstanceRef.current.destroy();
            sortableInstanceRef.current = null;
        }
    };
  }, [pageObjects.length, viewMode, createSortableInstance]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const options = {
        root: mainViewContainerRef.current,
        rootMargin: '0px',
        threshold: 0.5
    };

    observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.getAttribute('data-page-index') || '0', 10);
                setActivePageIndex(index);
            }
        });
    }, options);

    const { current: observer } = observerRef;
    const { current: pageElements } = pageRefs;

    pageElements.forEach(el => {
        if (el) observer.observe(el);
    });

    return () => {
        if (observer) {
            pageElements.forEach(el => {
                if (el) observer.unobserve(el);
            });
        }
    };
  }, [pageObjects, mainCanvasZoom]);
  
  useEffect(() => {
    if (activePageIndex !== null && thumbnailRefs.current[activePageIndex]) {
        thumbnailRefs.current[activePageIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
  }, [activePageIndex]);


  const handleFitPage = useCallback(() => {
      if (!mainViewContainerRef.current || pageObjects.length === 0 || activePageIndex === null) return;
      const container = mainViewContainerRef.current;
      const containerWidth = container.clientWidth - 40;
      const containerHeight = container.clientHeight - 40;

      const activePage = pageObjects[activePageIndex];
      if (!activePage) return;

      const pageCanvas = activePage.sourceCanvas;
      const rotation = activePage.rotation;

      let pageRenderWidth = (rotation % 180 !== 0) ? pageCanvas.height : pageCanvas.width;
      let pageRenderHeight = (rotation % 180 !== 0) ? pageCanvas.width : pageCanvas.height;

      const widthRatio = containerWidth / pageRenderWidth;
      const heightRatio = containerHeight / pageRenderHeight;

      const newZoom = Math.min(widthRatio, heightRatio);
      setMainCanvasZoom(newZoom);
  }, [activePageIndex, pageObjects]);

  const handleFitToWidth = useCallback(() => {
      if (!mainViewContainerRef.current || pageObjects.length === 0 || activePageIndex === null) return;
      const containerWidth = mainViewContainerRef.current.clientWidth - 40;
      const activePage = pageObjects[activePageIndex];
      if (!activePage) return;

      const pageCanvas = activePage.sourceCanvas;
      const rotation = activePage.rotation;
      let pageRenderWidth = (rotation % 180 !== 0) ? pageCanvas.height : pageCanvas.width;

      const newZoom = containerWidth / pageRenderWidth;
      setMainCanvasZoom(newZoom);
  }, [activePageIndex, pageObjects]);


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
    setTextAnnotations([]);
    setSelectedAnnotationId(null);

    setIsLoading(true);
    setLoadingMessage(texts.loadingPdf);
    try {
      const { newPageObjects, docProxy } = await processPdfFile(file);
      setPageObjects(newPageObjects);
      setPdfDocumentProxy(docProxy);
      setSelectedPageIds(new Set());
      setActivePageIndex(newPageObjects.length > 0 ? 0 : null);
      setViewMode('editor');
      
      setTimeout(() => handleFitPage(), 100);

    } catch (err: any) {
      toast({ title: texts.loadError, description: err.message, variant: "destructive" });
      setPdfDocumentProxy(null);
      setUploadedPdfFile(null);
      setPageObjects([]);
      setActivePageIndex(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (pdfUploadRef.current) pdfUploadRef.current.value = '';
    }
  };

  const handleDeletePages = () => {
    if (pageToDelete !== null) {
        const newPages = pageObjects.filter((p, index) => index !== pageToDelete);
        const newActiveIndex = pageToDelete >= newPages.length ? newPages.length - 1 : pageToDelete;

        setPageObjects(newPages);
        setActivePageIndex(newActiveIndex);
        setSelectedPageIds(new Set());
    } else {
        if (selectedPageIds.size === 0) {
            toast({ title: texts.pageManagement, description: texts.noPageSelected, variant: "destructive" });
            return;
        }
        const newPages = pageObjects.filter(p => !selectedPageIds.has(p.id));

        setPageObjects(newPages);
        setActivePageIndex(null);
        setSelectedPageIds(new Set());
    }

    if (pageObjects.length - (pageToDelete !== null ? 1 : selectedPageIds.size) === 0) {
      setPdfDocumentProxy(null);
      setUploadedPdfFile(null);
    }

    toast({ title: texts.pageManagement, description: currentLanguage === 'zh' ? "選取的頁面已刪除。" : "Selected pages have been deleted." });
    setPageToDelete(null);
    setIsDeleteConfirmOpen(false);
  };


  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0.5, g: 0.5, b: 0.5 };
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
      const helveticaFont = await pdfDocOut.embedFont(StandardFonts.Helvetica);

      for (const [index, pageObj] of pageObjects.entries()) {
        const { sourceCanvas, rotation } = pageObj;

        const tempRenderCanvas = document.createElement('canvas');
        const tempCtx = tempRenderCanvas.getContext('2d');
        if (!tempCtx) continue;

        const rad = rotation * Math.PI / 180;

        if (rotation % 180 !== 0) {
          tempRenderCanvas.width = sourceCanvas.height;
          tempRenderCanvas.height = sourceCanvas.width;
        } else {
          tempRenderCanvas.width = sourceCanvas.width;
          tempRenderCanvas.height = sourceCanvas.height;
        }

        tempCtx.translate(tempRenderCanvas.width / 2, tempRenderCanvas.height / 2);
        tempCtx.rotate(rad);
        tempCtx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2, sourceCanvas.width, sourceCanvas.height);

        const imgDataUrl = tempRenderCanvas.toDataURL('image/png');
        const pngImage = await pdfDocOut.embedPng(imgDataUrl);

        const pdfLibPage = pdfDocOut.addPage([tempRenderCanvas.width, tempRenderCanvas.height]);
        pdfLibPage.drawImage(pngImage, { x: 0, y: 0, width: tempRenderCanvas.width, height: tempRenderCanvas.height });

        const { width: pageWidth, height: pageHeight } = pdfLibPage.getSize();

        // Apply Text Annotations
        for (const annotation of textAnnotations) {
            if (annotation.pageIndex === index) {
                const { r, g, b } = hexToRgb(annotation.color);
                pdfLibPage.drawText(annotation.text, {
                    x: annotation.leftRatio * pageWidth,
                    y: pageHeight - (annotation.topRatio * pageHeight) - annotation.fontSize,
                    font: helveticaFont,
                    size: annotation.fontSize,
                    color: rgb(r, g, b),
                    lineHeight: annotation.fontSize * 1.2,
                });
            }
        }


        if ((watermarkConfig.type === 'text' && watermarkConfig.text) || (watermarkConfig.type === 'image' && watermarkConfig.imageUrl)) {
            pdfLibPage.pushGraphicsState();
            pdfLibPage.setOpacity(watermarkConfig.opacity);

            if (watermarkConfig.type === 'text' && watermarkConfig.text) {
                const pdfWatermarkFontSize = watermarkConfig.fontSize;
                const textColor = hexToRgb(watermarkConfig.color);
                const textWidth = helveticaFont.widthOfTextAtSize(watermarkConfig.text, pdfWatermarkFontSize);
                const textHeight = helveticaFont.heightAtSize(pdfWatermarkFontSize);

                const wmX_pdf_text = watermarkConfig.leftRatio * pageWidth - textWidth / 2;
                const wmY_pdf_text = pageHeight - (watermarkConfig.topRatio * pageHeight) - textHeight / 2;


                pdfLibPage.drawText(watermarkConfig.text, {
                    x: wmX_pdf_text,
                    y: wmY_pdf_text,
                    font: helveticaFont,
                    size: pdfWatermarkFontSize,
                    color: rgb(textColor.r, textColor.g, textColor.b),
                });
            } else if (watermarkConfig.type === 'image' && watermarkConfig.imageUrl) {
                try {
                    const imageBytes = await fetch(watermarkConfig.imageUrl).then(res => res.arrayBuffer());
                    let wmEmbedImage;
                    if (watermarkConfig.imageUrl.startsWith('data:image/png')) {
                        wmEmbedImage = await pdfDocOut.embedPng(imageBytes);
                    } else if (watermarkConfig.imageUrl.startsWith('data:image/jpeg') || watermarkConfig.imageUrl.startsWith('data:image/jpg')) {
                        wmEmbedImage = await pdfDocOut.embedJpg(imageBytes);
                    }

                    if (wmEmbedImage) {
                        const { width: imgOriginalWidth, height: imgOriginalHeight } = wmEmbedImage.scale(1);
                        const wmX_pdf_img = watermarkConfig.leftRatio * pageWidth - imgOriginalWidth / 2;
                        const wmY_pdf_img = pageHeight - (watermarkConfig.topRatio * pageHeight) - imgOriginalHeight / 2;

                        pdfLibPage.drawImage(wmEmbedImage, {
                            x: wmX_pdf_img,
                            y: wmY_pdf_img,
                            width: imgOriginalWidth,
                            height: imgOriginalHeight,
                        });
                    }
                } catch (imgErr) {
                    console.error("Error embedding watermark image:", imgErr);
                    toast({ title: "Watermark Error", description: "Could not embed watermark image.", variant: "destructive" });
                }
            }
            pdfLibPage.popGraphicsState();
        }


        if (pageNumberingConfig.enabled) {
            const { width: pnPageWidth, height: pnPageHeight } = pdfLibPage.getSize();
            const currentPageNum = index + pageNumberingConfig.start;
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

  const handleSplitPdf = async () => {
    const selectedPages = pageObjects.filter(p => selectedPageIds.has(p.id));
    if (selectedPages.length === 0) {
      toast({ title: texts.splitPages, description: texts.noPageSelected, variant: "destructive" });
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

      for (const [index, pageObj] of selectedPages.entries()) {
        const { sourceCanvas, rotation } = pageObj;
        const tempRenderCanvas = document.createElement('canvas');
        const tempCtx = tempRenderCanvas.getContext('2d');
        if (!tempCtx) continue;

        const rad = rotation * Math.PI / 180;
        if (rotation % 180 !== 0) {
          tempRenderCanvas.width = sourceCanvas.height;
          tempRenderCanvas.height = sourceCanvas.width;
        } else {
          tempRenderCanvas.width = sourceCanvas.width;
          tempRenderCanvas.height = sourceCanvas.height;
        }

        tempCtx.translate(tempRenderCanvas.width / 2, tempRenderCanvas.height / 2);
        tempCtx.rotate(rad);
        tempCtx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2, sourceCanvas.width, sourceCanvas.height);

        const imgDataUrl = tempRenderCanvas.toDataURL('image/png');
        const pngImage = await pdfDocOut.embedPng(imgDataUrl);
        const pdfLibPage = pdfDocOut.addPage([tempRenderCanvas.width, tempRenderCanvas.height]);
        pdfLibPage.drawImage(pngImage, { x: 0, y: 0, width: tempRenderCanvas.width, height: tempRenderCanvas.height });

        const { width: pageWidth, height: pageHeight } = pdfLibPage.getSize();
        if ((watermarkConfig.type === 'text' && watermarkConfig.text) || (watermarkConfig.type === 'image' && watermarkConfig.imageUrl)) {
            pdfLibPage.pushGraphicsState();
            pdfLibPage.setOpacity(watermarkConfig.opacity);
            if (watermarkConfig.type === 'text' && watermarkConfig.text) {
                const pdfWatermarkFontSize = watermarkConfig.fontSize;
                const textColor = hexToRgb(watermarkConfig.color);
                const textWidth = helveticaFont.widthOfTextAtSize(watermarkConfig.text, pdfWatermarkFontSize);
                const textHeight = helveticaFont.heightAtSize(pdfWatermarkFontSize);
                const wmX_pdf_text = watermarkConfig.leftRatio * pageWidth - textWidth / 2;
                const wmY_pdf_text = pageHeight - (watermarkConfig.topRatio * pageHeight) - textHeight / 2;
                pdfLibPage.drawText(watermarkConfig.text, { x: wmX_pdf_text, y: wmY_pdf_text, font: helveticaFont, size: pdfWatermarkFontSize, color: rgb(textColor.r, textColor.g, textColor.b) });
            } else if (watermarkConfig.type === 'image' && watermarkConfig.imageUrl) {
                try {
                    const imageBytes = await fetch(watermarkConfig.imageUrl).then(res => res.arrayBuffer());
                    let wmEmbedImage;
                    if (watermarkConfig.imageUrl.startsWith('data:image/png')) {
                        wmEmbedImage = await pdfDocOut.embedPng(imageBytes);
                    } else if (watermarkConfig.imageUrl.startsWith('data:image/jpeg') || watermarkConfig.imageUrl.startsWith('data:image/jpg')) {
                        wmEmbedImage = await pdfDocOut.embedJpg(imageBytes);
                    }
                    if (wmEmbedImage) {
                        const { width: imgOriginalWidth, height: imgOriginalHeight } = wmEmbedImage.scale(1);
                        const wmX_pdf_img = watermarkConfig.leftRatio * pageWidth - imgOriginalWidth / 2;
                        const wmY_pdf_img = pageHeight - (watermarkConfig.topRatio * pageHeight) - imgOriginalHeight / 2;
                        pdfLibPage.drawImage(wmEmbedImage, { x: wmX_pdf_img, y: wmY_pdf_img, width: imgOriginalWidth, height: imgOriginalHeight });
                    }
                } catch (imgErr) { console.error("Error embedding watermark image:", imgErr); toast({ title: "Watermark Error", description: "Could not embed watermark image.", variant: "destructive" }); }
            }
            pdfLibPage.popGraphicsState();
        }

        if (pageNumberingConfig.enabled) {
            const { width: pnPageWidth, height: pnPageHeight } = pdfLibPage.getSize();
            const currentPageNum = index + pageNumberingConfig.start;
            const totalNumPages = selectedPages.length;
            let text = pageNumberingConfig.format.replace('{page}', currentPageNum.toString()).replace('{total}', totalNumPages.toString());
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
        await pdfDocOut.encrypt({ userPassword: pdfProtectionConfig.password, ownerPassword: pdfProtectionConfig.password, permissions: {} });
      }

      const pdfBytes = await pdfDocOut.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DocuPilot_split.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: texts.splitPages, description: texts.splitPdfSuccess });
    } catch (err: any) {
      console.error("Split PDF error:", err);
      toast({ title: texts.splitPdfError, description: err.message, variant: "destructive" });
    } finally {
      setIsDownloading(false);
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
      const { newPageObjects: insertPageObjects } = await processPdfFile(file);

      let insertAtIndex = activePageIndex !== null ? activePageIndex + 1 : pageObjects.length;

      const newCombinedPageObjects = [...pageObjects];
      newCombinedPageObjects.splice(insertAtIndex, 0, ...insertPageObjects);
      setPageObjects(newCombinedPageObjects);

      const newActivePageId = insertPageObjects[0]?.id;
      if (newActivePageId) {
        setSelectedPageIds(new Set([newActivePageId]));
      }
      setActivePageIndex(insertAtIndex);

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

  const handleDragMouseDown = (
    event: React.MouseEvent<HTMLElement>,
    type: 'watermark' | 'annotation',
    id: string | null = null
  ) => {
    event.preventDefault();
    const draggedElement = event.currentTarget as HTMLElement;
    const containerElement = (type === 'watermark' ? watermarkPreviewCanvasContainerRef.current : draggedElement.closest('[data-page-index]')) as HTMLElement;
    if (!containerElement) return;

    draggedElement.style.cursor = 'grabbing';
    
    dragDataRef.current = {
      type: type,
      id: id,
      initialMouseX: event.clientX,
      initialMouseY: event.clientY,
      initialElementLeft: draggedElement.offsetLeft,
      initialElementTop: draggedElement.offsetTop,
      containerRect: containerElement.getBoundingClientRect(),
    };

    document.addEventListener('mousemove', handleDragMouseMove);
    document.addEventListener('mouseup', handleDragMouseUp);
  };

  const handleDragMouseMove = useCallback((event: MouseEvent) => {
    if (!dragDataRef.current) return;
    event.preventDefault();

    const {
        type, id, initialMouseX, initialMouseY,
        initialElementLeft, initialElementTop,
        containerRect
    } = dragDataRef.current;

    const deltaX = event.clientX - initialMouseX;
    const deltaY = event.clientY - initialMouseY;

    let newLeftPx = initialElementLeft + deltaX;
    let newTopPx = initialElementTop + deltaY;
    
    const draggedEl = event.target as HTMLElement;
    const elRect = draggedEl.getBoundingClientRect();
    
    newLeftPx = Math.max(0, Math.min(newLeftPx, containerRect.width - elRect.width));
    newTopPx = Math.max(0, Math.min(newTopPx, containerRect.height - elRect.height));

    const newLeftRatio = containerRect.width > 0 ? newLeftPx / containerRect.width : 0;
    const newTopRatio = containerRect.height > 0 ? newTopPx / containerRect.height : 0;

    if (type === 'watermark') {
        setTempWatermarkConfig(prev => ({
            ...prev,
            topRatio: parseFloat(newTopRatio.toFixed(4)),
            leftRatio: parseFloat(newLeftRatio.toFixed(4))
        }));
    } else if (type === 'annotation' && id) {
        setTextAnnotations(prev => prev.map(ann => 
            ann.id === id 
            ? { ...ann, topRatio: newTopRatio, leftRatio: newLeftRatio } 
            : ann
        ));
    }
  }, []);

  const handleDragMouseUp = useCallback((event: MouseEvent) => {
    if (!dragDataRef.current) return;
    event.preventDefault();

    const draggedElement = event.target as HTMLElement;
    if (draggedElement) {
        draggedElement.style.cursor = 'grab';
    }

    document.removeEventListener('mousemove', handleDragMouseMove);
    document.removeEventListener('mouseup', handleDragMouseUp);
    dragDataRef.current = null;
  }, [handleDragMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMouseMove);
      document.removeEventListener('mouseup', handleDragMouseUp);
    };
  }, [handleDragMouseMove, handleDragMouseUp]);


  const openWatermarkPreviewModal = () => {
    if (pageObjects.length === 0) {
        toast({ title: texts.watermarkSectionTitle, description: texts.noPdfForWatermarkPreview, variant: "destructive"});
        return;
    }
    setTempWatermarkConfig(watermarkConfig);
    setIsWatermarkPreviewModalOpen(true);
  };

   useEffect(() => {
    if (isWatermarkPreviewModalOpen && pageObjects.length > 0) {
      const canvas = watermarkPreviewModalCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      const sourceCanvas = pageObjects[0].sourceCanvas;
      if (canvas && ctx && sourceCanvas) {
        const container = watermarkPreviewCanvasContainerRef.current;
        if (container) {
          const scaleFactor = Math.min(
            (container.clientWidth * 0.95) / sourceCanvas.width,
            (container.clientHeight * 0.95) / sourceCanvas.height
          );
          canvas.width = sourceCanvas.width * scaleFactor;
          canvas.height = sourceCanvas.height * scaleFactor;
          ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [isWatermarkPreviewModalOpen, pageObjects]);

  const handleWatermarkImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempWatermarkConfig(prev => ({
          ...prev,
          imageUrl: reader.result as string,
          type: 'image'
        }));
      };
      reader.readAsDataURL(file);
    }
    if (watermarkImageUploadRef.current) watermarkImageUploadRef.current.value = '';
  };


  const confirmWatermarkSettings = () => {
    setWatermarkConfig(tempWatermarkConfig);
    setIsWatermarkPreviewModalOpen(false);
  };

  const handleThumbnailClick = (index: number, event: React.MouseEvent) => {
      if (viewMode === 'editor') {
          setActivePageIndex(index);
          const targetPage = pageRefs.current[index];
          if (targetPage) {
              targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
      } else {
          const clickedId = pageObjects[index].id;
          if (event.metaKey || event.ctrlKey) {
              setSelectedPageIds(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(clickedId)) {
                      newSet.delete(clickedId);
                  } else {
                      newSet.add(clickedId);
                  }
                  return newSet;
              });
          } else {
              setSelectedPageIds(new Set([clickedId]));
          }
      }
  };

    const handleRotatePage = (direction: 'cw' | 'ccw') => {
        if (activePageIndex === null) return;
        setPageObjects(prev => prev.map((page, index) => {
            if (index === activePageIndex) {
                const newRotation = (page.rotation + (direction === 'cw' ? 90 : -90) + 360) % 360;
                return { ...page, rotation: newRotation };
            }
            return page;
        }));
    };

    const handleAddBlankPage = () => {
        const blankCanvas = document.createElement('canvas');
        
        if (pageObjects.length > 0 && pageObjects[0].sourceCanvas) {
            blankCanvas.width = pageObjects[0].sourceCanvas.width;
            blankCanvas.height = pageObjects[0].sourceCanvas.height;
        } else {
            blankCanvas.width = 595 * 2;
            blankCanvas.height = 842 * 2;
        }

        const ctx = blankCanvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, blankCanvas.width, blankCanvas.height);
        }
        const newPageObject: PageObject = { id: uuidv4(), sourceCanvas: blankCanvas, rotation: 0 };

        const insertAt = (activePageIndex === null ? pageObjects.length - 1 : activePageIndex) + 1;

        setPageObjects(prev => {
            const newPages = [...prev];
            newPages.splice(insertAt, 0, newPageObject);
            return newPages;
        });

        setActivePageIndex(insertAt);
        setSelectedPageIds(new Set([newPageObject.id]));
        
        setTimeout(() => {
            const newPageElement = pageRefs.current[insertAt];
            if (newPageElement) {
                newPageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const handleAddTextAnnotation = () => {
      if (activePageIndex === null) {
          toast({ title: texts.toolInsertText, description: texts.noPageSelected, variant: "destructive" });
          return;
      }
      const newAnnotation: TextAnnotation = {
          id: uuidv4(),
          pageIndex: activePageIndex,
          text: texts.textAnnotationSample,
          topRatio: 0.5,
          leftRatio: 0.5,
          fontSize: 24,
          color: '#000000',
      };
      setTextAnnotations(prev => [...prev, newAnnotation]);
      setSelectedAnnotationId(newAnnotation.id);
    };
    
    const updateSelectedAnnotation = (prop: keyof TextAnnotation, value: any) => {
        if (!selectedAnnotationId) return;
        setTextAnnotations(prev => prev.map(ann => 
            ann.id === selectedAnnotationId ? { ...ann, [prop]: value } : ann
        ));
    };

    const selectedAnnotation = textAnnotations.find(ann => ann.id === selectedAnnotationId);


    const handlePlaceholderClick = (featureName: string) => {
        toast({
            title: texts.comingSoon,
            description: `${featureName} ${texts.featureNotImplemented}`
        });
    };

    const handleZoom = (direction: 'in' | 'out') => {
      const ZOOM_STEP = 0.1;
      setMainCanvasZoom(prev => {
        let newZoom = direction === 'in' ? prev + ZOOM_STEP : prev - ZOOM_STEP;
        return Math.max(0.1, Math.min(newZoom, 5));
      });
    };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      {(isLoading || isDownloading || isConvertingToWord || isConvertingImagesToPdf || isCompressingPdf) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">
            {isLoading ? loadingMessage :
             isConvertingToWord ? texts.convertingToWord :
             isDownloading ? texts.generatingFile :
             isConvertingImagesToPdf ? texts.generatingPdfFromImages :
             isCompressingPdf ? texts.compressingPdf : ''}
          </p>
        </div>
      )}

      {isWatermarkPreviewModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="watermark-preview-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setIsWatermarkPreviewModalOpen(false)}
        >
          <div
            className="bg-card text-card-foreground shadow-2xl rounded-lg w-[90vw] max-w-6xl h-[90vh] flex flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div
                ref={watermarkPreviewCanvasContainerRef}
                className="flex-grow p-4 overflow-auto bg-muted/20 flex justify-center items-center relative"
            >
              <canvas
                ref={watermarkPreviewModalCanvasRef}
                className="max-w-full max-h-full object-contain shadow-md"
              />

              {watermarkPreviewCanvasContainerRef.current && (
                <>
                {tempWatermarkConfig.type === 'text' && tempWatermarkConfig.text && (
                    <div
                    onMouseDown={(e) => handleDragMouseDown(e, 'watermark')}
                    style={{
                        position: 'absolute',
                        top: `${tempWatermarkConfig.topRatio * 100}%`,
                        left: `${tempWatermarkConfig.leftRatio * 100}%`,
                        transform: `translate(-50%, -50%)`,
                        fontSize: `${Math.max(8, tempWatermarkConfig.fontSize * (watermarkPreviewModalCanvasRef.current?.height || 600) / 842 / 2 )}px`,
                        color: tempWatermarkConfig.color,
                        opacity: tempWatermarkConfig.opacity,
                        cursor: 'grab',
                        padding: '3px 5px',
                        backgroundColor: 'rgba(200,200,200,0.2)',
                        border: '1px dashed gray',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                    }}
                    className="draggable-watermark-modal"
                    >
                    {tempWatermarkConfig.text}
                    </div>
                )}
                {tempWatermarkConfig.type === 'image' && tempWatermarkConfig.imageUrl && (
                    <img
                    src={tempWatermarkConfig.imageUrl}
                    alt="Watermark"
                    onMouseDown={(e) => handleDragMouseDown(e, 'watermark')}
                    style={{
                        position: 'absolute',
                        top: `${tempWatermarkConfig.topRatio * 100}%`,
                        left: `${tempWatermarkConfig.leftRatio * 100}%`,
                        transform: `translate(-50%, -50%)`,
                        opacity: tempWatermarkConfig.opacity,
                        cursor: 'grab',
                        maxWidth: '200px',
                        maxHeight: '200px',
                        userSelect: 'none',
                        zIndex: 10,
                        objectFit: 'contain',
                        border: '1px dashed gray',
                    }}
                    className="draggable-watermark-modal"
                    />
                )}
                </>
              )}
            </div>
            <div className="w-80 flex-shrink-0 p-4 border-l space-y-4 overflow-y-auto">
                <h2 id="watermark-preview-title" className="text-lg font-semibold">{texts.watermarkPreviewModalTitle}</h2>
                <p className="text-sm text-muted-foreground">{texts.watermarkPreviewInfo}</p>
                <Separator />
                
                <RadioGroup value={tempWatermarkConfig.type} onValueChange={(value) => setTempWatermarkConfig(p => ({...p, type: value as 'text' | 'image'}))} className="flex space-x-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="text" id="r1-modal" /><Label htmlFor="r1-modal">{texts.watermarkTypeText}</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="image" id="r2-modal" /><Label htmlFor="r2-modal">{texts.watermarkTypeImage}</Label></div>
                </RadioGroup>

                {tempWatermarkConfig.type === 'text' ? (
                  <>
                    <div>
                        <Label htmlFor="modalWatermarkText" className="text-sm font-medium">{texts.watermarkInputPlaceholder}</Label>
                        <Input
                            id="modalWatermarkText"
                            type="text"
                            value={tempWatermarkConfig.text}
                            onChange={(e) => setTempWatermarkConfig(prev => ({...prev, text: e.target.value}))}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="modalWatermarkFontSize" className="text-sm font-medium">{texts.watermarkFontSizeLabel} (pt for PDF)</Label>
                        <Input
                            id="modalWatermarkFontSize"
                            type="number"
                            value={tempWatermarkConfig.fontSize}
                            onChange={(e) => setTempWatermarkConfig(prev => ({...prev, fontSize: parseInt(e.target.value, 10) || 20}))}
                            min="8"
                            max="200"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="modalWatermarkColor" className="text-sm font-medium">{texts.watermarkColorLabel}</Label>
                        <Input
                            id="modalWatermarkColor"
                            type="color"
                            value={tempWatermarkConfig.color}
                            onChange={(e) => setTempWatermarkConfig(prev => ({...prev, color: e.target.value}))}
                            className="mt-1 h-10 w-full"
                        />
                    </div>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => watermarkImageUploadRef.current?.click()} className="w-full">{texts.watermarkImageLabel}</Button>
                    <Input type="file" accept="image/png,image/jpeg" ref={watermarkImageUploadRef} onChange={handleWatermarkImageFileChange} className="hidden"/>
                    {tempWatermarkConfig.imageUrl && <img src={tempWatermarkConfig.imageUrl} alt="watermark" className="max-w-full h-auto rounded-md border p-1"/>}
                  </>
                )}
                
                 <div>
                    <Label htmlFor="modalWatermarkOpacity" className="text-sm font-medium">{texts.watermarkOpacityLabel} ({Math.round(tempWatermarkConfig.opacity * 100)}%)</Label>
                    <Slider
                        id="modalWatermarkOpacity"
                        min={0} max={1} step={0.01}
                        value={[tempWatermarkConfig.opacity]}
                        onValueChange={(value) => setTempWatermarkConfig(prev => ({...prev, opacity: value[0]}))}
                        className="mt-1"
                    />
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsWatermarkPreviewModalOpen(false)}>{texts.cancel}</Button>
                  <Button onClick={confirmWatermarkSettings}>{texts.watermarkConfirmPosition}</Button>
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

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
            <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{texts.deletePageConfirmTitle}</ShadAlertDialogTitle>
            <AlertDialogDescription>
                {texts.deletePageConfirmDescription}
            </AlertDialogDescription>
            </ShadAlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeletePages()}>{texts.confirm}</AlertDialogAction>
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

      <header className="p-4 border-b bg-card sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary flex items-center">
              <MenuSquare className="mr-2 h-6 w-6"/> {texts.pageTitle}
            </h1>

            {pageObjects.length > 0 && (
                <div className='flex items-center gap-2'>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === 'editor' ? 'grid' : 'editor')}
                        title={viewMode === 'editor' ? texts.gridMode : texts.editorMode}
                    >
                        {viewMode === 'editor' ? <LayoutGrid className='h-4 w-4 mr-2' /> : <PanelLeft className='h-4 w-4 mr-2' />}
                        {viewMode === 'editor' ? texts.gridMode : texts.editorMode}
                    </Button>
                    <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                        <Download className="mr-2 h-4 w-4" />
                        {texts.downloadPdf}
                    </Button>
                </div>
            )}

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

      <main className="flex-grow flex overflow-hidden">
        {pageObjects.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-4 space-y-8">
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
          ) : viewMode === 'grid' ? (
              <div ref={mainViewContainerRef} className="flex-grow p-6 overflow-y-auto">
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-xl"><Shuffle className="mr-2 h-5 w-5 text-primary" /> {texts.pageManagement}</CardTitle>
                      <CardDescription>
                        {pageObjects.length} {texts.pagesLoaded}.
                        {selectedPageIds.size > 0 ? ` ${selectedPageIds.size} ${texts.pageSelectedSuffix}.` : ''}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSplitPdf} variant="outline" size="sm" disabled={selectedPageIds.size === 0}>
                        <Scissors className="mr-2 h-4 w-4" /> {texts.splitPages}
                      </Button>
                      <Button onClick={() => { setPageToDelete(null); setIsDeleteConfirmOpen(true); }} variant="destructive" size="sm" disabled={selectedPageIds.size === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> {texts.deletePages}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      id="previewContainer"
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-1 bg-muted/20 rounded-md min-h-[200px]"
                    >
                      {pageObjects.map((pageObj, index) => (
                        <PagePreviewItem
                          key={pageObj.id}
                          pageObj={pageObj}
                          index={index}
                          isSelected={selectedPageIds.has(pageObj.id)}
                          onClick={(e) => handleThumbnailClick(index, e)}
                          onDoubleClick={() => {
                            setActivePageIndex(index);
                            setViewMode('editor');
                          }}
                          watermarkConfig={watermarkConfig}
                          texts={texts}
                        />
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground space-y-1">
                      <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> {texts.instSelect}</p>
                      <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> {texts.instDrag}</p>
                      <p><Info className="inline h-4 w-4 mr-1 text-primary/80" /> Double-click page to enter editor mode.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
          ) : (
            <>
                <div ref={thumbnailContainerRef} className="w-[13%] border-r bg-card flex-shrink-0 overflow-y-auto p-2 space-y-2">
                    {pageObjects.map((page, index) => {
                        const isActive = activePageIndex === index;
                        return (
                           <div key={page.id}
                                ref={el => thumbnailRefs.current[index] = el}
                                data-id={page.id}
                                onClick={(e) => handleThumbnailClick(index, e)}
                                className={cn(
                                    "p-1 rounded-md cursor-pointer border-2",
                                    isActive ? "border-primary" : "border-transparent"
                                )}>
                                <canvas
                                    ref={canvas => {
                                        if (canvas) {
                                            const ctx = canvas.getContext('2d');
                                            if (!ctx) return;
                                            const source = page.sourceCanvas;
                                            const aspectRatio = source.width / source.height;
                                            canvas.width = 100;
                                            canvas.height = 100 / aspectRatio;
                                            const sourceAspectRatio = source.width / source.height;
                                            const thumbAspectRatio = canvas.width / canvas.height;
                                            let drawWidth = canvas.width;
                                            let drawHeight = canvas.height;
                                            let x = 0;
                                            let y = 0;

                                            if(sourceAspectRatio > thumbAspectRatio){
                                                drawHeight = drawWidth / sourceAspectRatio;
                                                y = (canvas.height - drawHeight) / 2;
                                            } else {
                                                drawWidth = drawHeight * sourceAspectRatio;
                                                x = (canvas.width - drawWidth) / 2;
                                            }

                                            ctx.clearRect(0,0,canvas.width, canvas.height);
                                            ctx.drawImage(source, x, y, drawWidth, drawHeight);
                                        }
                                    }}
                                    className="w-full h-auto rounded-sm shadow-md bg-white"
                                />
                               <p className='text-center text-xs mt-1 text-muted-foreground'>{texts.page} {index + 1}</p>
                           </div>
                        )
                    })}
                </div>

                <div ref={mainViewContainerRef} className="flex-grow bg-muted/30 overflow-y-auto flex flex-col items-center p-4 space-y-4 relative">
                    {pageObjects.map((page, index) => {
                        const {sourceCanvas, rotation} = page;
                        const srcWidth = sourceCanvas.width;
                        const srcHeight = sourceCanvas.height;

                        let bufferWidth, bufferHeight;
                        if (rotation % 180 !== 0) {
                            bufferWidth = srcHeight * mainCanvasZoom;
                            bufferHeight = srcWidth * mainCanvasZoom;
                        } else {
                            bufferWidth = srcWidth * mainCanvasZoom;
                            bufferHeight = srcHeight * mainCanvasZoom;
                        }

                        return (
                            <div key={page.id} ref={el => pageRefs.current[index] = el} data-page-index={index} className="shadow-lg bg-white relative">
                                <canvas
                                  ref={canvas => {
                                      if (canvas) {
                                          const ctx = canvas.getContext('2d');
                                          if (!ctx) return;
                                          canvas.width = bufferWidth;
                                          canvas.height = bufferHeight;
                                          ctx.save();
                                          ctx.fillStyle = 'white';
                                          ctx.fillRect(0,0,canvas.width, canvas.height);
                                          ctx.translate(canvas.width / 2, canvas.height / 2);
                                          ctx.rotate(rotation * Math.PI / 180);
                                          
                                          const rotatedSrcWidth = rotation % 180 !== 0 ? srcHeight : srcWidth;
                                          const rotatedSrcHeight = rotation % 180 !== 0 ? srcWidth : srcHeight;

                                          const scale = mainCanvasZoom;
                                          const drawWidth = srcWidth * scale;
                                          const drawHeight = srcHeight * scale;

                                          ctx.drawImage(
                                              sourceCanvas,
                                              -drawWidth/2, -drawHeight/2,
                                              drawWidth, drawHeight
                                          );
                                          ctx.restore();
                                      }
                                  }}
                                />
                                {textAnnotations.filter(ann => ann.pageIndex === index).map(ann => (
                                    <div
                                        key={ann.id}
                                        onMouseDown={(e) => handleDragMouseDown(e, 'annotation', ann.id)}
                                        onClick={() => setSelectedAnnotationId(ann.id)}
                                        style={{
                                            position: 'absolute',
                                            left: `${ann.leftRatio * 100}%`,
                                            top: `${ann.topRatio * 100}%`,
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: `${ann.fontSize * mainCanvasZoom}px`,
                                            color: ann.color,
                                            border: selectedAnnotationId === ann.id ? '1px dashed blue' : '1px solid transparent',
                                            cursor: 'grab',
                                            userSelect: 'none',
                                            padding: '2px',
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {ann.text}
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                    <div className="sticky bottom-4 mx-auto bg-card p-2 rounded-full shadow-lg flex items-center gap-1 border">
                        <Button variant="ghost" size="icon" onClick={() => handleZoom('out')} title={texts.zoomOut}><ZoomOut className="h-5 w-5" /></Button>
                        <div className="w-20 text-center text-sm font-medium tabular-nums text-foreground" title="Current zoom">{`${Math.round(mainCanvasZoom * 100)}%`}</div>
                        <Button variant="ghost" size="icon" onClick={() => handleZoom('in')} title={texts.zoomIn}><ZoomIn className="h-5 w-5" /></Button>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button variant="ghost" size="icon" onClick={handleFitPage} title={texts.fitToPage}><Expand className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleFitToWidth} title={texts.fitToWidth}><Columns className="h-5 w-5" /></Button>
                    </div>
                </div>

                <div className="w-[17%] border-l bg-card flex-shrink-0 p-4 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                        <ToolbarButton icon={RotateCw} label={texts.toolRotate} onClick={() => handleRotatePage('cw')} disabled={activePageIndex === null}/>
                        <ToolbarButton icon={Trash2} label={texts.toolDelete} onClick={() => { if(activePageIndex !== null) { setPageToDelete(activePageIndex); setIsDeleteConfirmOpen(true); } }} disabled={activePageIndex === null}/>
                        <ToolbarButton icon={FilePlus2} label={texts.toolAddBlank} onClick={handleAddBlankPage} />
                        <ToolbarButton icon={Combine} label={texts.toolMerge} onClick={() => insertPdfRef.current?.click()} />
                        <ToolbarButton icon={Scissors} label={texts.toolSplit} onClick={handleSplitPdf} disabled={selectedPageIds.size === 0}/>
                        <ToolbarButton icon={Droplet} label={texts.toolWatermark} onClick={openWatermarkPreviewModal} disabled={pageObjects.length === 0} />
                        <ToolbarButton icon={Type} label={texts.toolInsertText} onClick={handleAddTextAnnotation} disabled={activePageIndex === null}/>
                        <ToolbarButton icon={ImagePlus} label={texts.toolInsertImage} onClick={() => handlePlaceholderClick("Insert Image")} disabled={activePageIndex === null}/>
                        <ToolbarButton icon={LinkIcon} label={texts.toolInsertLink} onClick={() => handlePlaceholderClick("Insert Link")} disabled={activePageIndex === null}/>
                        <ToolbarButton icon={MessageSquarePlus} label={texts.toolInsertComment} onClick={() => handlePlaceholderClick("Insert Comment")} disabled={activePageIndex === null}/>
                    </div>
                     <Input
                        type="file"
                        id="insertPdfInput"
                        accept="application/pdf"
                        onChange={handleInsertPdfFileSelected}
                        ref={insertPdfRef}
                        className="hidden"
                     />
                     <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>{texts.watermarkSectionTitle}</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                               <p className="text-sm text-muted-foreground">{currentLanguage === 'zh' ? '在此設定全域浮水印。點擊下方按鈕以預覽並定位。' : 'Configure global watermark. Click below to preview and position.'}</p>
                                <Button onClick={openWatermarkPreviewModal} disabled={pageObjects.length === 0} className="w-full">{texts.watermarkPreviewButton}</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" disabled={!selectedAnnotation}>
                            <AccordionTrigger>{texts.textProperties}</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                {selectedAnnotation ? (
                                    <>
                                        <div>
                                            <Label htmlFor="textAnnotationContent">{texts.textAnnotationContent}</Label>
                                            <Textarea id="textAnnotationContent" value={selectedAnnotation.text} onChange={(e) => updateSelectedAnnotation('text', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label htmlFor="textAnnotationFontSize">{texts.watermarkFontSizeLabel}</Label>
                                            <Input id="textAnnotationFontSize" type="number" value={selectedAnnotation.fontSize} onChange={(e) => updateSelectedAnnotation('fontSize', parseInt(e.target.value, 10))} />
                                        </div>
                                        <div>
                                            <Label htmlFor="textAnnotationColor">{texts.watermarkColorLabel}</Label>
                                            <Input id="textAnnotationColor" type="color" value={selectedAnnotation.color} onChange={(e) => updateSelectedAnnotation('color', e.target.value)} className="h-10 w-full" />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">{currentLanguage === 'zh' ? '請先在頁面上選擇一個文字方塊以編輯屬性。' : 'Select a text box on the page to edit its properties.'}</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                     </Accordion>
                </div>
            </>
          )}
      </main>
    </div>
  );
}
