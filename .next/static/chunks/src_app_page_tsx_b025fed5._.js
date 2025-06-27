(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>PdfEditorPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdfjs-dist/build/pdf.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$PDFDocument$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PDFDocument$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/PDFDocument.js [app-client] (ecmascript) <export default as PDFDocument>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sortablejs$2f$modular$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sortablejs/modular/sortable.esm.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// Set workerSrc for pdf.js
if ("TURBOPACK compile-time truthy", 1) {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GlobalWorkerOptions"].workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["version"]}/pdf.worker.min.js`;
}
const translations = {
    en: {
        pageTitle: 'PDF Page Editor',
        uploadLabel: 'Select PDF file to edit:',
        deletePages: 'Delete Selected Pages',
        downloadPdf: 'Download Edited File',
        insertAreaTitle: 'Select file and position to insert',
        insertBeforeLabel: 'Insert before this page',
        insertAfterLabel: 'Insert after this page',
        insertFileLabel: 'Select file to insert',
        instSelect: '✔ Click page to select/deselect',
        instDrag: '✔ Drag pages to reorder',
        instZoom: '✔ Double click page to zoom',
        modalCloseButton: 'Close',
        rotateLeft: '⟲ Rotate Left 90°',
        rotateRight: '⟳ Rotate Right 90°',
        resetRotation: 'Reset Rotation',
        generatingFile: 'Generating file, please wait…',
        loadError: 'Failed to load PDF:',
        downloadError: 'Failed to download PDF:',
        insertError: 'Failed to insert PDF:',
        insertConfirm: 'Please specify the page position to insert. If not specified, the document will be inserted at the end of the current document.',
        noteInputPlaceholder: 'Note (not saved)'
    },
    zh: {
        pageTitle: 'PDF 頁面編輯工具',
        uploadLabel: '選擇要編輯的 PDF 文件：',
        deletePages: '刪除選取頁面',
        downloadPdf: '下載編輯後檔案',
        insertAreaTitle: '選擇要插入的檔案及位置',
        insertBeforeLabel: '插入此頁之前',
        insertAfterLabel: '插入此頁之後',
        insertFileLabel: '選擇要插入的檔案',
        instSelect: '✔ 點選頁面以選取/取消',
        instDrag: '✔ 拖曳頁面以調整順序',
        instZoom: '✔ 雙擊頁面以放大預覽',
        modalCloseButton: '關閉',
        rotateLeft: '⟲ 左轉90°',
        rotateRight: '⟳ 右轉90°',
        resetRotation: '重置旋轉',
        generatingFile: '正在產生下載檔案，請稍候…',
        loadError: '載入失敗：',
        downloadError: '下載失敗：',
        insertError: '插入 PDF 失敗：',
        insertConfirm: '請指定要插入的頁面位置，不指定則自動將文件插至本文件尾端',
        noteInputPlaceholder: '筆記（不會儲存）'
    }
};
function PdfEditorPage() {
    _s();
    const [pages, setPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedPages, setSelectedPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [zoomedPage, setZoomedPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentScale, setCurrentScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1.5);
    const [currentRotation, setCurrentRotation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [currentLanguage, setCurrentLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('en');
    const [texts, setTexts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(translations.en);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDownloading, setIsDownloading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showInsertArea, setShowInsertArea] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [insertPosition, setInsertPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('before');
    const previewContainerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const zoomCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const pdfUploadRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const insertPdfRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const sortableInstanceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfEditorPage.useEffect": ()=>{
            setTexts(translations[currentLanguage]);
        }
    }["PdfEditorPage.useEffect"], [
        currentLanguage
    ]);
    const updateLanguage = (lang)=>{
        setCurrentLanguage(lang);
    };
    const renderPagePreviews = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PdfEditorPage.useCallback[renderPagePreviews]": ()=>{
            if (!previewContainerRef.current) return;
            // Destroy previous Sortable instance if it exists
            if (sortableInstanceRef.current) {
                sortableInstanceRef.current.destroy();
                sortableInstanceRef.current = null;
            }
            previewContainerRef.current.innerHTML = ''; // Clear previous previews
            pages.forEach({
                "PdfEditorPage.useCallback[renderPagePreviews]": (pageCanvas, index)=>{
                    const previewDisplayCanvas = document.createElement('canvas');
                    const previewCtx = previewDisplayCanvas.getContext('2d');
                    if (!previewCtx) return;
                    previewDisplayCanvas.width = pageCanvas.width;
                    previewDisplayCanvas.height = pageCanvas.height;
                    previewCtx.drawImage(pageCanvas, 0, 0);
                    previewDisplayCanvas.style.width = pageCanvas.width * 0.4 + 'px';
                    previewDisplayCanvas.style.height = pageCanvas.height * 0.4 + 'px';
                    const wrapper = document.createElement('div');
                    wrapper.className = 'page-preview';
                    if (selectedPages.has(index)) {
                        wrapper.classList.add('selected');
                    }
                    wrapper.appendChild(previewDisplayCanvas);
                    wrapper.dataset.index = index.toString();
                    wrapper.addEventListener('click', {
                        "PdfEditorPage.useCallback[renderPagePreviews]": ()=>{
                            const newSelectedPages = new Set(selectedPages);
                            if (newSelectedPages.has(index)) {
                                newSelectedPages.delete(index);
                            } else {
                                // Single selection behavior
                                newSelectedPages.clear();
                                newSelectedPages.add(index);
                            }
                            setSelectedPages(newSelectedPages);
                            // Re-render to update classes (or manipulate classes directly)
                            Array.from(previewContainerRef.current?.children || []).forEach({
                                "PdfEditorPage.useCallback[renderPagePreviews]": (child)=>{
                                    const childIndex = parseInt(child.dataset.index || '-1');
                                    if (newSelectedPages.has(childIndex)) {
                                        child.classList.add('selected');
                                    } else {
                                        child.classList.remove('selected');
                                    }
                                }
                            }["PdfEditorPage.useCallback[renderPagePreviews]"]);
                        }
                    }["PdfEditorPage.useCallback[renderPagePreviews]"]);
                    wrapper.addEventListener('dblclick', {
                        "PdfEditorPage.useCallback[renderPagePreviews]": ()=>{
                            setZoomedPage(pageCanvas);
                            setCurrentScale(1.5);
                            setCurrentRotation(0);
                            const modalOverlay = document.getElementById('modalOverlay');
                            if (modalOverlay) modalOverlay.style.display = 'flex';
                        }
                    }["PdfEditorPage.useCallback[renderPagePreviews]"]);
                    previewContainerRef.current?.appendChild(wrapper);
                }
            }["PdfEditorPage.useCallback[renderPagePreviews]"]);
            if (pages.length > 0 && previewContainerRef.current) {
                sortableInstanceRef.current = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sortablejs$2f$modular$2f$sortable$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create(previewContainerRef.current, {
                    animation: 150,
                    onEnd: {
                        "PdfEditorPage.useCallback[renderPagePreviews]": (evt)=>{
                            if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
                            const reorderedPages = Array.from(pages);
                            const [movedItem] = reorderedPages.splice(evt.oldIndex, 1);
                            reorderedPages.splice(evt.newIndex, 0, movedItem);
                            setPages(reorderedPages);
                        }
                    }["PdfEditorPage.useCallback[renderPagePreviews]"]
                });
            }
        }
    }["PdfEditorPage.useCallback[renderPagePreviews]"], [
        pages,
        selectedPages
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfEditorPage.useEffect": ()=>{
            renderPagePreviews();
        }
    }["PdfEditorPage.useEffect"], [
        pages,
        selectedPages,
        renderPagePreviews
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfEditorPage.useEffect": ()=>{
            if (zoomedPage && zoomCanvasRef.current) {
                const canvas = zoomCanvasRef.current;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                const baseWidth = zoomedPage.width;
                const baseHeight = zoomedPage.height;
                let displayWidth = baseWidth * currentScale;
                let displayHeight = baseHeight * currentScale;
                canvas.width = currentRotation % 180 === 0 ? displayWidth : displayHeight;
                canvas.height = currentRotation % 180 === 0 ? displayHeight : displayWidth;
                ctx.save();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(currentRotation * Math.PI / 180);
                ctx.drawImage(zoomedPage, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);
                ctx.restore();
            }
        }
    }["PdfEditorPage.useEffect"], [
        zoomedPage,
        currentScale,
        currentRotation
    ]);
    const handlePdfUpload = async (event)=>{
        const file = event.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocProxy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocument"])({
                data: arrayBuffer,
                cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["version"]}/cmaps/`,
                cMapPacked: true
            }).promise;
            const numPages = pdfDocProxy.numPages;
            const loadedCanvases = [];
            for(let i = 1; i <= numPages; i++){
                const page = await pdfDocProxy.getPage(i);
                const viewport = page.getViewport({
                    scale: 1
                }); // Render at high quality initially
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) continue;
                await page.render({
                    canvasContext: ctx,
                    viewport
                }).promise;
                loadedCanvases.push(canvas);
            }
            setPages(loadedCanvases);
            setSelectedPages(new Set());
            setShowInsertArea(true);
        } catch (err) {
            alert(`${texts.loadError} ${err.message}`);
        } finally{
            setIsLoading(false);
            if (pdfUploadRef.current) pdfUploadRef.current.value = '';
        }
    };
    const handleDeletePages = ()=>{
        const newPages = pages.filter((_, idx)=>!selectedPages.has(idx));
        setPages(newPages);
        setSelectedPages(new Set());
    };
    const handleDownloadPdf = async ()=>{
        if (pages.length === 0) return;
        setIsDownloading(true);
        try {
            await new Promise((resolve)=>setTimeout(resolve, 100));
            const pdfDocOut = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$PDFDocument$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PDFDocument$3e$__["PDFDocument"].create();
            for (let canvas of pages){
                const imgDataUrl = canvas.toDataURL('image/png');
                const pngImage = await pdfDocOut.embedPng(imgDataUrl);
                const page = pdfDocOut.addPage([
                    canvas.width,
                    canvas.height
                ]);
                page.drawImage(pngImage, {
                    x: 0,
                    y: 0,
                    width: canvas.width,
                    height: canvas.height
                });
            }
            const pdfBytes = await pdfDocOut.save();
            const blob = new Blob([
                pdfBytes
            ], {
                type: 'application/pdf'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            alert(`${texts.downloadError} ${err.message}`);
        } finally{
            setIsDownloading(false);
        }
    };
    const handleInsertPdf = async (event)=>{
        const file = event.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const insertDocProxy = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocument"])({
                data: arrayBuffer,
                cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["version"]}/cmaps/`,
                cMapPacked: true
            }).promise;
            const insertCanvases = [];
            for(let i = 1; i <= insertDocProxy.numPages; i++){
                const page = await insertDocProxy.getPage(i);
                const viewport = page.getViewport({
                    scale: 1
                }); // Render at high quality
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) continue;
                await page.render({
                    canvasContext: ctx,
                    viewport
                }).promise;
                insertCanvases.push(canvas);
            }
            let insertIdx = pages.length;
            if (selectedPages.size > 0) {
                const firstSelected = Math.min(...Array.from(selectedPages));
                insertIdx = insertPosition === 'before' ? firstSelected : firstSelected + 1;
            } else {
                if ("object" !== 'undefined' && !window.confirm(texts.insertConfirm)) {
                    setIsLoading(false);
                    return;
                }
            }
            const newPages = [
                ...pages
            ];
            newPages.splice(insertIdx, 0, ...insertCanvases);
            setPages(newPages);
            setSelectedPages(new Set());
        } catch (err) {
            alert(`${texts.insertError} ${err.message}`);
        } finally{
            setIsLoading(false);
            if (insertPdfRef.current) insertPdfRef.current.value = '';
        }
    };
    const closeModal = ()=>{
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.style.display = 'none';
        setZoomedPage(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "1424d90aba45aa67",
                children: "body{background-color:#f8f9fa;padding:20px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif}h1,#pdfUploadInput,#insertPdfInput{margin-bottom:10px}#insertControls{margin-top:10px}#insertControls label{margin-right:10px}#topControls{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px;display:flex}#controlButtons button{color:#fff;cursor:pointer;background-color:#007bff;border:none;border-radius:4px;padding:8px 16px;font-size:14px}#controlButtons button:hover{background-color:#0056b3}#instructions{background:#e9ecef;border-radius:5px;margin-bottom:10px;padding:10px;font-size:14px}#previewContainer{flex-wrap:wrap;gap:10px;min-height:200px;margin-top:10px;display:flex}.page-preview{cursor:pointer;background:#fff;border:2px solid #dee2e6;border-radius:4px;transition:border .2s;position:relative;box-shadow:0 2px 4px #0000001a}.page-preview.selected{border:3px solid #dc3545}#modalOverlay{z-index:1000;background:#00000080;justify-content:center;align-items:center;width:100%;height:100%;display:none;position:fixed;top:0;left:0}#modalContent{background:#fff;border-radius:8px;width:80%;max-width:800px;height:auto;padding:20px;overflow:auto}#modalContent canvas{object-fit:contain;width:100%;max-width:100%;height:auto;max-height:90vh;display:block}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}#loadingSpinnerContainer div{border:6px solid #f3f3f3;border-top-color:#3498db;border-radius:50%;width:40px;height:40px;animation:1s linear infinite spin}.spinner-container{z-index:9999;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)}.spinner{border:6px solid #f3f3f3;border-top-color:#3498db;border-radius:50%;width:40px;height:40px;animation:1s linear infinite spin}button{color:#fff;cursor:pointer;background-color:#007bff;border:none;border-radius:4px;margin-right:8px;padding:6px 12px;font-size:14px}button:hover{background-color:#0056b3}#languageButtons button{padding:6px 12px;font-size:12px}#languageButtons button:hover{opacity:.9;background-color:#0056b3}#modalContent button{color:#fff;cursor:pointer;background-color:#007bff;border:none;border-radius:4px;padding:6px 14px;font-size:14px}#modalContent button:hover{background-color:#0056b3}#downloadOverlayContainer{z-index:10000;color:#fff;background:#00000080;flex-direction:column;justify-content:center;align-items:center;width:100%;height:100%;font-size:24px;font-weight:700;display:none;position:fixed;top:0;left:0}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-1424d90aba45aa67" + " " + "p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "jsx-1424d90aba45aa67",
                        children: texts.pageTitle
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 499,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "topControls",
                        className: "jsx-1424d90aba45aa67",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-1424d90aba45aa67",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "pdfUploadInput",
                                        className: "jsx-1424d90aba45aa67",
                                        children: texts.uploadLabel
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 502,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        id: "pdfUploadInput",
                                        accept: "application/pdf",
                                        onChange: handlePdfUpload,
                                        ref: pdfUploadRef,
                                        className: "jsx-1424d90aba45aa67"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 503,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 501,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                id: "controlButtons",
                                className: "jsx-1424d90aba45aa67",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleDeletePages,
                                        disabled: selectedPages.size === 0 || pages.length === 0,
                                        className: "jsx-1424d90aba45aa67",
                                        children: texts.deletePages
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 506,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleDownloadPdf,
                                        disabled: pages.length === 0,
                                        className: "jsx-1424d90aba45aa67",
                                        children: texts.downloadPdf
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 507,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 505,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                id: "languageButtons",
                                className: "jsx-1424d90aba45aa67",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>updateLanguage('en'),
                                        className: "jsx-1424d90aba45aa67",
                                        children: "English"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 510,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>updateLanguage('zh'),
                                        className: "jsx-1424d90aba45aa67",
                                        children: "中文"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 511,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 509,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 500,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                        className: "jsx-1424d90aba45aa67"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 515,
                        columnNumber: 9
                    }, this),
                    showInsertArea && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "insertArea",
                        className: "jsx-1424d90aba45aa67",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "jsx-1424d90aba45aa67",
                                children: texts.insertAreaTitle
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 519,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                id: "insertControls",
                                className: "jsx-1424d90aba45aa67",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "jsx-1424d90aba45aa67",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "radio",
                                                name: "insertPosition",
                                                value: "before",
                                                checked: insertPosition === 'before',
                                                onChange: ()=>setInsertPosition('before'),
                                                className: "jsx-1424d90aba45aa67"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 522,
                                                columnNumber: 17
                                            }, this),
                                            " ",
                                            texts.insertBeforeLabel
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 521,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "jsx-1424d90aba45aa67",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "radio",
                                                name: "insertPosition",
                                                value: "after",
                                                checked: insertPosition === 'after',
                                                onChange: ()=>setInsertPosition('after'),
                                                className: "jsx-1424d90aba45aa67"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 531,
                                                columnNumber: 17
                                            }, this),
                                            " ",
                                            texts.insertAfterLabel
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 530,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 520,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "file",
                                id: "insertPdfInput",
                                accept: "application/pdf",
                                onChange: handleInsertPdf,
                                ref: insertPdfRef,
                                className: "jsx-1424d90aba45aa67"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 540,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "jsx-1424d90aba45aa67",
                                children: texts.insertFileLabel
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 541,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 518,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "instructions",
                        className: "jsx-1424d90aba45aa67",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-1424d90aba45aa67",
                                children: texts.instSelect
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 546,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-1424d90aba45aa67",
                                children: texts.instDrag
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 547,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "jsx-1424d90aba45aa67",
                                children: texts.instZoom
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 548,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 545,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "previewContainer",
                        ref: previewContainerRef,
                        className: "jsx-1424d90aba45aa67"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 551,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "modalOverlay",
                        className: "jsx-1424d90aba45aa67",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            id: "modalContent",
                            className: "jsx-1424d90aba45aa67",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                    id: "zoomCanvas",
                                    ref: zoomCanvasRef,
                                    style: {
                                        willReadFrequently: "true"
                                    },
                                    className: "jsx-1424d90aba45aa67"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 555,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    id: "noteInput",
                                    placeholder: texts.noteInputPlaceholder,
                                    className: "jsx-1424d90aba45aa67"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 556,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: closeModal,
                                    className: "jsx-1424d90aba45aa67",
                                    children: texts.modalCloseButton
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 557,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    id: "previewControls",
                                    style: {
                                        marginTop: '12px',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '8px'
                                    },
                                    className: "jsx-1424d90aba45aa67",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setCurrentRotation((r)=>(r - 90 + 360) % 360),
                                            className: "jsx-1424d90aba45aa67",
                                            children: texts.rotateLeft
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 559,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setCurrentRotation((r)=>(r + 90) % 360),
                                            className: "jsx-1424d90aba45aa67",
                                            children: texts.rotateRight
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 560,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setCurrentRotation(0),
                                            className: "jsx-1424d90aba45aa67",
                                            children: texts.resetRotation
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 561,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 558,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 554,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 553,
                        columnNumber: 9
                    }, this),
                    isDownloading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "downloadOverlayContainer",
                        style: {
                            display: 'flex'
                        },
                        className: "jsx-1424d90aba45aa67",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-1424d90aba45aa67" + " " + "spinner"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 568,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '12px'
                                },
                                className: "jsx-1424d90aba45aa67",
                                children: texts.generatingFile
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 569,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 567,
                        columnNumber: 11
                    }, this),
                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        id: "loadingSpinnerContainer",
                        style: {
                            display: 'block'
                        },
                        className: "jsx-1424d90aba45aa67" + " " + "spinner-container",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-1424d90aba45aa67" + " " + "spinner"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 575,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 574,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 498,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(PdfEditorPage, "ne0XaLGexolTub+WWY9FF8Yzr1Y=");
_c = PdfEditorPage;
var _c;
__turbopack_context__.k.register(_c, "PdfEditorPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_page_tsx_b025fed5._.js.map