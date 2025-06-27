
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as pdfjsLib from 'pdfjs-dist';
import { fabric } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

import useTextTool from '@/hooks/useTextTool';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FilePlus, Type, Bold, Italic, Underline } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageObject {
  id: string;
  sourceCanvas: HTMLCanvasElement;
}

export default function PdfEditorPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('black');

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const pdfUploadRef = useRef<HTMLInputElement>(null);
  
  const textTool = useTextTool(fabricCanvasRef);

  const initFabricCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
    }
    const canvasElement = document.createElement('canvas');
    canvasContainerRef.current?.appendChild(canvasElement);

    const container = canvasContainerRef.current;
    if (container) {
        const newCanvas = new fabric.Canvas(canvasElement, {
            width: container.clientWidth,
            height: container.clientHeight,
            backgroundColor: '#f0f0f0',
        });
        fabricCanvasRef.current = newCanvas;
    }
  }, []);

  const displayPage = useCallback((pageIndex: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !pageObjects[pageIndex]) return;

    const pageObj = pageObjects[pageIndex];
    const dataUrl = pageObj.sourceCanvas.toDataURL('image/png');

    fabric.Image.fromURL(dataUrl, (img) => {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width! / img.width!,
        scaleY: canvas.height! / img.height!,
      });
    });
    setActivePageIndex(pageIndex);
  }, [pageObjects]);

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingMessage('載入 PDF 中...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocProxy = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      const loadedPageObjects: PageObject[] = [];
      for (let i = 1; i <= pdfDocProxy.numPages; i++) {
        const page = await pdfDocProxy.getPage(i);
        const viewport = page.getViewport({ scale: 3.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
        loadedPageObjects.push({ id: uuidv4(), sourceCanvas: canvas });
      }
      setPageObjects(loadedPageObjects);
      
      // Initialize canvas and display first page
      if (loadedPageObjects.length > 0) {
        if (!fabricCanvasRef.current) {
            initFabricCanvas();
        }
        // A short delay to ensure the canvas is sized correctly
        setTimeout(() => displayPage(0), 100);
      }
      toast({ title: "PDF 載入成功", description: `${pdfDocProxy.numPages} 頁已載入` });
    } catch (err: any) {
      toast({ title: "載入 PDF 失敗", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  useEffect(() => {
    initFabricCanvas();
    const resizeObserver = new ResizeObserver(entries => {
        if (fabricCanvasRef.current && entries[0]) {
            const { width, height } = entries[0].contentRect;
            fabricCanvasRef.current.setWidth(width);
            fabricCanvasRef.current.setHeight(height);
            if(activePageIndex !== null) displayPage(activePageIndex);
        }
    });

    if (canvasContainerRef.current) {
        resizeObserver.observe(canvasContainerRef.current);
    }
    
    return () => {
        resizeObserver.disconnect();
        fabricCanvasRef.current?.dispose();
    };
  }, [initFabricCanvas, activePageIndex, displayPage]);


  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    textTool.setColor(color);
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-white">{loadingMessage}</p>
        </div>
      )}

      <header className="p-2 border-b flex items-center justify-between sticky top-0 bg-card z-50">
        <div className='flex items-center gap-2'>
            <h1 className="text-xl font-bold">PDF 編輯器</h1>
            <Input type="file" ref={pdfUploadRef} onChange={handlePdfUpload} className="hidden" />
            <Button onClick={() => pdfUploadRef.current?.click()} variant="outline">
                <Upload className="mr-2 h-4 w-4" /> 上傳 PDF
            </Button>
        </div>
        
        {/* Main Toolbar */}
        <div id="main-toolbar" className="flex items-center gap-2">
            <Button variant="ghost" onClick={textTool.insertTextBox}>
                <Type className="mr-2 h-4 w-4" /> 新增文字
            </Button>
            {/* The text-specific toolbar is now separate */}
        </div>
      </header>

      {/* Floating Text Toolbar */}
      <div id="text-toolbar" style={{display: 'none'}} className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-card p-2 rounded-lg shadow-lg border flex items-center gap-2">
           <Button size="sm" variant="outline" onClick={() => textTool.applyStyle('fontWeight', 'bold')}> <Bold /> </Button>
           <Button size="sm" variant="outline" onClick={() => textTool.applyStyle('fontStyle', 'italic')}> <Italic /> </Button>
           <Button size="sm" variant="outline" onClick={() => textTool.applyStyle('underline', true)}> <Underline /> </Button>
           <Separator orientation="vertical" className="h-8"/>
            <div className="flex items-center space-x-2">
              {['black', 'red', 'blue', 'green', 'orange', 'purple'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-48 bg-card border-r p-2 overflow-y-auto">
          <p className="text-sm font-semibold mb-2 p-2">頁面</p>
          <div className="space-y-2">
            {pageObjects.map((page, index) => (
              <div
                key={page.id}
                onClick={() => displayPage(index)}
                className={`p-1 rounded-md cursor-pointer border-2 ${activePageIndex === index ? 'border-primary' : 'border-transparent'}`}
              >
                <img
                  src={page.sourceCanvas.toDataURL()}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto rounded-sm shadow-md"
                />
                <p className="text-center text-xs mt-1 text-muted-foreground"> {index + 1} </p>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 bg-muted/30 p-4" ref={canvasContainerRef}>
          {/* Fabric.js canvas will be appended here by useEffect */}
        </main>
      </div>
    </div>
  );
}

