
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb, degrees, grayscale, pushGraphicsState, popGraphicsState, setOpacity, layoutMultilineText, PDFFont, BlendMode } from 'pdf-lib';
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
import { Loader2, RotateCcw, RotateCw, X, Trash2, Download, Upload, Info, Shuffle, Search, Edit3, Droplet, LogIn, LogOut, UserCircle, FileText, Lock, MenuSquare, Columns, ShieldCheck, FilePlus, ListOrdered, Move, CheckSquare, Image as ImageIcon, Minimize2, Palette, FontSize, Eye, Scissors, LayoutGrid, PanelLeft, FilePlus2, Combine, Type, ImagePlus, Link as LinkIcon, MessageSquarePlus, ZoomIn, ZoomOut, Expand, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Highlighter, ArrowRightLeft, Edit, FileUp, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, XCircle, File } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { cn } from '@/lib/utils';


if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageObject {
  id: string;
  sourceCanvas: HTMLCanvasElement;
  rotation: number; // 0, 90, 180, 270
}

interface LinkAnnotationDef {
  type: 'url' | 'page';
  value: string; // URL string or page number as a string
}

interface TextAnnotation {
  id: string;
  pageIndex: number;
  text: string;
  topRatio: number;
  leftRatio: number;
  widthRatio: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  link?: LinkAnnotationDef;
}

interface ImageAnnotation {
    id: string;
    pageIndex: number;
    dataUrl: string;
    topRatio: number;
    leftRatio: number;
    widthRatio: number;
    heightRatio: number;
    aspectRatio: number;
    link?: LinkAnnotationDef;
}

interface HighlightAnnotation {
  id: string;
  pageIndex: number;
  topRatio: number;
  leftRatio: number;
  widthRatio: number;
  heightRatio: number;
  color: string;
}

const translations = {
    en: {
        pageTitle: 'PDF Editor (Pro Mode)',
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
        pageNumberingSectionTitle: 'Page Numbering',
        enablePageNumbering: 'Enable Page Numbering',
        pageNumberPosition: 'Position',
        pageNumberStart: 'Start Number',
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
        toolHighlight: 'Highlight',
        toolInsertLink: 'Insert Link',
        toolInsertComment: 'Comment',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        fitToWidth: 'Fit to Width',
        fitToPage: 'Fit to Page',
        textAnnotationSample: 'Sample Text',
        noImageForInsertion: 'No image selected for insertion.',
        imageInsertSuccess: 'Image inserted successfully.',
        imageInsertError: 'Error inserting image.',
        imagePasteSuccess: 'Image pasted successfully.',
        linkSetUrl: 'Link to URL',
        linkSetPage: 'Link to Page',
        linkEnterUrl: 'Enter URL',
        linkEnterPage: 'Enter Page Number',
        linkSave: 'Save Link',
        linkRemove: 'Remove Link',
        linkEditTitle: 'Edit Link',
        linkAttached: 'Link attached',
        linkRemoved: 'Link removed',
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
        pptToPdf: 'PPT to PDF',
        htmlToPdf: 'HTML to PDF',
        jpgToPdf: 'JPG to Image',
        pdfToWord: 'PDF to WORD',
        pdfToExcel: 'PDF to EXCEL',
        pdfToPpt: 'PDF to PPT',
        pdfToHtml: 'PDF to HTML',
        pdfToJpg: 'PDF to Image',
        pdfToOcr: 'PDF with OCR',
        proMode: 'Professional Mode',
        appTitle: 'Pdf Solution',
        batchConvert: 'Batch Conversion',
        selectFormat: 'Select Target Format',
        uploadAreaTitle: 'Upload PDF Files for Batch Conversion',
        uploadButton: 'Click or drag up to 5 files here',
        convertButton: 'Convert All Files',
        convertingMessage: 'Converting...',
        noFilesSelected: 'Please select files to convert.',
        tooManyFiles: 'You can only select up to 5 files at a time.',
        invalidFileError: 'Some files were not valid PDFs and were removed.',
        status_waiting: 'Waiting',
        status_uploading: 'Uploading...',
        status_converting: 'Converting...',
        status_done: 'Done!',
        status_error: 'Error',
        dailyLimitTitle: 'Daily Limit Reached',
        dailyLimitDescription: 'Your free uses for today have been exhausted. Please register or come back tomorrow.',
        convertLimitTitle: 'Conversion Limit Reached',
        convertLimitDescription: 'Your free conversion for today has been used. Register to get 3 conversions daily.',
    },
    zh: {
        pageTitle: 'PDF 編輯器 (專業模式)',
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
        resetRotation: '重置旋轉与縮放',
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
        pageNumberingSectionTitle: '頁碼',
        enablePageNumbering: '啟用頁碼',
        pageNumberPosition: '位置',
        pageNumberStart: '起始號碼',
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
        comingSoon: '即將推出！',
        featureNotImplemented: '功能尚未實現。',
        editorMode: '編輯模式',
        gridMode: '縮圖模式',
        deletePageConfirmTitle: '刪除頁面？',
        deletePageConfirmDescription: '您確定要刪除此頁面嗎？此操作無法復原。',
        toolRotate: '旋轉',
        toolDelete: 'Delete',
        toolAddBlank: '新增空白',
        toolMerge: '合併',
        toolSplit: '拆分',
        toolWatermark: '浮水印',
        toolInsertText: '插入文字',
        toolInsertImage: '插入圖片',
        toolHighlight: '螢光筆',
        toolInsertLink: '插入連結',
        toolInsertComment: '註解',
        zoomIn: '放大',
        zoomOut: '縮小',
        fitToWidth: '符合頁寬',
        fitToPage: '符合頁面',
        textAnnotationSample: '範例文本',
        noImageForInsertion: '未選擇要插入的圖片。',
        imageInsertSuccess: '圖片插入成功。',
        imageInsertError: '圖片插入失敗。',
        imagePasteSuccess: '圖片貼上成功。',
        linkSetUrl: '連結到網址',
        linkSetPage: '連結到頁碼',
        linkEnterUrl: '輸入網址',
        linkEnterPage: '輸入頁碼',
        linkSave: '儲存連結',
        linkRemove: '移除連結',
        linkEditTitle: '編輯連結',
        linkAttached: '連結已附加',
        linkRemoved: '連結已移除',
        pdfEditMenu: 'PDF編輯',
        pdfConvertMenu: 'PDF轉換',
        mergePdf: '合併PDF',
        splitPdf: '拆分PDF',
        deletePdfPages: '刪除頁面',
        extractPdfPages: '擷取頁面',
        reorderPdfPages: '變換順序',
        addWatermark: '添加浮水印',
        convertToPdf: '轉換為PDF',
        convertFromPdf: '從PDF轉換',
        wordToPdf: 'WORD轉PDF',
        excelToPdf: 'EXCEL轉PDF',
        pptToPdf: 'PPT轉PDF',
        htmlToPdf: 'HTML轉PDF',
        jpgToPdf: 'JPG轉PDF',
        pdfToWord: 'PDF轉WORD',
        pdfToExcel: 'PDF轉EXCEL',
        pdfToPpt: 'PDF轉PPT',
        pdfToHtml: 'PDF轉HTML',
        pdfToJpg: 'PDF轉圖片',
        pdfToOcr: 'PDF光學掃描(OCR)',
        proMode: '專業模式',
        appTitle: 'Pdf Solution',
        batchConvert: '批次轉換',
        selectFormat: '選擇目標格式',
        uploadAreaTitle: '上傳 PDF 檔案以進行批次轉換',
        uploadButton: '點擊或拖曳最多 5 個檔案到此處',
        convertButton: '轉換所有檔案',
        convertingMessage: '轉換中...',
        noFilesSelected: '請選擇要轉換的檔案。',
        tooManyFiles: '一次最多只能選擇 5 個檔案。',
        invalidFileError: '部分檔案不是有效的 PDF，已被移除。',
        status_waiting: '等待中',
        status_uploading: '上傳中...',
        status_converting: '轉換中...',
        status_done: '完成！',
        status_error: '錯誤',
        dailyLimitTitle: '每日次數已用完',
        dailyLimitDescription: '您今日的免費使用次數已用完，請註冊或明天再來試。',
        convertLimitTitle: '轉檔次數已用完',
        convertLimitDescription: '您今日的免費轉檔次數已用完，註冊即可獲得每日 3 次轉換。',
    }
};

type PageNumberPosition = 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right';

const pageNumberPositions: {value: PageNumberPosition, labelKey: keyof typeof translations.en}[] = [
  { value: 'bottom-center', labelKey: 'bottomCenter'},
  { value: 'bottom-left', labelKey: 'bottomLeft'},
  { value: 'bottom-right', labelKey: 'bottomRight'},
  { value: 'top-center', labelKey: 'topCenter'},
  { value: 'top-left', labelKey: 'topLeft'},
  { value: 'top-right', labelKey: 'topRight'},
];

const formatOptions = [
  { value: 'word', labelKey: 'pdfToWord', extension: 'docx' },
  { value: 'excel', labelKey: 'pdfToExcel', extension: 'xlsx' },
  { value: 'ppt', labelKey: 'pdfToPpt', extension: 'pptx' },
  { value: 'html', labelKey: 'pdfToHtml', extension: 'html' },
  { value: 'image', labelKey: 'pdfToJpg', extension: 'zip' },
  { value: 'ocr', labelKey: 'pdfToOcr', extension: 'pdf' },
] as const;

type UploadStatus = {
    status: 'waiting' | 'uploading' | 'converting' | 'done' | 'error';
    progress: number;
    error?: string;
};

const MAX_FILES = 5;

interface PagePreviewItemProps {
  pageObj: PageObject;
  index: number;
  isSelected: boolean;
  onClick: (event: React.MouseEvent) => void;
  onDoubleClick: () => void;
  texts: typeof translations.en;
}

const PagePreviewItem = React.memo(({
  pageObj, index, isSelected, onClick, onDoubleClick, texts
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
    </div>
  );
});
PagePreviewItem.displayName = 'PagePreviewItem';

const ToolbarButton = ({ icon: Icon, label, onClick, disabled = false, popoverContent }: { icon: React.ElementType, label: string, onClick?: () => void, disabled?: boolean, popoverContent?: React.ReactNode }) => {
    const button = (
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

    if (popoverContent) {
        return (
            <Popover>
                <PopoverTrigger asChild disabled={disabled}>{button}</PopoverTrigger>
                <PopoverContent className="w-80" side="left" align="start">
                    {popoverContent}
                </PopoverContent>
            </Popover>
        )
    }

    return button;
};

const fonts = [
  { name: 'Arial', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times-Roman' },
  { name: 'Courier', value: 'Courier' },
];

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

const TextAnnotationToolbar = ({ annotation, onAnnotationChange, onDelete }: { annotation: TextAnnotation; onAnnotationChange: (annotation: TextAnnotation) => void; onDelete: (id: string) => void; }) => {
    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-card p-2 rounded-lg shadow-lg border flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
            <Select value={annotation.fontFamily} onValueChange={(value) => onAnnotationChange({ ...annotation, fontFamily: value })}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                    {fonts.map(font => <SelectItem key={font.value} value={font.value} className="text-xs">{font.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={String(annotation.fontSize)} onValueChange={(value) => onAnnotationChange({ ...annotation, fontSize: Number(value) })}>
                <SelectTrigger className="w-[60px] h-8 text-xs">
                    <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                    {fontSizes.map(size => <SelectItem key={size} value={String(size)} className="text-xs">{size}</SelectItem>)}
                </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6" />
            <Toggle pressed={annotation.bold} onPressedChange={(pressed) => onAnnotationChange({ ...annotation, bold: pressed })}>
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle pressed={annotation.italic} onPressedChange={(pressed) => onAnnotationChange({ ...annotation, italic: pressed })}>
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle pressed={annotation.underline} onPressedChange={(pressed) => onAnnotationChange({ ...annotation, underline: pressed })}>
                <Underline className="h-4 w-4" />
            </Toggle>
            <Separator orientation="vertical" className="h-6" />
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: annotation.color }} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Input type="color" value={annotation.color} onChange={(e) => onAnnotationChange({ ...annotation, color: e.target.value })} className="w-full h-10 p-1 border-0" />
                </PopoverContent>
            </Popover>
            <Separator orientation="vertical" className="h-6" />
            <ToggleGroup type="single" value={annotation.textAlign} onValueChange={(value: TextAnnotation['textAlign']) => value && onAnnotationChange({ ...annotation, textAlign: value })}>
                <ToggleGroupItem value="left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(annotation.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

const TextAnnotationComponent = ({
    annotation,
    mainCanvasZoom,
    isSelected,
    isEditing,
    onAnnotationChange,
    onWrapperClick,
    onDoubleClick,
    onDragStart,
    onResizeStart,
}: {
    annotation: TextAnnotation,
    mainCanvasZoom: number,
    isSelected: boolean,
    isEditing: boolean,
    onAnnotationChange: (annotation: TextAnnotation) => void,
    onWrapperClick: (id: string, e: React.MouseEvent) => void,
    onDoubleClick: (id: string, e: React.MouseEvent) => void,
    onDragStart: (e: React.MouseEvent, id: string) => void,
    onResizeStart: (e: React.MouseEvent, id: string) => void,
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [annotation.text, annotation.fontSize, annotation.widthRatio, mainCanvasZoom, annotation.fontFamily, annotation.bold, annotation.italic, annotation.textAlign]);


    return (
        <div
            onMouseDown={(e) => {
                if (!isEditing) onDragStart(e, annotation.id)
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (isEditing) return;
                onWrapperClick(annotation.id, e);
            }}
            onDoubleClick={(e) => onDoubleClick(annotation.id, e)}
            className={cn(
                "absolute group/text-annotation",
                !isEditing && "cursor-grab",
                isSelected && !isEditing && "border-2 border-dashed border-primary",
                annotation.link && !isEditing && "border-2 border-dashed border-blue-500"
            )}
            style={{
                left: `${annotation.leftRatio * 100}%`,
                top: `${annotation.topRatio * 100}%`,
                width: `${annotation.widthRatio * 100}%`,
                height: 'auto',
                zIndex: 20,
            }}
        >
           <Textarea
                ref={textareaRef}
                value={annotation.text}
                onChange={(e) => onAnnotationChange({ ...annotation, text: e.target.value })}
                onClick={(e) => {
                    if (isEditing) e.stopPropagation();
                }}
                disabled={!isEditing}
                className={cn(
                    "w-full p-0 bg-transparent border-0 resize-none focus:ring-0 overflow-hidden",
                    isEditing ? "cursor-text pointer-events-auto" : "pointer-events-none"
                )}
                style={{
                    fontFamily: annotation.fontFamily.includes('Times') ? '"Times New Roman", Times, serif' : annotation.fontFamily,
                    fontSize: `${annotation.fontSize * mainCanvasZoom}px`,
                    fontWeight: annotation.bold ? 'bold' : 'normal',
                    fontStyle: annotation.italic ? 'italic' : 'normal',
                    textDecoration: annotation.underline ? 'underline' : 'none',
                    color: annotation.color,
                    textAlign: annotation.textAlign,
                    lineHeight: 1.3,
                }}
            />
            {annotation.link && !isEditing && <LinkIcon className="absolute -top-1.5 -right-1.5 h-4 w-4 text-white bg-blue-500 p-0.5 rounded-full" />}
            {isSelected && !isEditing && (
                <div
                    className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize"
                    onMouseDown={(e) => onResizeStart(e, annotation.id)}
                />
            )}
        </div>
    );
}


export default function PdfEditorPage() {
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
  
  const [isInsertConfirmOpen, setIsInsertConfirmOpen] = useState(false);
  const [pendingInsertFile, setPendingInsertFile] = useState<File | null>(null);
  
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);

  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const [highlightAnnotations, setHighlightAnnotations] = useState<HighlightAnnotation[]>([]);
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);
  
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<LinkAnnotationDef>({ type: 'url', value: '' });

  const dragStartRef = useRef({ x: 0, y: 0, initialLeft: 0, initialTop: 0, initialWidth: 0, initialHeight: 0 });
  const isDraggingRef = useRef(false);

  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [guestLimitModalContent, setGuestLimitModalContent] = useState({ title: '', description: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Batch Conversion State
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('word');
  const [isConverting, setIsConverting] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<{ [fileName: string]: UploadStatus }>({});
  const batchFileUploadRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);

      // Initialize daily quotas if it's a new day
      const today = new Date().toISOString().split('T')[0];
      const lastUsed = localStorage.getItem('pdfLastUsed');
      if (lastUsed !== today) {
        localStorage.setItem('pdfDailyCount', '5');
        localStorage.setItem('pdfConvertCount', '1');
        localStorage.setItem('pdfLastUsed', today);
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
        block: 'nearest',
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
    const handlePlaceholderClick = (featureName: string) => {
    toast({
        title: texts.comingSoon,
        description: `${featureName} ${texts.featureNotImplemented}`
    });
  };

  const checkAndDecrementQuota = useCallback((quotaType: 'daily' | 'convert'): boolean => {
      if (isLoggedIn || typeof window === 'undefined') {
        return true; // Logged-in users are not subject to this limit
      }

      const today = new Date().toISOString().split('T')[0];
      const lastUsed = localStorage.getItem('pdfLastUsed');

      if (lastUsed !== today) {
        localStorage.setItem('pdfDailyCount', '5');
        localStorage.setItem('pdfConvertCount', '1');
        localStorage.setItem('pdfLastUsed', today);
      }
      
      const key = quotaType === 'daily' ? 'pdfDailyCount' : 'pdfConvertCount';
      const limit = quotaType === 'daily' ? 5 : 1;
      let currentCount = parseInt(localStorage.getItem(key) || String(limit), 10);

      if (isNaN(currentCount)) {
          currentCount = limit;
      }

      if (currentCount <= 0) {
        setGuestLimitModalContent({
          title: quotaType === 'daily' ? texts.dailyLimitTitle : texts.convertLimitTitle,
          description: quotaType === 'daily' ? texts.dailyLimitDescription : texts.convertLimitDescription
        });
        setIsGuestLimitModalOpen(true);
        return false;
      }

      localStorage.setItem(key, String(currentCount - 1));
      return true;
  }, [isLoggedIn, texts]);


  const processPdfFile = async (file: File) => {
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
      const viewport = page.getViewport({ scale: 3.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      await page.render({ canvasContext: ctx, viewport }).promise;
      loadedPageObjects.push({ id: uuidv4(), sourceCanvas: canvas, rotation: 0 });
    }
    return loadedPageObjects;
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
    setTextAnnotations([]);
    setSelectedAnnotationId(null);
    setEditingAnnotationId(null);
    setImageAnnotations([]);
    setSelectedImageId(null);
    setHighlightAnnotations([]);
    setSelectedHighlightId(null);

    setIsLoading(true);
    setLoadingMessage(texts.loadingPdf);
    try {
      const newPageObjects = await processPdfFile(file);
      setPageObjects(newPageObjects);
      setSelectedPageIds(new Set());
      setActivePageIndex(0);
      setViewMode('editor');
      
      setTimeout(() => handleFitPage(), 100);

    } catch (err: any)
    {
      toast({ title: texts.loadError, description: err.message, variant: "destructive" });
      setPageObjects([]);
      setActivePageIndex(null);
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
    setActivePageIndex(null);
    setSelectedPageIds(new Set());

    if (newPages.length === 0) {
        setPageObjects([]);
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
    } : { r: 0, g: 0, b: 0 };
  };

  const parseRgba = (rgba: string) => {
    const result = rgba.match(/(\d+(\.\d+)?)/g);
    if (!result || result.length < 4) return { r: 0, g: 0, b: 0, a: 1 };
    return {
        r: parseInt(result[0]) / 255,
        g: parseInt(result[1]) / 255,
        b: parseInt(result[2]) / 255,
        a: parseFloat(result[3]),
    };
  };

  const getPdfFont = async (pdfDoc: PDFLibDocument, annotation: TextAnnotation): Promise<PDFFont> => {
    const { fontFamily, bold, italic } = annotation;
    let font = StandardFonts.Helvetica;

    if (fontFamily === 'Helvetica') {
        if (bold && italic) font = StandardFonts.HelveticaBoldOblique;
        else if (bold) font = StandardFonts.HelveticaBold;
        else if (italic) font = StandardFonts.HelveticaOblique;
        else font = StandardFonts.Helvetica;
    } else if (fontFamily === 'Times-Roman') {
        if (bold && italic) font = StandardFonts.TimesRomanBoldItalic;
        else if (bold) font = StandardFonts.TimesRomanBold;
        else if (italic) font = StandardFonts.TimesRomanItalic;
        else font = StandardFonts.TimesRoman;
    } else if (fontFamily === 'Courier') {
        if (bold && italic) font = StandardFonts.CourierBoldOblique;
        else if (bold) font = StandardFonts.CourierBold;
        else if (italic) font = StandardFonts.CourierOblique;
        else font = StandardFonts.Courier;
    }
    return await pdfDoc.embedFont(font);
  };


  const handleDownloadPdf = async () => {
    if (pageObjects.length === 0) {
      toast({ title: texts.downloadPdf, description: texts.noPagesToDownload, variant: "destructive" });
      return;
    }

    if (!checkAndDecrementQuota('daily')) {
        return;
    }

    setIsDownloading(true);
    setLoadingMessage(texts.generatingFile);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const pdfDocOut = await PDFLibDocument.create();

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

        // Draw highlights first so they are under other elements
        for (const annotation of highlightAnnotations.filter(a => a.pageIndex === index)) {
            const { r, g, b, a } = parseRgba(annotation.color);
            pdfLibPage.drawRectangle({
                x: annotation.leftRatio * pageWidth,
                y: pageHeight - (annotation.topRatio * pageHeight) - (annotation.heightRatio * pageHeight),
                width: annotation.widthRatio * pageWidth,
                height: annotation.heightRatio * pageHeight,
                color: rgb(r, g, b),
                opacity: a,
                blendMode: BlendMode.Multiply,
            });
        }

        // Apply Image Annotations
        for (const annotation of imageAnnotations.filter(a => a.pageIndex === index)) {
            let embeddedImage;
            if (annotation.dataUrl.startsWith('data:image/png')) {
                embeddedImage = await pdfDocOut.embedPng(annotation.dataUrl);
            } else if (annotation.dataUrl.startsWith('data:image/jpeg')) {
                embeddedImage = await pdfDocOut.embedJpg(annotation.dataUrl);
            } else {
                continue;
            }

            const imgX = annotation.leftRatio * pageWidth;
            const imgHeight = annotation.heightRatio * pageHeight;
            const imgY = pageHeight - (annotation.topRatio * pageHeight) - imgHeight;
            const imgWidth = annotation.widthRatio * pageWidth;
            
            pdfLibPage.drawImage(embeddedImage, { x: imgX, y: imgY, width: imgWidth, height: imgHeight });

            if (annotation.link) {
                const linkRect = { x: imgX, y: imgY, width: imgWidth, height: imgHeight };
                if(annotation.link.type === 'url') {
                    pdfLibPage.addURIAnnotation(linkRect, annotation.link.value);
                } else if (annotation.link.type === 'page') {
                    const targetPageNum = parseInt(annotation.link.value, 10);
                    if (!isNaN(targetPageNum) && targetPageNum > 0 && targetPageNum <= pdfDocOut.getPageCount()) {
                       const targetPage = pdfDocOut.getPages()[targetPageNum - 1];
                       pdfLibPage.addLinkAnnotation(linkRect, targetPage);
                    }
                }
            }
        }
        
        // Apply Text Annotations
        for (const annotation of textAnnotations.filter(a => a.pageIndex === index)) {
            const font = await getPdfFont(pdfDocOut, annotation);
            const { r, g, b } = hexToRgb(annotation.color);
            const boxWidth = annotation.widthRatio * pageWidth;

            const textLayout = layoutMultilineText(annotation.text, {
                font,
                bounds: { width: boxWidth, height: Infinity },
                fontSize: annotation.fontSize,
                lineHeight: annotation.fontSize * 1.2,
                alignment: annotation.textAlign === 'left' ? 0 : annotation.textAlign === 'center' ? 1 : 2,
            });

            const textHeight = textLayout.lines.length * annotation.fontSize * 1.2;
            const x = annotation.leftRatio * pageWidth;
            const y = pageHeight - (annotation.topRatio * pageHeight);

            pdfLibPage.pushGraphicsState();
            pdfLibPage.drawText(textLayout.lines.map(l => l.text).join('\n'), {
                x,
                y: y - font.ascent * (annotation.fontSize / font.unitsPerEm), // Adjust for baseline
                font,
                size: annotation.fontSize,
                color: rgb(r, g, b),
                lineHeight: annotation.fontSize * 1.2,
                maxWidth: boxWidth,
                wordBreaks: [' '],
            });

            if (annotation.underline) {
              const textWidth = font.widthOfTextAtSize(textLayout.lines.map(l=>l.text).join('\n'), annotation.fontSize);
              textLayout.lines.forEach((line, i) => {
                  const lineY = y - (font.ascent * (annotation.fontSize / font.unitsPerEm)) - (i * annotation.fontSize * 1.2) - 2;
                   pdfLibPage.drawLine({
                      start: { x: x, y: lineY },
                      end: { x: x + line.width, y: lineY },
                      thickness: 0.5,
                      color: rgb(r, g, b)
                  });
              });
            }
            pdfLibPage.popGraphicsState();

            if (annotation.link) {
                const linkRect = { x, y: y - textHeight, width: boxWidth, height: textHeight };
                if(annotation.link.type === 'url') {
                    pdfLibPage.addURIAnnotation(linkRect, annotation.link.value);
                } else if (annotation.link.type === 'page') {
                    const targetPageNum = parseInt(annotation.link.value, 10);
                    if (!isNaN(targetPageNum) && targetPageNum > 0 && targetPageNum <= pdfDocOut.getPageCount()) {
                       const targetPage = pdfDocOut.getPages()[targetPageNum - 1];
                       pdfLibPage.addLinkAnnotation(linkRect, targetPage);
                    }
                }
            }
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
      a.download = 'PdfSolution_edited.pdf';
      document.body.appendChild(a);
      a.href = url;
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
  
  const handleDragMouseDown = (
      event: React.MouseEvent<HTMLElement>,
      type: 'annotation' | 'image' | 'highlight' | 'image-resize' | 'highlight-resize' | 'annotation-resize',
      id: string
  ) => {
      event.stopPropagation();

      const isResize = type.endsWith('-resize');
      const itemType = type.split('-')[0] as 'annotation' | 'image' | 'highlight';

      const draggedElement = event.currentTarget as HTMLElement;
      const containerElement = (draggedElement.closest('.main-page-container')) as HTMLElement;
      if (!containerElement) return;

      const containerRect = containerElement.getBoundingClientRect();
      
      let initialItemState: any;
      switch (itemType) {
          case 'annotation': initialItemState = textAnnotations.find(a => a.id === id); break;
          case 'image': initialItemState = imageAnnotations.find(a => a.id === id); break;
          case 'highlight': initialItemState = highlightAnnotations.find(a => a.id === id); break;
      }
      
      if (!initialItemState) return;

      dragStartRef.current = {
          x: event.clientX,
          y: event.clientY,
          initialLeft: initialItemState.leftRatio * containerRect.width,
          initialTop: initialItemState.topRatio * containerRect.height,
          initialWidth: 'widthRatio' in initialItemState ? initialItemState.widthRatio * containerRect.width : 0,
          initialHeight: 'heightRatio' in initialItemState ? initialItemState.heightRatio * containerRect.height : 0
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
          moveEvent.preventDefault();
          isDraggingRef.current = true;
          draggedElement.style.cursor = 'grabbing';

          const deltaX = moveEvent.clientX - dragStartRef.current.x;
          const deltaY = moveEvent.clientY - dragStartRef.current.y;

          if (isResize && 'aspectRatio' in initialItemState && itemType === 'image') {
              const newWidthPx = dragStartRef.current.initialWidth + deltaX;
              const newWidthRatio = Math.max(0.05, newWidthPx / containerRect.width);
              setImageAnnotations(prev => prev.map(ann =>
                  ann.id === id ? {
                      ...ann,
                      widthRatio: newWidthRatio,
                      heightRatio: newWidthRatio / ann.aspectRatio * (containerRect.width / containerRect.height)
                  } : ann
              ));
          } else if (isResize && itemType === 'highlight') {
              const newWidthPx = dragStartRef.current.initialWidth + deltaX;
              const newHeightPx = dragStartRef.current.initialHeight + deltaY;
              setHighlightAnnotations(prev => prev.map(ann =>
                  ann.id === id ? {
                      ...ann,
                      widthRatio: Math.max(0.01, newWidthPx / containerRect.width),
                      heightRatio: Math.max(0.01, newHeightPx / containerRect.height)
                  } : ann
              ));
          } else if (isResize && itemType === 'annotation') {
              const newWidthPx = dragStartRef.current.initialWidth + deltaX;
              const newWidthRatio = Math.max(0.1, newWidthPx / containerRect.width);
               setTextAnnotations(prev => prev.map(ann =>
                  ann.id === id ? { ...ann, widthRatio: newWidthRatio } : ann
              ));
          }
          else { // It's a drag operation
              const newLeftPx = dragStartRef.current.initialLeft + deltaX;
              const newTopPx = dragStartRef.current.initialTop + deltaY;

              const newLeftRatio = Math.max(0, Math.min(1, newLeftPx / containerRect.width));
              const newTopRatio = Math.max(0, Math.min(1, newTopPx / containerRect.height));
              
              const updater = (prev: any) => ({ ...prev, topRatio: newTopRatio, leftRatio: newLeftRatio });

              switch (itemType) {
                  case 'annotation': 
                      if (editingAnnotationId === id) return;
                      setTextAnnotations(prev => prev.map(ann => ann.id === id ? updater(ann) : ann)); 
                      break;
                  case 'image': setImageAnnotations(prev => prev.map(ann => ann.id === id ? updater(ann) : ann)); break;
                  case 'highlight': setHighlightAnnotations(prev => prev.map(ann => ann.id === id ? updater(ann) : ann)); break;
              }
          }
      };

      const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          draggedElement.style.cursor = 'grab';

          setTimeout(() => { isDraggingRef.current = false; }, 50);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };


  const handleThumbnailClick = (index: number, event: React.MouseEvent) => {
      if (viewMode === 'editor') {
          setActivePageIndex(index);
          const targetPage = pageRefs.current[index];
          if (targetPage) {
              targetPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      } else {
          const clickedId = pageObjects[index].id;
          const newSelectedPageIds = new Set(selectedPageIds);
          if (newSelectedPageIds.has(clickedId)) {
              newSelectedPageIds.delete(clickedId);
          } else {
              newSelectedPageIds.add(clickedId);
          }
          setSelectedPageIds(newSelectedPageIds);
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
            blankCanvas.width = 2480; 
            blankCanvas.height = 3508;
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
          widthRatio: 0.3,
          fontSize: 36,
          fontFamily: 'Helvetica',
          bold: false,
          italic: false,
          underline: false,
          color: '#000000',
          textAlign: 'left',
      };
      setTextAnnotations(prev => [...prev, newAnnotation]);
      setSelectedAnnotationId(newAnnotation.id);
      setEditingAnnotationId(null);
      setSelectedImageId(null);
      setSelectedHighlightId(null);
    };
    
    const handleAnnotationChange = (updatedAnnotation: TextAnnotation) => {
      setTextAnnotations(prev => prev.map(ann => 
          ann.id === updatedAnnotation.id ? updatedAnnotation : ann
      ));
    };

    const handleDeleteAnnotation = (id: string) => {
        setTextAnnotations(prev => prev.filter(ann => ann.id !== id));
        if (selectedAnnotationId === id) setSelectedAnnotationId(null);
        if (editingAnnotationId === id) setEditingAnnotationId(null);
    }
    
    const addImageAnnotation = useCallback((dataUrl: string, pageIndex: number) => {
        const img = new window.Image();
        img.onload = () => {
            const container = pageRefs.current[pageIndex];
            if (!container) return;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            const aspectRatio = img.width / img.height;
            let widthRatio = 0.25;
            let heightRatio = widthRatio / aspectRatio * (containerWidth / containerHeight);

            const newAnnotation: ImageAnnotation = {
                id: uuidv4(),
                pageIndex,
                dataUrl,
                topRatio: 0.5,
                leftRatio: 0.5,
                widthRatio,
                heightRatio,
                aspectRatio
            };
            setImageAnnotations(prev => [...prev, newAnnotation]);
            setSelectedImageId(newAnnotation.id);
            setSelectedAnnotationId(null);
            setEditingAnnotationId(null);
            setSelectedHighlightId(null);
        };
        img.src = dataUrl;
    }, []);

    const handleImageFileSelected = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (activePageIndex === null) return;
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
                addImageAnnotation(dataUrl, activePageIndex);
                toast({ title: texts.imageInsertSuccess });
            }
        };
        reader.readAsDataURL(file);
        if(imageUploadRef.current) imageUploadRef.current.value = '';
    }, [activePageIndex, addImageAnnotation, texts.imageInsertSuccess]);

    const handlePaste = useCallback((event: ClipboardEvent) => {
        if (activePageIndex === null) return;
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (!file) continue;

                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target?.result as string;
                    if (dataUrl) {
                        addImageAnnotation(dataUrl, activePageIndex);
                        toast({ title: texts.imagePasteSuccess });
                    }
                };
                reader.readAsDataURL(file);
                event.preventDefault();
                return;
            }
        }
    }, [activePageIndex, addImageAnnotation, texts.imagePasteSuccess]);

    const handleDeleteImageAnnotation = (id: string) => {
        setImageAnnotations(prev => prev.filter(ann => ann.id !== id));
        if (selectedImageId === id) setSelectedImageId(null);
    }
    
    const handleAddHighlightAnnotation = () => {
      if (activePageIndex === null) return;
      const newAnnotation: HighlightAnnotation = {
        id: uuidv4(),
        pageIndex: activePageIndex,
        topRatio: 0.4,
        leftRatio: 0.4,
        widthRatio: 0.2,
        heightRatio: 0.05,
        color: 'rgba(255, 255, 0, 0.4)',
      };
      setHighlightAnnotations(prev => [...prev, newAnnotation]);
      setSelectedHighlightId(newAnnotation.id);
      setSelectedAnnotationId(null);
      setEditingAnnotationId(null);
      setSelectedImageId(null);
    };

    const handleDeleteHighlightAnnotation = (id: string) => {
        setHighlightAnnotations(prev => prev.filter(ann => ann.id !== id));
        if (selectedHighlightId === id) setSelectedHighlightId(null);
    }

    const handleAnnotationWrapperClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDraggingRef.current) return;
        
        setSelectedAnnotationId(id);
        setSelectedImageId(null);
        setSelectedHighlightId(null);
    };

    const handleAnnotationDoubleClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingAnnotationId(id);
        setSelectedAnnotationId(id);
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedAnnotationId && !editingAnnotationId) {
                    handleDeleteAnnotation(selectedAnnotationId);
                }
                if (selectedImageId) {
                    handleDeleteImageAnnotation(selectedImageId);
                }
                if (selectedHighlightId) {
                    handleDeleteHighlightAnnotation(selectedHighlightId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('paste', handlePaste);
        };
    }, [selectedAnnotationId, editingAnnotationId, selectedImageId, selectedHighlightId, handlePaste]);


    const handleOpenLinkPopover = () => {
        const activeId = selectedAnnotationId || selectedImageId;
        if (!activeId) return;

        const isText = !!selectedAnnotationId;
        const annotation = isText
            ? textAnnotations.find(a => a.id === activeId)
            : imageAnnotations.find(a => a.id === activeId);

        if (annotation?.link) {
            setCurrentLink(annotation.link);
        } else {
            setCurrentLink({ type: 'url', value: '' });
        }
    };

    const handleSaveLink = () => {
        const activeId = selectedAnnotationId || selectedImageId;
        if (!activeId) return;

        const isText = !!selectedAnnotationId;
        if (isText) {
            setTextAnnotations(prev => prev.map(ann =>
                ann.id === activeId ? { ...ann, link: currentLink } : ann
            ));
        } else {
            setImageAnnotations(prev => prev.map(ann =>
                ann.id === activeId ? { ...ann, link: currentLink } : ann
            ));
        }
        setIsLinkPopoverOpen(false);
        toast({ title: texts.linkAttached });
    };

    const handleRemoveLink = () => {
        const activeId = selectedAnnotationId || selectedImageId;
        if (!activeId) return;

        const isText = !!selectedAnnotationId;
        if (isText) {
            setTextAnnotations(prev => prev.map(ann => {
                if (ann.id === activeId) {
                    const { link, ...rest } = ann;
                    return rest;
                }
                return ann;
            }));
        } else {
            setImageAnnotations(prev => prev.map(ann => {
                if (ann.id === activeId) {
                    const { link, ...rest } = ann;
                    return rest;
                }
                return ann;
            }));
        }
        setIsLinkPopoverOpen(false);
        toast({ title: texts.linkRemoved, variant: "destructive" });
    };


    const linkPopoverContent = (
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">{texts.linkEditTitle}</h4>
        </div>
        <div className="grid gap-2">
          <RadioGroup value={currentLink.type} onValueChange={(type: 'url' | 'page') => setCurrentLink({ ...currentLink, type })}>
              <div className="flex items-center space-x-2">
                  <RadioGroupItem value="url" id="r-url" />
                  <Label htmlFor="r-url">{texts.linkSetUrl}</Label>
              </div>
              <div className="flex items-center space-x-2">
                  <RadioGroupItem value="page" id="r-page" />
                  <Label htmlFor="r-page">{texts.linkSetPage}</Label>
              </div>
          </RadioGroup>
          <div className="mt-2">
            {currentLink.type === 'url' ? (
                <Input
                    id="link-url"
                    placeholder="https://example.com"
                    value={currentLink.value}
                    onChange={(e) => setCurrentLink({ ...currentLink, value: e.target.value })}
                />
            ) : (
                <Input
                    id="link-page"
                    type="number"
                    placeholder="e.g., 5"
                    min="1"
                    max={pageObjects.length}
                    value={currentLink.value}
                    onChange={(e) => setCurrentLink({ ...currentLink, value: e.target.value })}
                />
            )}
          </div>
        </div>
        <div className="flex justify-between">
            <Button variant="destructive" size="sm" onClick={handleRemoveLink}>{texts.linkRemove}</Button>
            <Button size="sm" onClick={handleSaveLink}>{texts.linkSave}</Button>
        </div>
      </div>
    );

    const editingAnnotation = editingAnnotationId ? textAnnotations.find(ann => ann.id === editingAnnotationId) : null;

    const handleZoom = (direction: 'in' | 'out') => {
      const ZOOM_STEP = 0.1;
      setMainCanvasZoom(prev => {
        let newZoom = direction === 'in' ? prev + ZOOM_STEP : prev - ZOOM_STEP;
        return Math.max(0.1, Math.min(newZoom, 5));
      });
    };

    // --- Batch Conversion Logic ---

    const handleBatchFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;
  
      if (files.length > MAX_FILES) {
          toast({ title: texts.tooManyFiles, variant: 'destructive' });
          return;
      }
  
      const validFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      if (validFiles.length !== files.length) {
          toast({ title: texts.invalidFileError, variant: 'destructive' });
      }
  
      setBatchFiles(validFiles);
      const initialStatuses: { [fileName: string]: UploadStatus } = {};
      validFiles.forEach(file => {
          initialStatuses[file.name] = { status: 'waiting', progress: 0 };
      });
      setUploadStatuses(initialStatuses);
    };
  
    const removeBatchFile = (fileName: string) => {
      setBatchFiles(prev => prev.filter(f => f.name !== fileName));
      setUploadStatuses(prev => {
          const newStatuses = {...prev};
          delete newStatuses[fileName];
          return newStatuses;
      });
    };
    
    const convertSingleFile = async (file: File) => {
        setUploadStatuses(prev => ({ ...prev, [file.name]: { status: 'uploading', progress: 25 } }));
        
        console.log("File name:", file.name);
        console.log("File type:", file.type);

        const formData = new FormData();
        const blob = new Blob([file], { type: 'application/pdf' });
        formData.append("file", blob, file.name);
        formData.append("format", targetFormat);
  
        try {
            const response = await fetch("https://pdfsolution.dpdns.org/upload", {
                method: 'POST',
                body: formData,
            });
  
            setUploadStatuses(prev => ({ ...prev, [file.name]: { status: 'converting', progress: 75 } }));
  
            if (!response.ok) {
                const error = await response.json();
                throw new Error(String(error.error || "Conversion failed."));
            }
  
            const resBlob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let downloadFilename = file.name.replace(/\.pdf$/i, `.${targetFormat}`);
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    downloadFilename = match[1];
                }
            } else {
                 const fallbackExtension = formatOptions.find(opt => opt.value === targetFormat)?.extension || 'bin';
                 downloadFilename = file.name.replace(/\.pdf$/i, `.${fallbackExtension}`);
            }
            
            const url = window.URL.createObjectURL(resBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            setUploadStatuses(prev => ({ ...prev, [file.name]: { status: 'done', progress: 100 } }));
  
        } catch (err: any) {
            setUploadStatuses(prev => ({ ...prev, [file.name]: { status: 'error', progress: 0, error: err.message } }));
            toast({ title: `${file.name}: ${texts.conversionError}`, description: err.message, variant: "destructive" });
        }
    };
  
    const handleBatchSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (batchFiles.length === 0) {
          toast({ title: texts.conversionError, description: texts.noFilesSelected, variant: 'destructive'});
          return;
      }
      
      if (!checkAndDecrementQuota('convert')) {
        return;
      }
  
      setIsConverting(true);
      await Promise.all(batchFiles.map(file => convertSingleFile(file)));
      setIsConverting(false);
    };

    // --- End Batch Conversion Logic ---

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      {(isLoading || isDownloading || isConverting) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">
            {isLoading ? loadingMessage :
             isDownloading ? texts.generatingFile :
             isConverting ? texts.convertingMessage : ''}
          </p>
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
            <AlertDialogAction onClick={() => {
                // This is a placeholder as the insert functionality is not fully implemented
            }}>{texts.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
            <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{texts.deletePageConfirmTitle}</ShadAlertDialogTitle>
            <AlertDialogDescription>
                {pageToDelete !== null ? texts.deletePageConfirmDescription : `${currentLanguage === 'zh' ? `您確定要刪除選取的 ${selectedPageIds.size} 個頁面嗎?` : `Are you sure you want to delete the ${selectedPageIds.size} selected pages?` }`}
            </AlertDialogDescription>
            </ShadAlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPageToDelete(null)}>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePages}>{texts.confirm}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <main className="flex-grow flex overflow-hidden relative" onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.main-page-container, .absolute.top-2, .popover-content, [data-radix-popper-content-wrapper]')) {
            setSelectedAnnotationId(null);
            setEditingAnnotationId(null);
            setSelectedImageId(null);
            setSelectedHighlightId(null);
        }
      }}>
        {editingAnnotationId && textAnnotations.find(ann => ann.id === editingAnnotationId) && (
            <TextAnnotationToolbar
                annotation={textAnnotations.find(ann => ann.id === editingAnnotationId)!}
                onAnnotationChange={handleAnnotationChange}
                onDelete={() => handleDeleteAnnotation(editingAnnotationId!)}
            />
        )}
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
                      <Button onClick={() => setViewMode('editor')} variant="outline" size="sm">
                        <PanelLeft className='h-4 w-4 mr-2' /> {texts.editorMode}
                      </Button>
                      <Button onClick={() => router.push('/split-pdf')} variant="outline" size="sm">
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
                                            canvas.width = 240;
                                            canvas.height = 240 / aspectRatio;
                                            ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
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
                        
                        return (
                            <div 
                                key={page.id} 
                                ref={el => pageRefs.current[index] = el} 
                                data-page-index={index} 
                                className="shadow-lg bg-white relative my-2 main-page-container" 
                                style={{
                                    width: (rotation % 180 !== 0 ? sourceCanvas.height : sourceCanvas.width) * mainCanvasZoom,
                                    height: (rotation % 180 !== 0 ? sourceCanvas.width : sourceCanvas.height) * mainCanvasZoom
                                }}
                            >
                                <canvas
                                    ref={canvas => {
                                        if (canvas) {
                                            const isRotated = rotation % 180 !== 0;
                                            const canvasWidth = isRotated ? sourceCanvas.height : sourceCanvas.width;
                                            const canvasHeight = isRotated ? sourceCanvas.width : sourceCanvas.height;
                                            
                                            canvas.width = canvasWidth;
                                            canvas.height = canvasHeight;

                                            const ctx = canvas.getContext('2d');
                                            if (!ctx) return;
                                            
                                            ctx.save();
                                            ctx.fillStyle = 'white';
                                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                                            ctx.restore();

                                            ctx.save();
                                            ctx.translate(canvas.width / 2, canvas.height / 2);
                                            ctx.rotate(rotation * Math.PI / 180);
                                            ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
                                            ctx.restore();
                                            
                                            canvas.style.width = `${canvasWidth * mainCanvasZoom}px`;
                                            canvas.style.height = `${canvasHeight * mainCanvasZoom}px`;
                                        }
                                    }}
                                />
                                {highlightAnnotations.filter(ann => ann.pageIndex === index).map(ann => (
                                    <div
                                        key={ann.id}
                                        onMouseDown={(e) => handleDragMouseDown(e, 'highlight', ann.id)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isDraggingRef.current) {
                                                setSelectedHighlightId(ann.id);
                                                setSelectedAnnotationId(null);
                                                setEditingAnnotationId(null);
                                                setSelectedImageId(null);
                                            }
                                        }}
                                        className={cn(
                                            "absolute cursor-grab",
                                            selectedHighlightId === ann.id && "border-2 border-dashed border-primary"
                                        )}
                                        style={{
                                            left: `${ann.leftRatio * 100}%`,
                                            top: `${ann.topRatio * 100}%`,
                                            width: `${ann.widthRatio * 100}%`,
                                            height: `${ann.heightRatio * 100}%`,
                                            backgroundColor: ann.color,
                                            mixBlendMode: 'multiply',
                                            zIndex: 15
                                        }}
                                    >
                                        {selectedHighlightId === ann.id && (
                                            <div
                                                className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize"
                                                onMouseDown={(e) => handleDragMouseDown(e, 'highlight-resize', ann.id)}
                                            />
                                        )}
                                    </div>
                                ))}
                                {imageAnnotations.filter(ann => ann.pageIndex === index).map(ann => (
                                    <div
                                        key={ann.id}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setSelectedImageId(ann.id);
                                            setSelectedAnnotationId(null);
                                            setEditingAnnotationId(null);
                                            setSelectedHighlightId(null);
                                            handleDragMouseDown(e, 'image', ann.id);
                                        }}
                                        onClick={(e) => { e.stopPropagation(); setSelectedImageId(ann.id); }}
                                        className={cn(
                                            "absolute cursor-grab",
                                            selectedImageId === ann.id && "border-2 border-dashed border-primary"
                                        )}
                                        style={{
                                            left: `${ann.leftRatio * 100}%`,
                                            top: `${ann.topRatio * 100}%`,
                                            width: `${ann.widthRatio * 100}%`,
                                            height: `${ann.heightRatio * 100}%`,
                                            zIndex: 20
                                        }}
                                    >
                                        <img src={ann.dataUrl} className="w-full h-full object-contain pointer-events-none" alt="user content" />
                                        {selectedImageId === ann.id && (
                                          <>
                                            <div
                                                className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize"
                                                onMouseDown={(e) => handleDragMouseDown(e, 'image-resize', ann.id)}
                                            />
                                            {ann.link && <LinkIcon className="absolute -top-1 -right-1 h-4 w-4 text-white bg-blue-500 p-0.5 rounded-full" />}
                                          </>
                                        )}
                                    </div>
                                ))}
                                {textAnnotations.filter(ann => ann.pageIndex === index).map(ann => (
                                    <TextAnnotationComponent
                                        key={ann.id}
                                        annotation={ann}
                                        mainCanvasZoom={mainCanvasZoom}
                                        isSelected={selectedAnnotationId === ann.id}
                                        isEditing={editingAnnotationId === ann.id}
                                        onWrapperClick={(id, e) => handleAnnotationWrapperClick(id, e)}
                                        onDoubleClick={(id, e) => handleAnnotationDoubleClick(id, e)}
                                        onAnnotationChange={handleAnnotationChange}
                                        onDragStart={(e, id) => {
                                            if (editingAnnotationId !== id) {
                                                handleDragMouseDown(e, 'annotation', id);
                                            }
                                        }}
                                        onResizeStart={(e, id) => {
                                            handleDragMouseDown(e, 'annotation-resize', id)
                                        }}
                                    />
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
                         <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} title={texts.gridMode}><LayoutGrid className="h-5 w-5" /></Button>
                    </div>
                </div>

                <div className="w-[20%] border-l bg-card flex-shrink-0 p-4 space-y-4 overflow-y-auto">
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-base font-semibold">{texts.pdfEditingTools}</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <ToolbarButton icon={RotateCw} label={texts.toolRotate} onClick={() => handleRotatePage('cw')} disabled={activePageIndex === null}/>
                                    <ToolbarButton icon={Trash2} label={texts.toolDelete} onClick={() => { if(activePageIndex !== null) { setPageToDelete(activePageIndex); setIsDeleteConfirmOpen(true); } }} disabled={activePageIndex === null}/>
                                    <ToolbarButton icon={FilePlus2} label={texts.toolAddBlank} onClick={handleAddBlankPage} />
                                    <ToolbarButton icon={Type} label={texts.toolInsertText} onClick={handleAddTextAnnotation} disabled={activePageIndex === null}/>
                                    <ToolbarButton icon={ImagePlus} label={texts.toolInsertImage} onClick={() => imageUploadRef.current?.click()} disabled={activePageIndex === null}/>
                                    <ToolbarButton icon={Highlighter} label={texts.toolHighlight} onClick={handleAddHighlightAnnotation} disabled={activePageIndex === null} />
                                    <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex flex-col items-center justify-center h-20 w-full text-xs space-y-1"
                                            disabled={!selectedAnnotationId && !selectedImageId}
                                            onClick={handleOpenLinkPopover}
                                        >
                                            <LinkIcon className="h-6 w-6 text-primary" />
                                            <span className="text-muted-foreground">{texts.toolInsertLink}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80" side="left" align="start">
                                        {linkPopoverContent}
                                    </PopoverContent>
                                    </Popover>
                                </div>
                                 <Input
                                    type="file"
                                    id="imageUploadInput"
                                    accept="image/*"
                                    onChange={handleImageFileSelected}
                                    ref={imageUploadRef}
                                    className="hidden"
                                 />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-base font-semibold">{texts.batchConvert}</AccordionTrigger>
                            <AccordionContent className="pt-4">
                                <form onSubmit={handleBatchSubmit} className="space-y-4">
                                     <div>
                                        <Label htmlFor="targetFormat" className="text-sm font-medium">{texts.selectFormat}</Label>
                                        <Select value={targetFormat} onValueChange={setTargetFormat} required>
                                            <SelectTrigger id="targetFormat" className="mt-1">
                                                <SelectValue placeholder="Select format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {formatOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {texts[opt.labelKey]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div 
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-muted/20"
                                    onClick={() => batchFileUploadRef.current?.click()}
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-xs text-muted-foreground text-center">
                                        {texts.uploadButton}
                                        </p>
                                        <Input
                                            type="file"
                                            ref={batchFileUploadRef}
                                            onChange={handleBatchFileChange}
                                            accept="application/pdf"
                                            required
                                            multiple
                                            className="hidden"
                                        />
                                    </div>
                                    {batchFiles.length > 0 && (
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                            {batchFiles.map(file => (
                                                <div key={file.name} className="flex items-center gap-2 p-1.5 border rounded-md text-xs">
                                                    <File className="h-4 w-4 text-primary flex-shrink-0" />
                                                    <div className="flex-grow min-w-0">
                                                        <p className="font-medium truncate">{file.name}</p>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <span>{texts[`status_${uploadStatuses[file.name]?.status}` as keyof typeof texts] || texts.status_waiting}</span>
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
                                        {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                        {texts.convertButton}
                                    </Button>
                                </form>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Separator />
                    {pageObjects.length > 0 && (
                    <Button onClick={handleDownloadPdf} disabled={isDownloading} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        {texts.downloadPdf}
                    </Button>
                    )}
                </div>
            </>
          )}
      </main>
    </div>
  );
}

    
