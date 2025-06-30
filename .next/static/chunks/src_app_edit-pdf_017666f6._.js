(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/edit-pdf/components/PdfCanvas.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/fabric/dist/index.min.mjs [app-client] (ecmascript)"); // Corrected import
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$legacy$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdfjs-dist/legacy/build/pdf.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$worker$2e$entry$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdfjs-dist/build/pdf.worker.entry.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$legacy$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GlobalWorkerOptions"].workerSrc = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$build$2f$pdf$2e$worker$2e$entry$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
const PdfCanvas = ({ pdfFile, currentPage, onTotalPages, toolMode, color, canvasRef, onDeletePage, onSaveEdits, onUpdatePdf, imageToInsert })=>{
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [pdfDoc, setPdfDoc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [scale, setScale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1.5);
    const [rotation, setRotation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [renderedPages, setRenderedPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [history, setHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [redoStack, setRedoStack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfCanvas.useEffect": ()=>{
            if (!pdfFile) return;
            const reader = new FileReader();
            reader.onload = ({
                "PdfCanvas.useEffect": async ()=>{
                    const data = new Uint8Array(reader.result);
                    const doc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdfjs$2d$dist$2f$legacy$2f$build$2f$pdf$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocument"])({
                        data
                    }).promise;
                    setPdfDoc(doc);
                    onTotalPages(doc.numPages);
                }
            })["PdfCanvas.useEffect"];
            reader.readAsArrayBuffer(pdfFile);
        }
    }["PdfCanvas.useEffect"], [
        pdfFile,
        onTotalPages
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PdfCanvas.useEffect": ()=>{
            if (!pdfDoc || !containerRef.current) return;
            const renderPage = {
                "PdfCanvas.useEffect.renderPage": async ()=>{
                    const page = await pdfDoc.getPage(currentPage);
                    const viewport = page.getViewport({
                        scale,
                        rotation
                    });
                    const tempCanvas = document.createElement("canvas");
                    const ctx = tempCanvas.getContext("2d");
                    tempCanvas.width = viewport.width;
                    tempCanvas.height = viewport.height;
                    await page.render({
                        canvasContext: ctx,
                        viewport
                    }).promise;
                    containerRef.current.innerHTML = "";
                    const fabricCanvasEl = document.createElement("canvas");
                    fabricCanvasEl.width = viewport.width;
                    fabricCanvasEl.height = viewport.height;
                    containerRef.current.appendChild(fabricCanvasEl);
                    const fabricCanvas = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Canvas"](fabricCanvasEl, {
                        selection: true,
                        backgroundColor: "#ffffff"
                    });
                    if (canvasRef) canvasRef.current = fabricCanvas;
                    const dataURL = tempCanvas.toDataURL();
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Image"].fromURL(dataURL, {
                        "PdfCanvas.useEffect.renderPage": (bgInstance)=>{
                            bgInstance.set({
                                selectable: false,
                                evented: false
                            });
                            fabricCanvas.setBackgroundImage(bgInstance, fabricCanvas.renderAll.bind(fabricCanvas));
                        }
                    }["PdfCanvas.useEffect.renderPage"]);
                    let isDragging = false;
                    let startX = 0, startY = 0;
                    let drawingObject = null;
                    fabricCanvas.on("mouse:down", {
                        "PdfCanvas.useEffect.renderPage": (e)=>{
                            if (toolMode === "select") return;
                            const pointer = fabricCanvas.getPointer(e.e);
                            startX = pointer.x;
                            startY = pointer.y;
                            if (toolMode === "draw") {
                                fabricCanvas.isDrawingMode = true;
                                fabricCanvas.freeDrawingBrush = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PencilBrush"](fabricCanvas);
                                fabricCanvas.freeDrawingBrush.color = color;
                                fabricCanvas.freeDrawingBrush.width = 2;
                                return;
                            }
                            isDragging = true;
                            if (toolMode === "text") {
                                drawingObject = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Textbox"]("輸入文字", {
                                    left: startX,
                                    top: startY,
                                    width: 1,
                                    height: 1,
                                    fontSize: 20,
                                    fill: color
                                });
                            } else if (toolMode === "rect") {
                                drawingObject = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Rect"]({
                                    left: startX,
                                    top: startY,
                                    width: 1,
                                    height: 1,
                                    stroke: color,
                                    strokeWidth: 2,
                                    fill: "transparent"
                                });
                            } else if (toolMode === "image" && imageToInsert) {
                                const img = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$fabric$2f$dist$2f$index$2e$min$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Image"](imageToInsert, {
                                    left: startX,
                                    top: startY,
                                    scaleX: 0.3,
                                    scaleY: 0.3
                                });
                                fabricCanvas.add(img);
                                fabricCanvas.setActiveObject(img);
                                return;
                            }
                            if (drawingObject) {
                                fabricCanvas.add(drawingObject);
                            }
                        }
                    }["PdfCanvas.useEffect.renderPage"]);
                    fabricCanvas.on("mouse:move", {
                        "PdfCanvas.useEffect.renderPage": (e)=>{
                            if (!isDragging || !drawingObject) return;
                            const pointer = fabricCanvas.getPointer(e.e);
                            const width = pointer.x - startX;
                            const height = pointer.y - startY;
                            drawingObject.set({
                                width: Math.abs(width),
                                height: Math.abs(height)
                            });
                            if (width < 0) drawingObject.set({
                                left: pointer.x
                            });
                            if (height < 0) drawingObject.set({
                                top: pointer.y
                            });
                            drawingObject.setCoords();
                            fabricCanvas.renderAll();
                        }
                    }["PdfCanvas.useEffect.renderPage"]);
                    fabricCanvas.on("mouse:up", {
                        "PdfCanvas.useEffect.renderPage": ()=>{
                            isDragging = false;
                            drawingObject = null;
                            fabricCanvas.isDrawingMode = false;
                        }
                    }["PdfCanvas.useEffect.renderPage"]);
                    fabricCanvas.on("mouse:dblclick", {
                        "PdfCanvas.useEffect.renderPage": (e)=>{
                            if (e.target && e.target.type === "textbox") {
                                e.target.enterEditing();
                            }
                        }
                    }["PdfCanvas.useEffect.renderPage"]);
                    const saveSnapshot = {
                        "PdfCanvas.useEffect.renderPage.saveSnapshot": ()=>{
                            const json = fabricCanvas.toJSON();
                            setHistory({
                                "PdfCanvas.useEffect.renderPage.saveSnapshot": (prev)=>[
                                        ...prev,
                                        JSON.stringify(json)
                                    ]
                            }["PdfCanvas.useEffect.renderPage.saveSnapshot"]);
                            setRedoStack([]);
                        }
                    }["PdfCanvas.useEffect.renderPage.saveSnapshot"];
                    fabricCanvas.on("object:added", saveSnapshot);
                    fabricCanvas.on("object:modified", saveSnapshot);
                    fabricCanvas.on("object:removed", saveSnapshot);
                    const resultUrl = fabricCanvas.toDataURL({
                        format: "png",
                        multiplier: 1
                    });
                    const updated = [
                        ...renderedPages
                    ];
                    updated[currentPage - 1] = resultUrl;
                    setRenderedPages(updated);
                    onUpdatePdf?.(updated);
                }
            }["PdfCanvas.useEffect.renderPage"];
            renderPage();
        }
    }["PdfCanvas.useEffect"], [
        pdfDoc,
        currentPage,
        scale,
        rotation,
        toolMode,
        color,
        imageToInsert,
        canvasRef,
        onUpdatePdf,
        renderedPages
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-full",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: containerRef,
            className: "flex justify-center items-center p-4 bg-gray-200 min-h-[600px] overflow-auto"
        }, void 0, false, {
            fileName: "[project]/src/app/edit-pdf/components/PdfCanvas.tsx",
            lineNumber: 189,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/edit-pdf/components/PdfCanvas.tsx",
        lineNumber: 188,
        columnNumber: 5
    }, this);
};
_s(PdfCanvas, "a6refoYzOXMqyf9ILfMj/Rgleyc=");
_c = PdfCanvas;
const __TURBOPACK__default__export__ = PdfCanvas;
var _c;
__turbopack_context__.k.register(_c, "PdfCanvas");
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
;
var _s = __turbopack_context__.k.signature();
"use client";
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
                    const pdfjsLib = await __turbopack_context__.r("[project]/node_modules/pdfjs-dist/build/pdf.js [app-client] (ecmascript, async loader)")(__turbopack_context__.i);
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
                    const pdf = await pdfjsLib.getDocument({
                        data
                    }).promise;
                    const thumbs = [];
                    for(let i = 1; i <= pdf.numPages; i++){
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({
                            scale: 0.3
                        });
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        await page.render({
                            canvasContext: ctx,
                            viewport
                        }).promise;
                        thumbs.push(canvas.toDataURL());
                    }
                    setThumbnails(thumbs);
                }
            })["Sidebar.useEffect"];
            reader.readAsArrayBuffer(pdfFile);
        }
    }["Sidebar.useEffect"], [
        pdfFile
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full overflow-y-auto bg-white border-r h-full",
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
                        lineNumber: 55,
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
                        lineNumber: 56,
                        columnNumber: 11
                    }, this)
                ]
            }, index, true, {
                fileName: "[project]/src/app/edit-pdf/components/Sidebar.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/app/edit-pdf/components/Sidebar.tsx",
        lineNumber: 46,
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
"[project]/src/app/edit-pdf/components/PdfEditor.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$PdfCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/edit-pdf/components/PdfCanvas.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/edit-pdf/components/Sidebar.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const PdfEditor = ()=>{
    _s();
    const [pdfFile, setPdfFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [totalPages, setTotalPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [toolMode, setToolMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("select");
    const [color, setColor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("#000000"); // 修正為合法顏色格式
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [updatedPages, setUpdatedPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const handleFileChange = (e)=>{
        const file = e.target.files?.[0] || null;
        setPdfFile(file);
        setCurrentPage(1);
    };
    const handleDeletePage = (page)=>{
        const updated = updatedPages.filter((_, index)=>index !== page - 1);
        setUpdatedPages(updated);
    };
    const handleSaveEdits = (dataUrl, page)=>{
        const newPages = [
            ...updatedPages
        ];
        newPages[page - 1] = dataUrl;
        setUpdatedPages(newPages);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex w-full h-screen",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-[120px]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    pdfFile: pdfFile,
                    currentPage: currentPage,
                    onPageClick: setCurrentPage
                }, void 0, false, {
                    fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        accept: "application/pdf",
                        onChange: handleFileChange,
                        className: "mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                        lineNumber: 45,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 flex gap-2 items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setToolMode("select"),
                                children: "選取"
                            }, void 0, false, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setToolMode("text"),
                                children: "文字"
                            }, void 0, false, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setToolMode("draw"),
                                children: "手繪"
                            }, void 0, false, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setToolMode("rect"),
                                children: "矩形"
                            }, void 0, false, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "color",
                                value: color,
                                onChange: (e)=>setColor(e.target.value),
                                title: "選擇顏色"
                            }, void 0, false, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 52,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    pdfFile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$PdfCanvas$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                pdfFile: pdfFile,
                                currentPage: currentPage,
                                onTotalPages: setTotalPages,
                                toolMode: toolMode,
                                color: color,
                                canvasRef: canvasRef,
                                onDeletePage: handleDeletePage,
                                onSaveEdits: handleSaveEdits,
                                onUpdatePdf: setUpdatedPages
                            }, void 0, false, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 62,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center mt-4 gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setCurrentPage((prev)=>Math.max(prev - 1, 1)),
                                        disabled: currentPage <= 1,
                                        children: "上一頁"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                        lineNumber: 75,
                                        columnNumber: 15
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
                                        lineNumber: 81,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setCurrentPage((prev)=>Math.min(prev + 1, totalPages)),
                                        disabled: currentPage >= totalPages,
                                        children: "下一頁"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                        lineNumber: 82,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/edit-pdf/components/PdfEditor.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
};
_s(PdfEditor, "7yJ85I7qb4jxgmkSqSKjLtT/b8I=");
_c = PdfEditor;
const __TURBOPACK__default__export__ = PdfEditor;
var _c;
__turbopack_context__.k.register(_c, "PdfEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/edit-pdf/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>EditPdfPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$PdfEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/edit-pdf/components/PdfEditor.tsx [app-client] (ecmascript)");
"use client";
;
;
function EditPdfPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$edit$2d$pdf$2f$components$2f$PdfEditor$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/edit-pdf/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = EditPdfPage;
var _c;
__turbopack_context__.k.register(_c, "EditPdfPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_edit-pdf_017666f6._.js.map