
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb, degrees, grayscale, pushGraphicsState, popGraphicsState, setOpacity, layoutMultilineText, PDFFont, BlendMode, drawText, drawPolygon } from 'pdf-lib';
import Sortable from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as ShadAlertDialogDescription, AlertDialogFooter, AlertDialogHeader as ShadAlertDialogHeader, AlertDialogTitle as ShadAlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RotateCcw, RotateCw, X, Trash2, Download, Upload, Info, Shuffle, Search, Edit3, Droplet, LogIn, LogOut, UserCircle, FileText, Lock, MenuSquare, Columns, ShieldCheck, FilePlus, ListOrdered, Move, CheckSquare, Image as ImageIcon, Minimize2, Palette, FontSize, Eye, Scissors, LayoutGrid, PanelLeft, FilePlus2, Combine, Type, ImagePlus, Link as LinkIcon, MessageSquarePlus, ZoomIn, ZoomOut, Expand, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Highlighter, ArrowRightLeft, Edit, FileUp, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, XCircle, File, FolderOpen, Save, Wrench, HelpCircle, PanelTop, Redo, Undo, Hand, Square, Circle, Pencil, Printer, SearchIcon, ChevronLeft, ChevronRight, CaseSensitive, MousePointerSquareDashed, Grid, ShieldAlert, Layers, Brush } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Toggle } from "@/components/ui/toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
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
  type: 'text';
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
    type: 'image';
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
  type: 'highlight';
  pageIndex: number;
  topRatio: number;
  leftRatio: number;
  widthRatio: number;
  heightRatio: number;
  color: string;
}

interface ShapeAnnotation {
  id: string;
  pageIndex: number;
  type: 'rect' | 'ellipse' | 'triangle';
  topRatio: number;
  leftRatio: number;
  widthRatio: number;
  heightRatio: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

interface ScribbleAnnotation {
  id: string;
  type: 'scribble';
  pageIndex: number;
  points: {x: number, y: number}[];
  color: string;
  strokeWidth: number;
  topRatio: number;
  leftRatio: number;
  widthRatio: number;
  heightRatio: number;
  aspectRatio: number;
}

interface MosaicAnnotation {
    id: string;
    type: 'mosaic';
    pageIndex: number;
    topRatio: number;
    leftRatio: number;
    widthRatio: number;
    heightRatio: number;
}

type Annotation = TextAnnotation | ImageAnnotation | HighlightAnnotation | ShapeAnnotation | ScribbleAnnotation | MosaicAnnotation;

interface EditorState {
    pageObjects: PageObject[];
    annotations: Annotation[];
}

interface PageTextContent {
  pageIndex: number;
  items: any[]; // pdfjs.TextItem[]
}

interface SearchResult {
  pageIndex: number;
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

type Tool = 'select' | 'pan' | 'text' | 'image' | 'highlight' | 'shape' | 'signature' | 'scribble' | 'mosaic';
type InteractionMode = 'idle' | 'selected' | 'editing' | 'drawing-mosaic';

const translations = {
    en: {
        pageTitle: 'PDF Editor (Pro Mode)',
        uploadLabel: 'Select PDF file to edit:',
        deletePages: 'Delete Selected Pages',
        splitPages: 'Split Selected',
        downloadPdf: 'Save as PDF',
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
        toolInsertText: 'Text',
        toolInsertImage: 'Image',
        toolHighlight: 'Highlight',
        toolInsertLink: 'Link',
        toolInsertComment: 'Comment',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        fitToWidth: 'Fit Width',
        fitToPage: 'Fit Page',
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
        uploadButton: 'Click or drag up to 10 files here',
        convertButton: 'Convert All Files',
        convertingMessage: 'Converting...',
        noFilesSelected: 'Please select files to convert.',
        tooManyFiles: 'You can only select up to 10 files at a time.',
        totalSizeExceeded: (size: number) => `Total file size cannot exceed ${size}MB.`,
        status_waiting: 'Waiting',
        status_uploading: 'Uploading...',
        status_converting: 'Converting...',
        status_done: 'Done!',
        status_error: 'Error',
        dailyLimitTitle: 'Daily Limit Reached',
        dailyLimitDescription: 'Your free uses for today have been exhausted. Please register or come back tomorrow.',
        convertLimitTitle: 'Conversion Limit Reached',
        convertLimitDescription: 'Your free conversion for today has been used. Register to get 3 conversions daily.',
        conversionError: 'Conversion failed',
        conversionSuccess: 'Conversion successful!',
        conversionSuccessDesc: (filename: string) => `${filename} has been downloaded successfully.`,
        menuFile: "File",
        menuEdit: "Edit",
        menuPage: "Page",
        menuConvert: "Convert",
        menuTools: "Tools",
        menuHelp: "Help",
        menuFileOpen: "Open PDF Document",
        menuFileNew: "Open PDF Document",
        insertPdf: "Insert PDF",
        menuFileSaveAs: "Save As",
        menuFileBatchConvert: "Batch Conversion",
        menuEditUndo: "Undo",
        menuEditRedo: "Redo",
        menuEditInsertText: "Insert Text",
        menuEditInsertImage: "Insert Image",
        menuEditHighlight: "Highlight Area",
        menuEditInsertLink: "Add/Edit Link",
        menuPageRotateCW: "Rotate Clockwise",
        menuPageRotateCCW: "Rotate Counter-Clockwise",
        menuPageAddBlank: "Add Blank Page",
        menuPageDelete: "Delete Current Page",
        planInfo: (files: number, size: number) => `Your current plan allows you to upload ${files} files at once, with a total size of up to ${size}MB.`,
        usageInfo: (files: number, size: string, remainingFiles: number, remainingSize: string) => `You have selected ${files} file(s), with a total size of ${size}MB. (You can still upload ${remainingFiles} more files or ${remainingSize}MB).`,
        toolSelect: 'Select',
        toolPan: 'Pan',
        toolText: 'Text',
        toolImage: 'Image',
        toolShape: 'Sign',
        toolSignature: 'Shape',
        toolHand: 'Pan',
        toolShapeShort: 'Shape',
        toolSignatureShort: 'Sign',
        toolPrint: 'Print',
        toolSearch: 'Search',
        toolSearchDoc: 'Search Document',
        shapeRect: 'Rectangle',
        shapeCircle: 'Circle',
        shapeTriangle: 'Triangle',
        addSignature: 'Add Signature',
        signaturePadTitle: 'Create Signature',
        signaturePadDescription: 'Draw your signature below. Click save when done.',
        signatureColor: 'Color',
        signatureStrokeWidth: 'Thickness',
        signatureClear: 'Clear',
        signatureSave: 'Save Signature',
        searchPlaceholder: 'Search document...',
        searchNext: 'Next',
        searchPrevious: 'Previous',
        searchCaseSensitive: 'Case Sensitive',
        searchResults: (count: number) => `${count} results found.`,
        searchNoResults: 'No results found.',
        noTextInPdf: 'This PDF has no text layer. OCR may be needed to enable search.',
        toolScribble: 'Scribble',
        toolMosaic: 'Mosaic',
        applyToAllPages: 'Apply to All Pages',
        convertConfirmTitle: "Convert File",
        convertConfirmDescription: (filename: string) => `"${filename}" will be converted to PDF. Do you want to download it or open it in the editor?`,
        convertConfirmDownload: 'Download',
        convertConfirmEdit: 'Open in Editor',
        convertingToPdf: 'Converting to PDF...',
        toolInsertFile: 'Insert PDF',
        insertAtStart: 'Insert at Beginning',
        insertAtEnd: 'Insert at End',
        insertBeforeSelection: 'Insert Before Selection',
        insertAfterSelection: 'Insert After Selection',
        newDocConfirmTitle: 'Confirm Open New Document',
        newDocConfirmDescription: 'This will close the current document without saving changes. Are you sure you want to continue?',
        downloadEditedFile: 'Download',
        toolDownload: 'Download',
    },
    zh: {
        pageTitle: 'PDF 編輯器 (專業模式)',
        uploadLabel: '選擇要編輯的 PDF 檔案：',
        deletePages: '刪除選取的頁面',
        splitPages: '拆分選定頁面',
        downloadPdf: '另存成PDF',
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
        downloadError: '下載 PDF 失败',
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
        toolDelete: '刪除',
        toolAddBlank: '新增空白',
        toolMerge: '合併',
        toolSplit: '拆分',
        toolWatermark: '浮水印',
        toolInsertText: '文字',
        toolInsertImage: '圖片',
        toolHighlight: '螢光筆',
        toolInsertLink: '連結',
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
        uploadButton: '點擊或拖曳最多 10 個檔案到此處',
        convertButton: '轉換所有檔案',
        convertingMessage: '轉換中...',
        noFilesSelected: '請選擇要轉換的檔案。',
        tooManyFiles: '一次最多只能選擇 10 個檔案。',
        totalSizeExceeded: (size: number) => `總檔案大小不能超過 ${size}MB。`,
        status_waiting: '等待中',
        status_uploading: '上傳中...',
        status_converting: '轉換中...',
        status_done: '完成！',
        status_error: '錯誤',
        dailyLimitTitle: '每日次數已用完',
        dailyLimitDescription: '您今日的免費使用次數已用完，請註冊或明天再來試。',
        convertLimitTitle: '轉檔次數已用完',
        convertLimitDescription: '您今日的免費轉檔次數已用完，註冊即可獲得每日 3 次轉換。',
        conversionError: '轉換失敗',
        conversionSuccess: '轉換成功！',
        conversionSuccessDesc: (filename: string) => `${filename} 已成功下載。`,
        menuFile: "檔案",
        menuEdit: "編輯",
        menuPage: "頁面",
        menuConvert: "轉換",
        menuTools: "工具",
        menuHelp: "說明",
        menuFileOpen: "開啟PDF文件",
        menuFileNew: "開啟PDF文件",
        insertPdf: "插入PDF",
        menuFileSaveAs: "另存成PDF",
        menuFileBatchConvert: "批次轉換",
        menuEditUndo: "復原",
        menuEditRedo: "重做",
        menuEditInsertText: "插入文字",
        menuEditInsertImage: "插入圖片",
        menuEditHighlight: "螢光筆",
        menuEditInsertLink: "新增/編輯連結",
        menuPageRotateCW: "順時針旋轉",
        menuPageRotateCCW: "逆時針旋轉",
        menuPageAddBlank: "新增空白頁",
        menuPageDelete: "刪除目前頁面",
        planInfo: (files: number, size: number) => `您加購的方案為：同時上傳 ${files} 份文件，大小總計不超過 ${size}MB。`,
        usageInfo: (files: number, size: string, remainingFiles: number, remainingSize: string) => `目前您已選擇 ${files} 份文件，大小總計 ${size}MB (尚可上傳 ${remainingFiles} 份文件或 ${remainingSize}MB)`,
        toolSelect: '選取',
        toolPan: '平移',
        toolText: '文字',
        toolImage: '圖片',
        toolShape: '圖形',
        toolSignature: '簽名',
        toolHand: '平移',
        toolShapeShort: '圖形',
        toolSignatureShort: '簽名',
        toolPrint: '列印',
        toolSearch: '搜尋',
        toolSearchDoc: '搜尋文件',
        shapeRect: '方形',
        shapeCircle: '圓形',
        shapeTriangle: '三角形',
        addSignature: '新增簽名',
        signaturePadTitle: '建立簽名',
        signaturePadDescription: '在下方繪製您的簽名，完成後點擊儲存。',
        signatureColor: '顏色',
        signatureStrokeWidth: '粗細',
        signatureClear: '清除',
        signatureSave: '儲存簽名',
        searchPlaceholder: '搜尋文件...',
        searchNext: '下一個',
        searchPrevious: '上一個',
        searchCaseSensitive: '區分大小寫',
        searchResults: (count: number) => `找到 ${count} 個結果。`,
        searchNoResults: '找不到結果。',
        noTextInPdf: '此 PDF 不包含文字層。可能需要 OCR 才能啟用搜尋。',
        toolScribble: '畫筆',
        toolMosaic: '馬賽克',
        applyToAllPages: '套用至所有頁面',
        convertConfirmTitle: "轉換檔案",
        convertConfirmDescription: (filename: string) => `將為您轉檔 "${filename}" 為 PDF。請選擇轉檔後要下載至您的電腦還是進入編輯模式？`,
        convertConfirmDownload: '下載檔案',
        convertConfirmEdit: '進入編輯模式',
        convertingToPdf: '正在轉檔為 PDF...',
        toolInsertFile: '插入PDF',
        insertAtStart: '插入至開頭',
        insertAtEnd: '插入至結尾',
        insertBeforeSelection: '插入至選取頁之前',
        insertAfterSelection: '插入至選取頁之後',
        newDocConfirmTitle: '確認開啟新文件',
        newDocConfirmDescription: '這將會關閉目前正在編輯的文件，且不會儲存變更。確定要繼續嗎？',
        downloadEditedFile: '下載',
        toolDownload: '下載',
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

const saveAsFormatOptions = [
  { value: 'pdf', labelKey: 'downloadPdf', extension: 'pdf' },
  { value: 'word', labelKey: 'pdfToWord', extension: 'docx' },
  { value: 'excel', labelKey: 'pdfToExcel', extension: 'xlsx' },
  { value: 'ppt', labelKey: 'pdfToPpt', extension: 'pptx' },
  { value: 'html', labelKey: 'pdfToHtml', extension: 'html' },
  { value: 'jpg', labelKey: 'pdfToJpg', extension: 'zip' },
  { value: 'ocr', labelKey: 'pdfToOcr', extension: 'pdf' },
] as const;

type UploadStatus = {
    status: 'waiting' | 'uploading' | 'converting' | 'done' | 'error';
    progress: number;
    error?: string;
};

const MAX_BATCH_FILES = 10;
const MAX_TOTAL_SIZE_MB = 50;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;


const PagePreviewItem = React.memo(({ pageObj, index, isSelected, onClick, onDoubleClick, texts }: {
  pageObj: PageObject;
  index: number;
  isSelected: boolean;
  onClick: (event: React.MouseEvent) => void;
  onDoubleClick: () => void;
  texts: typeof translations.en;
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

const fonts = [
  { name: 'Arial', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times-Roman' },
  { name: 'Courier', value: 'Courier' },
];

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

const TextAnnotationToolbar = ({ annotation, onAnnotationChange, onDelete }: { annotation: TextAnnotation; onAnnotationChange: (id: string, annotation: Partial<TextAnnotation>) => void; onDelete: (id: string) => void; }) => {
    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-card p-2 rounded-lg shadow-lg border flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
            <Select value={annotation.fontFamily} onValueChange={(value) => onAnnotationChange(annotation.id, { fontFamily: value })}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                    {fonts.map(font => <SelectItem key={font.value} value={font.value} className="text-xs">{font.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={String(annotation.fontSize)} onValueChange={(value) => onAnnotationChange(annotation.id, { fontSize: Number(value) })}>
                <SelectTrigger className="w-[60px] h-8 text-xs">
                    <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                    {fontSizes.map(size => <SelectItem key={size} value={String(size)} className="text-xs">{size}</SelectItem>)}
                </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6" />
            <Toggle pressed={annotation.bold} onPressedChange={(pressed) => onAnnotationChange(annotation.id, { bold: pressed })}>
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle pressed={annotation.italic} onPressedChange={(pressed) => onAnnotationChange(annotation.id, { italic: pressed })}>
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle pressed={annotation.underline} onPressedChange={(pressed) => onAnnotationChange(annotation.id, { underline: pressed })}>
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
                    <Input type="color" value={annotation.color} onChange={(e) => onAnnotationChange(annotation.id, { color: e.target.value })} className="w-full h-10 p-1 border-0" />
                </PopoverContent>
            </Popover>
            <Separator orientation="vertical" className="h-6" />
            <ToggleGroup type="single" value={annotation.textAlign} onValueChange={(value: TextAnnotation['textAlign']) => value && onAnnotationChange(annotation.id, { textAlign: value })}>
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

const ShapeToolbar = ({ annotation, onAnnotationChange, onDelete }: { annotation: ShapeAnnotation; onAnnotationChange: (id: string, annotation: Partial<ShapeAnnotation>) => void; onDelete: (id: string) => void; }) => {
    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-card p-2 rounded-lg shadow-lg border flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
             <Label>Fill</Label>
             <Input type="color" value={annotation.fillColor} onChange={(e) => onAnnotationChange(annotation.id, { fillColor: e.target.value })} className="w-10 h-8 p-1"/>
             <Label>Stroke</Label>
             <Input type="color" value={annotation.strokeColor} onChange={(e) => onAnnotationChange(annotation.id, { strokeColor: e.target.value })} className="w-10 h-8 p-1"/>
             <Separator orientation="vertical" className="h-6" />
             <Label>Width</Label>
             <Slider min={1} max={20} step={1} value={[annotation.strokeWidth]} onValueChange={val => onAnnotationChange(annotation.id, { strokeWidth: val[0] })} className="w-24"/>
             <Separator orientation="vertical" className="h-6" />
             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(annotation.id)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

const TextAnnotationComponent = ({
    annotation,
    mainCanvasZoom,
    isSelected,
    isEditing,
    onAnnotationChange,
    onSelect,
    onEdit,
    onDragStart,
    onResizeStart,
}: {
    annotation: TextAnnotation,
    mainCanvasZoom: number,
    isSelected: boolean,
    isEditing: boolean,
    onAnnotationChange: (id: string, annotation: Partial<TextAnnotation>) => void,
    onSelect: (id: string, e: React.MouseEvent) => void,
    onEdit: (id: string, e: React.MouseEvent) => void,
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
              if (!isEditing) onSelect(annotation.id, e);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onEdit(annotation.id, e);
            }}
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
                onChange={(e) => onAnnotationChange(annotation.id, { ...annotation, text: e.target.value })}
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

const TriangleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
        <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
)

const ShapeAnnotationComponent = ({ annotation, onDragStart, onResizeStart, onSelect, isSelected }: {
    annotation: ShapeAnnotation;
    onDragStart: (e: React.MouseEvent, id: string) => void;
    onResizeStart: (e: React.MouseEvent, id: string) => void;
    onSelect: (e: React.MouseEvent, id: string) => void;
    isSelected: boolean;
}) => {
    const shapeStyle = {
        fill: annotation.fillColor,
        stroke: annotation.strokeColor,
        strokeWidth: annotation.strokeWidth,
    };

    const wrapperStyle = {
        left: `${annotation.leftRatio * 100}%`,
        top: `${annotation.topRatio * 100}%`,
        width: `${annotation.widthRatio * 100}%`,
        height: `${annotation.heightRatio * 100}%`,
        zIndex: 18,
    };

    return (
        <div
            onMouseDown={(e) => onDragStart(e, annotation.id)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(e, annotation.id);
            }}
            className={cn("absolute cursor-grab", isSelected && "border-2 border-dashed border-primary")}
            style={wrapperStyle}
        >
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                {annotation.type === 'rect' && <rect x={0} y={0} width="100" height="100" {...shapeStyle} />}
                {annotation.type === 'ellipse' && <ellipse cx="50" cy="50" rx="50" ry="50" {...shapeStyle} />}
                {annotation.type === 'triangle' && <polygon points="50,0 100,100 0,100" {...shapeStyle} />}
            </svg>
            {isSelected && (
                <div
                    className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize"
                    onMouseDown={(e) => onResizeStart(e, annotation.id)}
                />
            )}
        </div>
    );
};

const SignaturePad = ({ onSave, texts }: { onSave: (dataUrl: string) => void, texts: typeof translations.en }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const lastPos = useRef({ x: 0, y: 0 });

    const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent | MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    const draw = (e: React.MouseEvent | MouseEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const pos = getMousePos(canvas, e);
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
        lastPos.current = pos;
    };

    const startDrawing = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        setIsDrawing(true);
        lastPos.current = getMousePos(canvasRef.current, e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearPad = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    const handleSave = () => {
        if (!canvasRef.current) return;
        onSave(canvasRef.current.toDataURL('image/png'));
    };
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if(canvas) {
            const parent = canvas.parentElement;
            if(parent) {
                canvas.width = parent.clientWidth;
                canvas.height = 300;
            }
        }
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <canvas
                ref={canvasRef}
                className="w-full bg-muted/50 rounded-md border cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
            <div className="flex justify-between items-center gap-4">
                <div className='flex items-center gap-2'>
                  <Label htmlFor="sig-color">{texts.signatureColor}</Label>
                  <Input id="sig-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-8 p-1"/>
                </div>
                <div className='flex items-center gap-2'>
                  <Label htmlFor="sig-stroke">{texts.signatureStrokeWidth}</Label>
                  <Slider id="sig-stroke" min={1} max={10} step={1} value={[strokeWidth]} onValueChange={val => setStrokeWidth(val[0])} className="w-32"/>
                </div>
                <Button variant="outline" onClick={clearPad}>{texts.signatureClear}</Button>
                <Button onClick={handleSave}>{texts.signatureSave}</Button>
            </div>
        </div>
    )
}

const initialEditorState: EditorState = {
  pageObjects: [],
  annotations: [],
};


export default function PdfEditorPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [editorState, setEditorState] = useState<EditorState>(initialEditorState);
  const [history, setHistory] = useState<EditorState[]>([initialEditorState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());

  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'grid'>('editor');
  
  // Refactored state management
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);

  const mainViewContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mainCanvasZoom, setMainCanvasZoom] = useState(1);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isNewDocConfirmOpen, setIsNewDocConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);

  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
  const [texts, setTexts] = useState(translations.zh);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<LinkAnnotationDef>({ type: 'url', value: '' });

  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);

  const [pageTextContents, setPageTextContents] = useState<PageTextContent[]>([]);
  const [hasTextLayer, setHasTextLayer] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchCaseSensitive, setIsSearchCaseSensitive] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0, initialLeft: 0, initialTop: 0, initialWidth: 0, initialHeight: 0 });
  const drawingStartRef = useRef<{ pageIndex: number; startX: number; startY: number; id: string } | null>(null);

  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);
  const [guestLimitModalContent, setGuestLimitModalContent] = useState({ title: '', description: '' });
  const [isConvertConfirmOpen, setIsConvertConfirmOpen] = useState(false);
  const [pendingFileToConvert, setPendingFileToConvert] = useState<File | null>(null);

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pdfUploadRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const insertPdfRef = useRef<HTMLInputElement>(null);
  const convertUploadRef = useRef<HTMLInputElement>(null);
  const sortableInstanceRef = useRef<Sortable | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const insertionTargetRef = useRef<'start' | 'end' | 'before' | 'after'>('end');

  const recordNextStateRef = useRef(false);

  // Destructure state for easier access in JSX
  const { pageObjects, annotations } = editorState;
  
  const textAnnotations = annotations.filter(a => a.type === 'text') as TextAnnotation[];
  const imageAnnotations = annotations.filter(a => a.type === 'image') as ImageAnnotation[];
  const highlightAnnotations = annotations.filter(a => a.type === 'highlight') as HighlightAnnotation[];
  const shapeAnnotations = annotations.filter(a => a.type === 'shape') as ShapeAnnotation[];
  const mosaicAnnotations = annotations.filter(a => a.type === 'mosaic') as MosaicAnnotation[];
  const scribbleAnnotations = annotations.filter(a => a.type === 'scribble') as ScribbleAnnotation[];

  const updateState = useCallback((newPartialState: Partial<EditorState>, isHistoryEvent: boolean = true) => {
    setEditorState(prevState => {
      const newState = { ...prevState, ...newPartialState };
      // Ensure all annotations have a type property
      if (newState.annotations) {
        newState.annotations = newState.annotations.map(a => ({...a, type: a.type || 'text'})); // Simple fix, may need improvement
      }
      return newState;
    });

    if(isHistoryEvent) {
        recordNextStateRef.current = true;
    }
  }, []);

  const addAnnotation = (annotation: Annotation) => {
    updateState({ annotations: [...annotations, annotation] });
  };
  
  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    updateState({
        annotations: annotations.map(ann => ann.id === id ? { ...ann, ...updates } : ann)
    }, false);
  };

  useEffect(() => {
    if (recordNextStateRef.current) {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, editorState]);
        setHistoryIndex(newHistory.length);
        recordNextStateRef.current = false;
    }
  }, [editorState, history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setEditorState(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setEditorState(history[newIndex]);
    }
  };


  useEffect(() => {
    setTexts(translations[currentLanguage] || translations.en);
  }, [currentLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedInStatus);
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

                const reorderedPageObjects = Array.from(pageObjects);
                const [movedItem] = reorderedPageObjects.splice(evt.oldIndex!, 1);
                reorderedPageObjects.splice(evt.newIndex!, 0, movedItem);
                updateState({ pageObjects: reorderedPageObjects });
            }
        });
    }
  }, [pageObjects, updateState]);

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


  const handleFitToPage = useCallback(() => {
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

  // Pan Tool Logic
    const panState = useRef({ isPanning: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

    const handlePanMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeTool !== 'pan' || !mainViewContainerRef.current) return;
        e.preventDefault();
        panState.current = {
            isPanning: true,
            startX: e.pageX - mainViewContainerRef.current.offsetLeft,
            startY: e.pageY - mainViewContainerRef.current.offsetTop,
            scrollLeft: mainViewContainerRef.current.scrollLeft,
            scrollTop: mainViewContainerRef.current.scrollTop,
        };
        mainViewContainerRef.current.style.cursor = 'grabbing';
    };

    const handlePanMouseUpAndLeave = () => {
        panState.current.isPanning = false;
        if(mainViewContainerRef.current) mainViewContainerRef.current.style.cursor = 'grab';
    };
    
    const handlePanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!panState.current.isPanning || !mainViewContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - mainViewContainerRef.current.offsetLeft;
        const y = e.pageY - mainViewContainerRef.current.offsetTop;
        const walkX = (x - panState.current.startX);
        const walkY = (y - panState.current.startY);
        mainViewContainerRef.current.scrollLeft = panState.current.scrollLeft - walkX;
        mainViewContainerRef.current.scrollTop = panState.current.scrollTop - walkY;
    };


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

  const checkAndDecrementQuota = useCallback((quotaType: 'daily' | 'convert'): boolean => {
      if (isLoggedIn) {
        return true; 
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


  const processPdfFile = async (file: File): Promise<PageObject[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDocProxy = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    }).promise;

    const numPages = pdfDocProxy.numPages;
    const loadedPageObjects: PageObject[] = [];
    const textContents: PageTextContent[] = [];

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

      const textContent = await page.getTextContent();
      if(textContent.items.length > 0) setHasTextLayer(true);
      textContents.push({ pageIndex: i - 1, items: textContent.items });
    }
    setPageTextContents(textContents);
    return loadedPageObjects;
  };
  
  const loadPdfIntoEditor = async (file: File) => {
    setIsLoading(true);
    setLoadingMessage(texts.loadingPdf);
    try {
      const newPageObjects = await processPdfFile(file);
      
      const newState: EditorState = {
        ...initialEditorState,
        pageObjects: newPageObjects,
      };
      setEditorState(newState);
      setHistory([newState]);
      setHistoryIndex(0);

      setSelectedPageIds(new Set());
      setActivePageIndex(0);
      setViewMode('editor');
      
      setTimeout(() => handleFitToWidth(), 100);

    } catch (err: any)
    {
      toast({ title: texts.loadError, description: err.message, variant: "destructive" });
      setEditorState(initialEditorState);
      setHistory([initialEditorState]);
      setHistoryIndex(0);
      setActivePageIndex(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      if (pdfUploadRef.current) pdfUploadRef.current.value = '';
    }
  }

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
    loadPdfIntoEditor(file);
  };

  const handleConfirmOpenNew = () => {
    const newState = {
      ...initialEditorState,
    };
    setEditorState(newState);
    setHistory([newState]);
    setHistoryIndex(0);
    setHasTextLayer(false);
    setSelectedPageIds(new Set());
    setActivePageIndex(null);
    
    if (pdfUploadRef.current) {
        pdfUploadRef.current.value = ''; 
        pdfUploadRef.current.click();
    }
    
    setIsNewDocConfirmOpen(false);
  };

  const handleDeletePages = () => {
    if (selectedPageIds.size === 0) {
        toast({ title: texts.pageManagement, description: texts.noPageSelected, variant: "destructive" });
        return;
    }
    const newPages = pageObjects.filter(p => !selectedPageIds.has(p.id));

    updateState({ pageObjects: newPages });
    setActivePageIndex(null);
    setSelectedPageIds(new Set());

    if (newPages.length === 0) {
      updateState({ pageObjects: [] });
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

  const generatePdfBytes = async (): Promise<Uint8Array> => {
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
      
      const pageAnnotations = annotations.filter(a => a.pageIndex === index);

      for (const annotation of pageAnnotations.filter(a => a.type === 'highlight') as HighlightAnnotation[]) {
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
      
      for (const annotation of pageAnnotations.filter(a => a.type === 'rect' || a.type === 'ellipse' || a.type === 'triangle') as ShapeAnnotation[]) {
          const x = annotation.leftRatio * pageWidth;
          const y = pageHeight - (annotation.topRatio * pageHeight) - (annotation.heightRatio * pageHeight);
          const width = annotation.widthRatio * pageWidth;
          const height = annotation.heightRatio * pageHeight;
          const { r: fillR, g: fillG, b: fillB } = hexToRgb(annotation.fillColor);
          const { r: strokeR, g: strokeG, b: strokeB } = hexToRgb(annotation.strokeColor);

          if (annotation.type === 'rect') {
              pdfLibPage.drawRectangle({ x, y, width, height, color: rgb(fillR, fillG, fillB), borderColor: rgb(strokeR, strokeG, strokeB), borderWidth: annotation.strokeWidth });
          } else if (annotation.type === 'ellipse') {
              pdfLibPage.drawEllipse({ x: x + width/2, y: y + height/2, xScale: width/2, yScale: height/2, color: rgb(fillR, fillG, fillB), borderColor: rgb(strokeR, strokeG, strokeB), borderWidth: annotation.strokeWidth });
          } else if (annotation.type === 'triangle') {
               const points = [ {x: x + width / 2, y: y + height}, {x: x, y}, {x: x + width, y} ];
               pdfLibPage.drawPolygon({ points, color: rgb(fillR, fillG, fillB), borderColor: rgb(strokeR, strokeG, strokeB), borderWidth: annotation.strokeWidth });
          }
      }
      
      for (const annotation of pageAnnotations.filter(a => a.type === 'mosaic') as MosaicAnnotation[]) {
          const mosaicX = annotation.leftRatio * pageWidth;
          const mosaicY = pageHeight - (annotation.topRatio * pageHeight) - (annotation.heightRatio * pageHeight);
          const mosaicWidth = annotation.widthRatio * pageWidth;
          const mosaicHeight = annotation.heightRatio * pageHeight;

          const sourcePageCanvas = pageObjects[index].sourceCanvas;
          const tempMosaicCanvas = document.createElement('canvas');
          const tempMosaicCtx = tempMosaicCanvas.getContext('2d', { willReadFrequently: true });
          if (!tempMosaicCtx) continue;

          tempMosaicCanvas.width = mosaicWidth;
          tempMosaicCanvas.height = mosaicHeight;

          tempMosaicCtx.drawImage(
            sourcePageCanvas,
            annotation.leftRatio * sourcePageCanvas.width,
            annotation.topRatio * sourcePageCanvas.height,
            annotation.widthRatio * sourcePageCanvas.width,
            annotation.heightRatio * sourcePageCanvas.height,
            0, 0, mosaicWidth, mosaicHeight
          );

          const PIXELATION_LEVEL = 10;
          const w = tempMosaicCanvas.width / PIXELATION_LEVEL;
          const h = tempMosaicCanvas.height / PIXELATION_LEVEL;
          
          tempMosaicCtx.imageSmoothingEnabled = false;
          tempMosaicCtx.drawImage(tempMosaicCanvas, 0, 0, w, h);
          tempMosaicCtx.drawImage(tempMosaicCanvas, 0, 0, w, h, 0, 0, tempMosaicCanvas.width, tempMosaicCanvas.height);
          
          const pixelatedImage = await pdfDocOut.embedPng(tempMosaicCanvas.toDataURL());
          pdfLibPage.drawImage(pixelatedImage, { x: mosaicX, y: mosaicY, width: mosaicWidth, height: mosaicHeight });
      }

      for (const annotation of pageAnnotations.filter(a => a.type === 'image') as ImageAnnotation[]) {
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
      
      for (const annotation of pageAnnotations.filter(a => a.type === 'text') as TextAnnotation[]) {
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
    }
    
    return await pdfDocOut.save();
  };

  const handleDownloadOption = async (format: string) => {
    setShowDownloadOptions(false);
    if (pageObjects.length === 0) {
      toast({ title: 'Error', description: 'No document to save.' });
      return;
    }

    if (!checkAndDecrementQuota('convert')) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
            if (prev >= 95) {
                clearInterval(progressInterval);
                return prev;
            }
            return prev + 5;
        });
    }, 200);

    try {
        const pdfBytes = await generatePdfBytes();
        
        if (format === 'pdf') {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "edited_document.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast({ title: 'Download Successful', description: 'PDF has been saved.' });
        } else {
            const pdfFile = new File([pdfBytes], "edited_document.pdf", { type: "application/pdf" });
            const formData = new FormData();
            formData.append("file", pdfFile);
            formData.append("format", format);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000); 

            const response = await fetch("https://pdfsolution.dpdns.org/upload", {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Conversion failed with status: ${response.status}`);
            }
            
            const resBlob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            const formatOption = saveAsFormatOptions.find(opt => opt.value === format);
            let downloadFilename = `result.${formatOption?.extension || 'bin'}`;

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) downloadFilename = match[1];
            }

            const url = window.URL.createObjectURL(resBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            toast({ title: 'Download Successful', description: `${downloadFilename} has been saved.` });
        }
        setDownloadProgress(100);
        setTimeout(() => setIsDownloading(false), 500);

    } catch (err: any) {
        toast({ title: `Error processing file`, description: err.message, variant: "destructive" });
        setIsDownloading(false);
    } finally {
        clearInterval(progressInterval);
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
        handler(e as any);
    }
  };
  
  const handleDragMouseDown = (
      event: React.MouseEvent<HTMLElement>,
      id: string
  ) => {
      event.stopPropagation();
      const annotation = annotations.find(a => a.id === id);
      if (!annotation) return;

      const isResize = (event.target as HTMLElement).classList.contains('cursor-se-resize');
      
      const containerElement = (event.currentTarget.closest('.main-page-container')) as HTMLElement;
      if (!containerElement) return;

      const containerRect = containerElement.getBoundingClientRect();
      
      dragStartRef.current = {
          x: event.clientX,
          y: event.clientY,
          initialLeft: annotation.leftRatio * containerRect.width,
          initialTop: annotation.topRatio * containerRect.height,
          initialWidth: ('widthRatio' in annotation) ? annotation.widthRatio * containerRect.width : 0,
          initialHeight: ('heightRatio' in annotation) ? annotation.heightRatio * containerRect.height : 0
      };
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
          moveEvent.preventDefault();

          const deltaX = moveEvent.clientX - dragStartRef.current.x;
          const deltaY = moveEvent.clientY - dragStartRef.current.y;
          
          let updatedAnnotation: Partial<Annotation> = {};

          if (isResize) {
              const newWidthPx = dragStartRef.current.initialWidth + deltaX;
              const newHeightPx = dragStartRef.current.initialHeight + deltaY;
              let newWidthRatio = Math.max(0.01, newWidthPx / containerRect.width);
              let newHeightRatio = Math.max(0.01, newHeightPx / containerRect.height);
              
              if (annotation.type === 'image' || annotation.type === 'scribble') {
                  newWidthRatio = Math.max(0.05, newWidthPx / containerRect.width);
                  updatedAnnotation = { 
                      widthRatio: newWidthRatio, 
                      heightRatio: newWidthRatio / annotation.aspectRatio * (containerRect.width / containerRect.height)
                  };
              } else if (annotation.type === 'text') {
                  updatedAnnotation = { widthRatio: Math.max(0.1, newWidthPx / containerRect.width) };
              } else {
                  updatedAnnotation = { widthRatio: newWidthRatio, heightRatio: newHeightRatio };
              }
          }
          else { // Drag operation
              const newLeftPx = dragStartRef.current.initialLeft + deltaX;
              const newTopPx = dragStartRef.current.initialTop + deltaY;
              
              const currentWidthRatio = 'widthRatio' in annotation ? annotation.widthRatio : 0;
              const currentHeightRatio = 'heightRatio' in annotation ? annotation.heightRatio : 0;

              const newLeftRatio = Math.max(0, Math.min(1 - currentWidthRatio, newLeftPx / containerRect.width));
              const newTopRatio = Math.max(0, Math.min(1 - currentHeightRatio, newTopPx / containerRect.height));
              updatedAnnotation = { leftRatio: newLeftRatio, topRatio: newTopRatio };
          }
          updateAnnotation(id, updatedAnnotation);
      };

      const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          recordNextStateRef.current = true;
          setEditorState(prev => ({...prev})); // Trigger history recording
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
        const newPageObjects = pageObjects.map((page, index) => {
            if (index === activePageIndex) {
                const newRotation = (page.rotation + (direction === 'cw' ? 90 : -90) + 360) % 360;
                return { ...page, rotation: newRotation };
            }
            return page;
        });
        updateState({ pageObjects: newPageObjects });
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

        const newPages = [...pageObjects];
        newPages.splice(insertAt, 0, newPageObject);
        updateState({ pageObjects: newPages });

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
        if (activePageIndex === null || !mainViewContainerRef.current) {
            toast({ title: texts.toolInsertText, description: texts.noPageSelected, variant: "destructive" });
            return;
        }

        const container = mainViewContainerRef.current;
        const topRatio = (container.scrollTop + container.clientHeight * 0.4) / container.scrollHeight;
        const leftRatio = (container.scrollLeft + container.clientWidth * 0.4) / container.scrollWidth;


        const newAnnotation: TextAnnotation = {
            id: uuidv4(),
            type: 'text',
            pageIndex: activePageIndex,
            text: texts.textAnnotationSample,
            topRatio: Math.min(0.8, topRatio),
            leftRatio: Math.min(0.8, leftRatio),
            widthRatio: 0.3,
            fontSize: 36,
            fontFamily: 'Helvetica',
            bold: false,
            italic: false,
            underline: false,
            color: '#000000',
            textAlign: 'left',
        };
        addAnnotation(newAnnotation);
        setSelectedAnnotationId(newAnnotation.id);
    };
    
    const handleDeleteAnnotation = (id: string) => {
        updateState({ annotations: annotations.filter(a => a.id !== id) });
        setSelectedAnnotationId(null);
        setEditingAnnotationId(null);
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
                type: 'image',
                pageIndex,
                dataUrl,
                topRatio: 0.5,
                leftRatio: 0.5,
                widthRatio,
                heightRatio,
                aspectRatio
            };
            addAnnotation(newAnnotation);
            setSelectedAnnotationId(newAnnotation.id);
        };
        img.src = dataUrl;
    }, [addAnnotation]);

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
    
    const handleAddHighlightAnnotation = () => {
      if (activePageIndex === null) return;
      const newAnnotation: HighlightAnnotation = {
        id: uuidv4(),
        type: 'highlight',
        pageIndex: activePageIndex,
        topRatio: 0.4,
        leftRatio: 0.4,
        widthRatio: 0.2,
        heightRatio: 0.05,
        color: 'rgba(255, 255, 0, 0.4)',
      };
      addAnnotation(newAnnotation);
      setSelectedAnnotationId(newAnnotation.id);
    };

    const handleAddShapeAnnotation = (type: ShapeAnnotation['type']) => {
        if(activePageIndex === null) return;
        const newShape: ShapeAnnotation = {
            id: uuidv4(),
            pageIndex: activePageIndex,
            type,
            topRatio: 0.4,
            leftRatio: 0.4,
            widthRatio: 0.2,
            heightRatio: 0.2,
            fillColor: '#3b82f6',
            strokeColor: '#000000',
            strokeWidth: 2,
        };
        addAnnotation(newShape);
        setSelectedAnnotationId(newShape.id);
        setActiveTool('select');
    }
    
    const handleSaveSignature = (dataUrl: string) => {
        if(activePageIndex === null) return;
        addImageAnnotation(dataUrl, activePageIndex);
        setIsSignatureDialogOpen(false);
    }
    
    const handleApplyImageToAllPages = () => {
        if(!selectedAnnotationId) return;
        const baseAnnotation = annotations.find(a => a.id === selectedAnnotationId);
        if (!baseAnnotation || baseAnnotation.type !== 'image') return;

        const newAnnotations: ImageAnnotation[] = [];
        for (let i=0; i < pageObjects.length; i++) {
            if (i === baseAnnotation.pageIndex) continue; 
            
            const existingAnnotationOnPage = imageAnnotations.find(a => a.pageIndex === i && a.dataUrl === baseAnnotation.dataUrl);
            if (!existingAnnotationOnPage) {
                newAnnotations.push({
                    ...(baseAnnotation as ImageAnnotation),
                    id: uuidv4(),
                    pageIndex: i,
                });
            }
        }
        
        updateState({ annotations: [...annotations, ...newAnnotations] });
        toast({ title: 'Success', description: 'Signature applied to all pages.' });
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          setSelectedAnnotationId(null);
          setEditingAnnotationId(null);
          setActiveTool('select');
      }
    };
    
    const handleAnnotationSelect = (id: string, e: React.MouseEvent) => {
      if (editingAnnotationId !== id) {
          setSelectedAnnotationId(id);
          setEditingAnnotationId(null);
      }
    };
    
    const handleAnnotationDoubleClick = (id: string, e: React.MouseEvent) => {
        const annotation = annotations.find(a => a.id === id);
        if (annotation && annotation.type === 'text') {
            setEditingAnnotationId(id);
            setSelectedAnnotationId(null);
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnnotationId !== null && editingAnnotationId === null) {
                handleDeleteAnnotation(selectedAnnotationId);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('paste', handlePaste);
        };
    }, [selectedAnnotationId, editingAnnotationId, handlePaste, handleUndo, handleRedo]);


    const handleOpenLinkPopover = () => {
        if (!selectedAnnotationId) return;
        const annotation = annotations.find(a => a.id === selectedAnnotationId);
        if (!annotation || (annotation.type !== 'text' && annotation.type !== 'image')) return;

        if (annotation.link) {
            setCurrentLink(annotation.link);
        } else {
            setCurrentLink({ type: 'url', value: '' });
        }
    };

    const handleSaveLink = () => {
        if (!selectedAnnotationId) return;
        updateAnnotation(selectedAnnotationId, { link: currentLink });
        setIsLinkPopoverOpen(false);
        toast({ title: texts.linkAttached });
    };

    const handleRemoveLink = () => {
        if (!selectedAnnotationId) return;
        const annotation = annotations.find(a => a.id === selectedAnnotationId);
        if (!annotation) return;
        const { link, ...rest } = annotation;
        updateState({ annotations: annotations.map(a => a.id === selectedAnnotationId ? rest : a) });
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
    
    const editingTextAnnotation = editingAnnotationId
        ? annotations.find(a => a.id === editingAnnotationId && a.type === 'text') as TextAnnotation | undefined
        : undefined;

    const selectedShapeAnnotation = selectedAnnotationId
        ? annotations.find(a => a.id === selectedAnnotationId && (a.type === 'rect' || a.type === 'ellipse' || a.type === 'triangle')) as ShapeAnnotation | undefined
        : undefined;

    const handleZoom = (direction: 'in' | 'out') => {
      const ZOOM_STEP = 0.1;
      setMainCanvasZoom(prev => {
        let newZoom = direction === 'in' ? prev + ZOOM_STEP : prev - ZOOM_STEP;
        return Math.max(0.1, Math.min(newZoom, 5));
      });
    };
    
    const handleInitiateInsert = (target: 'start' | 'end' | 'before' | 'after') => {
      if (pageObjects.length === 0 && (target === 'before' || target === 'after')) {
          toast({ title: texts.noPageSelected, variant: "destructive" });
          return;
      }
      insertionTargetRef.current = target;
      if (insertPdfRef.current) {
        insertPdfRef.current.value = '';
        insertPdfRef.current.click();
      }
    };

    const handleInsertFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (!file || !file.type.includes('pdf')) {
            if(file) toast({ title: 'Invalid file', description: currentLanguage === 'zh' ? '請選擇一個有效的 PDF 檔案。' : 'Please select a valid PDF file.', variant: "destructive" });
            return;
        }
        proceedWithInsert(file);
    };

    const proceedWithInsert = async (fileToInsert: File) => {
        setIsLoading(true);
        setLoadingMessage(texts.insertingPdf);
        try {
            const newPages = await processPdfFile(fileToInsert);
            let insertAtIndex: number;

            switch (insertionTargetRef.current) {
                case 'start':
                    insertAtIndex = 0;
                    break;
                case 'end':
                    insertAtIndex = pageObjects.length;
                    break;
                case 'before':
                    insertAtIndex = activePageIndex ?? 0;
                    break;
                case 'after':
                    insertAtIndex = (activePageIndex ?? pageObjects.length - 1) + 1;
                    break;
                default:
                    insertAtIndex = pageObjects.length;
            }
            
            const newPageObjects = [...pageObjects];
            newPageObjects.splice(insertAtIndex, 0, ...newPages);
            updateState({ pageObjects: newPageObjects });
            
            toast({ title: "Insert Success", description: currentLanguage === 'zh' ? `${fileToInsert.name} 已成功插入。` : `${fileToInsert.name} has been inserted.` });

        } catch (err: any) {
            toast({ title: texts.insertError, description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            if (insertPdfRef.current) insertPdfRef.current.value = '';
        }
    };

    const triggerConvertUpload = (acceptType: string) => {
        if (convertUploadRef.current) {
            convertUploadRef.current.accept = acceptType;
            convertUploadRef.current.click();
        }
    };

    const handleConvertFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPendingFileToConvert(file);
            setIsConvertConfirmOpen(true);
        }
        if (convertUploadRef.current) convertUploadRef.current.value = '';
    };

    const startConversionProcess = async (mode: 'download' | 'edit') => {
        if (!pendingFileToConvert) return;

        setIsConvertConfirmOpen(false);
        setIsLoading(true);
        setLoadingMessage(texts.convertingToPdf);
        
        const formData = new FormData();
        formData.append('file', pendingFileToConvert);
        formData.append('format', 'pdf');

        try {
            const response = await fetch("https://pdfsolution.dpdns.org/convert_to_pdf", {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Conversion failed');
            
            const blob = await response.blob();
            const filename = pendingFileToConvert.name.split('.').slice(0, -1).join('.') + '.pdf';
            const convertedFile = new File([blob], filename, { type: 'application/pdf' });

            if (mode === 'edit') {
                await loadPdfIntoEditor(convertedFile);
            } else {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast({ title: texts.conversionSuccess, description: texts.conversionSuccessDesc(filename) });
            }
        } catch (err: any) {
            toast({ title: texts.conversionError, description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setPendingFileToConvert(null);
        }
    };
    
    // Drawing new annotations (mosaic)
    const handlePageMouseDown = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
        if (activeTool !== 'mosaic' && activeTool !== 'scribble') return;

        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const startX = (e.clientX - rect.left) / rect.width;
        const startY = (e.clientY - rect.top) / rect.height;
        const id = uuidv4();
        
        drawingStartRef.current = { pageIndex, startX, startY, id };
        
        if (activeTool === 'mosaic') {
            const newAnnotation: MosaicAnnotation = { id, type: 'mosaic', pageIndex, topRatio: startY, leftRatio: startX, widthRatio: 0, heightRatio: 0 };
            addAnnotation(newAnnotation);
        }
    };
    
    const handleMainViewMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        handlePanMouseMove(e); // Handle pan if active

        if (!drawingStartRef.current || activeTool !== 'mosaic') return;
        
        const { pageIndex, startX, startY, id } = drawingStartRef.current;
        const container = pageRefs.current[pageIndex];
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const mainRect = mainViewContainerRef.current!.getBoundingClientRect();

        // Adjust coordinates relative to the page, not the main view
        const currentX = (e.clientX - rect.left) / rect.width;
        const currentY = (e.clientY - rect.top) / rect.height;

        const leftRatio = Math.min(startX, currentX);
        const topRatio = Math.min(startY, currentY);
        const widthRatio = Math.abs(currentX - startX);
        const heightRatio = Math.abs(currentY - startY);

        updateAnnotation(id, { leftRatio, topRatio, widthRatio, heightRatio });
    };
    
    const handleMainViewMouseUp = () => {
        handlePanMouseUpAndLeave(); // Handle pan if active

        if (drawingStartRef.current) {
            const finalAnnotation = annotations.find(a => a.id === drawingStartRef.current!.id);
            if(finalAnnotation && ('widthRatio' in finalAnnotation) && (finalAnnotation.widthRatio < 0.01 || finalAnnotation.heightRatio < 0.01)) {
                updateState({ annotations: annotations.filter(a => a.id !== drawingStartRef.current!.id) }, false);
            } else {
                 recordNextStateRef.current = true;
                 setEditorState(prev => ({...prev})); // Trigger history
            }
        }
        
        drawingStartRef.current = null;
        if (activeTool === 'mosaic' || activeTool === 'scribble') {
            setActiveTool('select');
        }
    };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      {(isLoading || isDownloading) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-white text-lg">
            {isLoading ? loadingMessage : isDownloading ? texts.generatingFile : ''}
          </p>
          {isDownloading && <Progress value={downloadProgress} className="w-56 mt-2" />}
        </div>
      )}

      <Input type="file" id="pdfUploadInput" accept="application/pdf" onChange={handlePdfUpload} ref={pdfUploadRef} className="hidden" />
      <Input type="file" id="imageUploadInput" accept="image/*" onChange={handleImageFileSelected} ref={imageUploadRef} className="hidden" />
      <Input type="file" id="insertPdfInput" accept="application/pdf" onChange={handleInsertFileSelected} ref={insertPdfRef} className="hidden" />
      <Input type="file" id="convertUploadInput" onChange={handleConvertFileSelect} ref={convertUploadRef} className="hidden" />

      <AlertDialog open={isNewDocConfirmOpen} onOpenChange={setIsNewDocConfirmOpen}>
        <AlertDialogContent>
            <ShadAlertDialogHeader>
                <ShadAlertDialogTitle>{texts.newDocConfirmTitle}</ShadAlertDialogTitle>
                <ShadAlertDialogDescription>{texts.newDocConfirmDescription}</ShadAlertDialogDescription>
            </ShadAlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmOpenNew}>{texts.confirm}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConvertConfirmOpen} onOpenChange={setIsConvertConfirmOpen}>
        <AlertDialogContent>
            <ShadAlertDialogHeader>
                <ShadAlertDialogTitle>{texts.convertConfirmTitle}</ShadAlertDialogTitle>
                <ShadAlertDialogDescription>
                    {pendingFileToConvert ? texts.convertConfirmDescription(pendingFileToConvert.name) : ''}
                </ShadAlertDialogDescription>
            </ShadAlertDialogHeader>
            <AlertDialogFooter>
                <Button variant="outline" onClick={() => startConversionProcess('download')}>{texts.convertConfirmDownload}</Button>
                <Button onClick={() => startConversionProcess('edit')}>{texts.convertConfirmEdit}</Button>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isGuestLimitModalOpen} onOpenChange={setIsGuestLimitModalOpen}>
        <AlertDialogContent>
            <ShadAlertDialogHeader>
            <ShadAlertDialogTitle>{guestLimitModalContent.title}</ShadAlertDialogTitle>
            <ShadAlertDialogDescription>
                {guestLimitModalContent.description}
            </ShadAlertDialogDescription>
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
            <ShadAlertDialogDescription>
                {pageToDelete !== null ? texts.deletePageConfirmDescription : `${currentLanguage === 'zh' ? `您確定要刪除選取的 ${selectedPageIds.size} 個頁面嗎?` : `Are you sure you want to delete the ${selectedPageIds.size} selected pages?` }`}
            </ShadAlertDialogDescription>
            </ShadAlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPageToDelete(null)}>{texts.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePages}>{texts.confirm}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    <header className="p-0 border-b bg-card sticky top-0 z-40 flex-shrink-0 h-14">
        <Menubar className="rounded-none border-x-0 h-full px-4 lg:px-6">
            <div className="flex items-center gap-2">
                <MenuSquare className="mr-2 h-6 w-6"/>
                <h1 className="text-lg font-bold">{texts.appTitle}</h1>
            </div>
            <MenubarMenu>
                <MenubarTrigger>{texts.menuFile}</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onClick={() => {
                        if (pageObjects.length > 0) {
                            setIsNewDocConfirmOpen(true);
                        } else {
                            handleConfirmOpenNew();
                        }
                    }}><FilePlus className="mr-2 h-4 w-4"/>{texts.menuFileNew}</MenubarItem>
                    <MenubarSub>
                         <MenubarSubTrigger disabled={pageObjects.length > 0}><FolderOpen className="mr-2 h-4 w-4"/>{texts.menuFileOpen}</MenubarSubTrigger>
                         <MenubarSubContent>
                             <MenubarItem onClick={() => triggerConvertUpload('.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document')}>{texts.wordToPdf}</MenubarItem>
                             <MenubarItem onClick={() => triggerConvertUpload('.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}>{texts.excelToPdf}</MenubarItem>
                             <MenubarItem onClick={() => triggerConvertUpload('.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation')}>{texts.pptToPdf}</MenubarItem>
                         </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                        <MenubarSubTrigger disabled={pageObjects.length === 0}>
                           <FilePlus2 className="mr-2 h-4 w-4" />{texts.insertPdf}
                        </MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem onClick={() => handleInitiateInsert('start')}>{texts.insertAtStart}</MenubarItem>
                            <MenubarItem onClick={() => handleInitiateInsert('end')}>{texts.insertAtEnd}</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem onClick={() => handleInitiateInsert('before')} disabled={activePageIndex === null}>{texts.insertBeforeSelection}</MenubarItem>
                            <MenubarItem onClick={() => handleInitiateInsert('after')} disabled={activePageIndex === null}>{texts.insertAfterSelection}</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                        <MenubarSubTrigger disabled={pageObjects.length === 0}>
                            <Save className="mr-2 h-4 w-4"/>{texts.menuFileSaveAs}
                        </MenubarSubTrigger>
                        <MenubarSubContent>
                            {saveAsFormatOptions.map(opt => (
                                <MenubarItem key={opt.value} onClick={() => handleDownloadOption(opt.value)}>{opt.labelKey === 'downloadPdf' ? texts.downloadPdf : texts[opt.labelKey]}</MenubarItem>
                            ))}
                        </MenubarSubContent>
                    </MenubarSub>
                </MenubarContent>
            </MenubarMenu>
             <MenubarMenu>
                <MenubarTrigger>{texts.menuEdit}</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onClick={handleUndo} disabled={historyIndex <= 0}><Undo className="mr-2 h-4 w-4" />{texts.menuEditUndo}</MenubarItem>
                    <MenubarItem onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo className="mr-2 h-4 w-4" />{texts.menuEditRedo}</MenubarItem>
                    <MenubarSeparator/>
                    <MenubarItem onClick={handleAddTextAnnotation} disabled={activePageIndex === null}><Type className="mr-2 h-4 w-4"/>{texts.menuEditInsertText}</MenubarItem>
                    <MenubarItem onClick={() => imageUploadRef.current?.click()} disabled={activePageIndex === null}><ImagePlus className="mr-2 h-4 w-4"/>{texts.menuEditInsertImage}</MenubarItem>
                    <MenubarItem onClick={handleAddHighlightAnnotation} disabled={activePageIndex === null}><Highlighter className="mr-2 h-4 w-4"/>{texts.menuEditHighlight}</MenubarItem>
                    <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                        <PopoverTrigger asChild>
                            <MenubarItem disabled={!selectedAnnotationId || !['text', 'image'].includes(annotations.find(a=>a.id === selectedAnnotationId)?.type || '')} onSelect={(e) => e.preventDefault()} onClick={handleOpenLinkPopover}>
                                <LinkIcon className="mr-2 h-4 w-4"/>{texts.menuEditInsertLink}
                            </MenubarItem>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="right" align="start">
                            {linkPopoverContent}
                        </PopoverContent>
                    </Popover>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>{texts.menuPage}</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onClick={() => handleRotatePage('cw')} disabled={activePageIndex === null}><RotateCw className="mr-2 h-4 w-4" />{texts.menuPageRotateCW}</MenubarItem>
                    <MenubarItem onClick={() => handleRotatePage('ccw')} disabled={activePageIndex === null}><RotateCcw className="mr-2 h-4 w-4" />{texts.menuPageRotateCCW}</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={handleAddBlankPage}><FilePlus2 className="mr-2 h-4 w-4"/>{texts.menuPageAddBlank}</MenubarItem>
                    <MenubarItem onClick={() => { if(activePageIndex !== null) { setPageToDelete(activePageIndex); setIsDeleteConfirmOpen(true); } }} disabled={activePageIndex === null}>
                        <Trash2 className="mr-2 h-4 w-4 text-destructive"/>
                        <span className="text-destructive">{texts.menuPageDelete}</span>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
             <MenubarMenu>
                <MenubarTrigger>{texts.menuConvert}</MenubarTrigger>
                <MenubarContent>
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
        </Menubar>
    </header>

    <div className="p-2 border-b bg-card flex items-center justify-between gap-1 sticky top-[56px] z-30">
        <div className='flex items-center gap-1'>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant={activeTool === 'select' ? "secondary" : "ghost"} className="flex flex-col h-auto p-2 space-y-1" onClick={() => setActiveTool('select')}>
                            <MousePointerSquareDashed className="h-5 w-5" />
                            <span className="text-xs">{texts.toolSelect}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Select</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={activeTool === 'pan' ? "secondary" : "ghost"} className="flex flex-col h-auto p-2 space-y-1" onClick={() => setActiveTool('pan')}>
                            <Hand className="h-5 w-5" />
                            <span className="text-xs">{texts.toolPan}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>{texts.toolHand}</p></TooltipContent>
                </Tooltip>
                 <Separator orientation="vertical" className="h-10 mx-2" />

                <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={handleUndo} disabled={historyIndex <= 0}>
                       <Undo className="h-5 w-5" />
                       <span className="text-xs">{texts.menuEditUndo}</span>
                   </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{texts.menuEditUndo}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                           <Redo className="h-5 w-5" />
                           <span className="text-xs">{texts.menuEditRedo}</span>
                       </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>{texts.menuEditRedo}</p></TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-10 mx-2" />

                <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={handleAddTextAnnotation} disabled={activePageIndex === null}>
                        <Type className="h-5 w-5" />
                        <span className="text-xs">{texts.toolText}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{texts.menuEditInsertText}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={() => imageUploadRef.current?.click()} disabled={activePageIndex === null}>
                        <ImagePlus className="h-5 w-5" />
                        <span className="text-xs">{texts.toolImage}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{texts.menuEditInsertImage}</p></TooltipContent>
                </Tooltip>
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" disabled={pageObjects.length === 0}>
                                    <FilePlus2 className="h-5 w-5" />
                                    <span className="text-xs">{texts.toolInsertFile}</span>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p>{texts.insertPdf}</p></TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleInitiateInsert('start')}>{texts.insertAtStart}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInitiateInsert('end')}>{texts.insertAtEnd}</DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={() => handleInitiateInsert('before')} disabled={activePageIndex === null}>{texts.insertBeforeSelection}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInitiateInsert('after')} disabled={activePageIndex === null}>{texts.insertAfterSelection}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={handleAddHighlightAnnotation} disabled={activePageIndex === null}>
                        <Brush className="h-5 w-5" />
                        <span className="text-xs">{texts.toolHighlight}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{texts.menuEditHighlight}</p></TooltipContent>
                </Tooltip>
                <Popover>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <Button variant={activeTool === 'shape' ? "secondary" : "ghost"} className="flex flex-col h-auto p-2 space-y-1" onClick={() => setActiveTool('shape')} disabled={activePageIndex === null}>
                                    <Square className="h-5 w-5" />
                                    <span className="text-xs">{texts.toolShapeShort}</span>
                                </Button>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p>{texts.toolShape}</p></TooltipContent>
                    </Tooltip>
                     <PopoverContent className="w-auto p-2 flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleAddShapeAnnotation('rect')}><Square className="h-5 w-5 text-primary" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAddShapeAnnotation('ellipse')}><Circle className="h-5 w-5 text-primary" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAddShapeAnnotation('triangle')}><TriangleIcon /></Button>
                    </PopoverContent>
                </Popover>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={activeTool === 'scribble' ? "secondary" : "ghost"} className="flex flex-col h-auto p-2 space-y-1" onClick={() => setActiveTool('scribble')} disabled={activePageIndex === null}>
                            <Pencil className="h-5 w-5" />
                            <span className="text-xs">{texts.toolScribble}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>{texts.toolScribble}</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={activeTool === 'mosaic' ? "secondary" : "ghost"} className="flex flex-col h-auto p-2 space-y-1" onClick={() => setActiveTool('mosaic')} disabled={activePageIndex === null}>
                            <ShieldAlert className="h-5 w-5" />
                            <span className="text-xs">{texts.toolMosaic}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>{texts.toolMosaic}</p></TooltipContent>
                </Tooltip>
                <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" disabled={activePageIndex === null}>
                                    <Edit3 className="h-5 w-5" />
                                    <span className="text-xs">{texts.toolSignature}</span>
                                </Button>
                            </DialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p>{texts.toolSignature}</p></TooltipContent>
                    </Tooltip>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{texts.signaturePadTitle}</DialogTitle>
                            <DialogDescription>{texts.signaturePadDescription}</DialogDescription>
                        </DialogHeader>
                        <SignaturePad onSave={handleSaveSignature} texts={texts}/>
                    </DialogContent>
                </Dialog>

                <Separator orientation="vertical" className="h-10 mx-2" />

                <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={() => handleRotatePage('ccw')} disabled={activePageIndex === null}>
                        <RotateCcw className="h-5 w-5" />
                        <span className="text-xs">{texts.toolRotate}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{texts.menuPageRotateCCW}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={handleAddBlankPage}>
                        <FilePlus2 className="h-5 w-5" />
                        <span className="text-xs">{texts.toolAddBlank}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{texts.menuPageAddBlank}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={() => { if(activePageIndex !== null) { setPageToDelete(activePageIndex); setIsDeleteConfirmOpen(true); } }} disabled={activePageIndex === null}>
                        <Trash2 className="h-5 w-5 text-destructive"/>
                        <span className="text-xs text-destructive">{texts.toolDelete}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{texts.menuPageDelete}</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" className="flex flex-col h-auto p-2 space-y-1" onClick={() => setShowDownloadOptions(true)} disabled={pageObjects.length === 0}>
                            <Download className="h-5 w-5" />
                            <span className="text-xs">{texts.toolDownload}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>{texts.downloadEditedFile}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <div className="flex items-center gap-1">
             <TooltipProvider>
                 {selectedAnnotationId && annotations.find(a => a.id === selectedAnnotationId)?.type === 'image' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={handleApplyImageToAllPages}>
                                <Layers className="mr-2 h-4 w-4" /> {texts.applyToAllPages}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p>Apply this image/signature to all pages</p></TooltipContent>
                    </Tooltip>
                 )}
                 <Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => window.print()}><Printer className="h-5 w-5" /></Button></TooltipTrigger>
                    <TooltipContent side="bottom"><p>{texts.toolPrint}</p></TooltipContent>
                </Tooltip>
                <Popover>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                 <Button variant="ghost" size="icon" onClick={() => {
                                     if (!hasTextLayer) {
                                         toast({title: texts.searchNoResults, description: texts.noTextInPdf, variant: 'destructive'})
                                     }
                                 }} disabled={!hasTextLayer}>
                                     <SearchIcon className="h-5 w-5" />
                                 </Button>
                             </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom"><p>{texts.toolSearchDoc}</p></TooltipContent>
                    </Tooltip>
                    <PopoverContent side="bottom">
                        <div className="grid gap-4">
                             <p>Search coming soon</p>
                        </div>
                    </PopoverContent>
                </Popover>
            </TooltipProvider>
        </div>
    </div>


      <main className="flex-grow flex overflow-hidden relative">
        {editingTextAnnotation && (
            <TextAnnotationToolbar
                annotation={editingTextAnnotation}
                onAnnotationChange={updateAnnotation}
                onDelete={() => handleDeleteAnnotation(editingTextAnnotation.id)}
            />
        )}
        {selectedShapeAnnotation && (
             <ShapeToolbar
                annotation={selectedShapeAnnotation}
                onAnnotationChange={updateAnnotation}
                onDelete={() => handleDeleteAnnotation(selectedShapeAnnotation.id)}
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
                    onDrop={(e) => commonDragEvents.onDrop(e, handlePdfUpload)}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground text-center">{texts.dropFileHere}</p>
                  </div>
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
                <div ref={thumbnailContainerRef} className="w-[15%] border-r bg-card flex-shrink-0 overflow-y-auto p-2 space-y-2">
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

                <div ref={mainViewContainerRef} 
                    className={cn("flex-grow bg-muted/30 overflow-auto flex flex-col items-center p-4 space-y-4 relative", activeTool === 'pan' && 'cursor-grab', activeTool === 'mosaic' && 'cursor-crosshair')}
                    onMouseDown={handlePanMouseDown}
                    onMouseMove={handleMainViewMouseMove}
                    onMouseUp={handleMainViewMouseUp}
                    onClick={handleCanvasClick}
                >
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
                                    height: (rotation % 180 !== 0 ? sourceCanvas.width : sourceCanvas.height) * mainCanvasZoom,
                                    flexShrink: 0
                                }}
                                onMouseDown={(e) => handlePageMouseDown(e, index)}
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
                                        onMouseDown={(e) => handleDragMouseDown(e, ann.id)}
                                        onClick={(e) => { e.stopPropagation(); handleAnnotationSelect(ann.id, e); }}
                                        className={cn(
                                            "absolute cursor-grab",
                                            selectedAnnotationId === ann.id && "border-2 border-dashed border-primary"
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
                                        {selectedAnnotationId === ann.id && (
                                            <div
                                                className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize"
                                                onMouseDown={(e) => handleDragMouseDown(e, ann.id)}
                                            />
                                        )}
                                    </div>
                                ))}
                                {mosaicAnnotations.filter(ann => ann.pageIndex === index).map(ann => (
                                    <div
                                        key={ann.id}
                                        onMouseDown={(e) => handleDragMouseDown(e, ann.id)}
                                        onClick={(e) => { e.stopPropagation(); handleAnnotationSelect(ann.id, e); }}
                                        className={cn(
                                            "absolute cursor-grab",
                                            selectedAnnotationId === ann.id && "border-2 border-dashed border-primary"
                                        )}
                                        style={{
                                            left: `${ann.leftRatio * 100}%`,
                                            top: `${ann.topRatio * 100}%`,
                                            width: `${ann.widthRatio * 100}%`,
                                            height: `${ann.heightRatio * 100}%`,
                                            backdropFilter: 'blur(5px)',
                                            zIndex: 25,
                                        }}
                                    >
                                        {selectedAnnotationId === ann.id && (
                                            <div
                                                className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize"
                                                onMouseDown={(e) => handleDragMouseDown(e, ann.id)}
                                            />
                                        )}
                                    </div>
                                ))}
                                {shapeAnnotations.filter(ann => ann.pageIndex === index).map(ann => (
                                    <ShapeAnnotationComponent
                                        key={ann.id}
                                        annotation={ann}
                                        isSelected={selectedAnnotationId === ann.id}
                                        onDragStart={(e) => handleDragMouseDown(e, ann.id)}
                                        onResizeStart={(e) => handleDragMouseDown(e, ann.id)}
                                        onSelect={(e) => handleAnnotationSelect(ann.id, e)}
                                    />
                                ))}
                                {imageAnnotations.filter(ann => ann.pageIndex === index).map(ann => (
                                    <div
                                        key={ann.id}
                                        onMouseDown={(e) => { handleDragMouseDown(e, ann.id); }}
                                        onClick={(e) => { e.stopPropagation(); handleAnnotationSelect(ann.id, e); }}
                                        className={cn(
                                            "absolute cursor-grab",
                                            selectedAnnotationId === ann.id && "border-2 border-dashed border-primary"
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
                                        {selectedAnnotationId === ann.id && (
                                          <>
                                            <div
                                                className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize"
                                                onMouseDown={(e) => handleDragMouseDown(e, ann.id)}
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
                                        onSelect={handleAnnotationSelect}
                                        onEdit={handleAnnotationDoubleClick}
                                        onAnnotationChange={updateAnnotation}
                                        onDragStart={(e) => handleDragMouseDown(e, ann.id)}
                                        onResizeStart={(e) => handleDragMouseDown(e, ann.id)}
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
                        <Button variant="ghost" size="icon" onClick={handleFitToPage} title={texts.fitToPage}><Expand className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleFitToWidth} title={texts.fitToWidth}><Columns className="h-5 w-5" /></Button>
                         <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')} title={texts.gridMode}><LayoutGrid className="h-5 w-5" /></Button>
                    </div>
                </div>
            </>
          )}
      </main>
      {pageObjects.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
            {showDownloadOptions && (
                <Card className="p-2 mb-2 shadow-lg animate-in fade-in-0 slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-2">
                        {saveAsFormatOptions.map(opt => (
                            <Button key={opt.value} variant="ghost" size="sm" onClick={() => handleDownloadOption(opt.value)}>{texts[opt.labelKey]}</Button>
                        ))}
                    </div>
                </Card>
            )}
            <Button
              onClick={() => setShowDownloadOptions(prev => !prev)}
              size="lg"
              className="w-48 h-14 text-lg rounded-full shadow-2xl"
            >
              <Download className="mr-2 h-5 w-5" />
              {texts.toolDownload}
            </Button>
        </div>
      )}
    </div>
  );
}

