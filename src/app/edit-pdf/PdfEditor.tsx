
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useToast } from "@/hooks/use-toast";
import { usePdfInitialization } from './hooks/usePdfInitialization';
import { useObjectManager } from './hooks/useObjectManager';
import { useInteractionManager } from './hooks/useInteractionManager';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useHistoryManager } from './hooks/useHistoryManager';
import { ThumbnailSidebar } from './components/sidebar/ThumbnailSidebar';
import type { EditableObject, PageInfo } from './lib/types';
import { drawObject } from './lib/pdf-drawing';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PdfEditorProps {
  file: File;
}

const MAX_CONCURRENT_RENDERS = 4;

const PdfCanvas = React.memo(({
    pageInfo,
    objects,
    scale,
    onObjectSelect,
    selectedObjectId,
    currentDrawingShape,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onCanvasInView,
}: {
    pageInfo: PageInfo;
    objects: EditableObject[];
    scale: number;
    onObjectSelect: (id: string | null) => void;
    selectedObjectId: string | null;
    currentDrawingShape: EditableObject | null;
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
    onCanvasInView: (id: string) => void;
}) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    React.useEffect(() => {
        if (inView) {
            onCanvasInView(pageInfo.id);
        }
    }, [inView, pageInfo.id, onCanvasInView]);

    const canvasWidth = pageInfo.width ? pageInfo.width * scale : 612 * scale; // Default to 8.5x11 inch at 72dpi
    const canvasHeight = pageInfo.height ? pageInfo.height * scale : 792 * scale;

    return (
        <div
            id={`pdf-page-${pageInfo.pageNumber}`}
            ref={ref}
            className="relative mx-auto my-4 bg-white shadow-lg"
            style={{ width: canvasWidth, height: canvasHeight }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            {pageInfo.canvasUrl ? (
                <>
                    <img src={pageInfo.canvasUrl} alt={`Page ${pageInfo.pageNumber}`} width={canvasWidth} height={canvasHeight} />
                    <svg
                        className="absolute top-0 left-0 w-full h-full"
                    >
                        {/* Render existing objects */}
                    </svg>
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
});
PdfCanvas.displayName = 'PdfCanvas';


export default function PdfEditor({ file }: PdfEditorProps) {
  const { toast } = useToast();
  const [scale, setScale] = useState(1.0);

  const {
    isLoading: isPdfLoading,
    pageInfos,
    setPageInfos,
    pdfDoc,
    loadPdf,
  } = usePdfInitialization();

  const {
    allObjects,
    setAllObjects,
    addObject,
    updateObject,
    deleteObject,
    getObjectsByPage,
  } = useObjectManager();
  
  const {
    currentState,
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
  } = useHistoryManager({
      pageInfos, 
      allObjects
  });

  const [renderQueue, setRenderQueue] = useState<string[]>([]);
  const [renderingPages, setRenderingPages] = useState<Set<string>>(new Set());
  
  const handleActionWithHistory = useCallback((action: () => void) => {
    action();
    const timer = setTimeout(() => {
        saveState({
            pageInfos: pageInfos,
            allObjects: allObjects,
        });
    }, 100);
    return () => clearTimeout(timer);
  }, [saveState, pageInfos, allObjects]);

  const {
    selectedTool,
    setSelectedTool,
    selectedObjectId,
    setSelectedObjectId,
    currentDrawingShape,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  } = useInteractionManager({
    addObject: (obj) => handleActionWithHistory(() => addObject(obj)),
    updateObject: (obj) => handleActionWithHistory(() => updateObject(obj)),
    scale: scale,
  });

  useKeyboardShortcuts({
      selectedObjectId,
      deleteObject: (id: string) => handleActionWithHistory(() => deleteObject(id)),
      undo,
      redo,
      canUndo,
      canRedo,
  });

  const renderPage = useCallback(async (pageToRender: PageInfo, renderFor: 'thumbnail' | 'canvas') => {
    try {
        if (!pdfDoc) return;
        
        const page = await pdfDoc.getPage(pageToRender.originalIndex + 1);
        
        let pageInfoToUpdate = { ...pageToRender };
        if (!pageInfoToUpdate.width || !pageInfoToUpdate.height) {
            pageInfoToUpdate.width = page.view[2];
            pageInfoToUpdate.height = page.view[3];
            pageInfoToUpdate.rotation = page.rotate;
        }

        const viewportScale = renderFor === 'thumbnail' ? 0.2 : 1.5; // Higher res for canvas
        const viewport = page.getViewport({ scale: viewportScale, rotation: pageInfoToUpdate.rotation });
        
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use jpeg for better compression
        
        // Use a functional update to avoid stale state issues
        setPageInfos(prevPages => 
          prevPages.map(p => {
            if (p.id === pageToRender.id) {
              const updatedPage = { ...p, ...pageInfoToUpdate };
              if(renderFor === 'thumbnail') updatedPage.thumbnailUrl = dataUrl;
              if(renderFor === 'canvas') updatedPage.canvasUrl = dataUrl;
              return updatedPage;
            }
            return p;
          })
        );
    } catch (error) {
        console.error(`Failed to render ${renderFor} for page ${pageToRender.pageNumber}:`, error);
        setPageInfos(prevPages => 
          prevPages.map(p => {
            if (p.id === pageToRender.id) {
              const updatedPage = { ...p };
              if(renderFor === 'thumbnail') updatedPage.thumbnailUrl = 'error';
              if(renderFor === 'canvas') updatedPage.canvasUrl = 'error';
              return updatedPage;
            }
            return p;
          })
        );
    } finally {
        setRenderingPages(prev => {
            const newSet = new Set(prev);
            newSet.delete(pageToRender.id);
            return newSet;
        });
    }
  }, [pdfDoc, setPageInfos]);


  const onThumbnailInView = useCallback((pageId: string) => {
    setRenderQueue(prev => {
      const page = pageInfos.find(p => p.id === pageId);
      if (page && !page.thumbnailUrl && !prev.includes(pageId) && !renderingPages.has(pageId)) {
        return [...prev, pageId];
      }
      return prev;
    });
  }, [pageInfos, renderingPages]);

  const onCanvasInView = useCallback((pageId: string) => {
     setRenderQueue(prev => {
      const page = pageInfos.find(p => p.id === pageId);
      if (page && !page.canvasUrl && !prev.includes(pageId) && !renderingPages.has(pageId)) {
        return [...prev, pageId];
      }
      return prev;
    });
  }, [pageInfos, renderingPages]);

  useEffect(() => {
    const processQueue = () => {
      if (renderQueue.length > 0 && renderingPages.size < MAX_CONCURRENT_RENDERS) {
        const nextPageId = renderQueue[0];
        const pageToRender = pageInfos.find(p => p.id === nextPageId);
        
        if (pageToRender) {
          const renderFor = !pageToRender.thumbnailUrl ? 'thumbnail' : 'canvas';
          if ((renderFor === 'thumbnail' && !pageToRender.thumbnailUrl) || (renderFor === 'canvas' && !pageToRender.canvasUrl)) {
            setRenderQueue(prev => prev.slice(1));
            setRenderingPages(prev => new Set(prev).add(nextPageId));
            renderPage(pageToRender, renderFor);
          } else {
             setRenderQueue(prev => prev.slice(1));
          }
        } else {
          setRenderQueue(prev => prev.slice(1));
        }
      }
    };
    const intervalId = setInterval(processQueue, 100);
    return () => clearInterval(intervalId);
  }, [renderQueue, renderingPages, pageInfos, renderPage]);

  useEffect(() => {
    if (file) {
      loadPdf(file)
        .then(initialState => {
          if (initialState) {
            setPageInfos(initialState.pageInfos);
            saveState({
                pageInfos: initialState.pageInfos,
                allObjects: {},
            });
          }
        })
        .catch(err => {
          console.error("Error loading PDF:", err);
          toast({
            title: "PDF Loading Error",
            description: "Could not load the provided PDF file.",
            variant: "destructive"
          });
        });
    }
  }, [file, loadPdf, saveState, setPageInfos, toast]);
  
  const handlePageChange = useCallback((pageNumber: number) => {
    const pageElement = document.getElementById(`pdf-page-${pageNumber}`);
    if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const reorderPages = useCallback((dragIndex: number, hoverIndex: number) => {
      handleActionWithHistory(() => {
          setPageInfos(prev => {
              const newPages = [...prev];
              const [draggedPage] = newPages.splice(dragIndex, 1);
              newPages.splice(hoverIndex, 0, draggedPage);
              return newPages;
          });
      });
  }, [setPageInfos, handleActionWithHistory]);
  
  const handleExport = async () => {
    if (!pdfDoc) return;
    toast({ title: "Exporting...", description: `Preparing your file.` });

    try {
        const newPdfDoc = await PDFLibDocument.create();
        for (const pageInfo of pageInfos) {
            const [originalPage] = await newPdfDoc.copyPages(pdfDoc, [pageInfo.originalIndex]);
            
            const page = newPdfDoc.addPage(originalPage);
            page.setRotation(pageInfo.rotation);
            
            const pageObjects = getObjectsByPage(pageInfo.pageNumber);
            for (const obj of pageObjects) {
                await drawObject(page, obj, {x:0, y:0, width: page.getWidth(), height: page.getHeight()});
            }
        }
        const pdfBytes = await newPdfDoc.save();
        saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `edited_${file.name}`);
        toast({ title: "Export Successful!", variant: "default" });
    } catch(err) {
        console.error("Export failed", err);
        toast({ title: "Export Failed", description: "There was an error while exporting your document.", variant: "destructive" });
    }
  };


  if (isPdfLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading PDF...</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen w-screen bg-muted/40 flex flex-col">
        {/* <PdfToolbar ... /> */}
        <div className="flex-1 flex overflow-hidden">
          <ThumbnailSidebar
            pages={pageInfos}
            currentPage={1} // This needs to be dynamic
            onPageChange={handlePageChange}
            onReorderPages={reorderPages}
            onThumbnailInView={onThumbnailInView}
          />
          <div className="flex-1 overflow-y-auto">
             {pageInfos.map((pageInfo) => (
                <PdfCanvas
                    key={pageInfo.id}
                    pageInfo={pageInfo}
                    objects={getObjectsByPage(pageInfo.pageNumber)}
                    scale={scale}
                    onObjectSelect={setSelectedObjectId}
                    selectedObjectId={selectedObjectId}
                    currentDrawingShape={currentDrawingShape}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onCanvasInView={onCanvasInView}
                />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
