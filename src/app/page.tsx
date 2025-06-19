
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import Sortable from 'sortablejs';

// Set workerSrc for pdf.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
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
        noteInputPlaceholder: 'Note (not saved)',
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
        noteInputPlaceholder: '筆記（不會儲存）',
    }
};

export default function PdfEditorPage() {
  const [pages, setPages] = useState<HTMLCanvasElement[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [zoomedPage, setZoomedPage] = useState<HTMLCanvasElement | null>(null);
  const [currentScale, setCurrentScale] = useState(1.5);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'zh'>('en');
  const [texts, setTexts] = useState(translations.en);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInsertArea, setShowInsertArea] = useState(false);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after'>('before');

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfUploadRef = useRef<HTMLInputElement>(null);
  const insertPdfRef = useRef<HTMLInputElement>(null);
  
  const sortableInstanceRef = useRef<Sortable | null>(null);

  useEffect(() => {
    setTexts(translations[currentLanguage]);
  }, [currentLanguage]);

  const updateLanguage = (lang: 'en' | 'zh') => {
    setCurrentLanguage(lang);
  };
  
  const renderPagePreviews = useCallback(() => {
    if (!previewContainerRef.current) return;

    // Destroy previous Sortable instance if it exists
    if (sortableInstanceRef.current) {
      sortableInstanceRef.current.destroy();
      sortableInstanceRef.current = null;
    }
    
    previewContainerRef.current.innerHTML = ''; // Clear previous previews

    pages.forEach((pageCanvas, index) => {
      const previewDisplayCanvas = document.createElement('canvas');
      const previewCtx = previewDisplayCanvas.getContext('2d');
      if (!previewCtx) return;

      previewDisplayCanvas.width = pageCanvas.width;
      previewDisplayCanvas.height = pageCanvas.height;
      previewCtx.drawImage(pageCanvas, 0, 0);
      previewDisplayCanvas.style.width = (pageCanvas.width * 0.4) + 'px';
      previewDisplayCanvas.style.height = (pageCanvas.height * 0.4) + 'px';

      const wrapper = document.createElement('div');
      wrapper.className = 'page-preview';
      if (selectedPages.has(index)) {
        wrapper.classList.add('selected');
      }
      wrapper.appendChild(previewDisplayCanvas);
      wrapper.dataset.index = index.toString();

      wrapper.addEventListener('click', () => {
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
         Array.from(previewContainerRef.current?.children || []).forEach(child => {
            const childIndex = parseInt((child as HTMLElement).dataset.index || '-1');
            if (newSelectedPages.has(childIndex)) {
                child.classList.add('selected');
            } else {
                child.classList.remove('selected');
            }
        });
      });

      wrapper.addEventListener('dblclick', () => {
        setZoomedPage(pageCanvas);
        setCurrentScale(1.5);
        setCurrentRotation(0);
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) modalOverlay.style.display = 'flex';
      });
      previewContainerRef.current?.appendChild(wrapper);
    });

    if (pages.length > 0 && previewContainerRef.current) {
      sortableInstanceRef.current = Sortable.create(previewContainerRef.current, {
        animation: 150,
        onEnd: (evt) => {
          if (evt.oldIndex === undefined || evt.newIndex === undefined) return;
          const reorderedPages = Array.from(pages);
          const [movedItem] = reorderedPages.splice(evt.oldIndex, 1);
          reorderedPages.splice(evt.newIndex, 0, movedItem);
          setPages(reorderedPages);
        }
      });
    }
  }, [pages, selectedPages]);


  useEffect(() => {
    renderPagePreviews();
  }, [pages, selectedPages, renderPagePreviews]);


  useEffect(() => {
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
      ctx.rotate((currentRotation * Math.PI) / 180);
      ctx.drawImage(
        zoomedPage,
        -displayWidth / 2,
        -displayHeight / 2,
        displayWidth,
        displayHeight
      );
      ctx.restore();
    }
  }, [zoomedPage, currentScale, currentRotation]);

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
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
        const viewport = page.getViewport({ scale: 1 }); // Render at high quality initially
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        loadedCanvases.push(canvas);
      }
      setPages(loadedCanvases);
      setSelectedPages(new Set());
      setShowInsertArea(true);
    } catch (err: any) {
      alert(`${texts.loadError} ${err.message}`);
    } finally {
      setIsLoading(false);
      if (pdfUploadRef.current) pdfUploadRef.current.value = '';
    }
  };

  const handleDeletePages = () => {
    const newPages = pages.filter((_, idx) => !selectedPages.has(idx));
    setPages(newPages);
    setSelectedPages(new Set());
  };

  const handleDownloadPdf = async () => {
    if (pages.length === 0) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); 
      const pdfDocOut = await PDFLibDocument.create();
      for (let canvas of pages) {
        const imgDataUrl = canvas.toDataURL('image/png');
        const pngImage = await pdfDocOut.embedPng(imgDataUrl);
        const page = pdfDocOut.addPage([canvas.width, canvas.height]);
        page.drawImage(pngImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });
      }
      const pdfBytes = await pdfDocOut.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`${texts.downloadError} ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInsertPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const insertDocProxy = await pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      }).promise;

      const insertCanvases: HTMLCanvasElement[] = [];
      for (let i = 1; i <= insertDocProxy.numPages; i++) {
        const page = await insertDocProxy.getPage(i);
        const viewport = page.getViewport({ scale: 1 }); // Render at high quality
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;
        insertCanvases.push(canvas);
      }

      let insertIdx = pages.length;
      if (selectedPages.size > 0) {
        const firstSelected = Math.min(...Array.from(selectedPages));
        insertIdx = insertPosition === 'before' ? firstSelected : firstSelected + 1;
      } else {
        if (typeof window !== 'undefined' && !window.confirm(texts.insertConfirm)) {
          setIsLoading(false);
          return;
        }
      }
      
      const newPages = [...pages];
      newPages.splice(insertIdx, 0, ...insertCanvases);
      setPages(newPages);
      setSelectedPages(new Set());

    } catch (err: any) {
      alert(`${texts.insertError} ${err.message}`);
    } finally {
      setIsLoading(false);
      if (insertPdfRef.current) insertPdfRef.current.value = '';
    }
  };
  
  const closeModal = () => {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.style.display = 'none';
    setZoomedPage(null);
  };

  return (
    <>
      <style jsx global>{`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
          background-color: #f8f9fa;
        }
        h1 {
          margin-bottom: 10px;
        }
        #pdfUploadInput, #insertPdfInput { /* Use different IDs for inputs if needed */
          margin-bottom: 10px;
        }
        #insertControls {
          /* display: none; Replaced by showInsertArea state */
          margin-top: 10px;
        }
        #insertControls label {
          margin-right: 10px;
        }
        #topControls {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 10px;
        }
        #controlButtons button {
          padding: 8px 16px;
          border: none;
          background-color: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        #controlButtons button:hover {
          background-color: #0056b3;
        }
        #instructions {
          margin-bottom: 10px;
          background: #e9ecef;
          padding: 10px;
          border-radius: 5px;
          font-size: 14px;
        }
        #previewContainer { /* This ID is used by ref */
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px; /* Adjusted margin */
          min-height: 200px; /* Ensure it has some height */
        }
        .page-preview {
          position: relative;
          border: 2px solid #dee2e6;
          border-radius: 4px;
          cursor: pointer;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: border 0.2s;
        }
        .page-preview.selected {
          border: 3px solid #dc3545;
        }
        #modalOverlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          display: none; /* Controlled by dblclick */
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        #modalContent {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 80%;
          max-width: 800px;
          height: auto; 
          overflow: auto; 
        }
        #modalContent canvas { /* This ID is used by ref */
          width: 100%;
          height: auto;
          max-width: 100%;
          max-height: 90vh;
          display: block;
          object-fit: contain; 
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #loadingSpinnerContainer div { /* Renamed for clarity */
          border: 6px solid #f3f3f3;
          border-top: 6px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        .spinner-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
        }
        .spinner {
          border: 6px solid #f3f3f3;
          border-top: 6px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        button { /* General button styling, can be refined with Tailwind/ShadCN later */
          margin-right: 8px;
          padding: 6px 12px;
          font-size: 14px;
          border-radius: 4px;
          border: none;
          background-color: #007bff;
          color: white;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        #languageButtons button {
          padding: 6px 12px;
          font-size: 12px;
        }
        #languageButtons button:hover {
         background-color: #0056b3;
         opacity: 0.9;
        }
        #modalContent button {
          padding: 6px 14px;
          font-size: 14px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        #modalContent button:hover {
          background-color: #0056b3;
        }
        #downloadOverlayContainer { /* Renamed for clarity */
          display:none;
          position:fixed;
          top:0;left:0;
          width:100%;height:100%;
          z-index:10000;
          background:rgba(0,0,0,0.5);
          color:white;
          /* display:flex; Replaced by isDownloading state */
          align-items:center;
          justify-content:center;
          flex-direction:column;
          font-size:24px;
          font-weight:bold;
        }
      `}</style>
      <div className="p-4">
        <h1>{texts.pageTitle}</h1>
        <div id="topControls">
          <div>
            <label htmlFor="pdfUploadInput">{texts.uploadLabel}</label>
            <input type="file" id="pdfUploadInput" accept="application/pdf" onChange={handlePdfUpload} ref={pdfUploadRef} />
          </div>
          <div id="controlButtons">
            <button onClick={handleDeletePages} disabled={selectedPages.size === 0 || pages.length === 0}>{texts.deletePages}</button>
            <button onClick={handleDownloadPdf} disabled={pages.length === 0}>{texts.downloadPdf}</button>
          </div>
          <div id="languageButtons">
            <button onClick={() => updateLanguage('en')}>English</button>
            <button onClick={() => updateLanguage('zh')}>中文</button>
          </div>
        </div>

        <hr />

        {showInsertArea && (
          <div id="insertArea">
            <h3>{texts.insertAreaTitle}</h3>
            <div id="insertControls">
              <label>
                <input 
                  type="radio" 
                  name="insertPosition" 
                  value="before" 
                  checked={insertPosition === 'before'} 
                  onChange={() => setInsertPosition('before')}
                /> {texts.insertBeforeLabel}
              </label>
              <label>
                <input 
                  type="radio" 
                  name="insertPosition" 
                  value="after" 
                  checked={insertPosition === 'after'}
                  onChange={() => setInsertPosition('after')}
                /> {texts.insertAfterLabel}
              </label>
            </div>
            <input type="file" id="insertPdfInput" accept="application/pdf" onChange={handleInsertPdf} ref={insertPdfRef}/>
            <span>{texts.insertFileLabel}</span>
          </div>
        )}

        <div id="instructions">
          <p>{texts.instSelect}</p>
          <p>{texts.instDrag}</p>
          <p>{texts.instZoom}</p>
        </div>

        <div id="previewContainer" ref={previewContainerRef}></div>

        <div id="modalOverlay">
          <div id="modalContent">
            <canvas id="zoomCanvas" ref={zoomCanvasRef} style={{willReadFrequently: "true"} as any}></canvas>
            <input type="text" id="noteInput" placeholder={texts.noteInputPlaceholder} />
            <button onClick={closeModal}>{texts.modalCloseButton}</button>
            <div id="previewControls" style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button onClick={() => setCurrentRotation((r) => (r - 90 + 360) % 360)}>{texts.rotateLeft}</button>
              <button onClick={() => setCurrentRotation((r) => (r + 90) % 360)}>{texts.rotateRight}</button>
              <button onClick={() => setCurrentRotation(0)}>{texts.resetRotation}</button>
            </div>
          </div>
        </div>

        {isDownloading && (
          <div id="downloadOverlayContainer" style={{display: 'flex'}}>
            <div className="spinner"></div>
            <div style={{ marginTop: '12px' }}>{texts.generatingFile}</div>
          </div>
        )}

        {isLoading && (
          <div id="loadingSpinnerContainer" style={{display: 'block'}} className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </>
  );
}
