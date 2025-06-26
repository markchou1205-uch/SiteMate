
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
import { Loader2, RotateCcw, RotateCw, X, Trash2, Download, Upload, Info, Shuffle, Search, Edit3, Droplet, LogIn, LogOut, UserCircle, FileText, Lock, MenuSquare, Columns, ShieldCheck, FilePlus, ListOrdered, Move, CheckSquare, Image as ImageIcon, Minimize2, Palette, FontSize, Eye, Scissors, LayoutGrid, PanelLeft, FilePlus2, Combine, Type, ImagePlus, Link as LinkIcon, MessageSquarePlus, ZoomIn, ZoomOut, Expand, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Highlighter, ArrowRightLeft, Edit, FileUp, FileSpreadsheet, LucidePresentation, Code, FileImage, FileMinus, Droplets, ScanText, Sparkles, XCircle, File, FolderOpen, Save, Wrench, HelpCircle, PanelTop, Redo, Undo, Hand, Square, Circle, Pencil, Printer, SearchIcon, ChevronLeft, ChevronRight, CaseSensitive, MousePointerSquareDashed, Grid, ShieldAlert, Layers, Brush, History } from 'lucide-react';
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
  heightRatio: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  link?: LinkAnnotationDef;
  isUserAction?: boolean;
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
    isUserAction?: boolean;
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
  isUserAction?: boolean;
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
  isUserAction?: boolean;
}

interface ScribbleAnnotation {
    id: string;
    type: 'scribble';
    pageIndex: number;
    points: {xRatio: number, yRatio: number}[];
    color: string;
    strokeWidth: number;
    isUserAction?: boolean;
}

interface MosaicAnnotation {
    id: string;
    type: 'mosaic';
    pageIndex: number;
    topRatio: number;
    leftRatio: number;
    widthRatio: number;
    heightRatio: number;
    isUserAction?: boolean;
}

interface TableAnnotation {
  id: string;
  type: 'table';
  pageIndex: number;
  topRatio: number;
  leftRatio: number;
  widthRatio: number;
  heightRatio: number;
  rows: number;
  cols: number;
  cellPadding: number;
  strokeColor: string;
  strokeWidth: number;
  cells: string[][];
  isUserAction?: boolean;
}

type Annotation = TextAnnotation | ImageAnnotation | HighlightAnnotation | ShapeAnnotation | ScribbleAnnotation | MosaicAnnotation | TableAnnotation;

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

type Tool = 'select' | 'pan' | 'text' | 'image' | 'highlight' | 'shape' | 'signature' | 'scribble' | 'mosaic' | 'table';
type InteractionMode = 'idle' | 'selected' | 'editing' | 'drawing-mosaic' | 'drawing-scribble' | 'drawing-table' | 'drawing-shape';

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
        toolTable: 'Table',
        drawTable: 'Draw Table',
        tableConfigTitle: 'Configure Table',
        tableConfigDescription: 'Set the number of rows and columns for your new table.',
        tableRows: 'Rows',
        tableCols: 'Columns',
        createTable: 'Create Table',
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
        actionHistory: 'Action History',
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
        usageInfo: (files: number, size: string, remainingFiles: number, remainingSize: string) => `目前您已選擇 ${files} 份文件，大小總計 ${size}MB (尚可上傳 ${remainingFiles} 份文件或 ${remainingSize}MB)`
    }
};

export default function PdfEditorPage() {
    const router = useRouter();
    const { toast } = useToast();
  
    // Language and login state
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('zh');
    const [texts, setTexts] = useState(translations.zh);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    // PDF and page state
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
    const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'editor'>('editor');
    
    // Editor state
    const [isLoading, setIsLoading] = useState(false);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
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
    const drawingStartRef = useRef<{ pageIndex: number; startX: number; startY: number; id: string } | null>(null);
  
    // Derived state
    const activeTextAnnotation = (interactionMode === 'editing' && selectedAnnotationId)
      ? annotations.find(a => a.id === selectedAnnotationId && a.type === 'text') as TextAnnotation | undefined
      : undefined;
    const activeShapeAnnotation = (interactionMode === 'selected' && selectedAnnotationId)
        ? annotations.find(a => a.id === selectedAnnotationId && (a.type === 'rect' || a.type === 'ellipse' || a.type === 'triangle')) as ShapeAnnotation | undefined
        : undefined;

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
            if (
                !mainViewContainerRef.current?.contains(e.target as Node) &&
                !downloadRef.current?.contains(e.target as Node) &&
                !toolbarContainerRef.current?.contains(e.target as Node)
            ) {
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
        setPdfDoc(pdf);
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
        setAnnotations(prev => {
            const newAnnotations = prev.map(a => (a.id === id ? { ...a, ...updates } : a));
            updateHistory({ pageObjects, annotations: newAnnotations });
            return newAnnotations;
        });
    };

    // --- Annotation Actions ---
    const handleAddAnnotation = (type: Tool) => {
        if (activePageIndex === null) return;
        const commonProps = { pageIndex: activePageIndex, leftRatio: 0.1, topRatio: 0.1, isUserAction: true, id: uuidv4() };

        let newAnnotation: Annotation | null = null;
        
        switch(type) {
            case 'text':
                newAnnotation = { ...commonProps, type, text: texts.textAnnotationSample, widthRatio: 0.3, heightRatio: 0.05, fontSize: 12, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#000000', textAlign: 'left' };
                break;
            case 'image':
                // Trigger file input for image
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
                                const imgAnn: ImageAnnotation = { ...commonProps, type, dataUrl: event.target?.result as string, widthRatio: 0.2, heightRatio: 0.2 / aspectRatio, aspectRatio };
                                setAnnotations(prev => [...prev, imgAnn]);
                            }
                            img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
                return; // Return early, annotation is added in callback
            case 'shape':
                setActiveTool('shape'); // Let user draw the shape
                return;
            case 'table':
                setTableConfig({ rows: 3, cols: 3 }); // Open config dialog
                return;
        }

        if (newAnnotation) {
            setAnnotations(prev => {
                const newAnnotations = [...prev, newAnnotation!];
                updateHistory({ pageObjects, annotations: newAnnotations });
                return newAnnotations;
            });
            setSelectedAnnotationId(newAnnotation.id);
            if(type === 'text') setInteractionMode('editing');
        }
    };
    
    const handleAddShapeAnnotation = (type: 'rect' | 'ellipse' | 'triangle') => {
        if (activePageIndex === null) return;
        setActiveTool('shape');
        // Store the shape type to be drawn
        drawingStartRef.current = { ...drawingStartRef.current, shapeType: type } as any;
    };
    
    const handleDeleteAnnotation = (id: string) => {
        setAnnotations(prev => {
            const newAnnotations = prev.filter(a => a.id !== id);
            updateHistory({ pageObjects, annotations: newAnnotations });
            return newAnnotations;
        });
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
        if (!['shape', 'mosaic', 'scribble', 'table'].includes(activeTool)) return;
        
        e.stopPropagation();
        setInteractionMode(`drawing-${activeTool}` as InteractionMode);

        const container = e.currentTarget;
        const rect = container.getBoundingClientRect();
        const startX = (e.clientX - rect.left) / mainCanvasZoom;
        const startY = (e.clientY - rect.top) / mainCanvasZoom;
        const id = uuidv4();
        drawingStartRef.current = { pageIndex, startX, startY, id };
        
        let newAnnotation: Annotation | null = null;
        const commonProps = { id, pageIndex, leftRatio: startX / rect.width, topRatio: startY / rect.height, widthRatio: 0, heightRatio: 0, isUserAction: true };
        
        if (activeTool === 'shape') {
            const shapeType = (drawingStartRef.current as any).shapeType || 'rect';
            newAnnotation = { ...commonProps, type: shapeType, fillColor: '#ffffff', strokeColor: '#000000', strokeWidth: 2 };
        } else if (activeTool === 'mosaic') {
            newAnnotation = { ...commonProps, type: 'mosaic' };
        } else if (activeTool === 'scribble') {
            newAnnotation = { ...commonProps, type: 'scribble', points: [{xRatio: startX / rect.width, yRatio: startY / rect.height}], color: '#000000', strokeWidth: 2 };
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
        const currentX = (e.clientX - rect.left) / mainCanvasZoom;
        const currentY = (e.clientY - rect.top) / mainCanvasZoom;
        
        if (interactionMode === 'drawing-scribble') {
            const currentAnnotation = annotations.find(a => a.id === id) as ScribbleAnnotation;
            if(currentAnnotation) {
                const newPoints = [...currentAnnotation.points, { xRatio: currentX / rect.width, yRatio: currentY / rect.height }];
                updateAnnotation(id, { points: newPoints });
            }
        } else {
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            updateAnnotation(id, { leftRatio: left / rect.width, topRatio: top / rect.height, widthRatio: width / rect.width, heightRatio: height / rect.height });
        }
    };

    const handleMainViewMouseUp = () => {
        handlePanMouseUpAndLeave();
        if (drawingStartRef.current) {
            drawingStartRef.current = null;
            setActiveTool('select');
            setInteractionMode('idle');
            updateHistory({ pageObjects, annotations });
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

    // Action History / Layers Panel
    const ActionHistoryPanel = () => (
        <div className="w-64 bg-card border-l p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">{texts.actionHistory}</h3>
            <div className="space-y-2">
                {annotations.filter(a => a.isUserAction).map(ann => (
                    <div
                        key={ann.id}
                        className={cn("p-2 border rounded-md cursor-pointer flex justify-between items-center", selectedAnnotationId === ann.id && "bg-primary/20 border-primary")}
                        onClick={() => setSelectedAnnotationId(ann.id)}
                    >
                        <span className="text-sm truncate">{ann.type}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleDeleteAnnotation(ann.id)}}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
    
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
            {/* Header and Toolbar */}
            <header className="p-2 border-b bg-card flex items-center justify-between gap-4 sticky top-0 z-30">
                 <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip><TooltipTrigger asChild><Button variant={activeTool === 'select' ? "secondary" : "ghost"} className="h-auto p-2" onClick={() => setActiveTool('select')}><MousePointerSquareDashed className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>Select</p></TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button variant={activeTool === 'pan' ? "secondary" : "ghost"} className="h-auto p-2" onClick={() => setActiveTool('pan')}><Hand className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>Pan</p></TooltipContent></Tooltip>
                    </TooltipProvider>
                    <Separator orientation="vertical" className="h-6"/>
                    <TooltipProvider>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" className="h-auto p-2" onClick={() => handleAddAnnotation('text')}><Type className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>Add Text</p></TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild><Button variant="ghost" className="h-auto p-2" onClick={() => handleAddAnnotation('image')}><ImageIcon className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>Add Image</p></TooltipContent></Tooltip>
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
                            <Tooltip><TooltipTrigger asChild><Button variant={activeTool === 'table' ? "secondary" : "ghost"} className="h-auto p-2" onClick={() => handleAddAnnotation('table')}><Grid className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>Add Table</p></TooltipContent></Tooltip>
                             <DialogContent>
                                <DialogHeader><DialogTitle>{texts.tableConfigTitle}</DialogTitle><DialogDescription>{texts.tableConfigDescription}</DialogDescription></DialogHeader>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="rows">{texts.tableRows}</Label><Input id="rows" type="number" value={tableConfig?.rows} onChange={e => setTableConfig(p => ({...p!, rows: parseInt(e.target.value)}))} /></div>
                                    <div className="space-y-2"><Label htmlFor="cols">{texts.tableCols}</Label><Input id="cols" type="number" value={tableConfig?.cols} onChange={e => setTableConfig(p => ({...p!, cols: parseInt(e.target.value)}))} /></div>
                                </div>
                                <AlertDialogFooter>
                                    <Button variant="outline" onClick={() => setTableConfig(null)}>{texts.cancel}</Button>
                                    <Button onClick={() => { setActiveTool('table'); setTableConfig(tableConfig); }}>{texts.createTable}</Button>
                                </AlertDialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TooltipProvider>
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
            </header>

            <div className="flex flex-grow overflow-hidden">
                <main className="flex-grow flex flex-col relative">
                     <div ref={toolbarContainerRef} className="absolute top-2 left-1/2 -translate-x-1/2 z-40">
                        {activeTextAnnotation && interactionMode === 'editing' && (
                            <Card className="p-2 flex items-center gap-1 shadow-lg text-toolbar">
                                <Input type="color" value={activeTextAnnotation.color} onChange={(e) => updateAnnotation(activeTextAnnotation.id, { color: e.target.value })} className="w-8 h-8 p-1"/>
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
                                <Label>Width:</Label><Input type="number" value={activeShapeAnnotation.strokeWidth} onChange={e => updateAnnotation(activeShapeAnnotation.id, { strokeWidth: parseInt(e.target.value)})} className="w-16"/>
                            </Card>
                        )}
                    </div>

                    {/* Main view */}
                    <div ref={mainViewContainerRef} className="flex-grow bg-muted/30 overflow-auto flex flex-col items-center p-4 space-y-4" onMouseDown={handlePanMouseDown} onMouseMove={handleMainViewMouseMove} onMouseUp={handleMainViewMouseUp} onMouseLeave={handlePanMouseUpAndLeave}>
                        {pageObjects.length > 0 ? pageObjects.map((page, index) => (
                             <div
                                key={page.id}
                                ref={el => pageRefs.current[index] = el}
                                className="relative bg-white shadow-lg"
                                style={{ width: page.sourceCanvas.width * mainCanvasZoom, height: page.sourceCanvas.height * mainCanvasZoom }}
                                onMouseDown={(e) => handlePageMouseDown(e, index)}
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
                                {annotations.filter(a => a.pageIndex === index).map(ann => {
                                    switch(ann.type) {
                                        // Simplified rendering for brevity. You'd have dedicated components.
                                        case 'text': return <div key={ann.id} style={{position:'absolute', left: `${ann.leftRatio*100}%`, top: `${ann.topRatio*100}%`, width:`${ann.widthRatio*100}%`, height:`${ann.heightRatio*100}%`}} onDoubleClick={(e) => handleTextAnnotationDoubleClick(e, ann.id)} onMouseDown={e => { e.stopPropagation(); setInteractionMode('selected'); setSelectedAnnotationId(ann.id); }}><Textarea defaultValue={(ann as TextAnnotation).text} readOnly={selectedAnnotationId !== ann.id || interactionMode !== 'editing'} className="bg-transparent border-0 resize-none w-full h-full p-0" style={{color: (ann as TextAnnotation).color, fontSize: `${(ann as TextAnnotation).fontSize * mainCanvasZoom}px`}}/></div>;
                                        case 'image': return <img key={ann.id} src={(ann as ImageAnnotation).dataUrl} style={{position:'absolute', left: `${ann.leftRatio*100}%`, top: `${ann.topRatio*100}%`, width:`${ann.widthRatio*100}%`, height:`${ann.heightRatio*100}%`}} onMouseDown={e => { e.stopPropagation(); setInteractionMode('selected'); setSelectedAnnotationId(ann.id); }}/>;
                                        case 'rect':
                                        case 'ellipse':
                                        case 'triangle':
                                             return <div key={ann.id} style={{position:'absolute', left: `${ann.leftRatio*100}%`, top: `${ann.topRatio*100}%`, width:`${ann.widthRatio*100}%`, height:`${ann.heightRatio*100}%`, backgroundColor: (ann as ShapeAnnotation).fillColor, border: `${(ann as ShapeAnnotation).strokeWidth}px solid ${(ann as ShapeAnnotation).strokeColor}`, borderRadius: ann.type === 'ellipse' ? '50%' : 0 }} onMouseDown={e => { e.stopPropagation(); setInteractionMode('selected'); setSelectedAnnotationId(ann.id); }}/>;
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
                <ActionHistoryPanel />
            </div>
        </div>
    );
}

    