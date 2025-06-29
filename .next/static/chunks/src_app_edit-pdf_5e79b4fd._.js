(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/edit-pdf/components/Toolbar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
"use client";
;
;
const colors = [
    "#000000",
    "#FF0000",
    "#008000",
    "#0000FF",
    "#FFA500",
    "#800080"
];
const Toolbar = ({ currentTool, setTool, color, setColor, onExport })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex gap-2 p-2 bg-gray-100 border-b border-gray-300",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setTool("select"),
                className: `p-2 rounded ${currentTool === "select" ? "bg-blue-200" : "bg-white"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaMousePointer"], {}, void 0, false, {
                    fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setTool("text"),
                className: `p-2 rounded ${currentTool === "text" ? "bg-blue-200" : "bg-white"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaFont"], {}, void 0, false, {
                    fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setTool("draw"),
                className: `p-2 rounded ${currentTool === "draw" ? "bg-blue-200" : "bg-white"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaPen"], {}, void 0, false, {
                    fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setTool("rect"),
                className: `p-2 rounded ${currentTool === "rect" ? "bg-blue-200" : "bg-white"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaSquare"], {}, void 0, false, {
                    fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                    lineNumber: 43,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center ml-4 gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaPalette"], {}, void 0, false, {
                        fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    colors.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `w-5 h-5 rounded-full cursor-pointer border ${color === c ? "border-black" : "border-gray-300"}`,
                            style: {
                                backgroundColor: c
                            },
                            onClick: ()=>setColor(c)
                        }, c, false, {
                            fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ml-auto flex gap-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onExport,
                    className: "px-2 py-1 bg-green-500 text-white rounded",
                    children: "下載 PDF"
                }, void 0, false, {
                    fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                    lineNumber: 59,
                    columnNumber: 3
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/edit-pdf/components/Toolbar.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
};
_c = Toolbar;
const __TURBOPACK__default__export__ = Toolbar;
var _c;
__turbopack_context__.k.register(_c, "Toolbar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/edit-pdf/components/Sidebar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const Sidebar = ({ pdfFile, currentPage, onPageClick })=>{
    _s();
    const [thumbnails, setThumbnails] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Sidebar.useEffect": ()=>{
            if (!pdfFile) return;
            const reader = new FileReader();
            reader.onload = ({
                "Sidebar.useEffect": async ()=>{
                    const data = new Uint8Array(reader.result);
                    const pdf = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocument"])({
                        data
                    }).promise;
                    const renderThumbnails = {
                        "Sidebar.useEffect.renderThumbnails": async ()=>{
                            const thumbs = [];
                            for(let i = 1; i <= pdf.numPages; i++){
                                const page = await pdf.getPage(i);
                                const viewport = page.getViewport({
                                    scale: 0.3
                                });
                                const canvas = document.createElement("canvas");
                                const context = canvas.getContext("2d");
                                canvas.width = viewport.width;
                                canvas.height = viewport.height;
                                await page.render({
                                    canvasContext: context,
                                    viewport
                                }).promise;
                                thumbs.push(canvas.toDataURL());
                            }
                            setThumbnails(thumbs);
                        }
                    }["Sidebar.useEffect.renderThumbnails"];
                    renderThumbnails();
                }
            })["Sidebar.useEffect"];
            reader.readAsArrayBuffer(pdfFile);
        }
    }["Sidebar.useEffect"], [
        pdfFile
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-[120px] overflow-y-auto bg-white border-r",
        children: thumbnails.map((src, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `m-2 border rounded cursor-pointer ${currentPage === index + 1 ? "border-blue-500" : "border-gray-300"}`,
                onClick: ()=>onPageClick(index + 1),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: src,
                        alt: `Page ${index + 1}`,
                        className: "w-full"
                    }, void 0, false, {
                        fileName: "[project]/src/app/edit-pdf/components/Sidebar.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center text-sm py-1",
                        children: [
                            "p.",
                            index + 1
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/edit-pdf/components/Sidebar.tsx",
                        lineNumber: 59,
                        columnNumber: 11
                    }, this)
                ]
            }, index, true, {
                fileName: "[project]/src/app/edit-pdf/components/Sidebar.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/edit-pdf/components/Sidebar.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
};
_s(Sidebar, "PweWjUrwrSsgRgfsGoerZAbrDns=");
_c = Sidebar;
const __TURBOPACK__default__export__ = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/edit-pdf/components/PdfCanvas.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/fabric/dist/index.min.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdfjs-dist/build/pdf.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GlobalWorkerOptions"].workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["version"]}/pdf.worker.min.js`;
const PdfCanvas = ({ pdfFile, currentPage, onTotalPages, toolMode, color, canvasRef })=>{
    _s();
    const canvasDomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const fabricRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [pdfDoc, setPdfDoc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 載入 PDF 文件
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfCanvas.useEffect": ()=>{
            if (!pdfFile) return;
            const reader = new FileReader();
            reader.onload = ({
                "PdfCanvas.useEffect": async ()=>{
                    const data = new Uint8Array(reader.result);
                    const doc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocument"])({
                        data
                    }).promise;
                    setPdfDoc(doc);
                    onTotalPages(doc.numPages);
                }
            })["PdfCanvas.useEffect"];
            reader.readAsArrayBuffer(pdfFile);
        }
    }["PdfCanvas.useEffect"], [
        pdfFile
    ]);
    // 渲染當前頁面
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfCanvas.useEffect": ()=>{
            if (!pdfDoc || !canvasDomRef.current) return;
            const renderPage = {
                "PdfCanvas.useEffect.renderPage": async ()=>{
                    const page = await pdfDoc.getPage(currentPage);
                    const viewport = page.getViewport({
                        scale: 1.5
                    });
                    const canvasEl = canvasDomRef.current;
                    canvasEl.width = viewport.width;
                    canvasEl.height = viewport.height;
                    const context = canvasEl.getContext("2d");
                    await page.render({
                        canvasContext: context,
                        viewport
                    }).promise;
                    // 建立 Fabric 畫布
                    if (fabricRef.current) fabricRef.current.dispose();
                    const fabricCanvas = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Canvas"](canvasEl, {
                        selection: true,
                        backgroundColor: null
                    });
                    fabricCanvas.setWidth(viewport.width);
                    fabricCanvas.setHeight(viewport.height);
                    fabricRef.current = fabricCanvas;
                    // 對外傳出 canvas 實體
                    if (canvasRef) {
                        canvasRef.current = fabricCanvas;
                    }
                }
            }["PdfCanvas.useEffect.renderPage"];
            renderPage();
        }
    }["PdfCanvas.useEffect"], [
        pdfDoc,
        currentPage
    ]);
    // 工具模式切換（文字、筆刷、矩形、選取）
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfCanvas.useEffect": ()=>{
            const canvas = fabricRef.current;
            if (!canvas) return;
            canvas.isDrawingMode = false;
            canvas.selection = false;
            canvas.defaultCursor = "default";
            if (toolMode === "draw") {
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PencilBrush"](canvas);
                canvas.freeDrawingBrush.color = color;
                canvas.freeDrawingBrush.width = 2;
            } else if (toolMode === "select") {
                canvas.selection = true;
                canvas.defaultCursor = "move";
            } else if (toolMode === "text") {
                canvas.defaultCursor = "text";
            } else if (toolMode === "rect") {
                canvas.defaultCursor = "crosshair";
            }
        }
    }["PdfCanvas.useEffect"], [
        toolMode,
        color
    ]);
    // 點擊畫布建立物件
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfCanvas.useEffect": ()=>{
            const canvas = fabricRef.current;
            if (!canvas) return;
            const handleClick = {
                "PdfCanvas.useEffect.handleClick": (event)=>{
                    const pointer = canvas.getPointer(event.e);
                    if (toolMode === "text") {
                        const text = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IText"]("輸入文字", {
                            left: pointer.x,
                            top: pointer.y,
                            fill: color,
                            fontSize: 20
                        });
                        canvas.add(text).setActiveObject(text);
                    } else if (toolMode === "rect") {
                        const rect = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rect"]({
                            left: pointer.x,
                            top: pointer.y,
                            width: 100,
                            height: 60,
                            fill: "transparent",
                            stroke: color,
                            strokeWidth: 2
                        });
                        canvas.add(rect).setActiveObject(rect);
                    }
                }
            }["PdfCanvas.useEffect.handleClick"];
            canvas.on("mouse:down", handleClick);
            return ({
                "PdfCanvas.useEffect": ()=>{
                    canvas.off("mouse:down", handleClick);
                }
            })["PdfCanvas.useEffect"];
        }
    }["PdfCanvas.useEffect"], [
        toolMode,
        color
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-center p-4 bg-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
            ref: canvasDomRef
        }, void 0, false, {
            fileName: "[project]/src/app/edit-pdf/components/PdfCanvas.tsx",
            lineNumber: 140,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/edit-pdf/components/PdfCanvas.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
};
_s(PdfCanvas, "fCl5K1EFBbumRBffkEMM6cXNMCE=");
_c = PdfCanvas;
const __TURBOPACK__default__export__ = PdfCanvas;
var _c;
__turbopack_context__.k.register(_c, "PdfCanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/edit-pdf/utils/PdfExporter.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "exportCanvasAsPdf": (()=>exportCanvasAsPdf)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript)");
;
const exportCanvasAsPdf = (canvas, filename = "edited.pdf")=>{
    const dataUrl = canvas.toDataURL({
        format: "png"
    });
    const pdf = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
        orientation: "portrait",
        unit: "pt",
        format: [
            canvas.getWidth(),
            canvas.getHeight()
        ]
    });
    pdf.addImage(dataUrl, "PNG", 0, 0, canvas.getWidth(), canvas.getHeight());
    pdf.save(filename);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/edit-pdf/components/PdfEditor.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$Toolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/edit-pdf/components/Toolbar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/edit-pdf/components/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$PdfCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/edit-pdf/components/PdfCanvas.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$utils$2f$PdfExporter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/edit-pdf/utils/PdfExporter.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const PdfEditor = ()=>{
    _s();
    const [pdfFile, setPdfFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [toolMode, setToolMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("select");
    const [color, setColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("#000000");
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [totalPages, setTotalPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const fabricCanvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null); // 儲存當前頁 canvas
    const handleFileChange = (e)=>{
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            setCurrentPage(1);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-full w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$Toolbar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                currentTool: toolMode,
                setTool: setToolMode,
                color: color,
                setColor: setColor,
                onExport: ()=>{
                    if (fabricCanvasRef.current) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$utils$2f$PdfExporter$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportCanvasAsPdf"])(fabricCanvasRef.current);
                    } else {
                        alert("尚未載入畫布！");
                    }
                }
            }, void 0, false, {
                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4 p-2 bg-white border-b",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        accept: "application/pdf",
                        onChange: handleFileChange
                    }, void 0, false, {
                        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ml-auto flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: currentPage <= 1,
                                onClick: ()=>setCurrentPage((p)=>p - 1),
                                className: "px-2 py-1 border rounded disabled:opacity-50",
                                children: "上一頁"
                            }, void 0, false, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "第 ",
                                    currentPage,
                                    " / ",
                                    totalPages,
                                    " 頁"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: currentPage >= totalPages,
                                onClick: ()=>setCurrentPage((p)=>p + 1),
                                className: "px-2 py-1 border rounded disabled:opacity-50",
                                children: "下一頁"
                            }, void 0, false, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-1 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        pdfFile: pdfFile,
                        currentPage: currentPage,
                        onPageClick: setCurrentPage
                    }, void 0, false, {
                        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-auto bg-gray-100",
                        children: pdfFile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$PdfCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            pdfFile: pdfFile,
                            currentPage: currentPage,
                            onTotalPages: setTotalPages,
                            toolMode: toolMode,
                            color: color,
                            canvasRef: fabricCanvasRef
                        }, void 0, false, {
                            fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                            lineNumber: 80,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 text-gray-500 text-center",
                            children: "請先上傳 PDF"
                        }, void 0, false, {
                            fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                            lineNumber: 89,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
};
_s(PdfEditor, "z2Ngve3DLwZPeFiVDb93nKJg+HY=");
_c = PdfEditor;
const __TURBOPACK__default__export__ = PdfEditor;
var _c;
__turbopack_context__.k.register(_c, "PdfEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_edit-pdf_5e79b4fd._.js.map